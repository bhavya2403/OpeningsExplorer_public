import pandas as pd
import pyodbc
from time import time

server = 'servername'
database = 'database'
username = 'username'
password = 'password'
conn = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};SERVER=tcp:'+server+';PORT=1433;DATABASE='+database+';UID='+username+';PWD='+ password)
cursor = conn.cursor()

# method 1
def table_to_sql(sidx):
    n = 1000000 - sidx
    arr = gamesFile.read().split('\n')
    start = start_main = time()
    for i in range(sidx, len(arr)):
        cursor.execute(arr[i])
        end = time()
        if end-start > 5:
            left = (n-i-1)*(end-start_main)/(i-sidx+1)
            print(f'\r{int(left/60)}m {int(left%60)}s {round((i-sidx)/(end-start_main)/3, 2)}kB/s', end=' ')
            start = end
    cursor.commit()
ratingsFile = open('chesscomgames_user_ratings.sql')
gamesFile = open('chesscomgames_chesscom_games.sql')

# method 2
games_df = pd.read_csv('chesscomgames_chesscom_games.csv')
sidx = 859994
games_df1 = games_df[games_df.index >= sidx]
games_df1.to_csv('chesscomgames_chesscom_games1.csv', index=False)