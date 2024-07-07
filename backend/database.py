import os
import profile
from contextlib import closing
from datetime import datetime
from typing import List, Tuple

import libsql_experimental as libsql
from dotenv import load_dotenv

from Enums import Roles
from Meeting import Task

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


def getTeamsByOrg(org: int, userID: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
    SELECT Org{org}Team.ID, Org{org}Team.NAME
    FROM Org{org}Team
    INNER JOIN  Org{org}Emp ON Org{org}Team.ID = Org{org}Emp.TEAM
    WHERE Org{org}Emp.ID = ?
    '''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (userID,))
        return cursor.fetchall()


def getTeamsByOrgStatus(org: int, userID: int, status: Roles):
    initialise()
    conn.sync()
    sqlCommand = f'''
    SELECT Org{org}Team.ID, Org{org}Team.NAME
    FROM Org{org}Team
    INNER JOIN  Org{org}Emp ON Org{org}Team.ID = Org{org}Emp.TEAM
    WHERE Org{org}Emp.ID = ?
    AND Org{org}Emp.STATUS = ?
    '''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (userID, status.value))
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
          FROM Org{orgId} WHERE TEAM IS NULL'''
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


def getStatusOrg(orgId: int, status: Roles):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT ID
              FROM OW{orgId}EMP WHERE ROLE = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (status.value,))
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


def getStatusTeam(orgId: int, teamId: int, status: Roles):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT ID
                FROM Org{orgId}Emp
                WHERE STATUS = ?
                AND TEAM = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (status.value, teamId))
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
        UNCOMMON TEXT,
        ISUSER BOOLEAN NOT NULL DEFAULT FALSE,
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
        ASSIGNER INT,
        DETAILS TEXT,
        MEETINGID INT,
        DEADLINE DATETIME,
        COMPLETED BOOLEAN,
        ISUSER BOOLEAN NOT NULL DEFAULT FALSE, 
        TEAM INT,
        FOREIGN KEY (ASSIGNEE) REFERENCES USERS(ID),
        FOREIGN KEY (ASSIGNER) REFERENCES USERS(ID),
        FOREIGN KEY (MEETINGID) REFERENCES Org{id}(ID),
        FOREIGN KEY (TEAM) REFERENCES Org{id}Team(ID)
        )
        '''
        cursor.execute(orgtodo)
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


def addUserToTeam(orgId: int, userId: int, role: str, team: int, status: str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              INSERT OR REPLACE INTO Org{orgId}Emp (ID,TEAM, ROLE,STATUS) VALUES (?,?,?,?)'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (userId, team, role, status))
        conn.commit()
        conn.sync()


def storeMeetingDetailsTeam(org: int, name: str, team: int, transcription: str, length: int, date: str,
                            summary: str, size: int, uncommon: str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              INSERT INTO Org{org} (NAME, TEAM, TRANSCRIPTION, LENGTH, DATE, SUMMARY, SIZE,UNCOMMON) VALUES (?,?,?,?,?,?,?,?)'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (name, team, transcription, length, date, summary, size, uncommon))
        conn.commit()
        conn.sync()
        return cursor.lastrowid


def storeMeetingDetailsOrg(org: int, name: str, transcription: str, length: int, date: str,
                           summary: str, size: int, uncommon: str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              INSERT INTO Org{org} (NAME, TRANSCRIPTION, LENGTH, DATE, SUMMARY, SIZE,UNCOMMON) VALUES (?,?,?,?,?,?,?)'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (name, transcription, length, date, summary, size, uncommon))
        conn.commit()
        conn.sync()
        return cursor.lastrowid


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


def getInvitesByUser(email: str):
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


def getSummary(orgId: int, meetingId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT SUMMARY
              FROM Org{orgId} WHERE ID = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (meetingId,))
        return cursor.fetchone()


def updateMeetingDetails(organisation: int, meetingId: int, transcription: str, summary: str,
                         uncommonwords: str):
    initialise()
    conn.sync()
    sqlCommand = f'''
              UPDATE Org{organisation} SET TRANSCRIPTION = ?, SUMMARY = ?, UNCOMMON = ?, ISUSER = TRUE WHERE ID = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (transcription, summary, uncommonwords, meetingId))
        conn.commit()
        conn.sync()


def getTranscription(organisation: int, meetingId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT ISUSER,TRANSCRIPTION,UNCOMMON
              FROM Org{organisation} WHERE ID = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (meetingId,))
        return cursor.fetchone()


def getMeetingMetaData(organisation: int, meetingId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT NAME,DATE,ISUSER,TEAM
              FROM Org{organisation} WHERE ID = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (meetingId,))
        return cursor.fetchone()


