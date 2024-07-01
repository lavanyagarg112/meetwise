import os
import libsql_experimental as libsql
from dotenv import load_dotenv

load_dotenv('.env')
url = os.environ["TURSO_DATABASE_URL"]
auth_token = os.environ["TURSO_AUTH_TOKEN"]

conn = libsql.connect("meetwise.db", sync_url=url, auth_token=auth_token)
conn.sync()
cursor = conn.cursor()

cursor.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER);")
conn.commit()

conn.sync()
cursor.close()


def setActiveOrganisation(id:int, name:str):
    #TODO: set user active organisation as name
    pass
