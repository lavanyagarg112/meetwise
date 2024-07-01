import os
from contextlib import closing

import libsql_experimental as libsql
from dotenv import load_dotenv

conn = None

#Store procedures



# noinspection SpellCheckingInspection
def initialise():
    global conn
    if conn is not None:
        return
    load_dotenv('.env')
    url = os.environ["TURSO_DATABASE_URL"]
    auth_token = os.environ["TURSO_AUTH_TOKEN"]
    conn = libsql.connect("meetwise.db",sync_url=url, auth_token=auth_token)
    conn.sync()  # gets change from db


def setActiveOrganisation(id: int, name: str):
    #TODO: set user active organisation as name
    pass


def getUserDetailsByName(name: str):
    initialise()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        SELECT ID , EMAIL,USERNAME,FIRSTNAME,LASTNAME ,PASSWORD,ACTIVEORG
        FROM USERS WHERE USERNAME = ?''',(name,))
        return cursor.fetchone()


def getUserDetailsByEmail(email:str):
    initialise()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        SELECT ID , EMAIL,USERNAME,FIRSTNAME,LASTNAME ,PASSWORD,ACTIVEORG
        FROM USERS WHERE EMAIL = ?''',(email,))
        return cursor.fetchone()