def addTodos(organisation: int, meetingId: int, details: str, deadline: str, assigner: int, assignee: int,
             isCompleted: bool):
    initialise()
    conn.sync()
    sqlCommand = f'''
              INSERT INTO  Org{organisation}Todo (MEETINGID, DETAILS, DEADLINE, ASSIGNER, ASSIGNEE, COMPLETED)
              VALUES (?,?,?,?,?,?)'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (meetingId, details, deadline, assigner, assignee, isCompleted))
        conn.commit()
        conn.sync()
        return cursor.lastrowid


def updateTodos(todoId: int, organisation: int, meetingId: int, details: str, deadline: str, assigner: int,
                assignee: int,
                isCompleted: bool):
    initialise()
    conn.sync()
    sqlCommand = f'''
              UPDATE Org{organisation}Todo SET MEETINGID =?,DETAILS =?, DEADLINE =?, ASSIGNER =?, ASSIGNEE =?,
              COMPLETED =?, ISUSER =? WHERE ID = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (meetingId, details, deadline, assigner, assignee, isCompleted, todoId, True))
        conn.commit()
        conn.sync()


def deleteTodos(org: int, todoId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              DELETE FROM Org{org}Todo WHERE ID = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (todoId,))
        conn.commit()
        conn.sync()


def getMeetingTodos(org: int, meetingId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT ID, DETAILS, DEADLINE, ASSIGNER, ASSIGNEE, COMPLETED
              FROM Org{org}Todo WHERE MEETINGID = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (meetingId,))
        return cursor.fetchall()


def getUserTodosOrg(userId: id, org: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT ID, DETAILS, DEADLINE, ASSIGNER, ASSIGNEE, COMPLETED
              FROM Org{org}Todo '''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand)
        return cursor.fetchall()


def getUserTodos(userId: id, orgs: List[int]):
    initialise()
    conn.sync()
    todos = []
    with closing(conn.cursor()) as cursor:
        for org in orgs:
            sqlCommand = f'''
                      SELECT ID, DETAILS, DEADLINE, ASSIGNER, ASSIGNEE, COMPLETED
                      FROM Org{org}Todo
                      WHERE ASSIGNEE = ?'''
            cursor.execute(sqlCommand, (userId,))
            todos = todos + cursor.fetchall()
    return todos


def replaceMeetTodos(org: int, meetingId: int, todos: List[Tuple[str, str | None]]):
    initialise()
    conn.sync()
    with closing(conn.cursor()) as cursor:
        sqlCommand = f'''
        SELECT TEAM FROM Org{org}Todo
        WHERE MEETINGID = {meetingId}
        LIMIT 1
        '''
        cursor.execute(sqlCommand)
        team = cursor.fetchone()
        team = team[0] if team else "NULL"
        team = team if team else "NULL"

        sqlCommand = f'''
        DELETE FROM Org{org}Todo 
        WHERE MEETINGID = ?
        AND ISUSER = ?
        '''
        cursor.execute(sqlCommand, (meetingId, False))
        conn.commit()
        conn.sync()
        sqlCommand = f'''
        INSERT INTO Org{org}Todo (MEETINGID, TEAM, DETAILS, DEADLINE) 
        VALUES ({meetingId} , {team} , ?,?)
        '''
        sqlCommandNone = f'''
        INSERT INTO Org{org}Todo (MEETINGID, TEAM, DETAILS) 
        VALUES ({meetingId} , {team} , ?)
        '''
        for todo in todos:
            if not todo[1] or todo[1] is None:
                cursor.execute(sqlCommandNone, (todo[0],))
            else:
                cursor.execute(sqlCommand, todo)
        conn.commit()
        conn.sync()


def addBulkTodos(meetingId: int, todos: List[Tuple[str, str | None]], org):
    initialise()
    conn.sync()
    sqlCommand = f'''
              INSERT INTO Org{org}Todo (MEETINGID,DETAILS, DEADLINE)
              VALUES ({meetingId} ,?,?)'''
    sqlCommandNone = f'''
        INSERT INTO Org{org}Todo (MEETINGID, DETAILS) 
        VALUES ({meetingId} , ?)
        '''
    with closing(conn.cursor()) as cursor:
        for todo in todos:
            if not todo[1]:
                cursor.execute(sqlCommandNone, (todo[0],))
            else:
                cursor.execute(sqlCommand, todo)
        conn.commit()
        conn.sync()


def addBulkTodosTeam(meetingId: int, teamID: int, todos: List[Tuple[str, str | None]], org):
    initialise()
    conn.sync()
    sqlCommand = f'''
              INSERT INTO Org{org}Todo (MEETINGID,TEAM,DETAILS, DEADLINE)
              VALUES ({meetingId} , {teamID} ,?,?)'''
    sqlCommandNone = f'''
        INSERT INTO Org{org}Todo (MEETINGID, TEAM, DETAILS) 
        VALUES ({meetingId} , {teamID} , ?)
        '''
    with closing(conn.cursor()) as cursor:
        for todo in todos:
            if not todo[1]:
                cursor.execute(sqlCommandNone, (todo[0],))
            else:
                cursor.execute(sqlCommand, todo)
        conn.commit()
        conn.sync()


def getTeamById(org: int, teamId: int):
    initialise()
    conn.sync()
    sqlCommand = f'''
              SELECT NAME
              FROM Org{org}Team WHERE ID = ?'''
    with closing(conn.cursor()) as cursor:
        cursor.execute(sqlCommand, (teamId,))
        return cursor.fetchone()

