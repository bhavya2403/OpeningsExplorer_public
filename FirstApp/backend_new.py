import pandas as pd

globalVars = {} # csrf: currcol, stack, currdfs

def split_moves(df):
    moves = df.moves
    df.drop(['moves'], axis=1, inplace=True)
    df['movesl'] = moves.apply(lambda s: s[:s.find(',')]).rename('movesl', axis=1)
    df['moves'] = moves.apply(lambda s: s[s.find(',')+2:]).rename('moves', axis=1)
    return df

def filter_by_class(df, clas):
    time_class_arr = []
    for tc in df.time_control:
        tc = tc + '+'
        tc = int(tc[:tc.find('+')])
        if tc < 180: time_class_arr.append('bullet')
        elif tc < 600: time_class_arr.append('blitz')
        else: time_class_arr.append('rapid')
    time_classes = pd.Series(time_class_arr)
    df.reset_index(inplace=True)
    df = df[time_classes == clas]
    return df.drop(['time_control'], axis=1)

def group_by_color(df):
    df_white = df[df.user_white == 1].drop(['user_white'], axis=1)
    df_black = df[df.user_white == 0].drop(['user_white'], axis=1)
    return df_white, df_black

def init_user_data(user, clas, csrf):
    globalVars[csrf] = {}
    globalVars[csrf]['stack'] = []
    globalVars[csrf]['currcol'] = True

    # query = f"""select 1 as id, time_control, moves, user_white, white_won
    #             from chesscom_games
    #             where user = '{user}';"""
    # rawQuerySet = ChesscomGames.objects.raw(query)
    # df = pd.DataFrame([item.__dict__ for item in rawQuerySet])
    # if df.empty: return False
    # df.drop(['id'], axis=1, inplace=True)
    df = pd.read_csv('static/games.csv', usecols=['time_control', 'moves', 'user_white', 'white_won', 'user'])
    df = df[df.user == user]
    if df.empty: return False

    df.drop(['user'], axis=1, inplace=True)
    # filter1
    df = filter_by_class(df, clas)
    # because some problem at the time of split
    df['moves'] = df.moves.apply(lambda s: s+',')
    # filter2
    globalVars[csrf]['df_white'], globalVars[csrf]['df_black'] = group_by_color(df)
    return True

def init_rating_data(range, clas, csrf):

    # query = f""" select 1 as id, time_control, moves, user_white, white_won, {clas}
    #             from (
    #                 chesscom_games cg left join user_ratings ur
    #                 on cg.user = ur.user
    #             )
    #             where {clas} > {range[0]} and {clas} < {range[1]};"""
    # rawQuerySet = ChesscomGames.objects.raw(query)
    # df = pd.DataFrame([item.__dict__ for item in rawQuerySet])
    # df.drop(['id'], axis=1, inplace=True)
    df_games = pd.read_csv('static/games.csv', usecols=['time_control', 'moves', 'user_white', 'white_won', 'user'])
    df_ratings = pd.read_csv('static/ratings.csv', usecols=['user', f'{clas}'])
    df = pd.merge(df_games, df_ratings, 'left', ['user'])
    df = df[(df[f'{clas}']>range[0]) & (df[f'{clas}']<range[1])]

    globalVars[csrf]['df_rating'] = filter_by_class(df, clas)
    globalVars[csrf]['df_rating']['moves'] = globalVars[csrf]['df_rating'].moves.apply(lambda s: s+',')

def change_color(csrf):
    globalVars[csrf]['currcol'] = (not globalVars[csrf]['currcol'])

def _get_on_display_helper(df):
    df_aux = df.copy()
    df_aux = split_moves(df_aux)

    grouped = df_aux.groupby(['movesl', 'white_won'])['white_won'].count()
    on_display = {}  # {move: {win_games_white:count, win_games_black:count, drawn_games:count}}
    for (move, res), cnt in grouped.items():
        if move not in on_display:
            on_display[move] = {}
        on_display[move][res] = cnt
    return on_display

def get_on_display_user(csrf):
    return (_get_on_display_helper(globalVars[csrf]['df_white']) if globalVars[csrf]['currcol'] else _get_on_display_helper(globalVars[csrf]['df_black']))

def get_on_display_rating(csrf):
    return _get_on_display_helper(globalVars[csrf]['df_rating'])

def move_click(move, csrf):
    globalVars[csrf]['stack'].append((globalVars[csrf]['df_white'].copy(), globalVars[csrf]['df_black'].copy(), globalVars[csrf]['df_rating'].copy()))

    def make_changes(df):
        df = split_moves(df)
        df = df[(df.movesl==move) & (df.moves!='')]
        return df.drop(['movesl'], axis=1)
    globalVars[csrf]['df_white'] = make_changes(globalVars[csrf]['df_white'])
    globalVars[csrf]['df_black'] = make_changes(globalVars[csrf]['df_black'])
    globalVars[csrf]['df_rating'] = make_changes(globalVars[csrf]['df_rating'])

def go_back(csrf):
    globalVars[csrf]['df_white'], globalVars[csrf]['df_black'], globalVars[csrf]['df_rating'] = globalVars[csrf]['stack'].pop()

def add_user(username):
    f = open('new_users.txt', 'a')
    f.write(f'{username}\n')
    f.close()