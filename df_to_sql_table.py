import pandas as pd
from sqlalchemy import create_engine
from time import time
from work_with_chesscom_api import userlist_all_games, userlist_ratings, username_all_games

def read_chesscom_users():
    f = open("chesscom_users", 'r')
    users = []
    while True:
        s = f.readline()
        if s == '': break
        users.append(s[:-1])
    return users

url = 'mysql://user:password@host:port/ChesscomGames'
conn = create_engine(url)

# check existing databases
existing_databases = conn.execute("SHOW DATABASES;")
existing_databases = [d[0] for d in existing_databases]

# read sql table
df1 = pd.read_sql("select * from chesscom_games where time_control='600'", conn)

# another way
ans = conn.execute('select * from user_ratings')
rows = ans._allrows() # each value is a legacyrow object
first = rows[0].values() # to get each row

###

def sql_to_csv():
    df = pd.read_sql('select * from chesscom_games', conn)
    df.to_csv('all_games.csv')
    df = pd.read_sql('select * from user_ratings', conn)
    df.to_csv('user_ratings.csv')

def ratings_table_to_sql(ratings_df):
    vals = ratings_df.values
    for val in vals:
        s = str(tuple(val.tolist()))
        s = s.replace('nan', 'null')
        s = s.replace('.0', '')
        conn.execute(f"insert into user_ratings values{s};")

def games_table_to_sql(df):
    vals = df.values
    n = len(vals)
    start_main = start = time()
    for i, val in enumerate(vals):
        val[4] = val[4].replace("\'", '')
        val[4] = val[4].replace('[', '')
        val[4] = val[4].replace(']', '')
        s = str(tuple(val.tolist()))
        s = s.replace('False', 'false')
        s = s.replace('True', 'true')
        conn.execute(f"insert into chesscom_games values{s};")
        end = time()
        if end-start > 5:
            left = (n-i-1)*(end-start_main)/(i+1)
            print(f'\r{int(left/60)}m {int(left%60)}s', end=' ')
            start = end
    print()

def delete_old_records():
    conn.execute("delete from chesscom_games where date_time < '2021-12-20';")

def insert_new_records():
    df1 = pd.read_sql("select user, max(date_time) from chesscom_games group by user;", conn)
    df2 = pd.read_sql('select user from user_ratings', conn)
    df1 = pd.merge(df2, df1, 'left', ['user']).fillna(pd.Timestamp('2022-01-20 00:00:00'))

    games = []
    n = len(df1)
    start = time()
    for i, val in enumerate(df1.values):
        games += username_all_games(val[0], str(val[1]))
        end = time()
        if end-start > 5:
            left = (n-i-1)*(end-start)/(i+1)
            print(f'\r{int(left/60)}m {int(left%60)}s', end=' ')
    df2 = pd.DataFrame(games)
    games_table_to_sql(df2)

    # update ratings
    user_list = df1.user.to_list()
    user_rating = userlist_ratings(user_list)
    for user, ratings in user_rating.items():
        rapid, blitz, bullet = str(ratings[0]), str(ratings[1]), str(ratings[2])
        rapid = rapid.replace('None', 'null')
        blitz = blitz.replace('None', 'null')
        bullet = bullet.replace('None', 'null')
        conn.execute(f"update user_ratings set rapid={rapid}, blitz={blitz}, bullet={bullet} where user='{user}';")


def add_users(user_list):
    user_ratings = userlist_ratings(user_list)
    ratings_df = pd.DataFrame(columns=['user', 'rapid', 'blitz', 'bullet'])
    for i, (user, ratings) in enumerate(user_ratings.items()):
        ratings_df.loc[len(ratings_df.index)] = [user, ratings[0], ratings[1], ratings[2]]
    ratings_table_to_sql(ratings_df)

    games = userlist_all_games(user_list, '2021-12-20')
    games_df = pd.DataFrame(games)
    games_table_to_sql(games_df)