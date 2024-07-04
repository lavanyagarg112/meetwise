import os
from contextlib import closing

import libsql_experimental as libsql
from dotenv import load_dotenv

from Enums import Roles

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


def setActiveOrganisation(id: int, name: int | None):
    conn.sync()
    with closing(conn.cursor()) as cursor:
        if name:
            cursor.execute('''
            UPDATE USERS
            SET ACTIVEORG = ?
            WHERE ID = ?''', (name, id))
        else:
            cursor.execute('''
            UPDATE USERS
            SET ACTIVEORG = NULL
            WHERE ID = ?''', (id,))
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
        SELECT ID, EMAIL, USERNAME, FIRSTNAME, LASTNAME, PASSWORD, ACTIVEORG
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
    initialise()
    conn.sync()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        SELECT ORGANISATION
        FROM UserOrg WHERE ID = ?''', (user,))
        return cursor.fetchall()


def getTeamsByOrg(org: int,userID : int):
    initialise()
    conn.sync()
    sqlCommand = f'''
    SELECT Org{org}Team.ID, Org{org}Team.NAME
    FROM Org{org}Team
    INNER JOIN  Org{org}Emp ON Org{org}Team.ID = Org{org}Emp.TEAM
    WHERE Org{org}Emp.ID = ?
    '''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand,(userID,))
        return cursor.fetchall()


def getOwner(org: int):
    initialise()
    conn.sync()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        SELECT OWNER FROM Organisations WHERE ID =?''', (org,))
        return cursor.fetchone()


def getBulkUsersByIds(userIds: [int]):
    initialise()
    conn.sync()
    placeHolders = ','.join('?' * len(userIds))
    sqlCommand = f'''
        SELECT ID,USERNAME,EMAIL,FIRSTNAME,LASTNAME FROM USERS WHERE ID IN ({placeHolders})'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, tuple(userIds))
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


def checkUserUserName(name: str):
    initialise()
    conn.sync()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        SELECT 1
        FROM USERS WHERE USERNAME =?''', (name,))
        return cursor.fetchone()


def checkUserOrg(id: int, org: int):
    initialise()
    conn.sync()
    with closing(conn.cursor()) as cursor:
        cursor.execute('''
        SELECT 1
        FROM UserOrg WHERE ID = ?
        AND ORGANISATION =?''', (id, org))
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


def getAdminsOrg(orgId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT ID
              FROM OW{orgId}EMP WHERE ROLE = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (Roles.ADMIN.value,))
        return cursor.fetchall()


def getUsersOrg(orgId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT ID
              FROM OW{orgId}EMP WHERE ROLE = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (Roles.USER.value,))
        return cursor.fetchall()


def getOrgRoleByID(orgId: int, userId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
                  SELECT ROLE
                  FROM OW{orgId}EMP WHERE ID = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (userId,))
        return cursor.fetchone()


def getAdminsTeam(orgId: int, teamId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT ID
                FROM Org{orgId}Emp
                WHERE STATUS = ?
                AND TEAM = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (Roles.ADMIN.value, teamId))
        return cursor.fetchall()


def getUsersTeam(orgId: int, teamId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT ID
                FROM Org{orgId}Emp
                WHERE STATUS = ?
                AND TEAM = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (Roles.USER.value, teamId,))
        return cursor.fetchall()


