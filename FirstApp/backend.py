from .models import ChesscomGames
import pandas as pd
from django.db import connection

currcol = True
stack = []
cursor = connection.cursor()

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
    df = df[time_classes == clas]
    return df.drop(['time_control'], axis=1)

def group_by_color(df):
    df_white = df[df.user_white == 1].drop(['user_white'], axis=1)
    df_black = df[df.user_white == 0].drop(['user_white'], axis=1)
    return df_white, df_black

# user data
# 1>rapid 2>blitz 3>bullet -> filt1
# 1>white 2>black -> filt2
def init_user_data(user, clas):
    global df_white, df_black

    query = f"""select 1 as id, time_control, moves, user_white, white_won
                from chesscom_games
                where user = '{user}';"""
    rawQuerySet = ChesscomGames.objects.raw(query)
    df = pd.DataFrame([item.__dict__ for item in rawQuerySet])
    if df.empty: return False

    df.drop(['id'], axis=1, inplace=True)
    df = filter_by_class(df, clas)
    df['moves'] = df.moves.apply(lambda s: s+',')
    df_white, df_black = group_by_color(df)
    return True

# ratings data
# rating range: 1>100 2>200 3>300
# 100 - 3000
def init_rating_data(range, clas):
    global df_rating

    query = f""" select 1 as id, time_control, moves, user_white, white_won, {clas}
                from (
                    chesscom_games cg left join user_ratings ur
                    on cg.user = ur.user
                )
                where {clas} > {range[0]} and {clas} < {range[1]};"""
    rawQuerySet = ChesscomGames.objects.raw(query)
    df = pd.DataFrame([item.__dict__ for item in rawQuerySet])
    df.drop(['id'], axis=1, inplace=True)
    df_rating = filter_by_class(df, clas)
    df_rating['moves'] = df_rating.moves.apply(lambda s: s+',')

def change_color():
    global currcol
    currcol = (not currcol)

def _get_on_display_helper(df):
    df_aux = df.copy()
    df_aux = split_moves(df_aux)

    grouped = df_aux.groupby(['movesl', 'white_won'])['white_won'].count()
    on_display = {}
    for (move, res), cnt in grouped.items():
        if move not in on_display:
            on_display[move] = {}
        on_display[move][res] = cnt
    return on_display

def get_on_display_user():
    global df_white, df_black, currcol
    return (_get_on_display_helper(df_white) if currcol else _get_on_display_helper(df_black))

def get_on_display_rating():
    global df_rating
    return _get_on_display_helper(df_rating)

def move_click(move):
    global df_white, df_black, df_rating, stack
    stack.append((df_white.copy(), df_black.copy(), df_rating.copy()))

    def make_changes(df):
        df = split_moves(df)
        df = df[(df.movesl==move) & (df.moves!='')]
        return df.drop(['movesl'], axis=1)
    df_white = make_changes(df_white)
    df_black = make_changes(df_black)
    df_rating = make_changes(df_rating)

def go_back():
    global df_white, df_black, df_rating
    df_white, df_black, df_rating = stack.pop()

def add_user(username):
    cursor.execute(f"insert into new_users values('{username}');")