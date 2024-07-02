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


def createNewUser(username: str, email: str, hashed_password: str, firstName: str, lastName: str):
    initialise()
    conn.sync()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        INSERT INTO USERS (USERNAME,EMAIL,PASSWORD,FIRSTNAME,LASTNAME) 
        VALUES (?,?,?,?,?)''', (username, email, hashed_password, firstName, lastName))
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


def getMeetingsByOrg(orgId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
          SELECT ID,NAME,DATE
          FROM Org{orgId}'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand)
        return cursor.fetchall()


def getMeetingsByTeam(orgId: int, teamId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT ID,NAME,DATE
              FROM Org{orgId} WHERE TEAM = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (teamId,))
        return cursor.fetchall()

def teamExists(orgId:int,team: str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT 1
              FROM Org{orgId}Team WHERE NAME =?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (team,))
        return cursor.fetchone()

def existsOrganisation(org : str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT 1
              FROM Organisations WHERE NAME =?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (org,))
        return cursor.fetchone()

def makeOrganisation(owner:int,org : str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              INSERT INTO Organisations (NAME, OWNER) VALUES (?,?)'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (org, owner))
        conn.commit()
        conn.sync()
        id =  cursor.lastrowid

        orgEmp = f'''
        CREATE TABLE Org{id}Emp (
        ID INTEGER NOT NULL ,
        TEAM INTEGER NOT NULL,
        ROLE TEXT,
        TEAMCONTROL TEXT NOT NULL DEFAULT 'member',
        FOREIGN KEY(ID) REFERENCES Users(ID),
        FOREIGN KEY(TEAM) REFERENCES Org{id}Team(ID),
        PRIMARY KEY (ID,TEAM)
        )
        '''

        cursor.execute(orgEmp)
        conn.commit()
        conn.sync()

        org = f'''
        CREATE TABLE Org{id} (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        NAME TEXT NOT NULL,
        TEAM INTEGER,
        TRANSCRIPTION TEXT NOT NULL,
        LENGTH DATETIME NOT NULL, 
        DATE DATETIME NOT NULL,
        SUMMARY TEXT NOT NULL,
        SIZE INTEGER NOT NULL,
        CONFIDENTIALITY TEXT NOT NULL DEFAULT 'PUBLIC'
        FOREIGN KEY(TEAM) REFERENCES Org{id}Team(ID)
        )
        '''

        cursor.execute(org)
        conn.commit()
        conn.sync()

        orgTeam = f'''
        CREATE TABLE Org{id}Team (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        NAME TEXT NOT NULL)
        '''

        cursor.execute(orgTeam)
        conn.commit()
        conn.sync()

        orgPerm = f'''
        CREATE TABLE Org{id}Perm (
        ID INTEGER PRIMARY KEY,
        PERMISSIONS TEXT NOT NULL)
        '''

        cursor.execute(orgPerm)
        conn.commit()
        conn.sync()


        owemp = f'''
        CREATE TABLE OW{id}EMP(
        ID INTEGER PRIMARY KEY,
        PERMISSIONS TEXT NOT NULL,
        FOREIGN KEY(ID) REFERENCES USERS(ID)
        )
        '''


        cursor.execute(owemp)
        conn.commit()
        conn.sync()

        omatt = f'''
        CREATE TABLE O{id}MAtt(
        ID INTEGER PRIMARY KEY,
        ATTENDEES INTEGER NOT NULL,
        FOREIGN KEY(ID) REFERENCES Org{id}(ID),
        FOREIGN KEY (ID) REFERENCES USERS(ID)
        )
        '''

        cursor.execute(omatt)
        conn.commit()
        conn.sync()

        orgtodo = f'''
        CREATE TABLE Org{id}Todo(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        ASSIGNEE INT,
        DETAIL TEXT,
        MEETINGID INT,
        DEADLINE DATETIME,
        COMPLETED BOOLEAN,
        TEAM INT,
        FOREIGN KEY (ASSIGNEE) REFERENCES USERS(ID),
        FOREIGN KEY (MEETINGID) REFERENCES Org{id}(ID),
        FOREIGN KEY (TEAM) REFERENCES Org{id}Team(ID)
        )
        '''

        return id





def makeTeam(orgId: int, team : str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              INSERT INTO Org{orgId}Team (NAME) VALUES (?)'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (team,))
        conn.commit()
        conn.sync()


def addUserToTeam(orgId : int, userId : int, role : str, team : int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              INSERT OR REPLACE INTO Org{orgId}Emp (ID,TEAM, ROLE) VALUES (?,?,?)'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (userId, team, role))
        conn.commit()
        conn.sync()

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


def mapTeamNameToId(orgId: int, teamName: str):
    initialise()
    conn.sync()
    sqlCommand = f'''
          SELECT ID
          FROM Org{orgId}Team WHERE NAME = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (teamName,))
        return cursor.fetchone()