def getAll(orgId: int, teamId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT ID 
              FROM OW{orgId}EMP'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand)
        return cursor.fetchall()


def getTeamRoleByID(orgId: int, teamId: int, userId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
                  SELECT ROLE
                  FROM Org{orgId}Emp WHERE ID =? AND TEAM =?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (userId, teamId))
        return cursor.fetchone()


def teamExists(orgId: int, team: str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT 1
              FROM Org{orgId}Team WHERE NAME =?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (team,))
        return cursor.fetchone()


def existsOrganisation(org: str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT 1
              FROM Organisations WHERE NAME =?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (org,))
        return cursor.fetchone()


def makeOrganisation(owner: int, org: str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              INSERT INTO Organisations (NAME, OWNER) VALUES (?,?)'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (org, owner))
        id = cursor.lastrowid

        orgEmp = f'''
        CREATE TABLE Org{id}Emp (
        ID INTEGER NOT NULL ,
        TEAM INTEGER NOT NULL,
        ROLE TEXT,
        TEAMCONTROL TEXT NOT NULL DEFAULT 'member',
        STATUS TEXT NOT NULL DEFAULT {Roles.USER.value},
        FOREIGN KEY(ID) REFERENCES Users(ID),
        FOREIGN KEY(TEAM) REFERENCES Org{id}Team(ID),
        PRIMARY KEY (ID,TEAM)
        )
        '''

        cursor.execute(orgEmp)

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
        CONFIDENTIALITY TEXT NOT NULL DEFAULT 'PUBLIC',
        FOREIGN KEY(TEAM) REFERENCES Org{id}Team(ID)
        )
        '''

        cursor.execute(org)

        orgTeam = f'''
        CREATE TABLE Org{id}Team (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        NAME TEXT NOT NULL)
        '''

        cursor.execute(orgTeam)

        orgPerm = f'''
        CREATE TABLE Org{id}Perm (
        ID INTEGER PRIMARY KEY,
        PERMISSIONS TEXT NOT NULL DEFAULT 'NONE')
        '''

        cursor.execute(orgPerm)

        owemp = f'''
        CREATE TABLE OW{id}EMP(
        ID INTEGER PRIMARY KEY,
        ROLE TEXT NOT NULL,
        FOREIGN KEY(ID) REFERENCES USERS(ID)
        )
        '''

        cursor.execute(owemp)

        omatt = f'''
        CREATE TABLE O{id}MAtt(
        ID INTEGER PRIMARY KEY,
        ATTENDEES INTEGER NOT NULL,
        FOREIGN KEY(ID) REFERENCES Org{id}(ID),
        FOREIGN KEY (ID) REFERENCES USERS(ID)
        )
        '''

        cursor.execute(omatt)

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

        conn.commit()
        conn.sync()

        return id


def makeTeam(orgId: int, team: str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              INSERT INTO Org{orgId}Team (NAME) VALUES (?)'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (team,))
        conn.commit()
        conn.sync()


def addUserToOrg(orgId: int, userId: int, role: str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              INSERT INTO UserOrg (ID, ORGANISATION) VALUES (?,?)'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (userId, orgId))

        orgemp = f'''
        INSERT INTO Org{orgId}Perm (ID) VALUES (?)
        '''
        cursor.execute(orgemp, (userId,))

        OWEMP = f'''
        INSERT INTO OW{orgId}EMP (ID,ROLE) VALUES (?,?)
        '''
        cursor.execute(OWEMP, (userId, role))

        conn.commit()
        conn.sync()


def addUserToTeam(orgId: int, userId: int, role: str, team: int,status: str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              INSERT OR REPLACE INTO Org{orgId}Emp (ID,TEAM, ROLE,STATUS) VALUES (?,?,?,?)'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (userId, team, role,status))
        conn.commit()
        conn.sync()


def addToPending(email: str, role: str, organisation: int) -> int:
    initialise()
    conn.sync()
    sqlCommand = f'''
              INSERT OR IGNORE INTO PendingInvites (EMAIL, ROLE, ORGANISATION) VALUES (?,?,?)'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (email, role, organisation))
        conn.commit()
        conn.sync()
        return cursor.lastrowid


def getInvites(orgId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT rowid,EMAIL,ROLE FROM PendingInvites WHERE ORGANISATION = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (orgId,))
        return cursor.fetchall()


def getInvitesByUser(email:str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT ORGANISATION,ROLE FROM PendingInvites WHERE EMAIL = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (email,))
        ele = cursor.fetchall()
        delUser = '''
        DELETE FROM PendingInvites WHERE EMAIL = ?
        '''
        cursor.execute(delUser, (email,))
        conn.commit()
        conn.sync()
        return ele


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
          FROM Organisations WHERE NAME IN ({placeHolders})'''
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


initialise()
setActiveOrganisation(30,None)
initialise()
getUserDetailsByEmail("user1@email.com")