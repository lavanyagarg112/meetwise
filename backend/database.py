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
    conn = libsql.connect("meetwise.db", sync_url=url, auth_token=auth_token)
    conn.sync()  # gets change from db


def setActiveOrganisation(id: int, name: int):
    conn.sync()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        UPDATE USERS
        SET ACTIVEORG = ?
        WHERE ID = ?''', (name, id))
        conn.commit()
        conn.sync()


def getUserDetailsByName(name: str):
    initialise()
    conn.sync()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        SELECT ID , EMAIL,USERNAME,FIRSTNAME,LASTNAME ,PASSWORD,ACTIVEORG
        FROM USERS WHERE USERNAME = ?''', (name,))
        return cursor.fetchone()


def getUserDetailsByEmail(email: str):
    initialise()
    conn.sync()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        SELECT ID , EMAIL,USERNAME,FIRSTNAME,LASTNAME ,PASSWORD,ACTIVEORG
        FROM USERS WHERE EMAIL = ?''', (email,))
        return cursor.fetchone()


def getUserDetailsByID(id: int):
    initialise()
    conn.sync()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        SELECT EMAIL,USERNAME,FIRSTNAME,LASTNAME,ACTIVEORG
        FROM USERS WHERE ID = ?''', (id,))
        return cursor.fetchone()


def getUserOrgs(user: int):
    conn.sync()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        SELECT ORGANISATION
        FROM UserOrg WHERE ID = ?''', (id,))
    return cursor.fetchall()


def getTeamsByOrg(org: int):
    conn.sync()
    sqlCommand = f'''
    SELECT * FROM ORG{org}TEAM
    '''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand)
    return cursor.fetchall()


def checkUserEmail(email: str):
    initialise()
    conn.sync()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        SELECT 1
        FROM USERS WHERE EMAIL =?''', (email,))
        return cursor.fetchone()

def checkUserUsername(name: str):
    initialise()
    conn.sync()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        SELECT 1
        FROM USERS WHERE USERNAME =?''', (name,))
        return cursor.fetchone()

def createNewUser(username : str,email : str,hashed_password : str ,firstName : str,lastName : str):
    initialise()
    conn.sync()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        INSERT INTO USERS (USERNAME,EMAIL,PASSWORD,FIRSTNAME,LASTNAME) 
        VALUES (?,?,?,?,?)''', (username,email,hashed_password,firstName,lastName))
        conn.commit()
        conn.sync()


def checkUserUserName(email: str):
    initialise()
    conn.sync()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        SELECT 1
        FROM USERS WHERE USERNAME =?''', (email,))
        return cursor.fetchone()


def mapOrgIDToName(orgIDs: [int]):
    initialise()
    conn.sync()
    placeHolders = ','.join('?' * len(orgIDs))
    sqlCommand = f'''
          SELECT ID,NAME
          FROM Organisations WHERE ID IN ({placeHolders})'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, tuple(orgIDs))
        return cursor.fetchall()


def mapOrgNameToID(orgNames: [str]):
    initialise()
    conn.sync()
    placeHolders = ','.join('?' * len(orgNames))
    sqlCommand = f'''
          SELECT ID,NAME
          FROM Organisations WHERE ID IN ({placeHolders})'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, tuple(orgNames))
        return cursor.fetchall()
