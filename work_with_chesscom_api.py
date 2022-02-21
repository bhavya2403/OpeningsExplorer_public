from time import time
from requests import get
from heapq import heappop, heappush

def pgn_to_moves(pgn_to_game):
    moves = []
    last_dot = -1
    for i in range(len(pgn_to_game)):
        if pgn_to_game[i] == '.': last_dot = i
        if pgn_to_game[i] == '{':
            moves.append(pgn_to_game[last_dot+2:i-1])
    return moves

def pgn_to_start_datetime(pgn):
    idx = pgn.find('UTCDate')
    date = pgn[idx+9:idx+19]
    date = date[:4] + '-' + date[5:7] + '-' + date[8:]
    idx = pgn.find('UTCTime')
    time = pgn[idx+9:idx+17]
    return f'{date} {time}'

def game_to_result(game):
    if game['white']['result'] == 'win': return 1
    if game['black']['result'] == 'win': return 0
    return -1

def username_all_games(user_name, last_datetime):
    all_games = []
    response = get(f'https://api.chess.com/pub/player/{user_name}/games/archives')
    months_ids = response.json()['archives']
    before = False
    for id in reversed(months_ids):
        if before: break
        response = get(id)
        games = response.json()['games']
        for game in reversed(games):
            if before: break
            if game['rules']=='chess' and game['rated'] and game['time_class'] in {'blitz', 'rapid', 'bullet'}:
                datetime = pgn_to_start_datetime(game['pgn'])
                if datetime <= last_datetime: before = True
                else:
                    all_games.append([user_name, 1, datetime, game['time_control'], pgn_to_moves(game['pgn']), game_to_result(game)])
                    all_games[-1][1] = (game['white']['username'] == user_name)
    return all_games

def userlist_all_games(users, last_date):
    all_games = []
    n = len(users)
    start = time()
    for i, user in enumerate(list(users)):
        all_games += username_all_games(user, last_date)
        end = time()
        left = (n-i-1)*(end-start)/(i+1)
        print(f"\r{int(left/60)}m {int(left%60)}s", end=' ')
    print(f'\rtime taken: {int((end-start)/60)}m {int((end-start)%60)}s')
    return all_games

def userlist_ratings(users):
    n = len(users)
    user_rating = {}
    start = time()
    for i, user in enumerate(list(users)):
        response = get(f'https://api.chess.com/pub/player/{user}/stats')
        user_rating[user] = []
        try: user_rating[user].append(response.json()['chess_rapid']['last']['rating'])
        except: user_rating[user].append(None)
        try: user_rating[user].append(response.json()['chess_blitz']['last']['rating'])
        except: user_rating[user].append(None)
        try: user_rating[user].append(response.json()['chess_bullet']['last']['rating'])
        except: user_rating[user].append(None)
        end = time()
        left = (n-i-1)*(end-start)/(i+1)
        print(f"\r{int(left/60)}m {int(left%60)}s", end=' ')
    print(f'\rtime taken: {int((end - start) / 60)}m {int((end - start) % 60)}s')
    return user_rating

def get_user_list():
    users_set = set()
    to_visit_set = {'bhavya1238955'}
    while len(users_set) < 1e6:
        user = to_visit_set.pop()
        users_set.add(user)
        response = get(f'https://api.chess.com/pub/player/{user}/games/archives')
        months_ids = response.json()['archives']
        for id in months_ids:
            print(f'\r{len(users_set)} {len(to_visit_set)}', end=' ')
            response = get(id)
            games = response.json()['games']
            for game in games:
                another = (game['white']['username'] if game['black']['username']==user else game['black']['username'])
                if another not in users_set:
                    to_visit_set.add(another)
    return users_set

def high_rated_users():
    users_set = set()
    to_visit_set = {'Hikaru'}
    pq = [(-3200, 'Hikaru')]
    while len(users_set) < 1e6:
        rating_user = heappop(pq)
        user = rating_user[1]
        to_visit_set.remove(user)
        users_set.add(user)
        response = get(f'https://api.chess.com/pub/player/{user}/games/archives')
        months_ids = response.json()['archives']
        for id in reversed(months_ids):
            print(f'\r{len(users_set)} {len(pq)} {len(to_visit_set)} {id}', end=' ')
            response = get(id)
            games = response.json()['games']
            for game in games:
                another = (game['white']['username'] if game['black']['username']==user else game['black']['username'])
                if another not in users_set and another not in to_visit_set:
                    rating = (game['white']['rating'] if game['black']['username']==user else game['black']['rating'])
                    to_visit_set.add(another)
                    heappush(pq, (-rating, another))
    return users_set