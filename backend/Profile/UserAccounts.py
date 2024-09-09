import datetime
from typing import List, Annotated

import bcrypt
import jwt
from fastapi import Cookie, HTTPException, Response
from jwt import ExpiredSignatureError
from dotenv import load_dotenv
from backend.States.IOSchema import Person, UserSignUp, UserLogIn, UserInfo, Organisation, InviteOutput
import os

from backend.States.Errors import CreateUserError, AuthError, AuthenticationError
from backend.Organisation.OrganisationHelpers import getOrganisationByID, getOrganisationByName, getOrgs, forceJoin, \
    getRoleByID
from backend.States.Enums import Roles
from backend.database.database import setActiveOrganisation, getUserDetailsByName, getUserDetailsByEmail, \
    getUserDetailsByID, \
    checkUserEmail, createNewUser, checkUserUsername, checkUserOrg, addUserToOrg, addToPending

load_dotenv('.env')
secret = os.environ["JWT_SIGNING_KEY"]
EXPIRY_TIME = datetime.timedelta(days=1)


def getUserDetails(user: UserLogIn) -> [Person, AuthError, str | None]:
    details = []
    if user.username is not None:
        details = getUserDetailsByName(user.username)
    else:
        details = getUserDetailsByEmail(user.email)
    if details is None:
        return None, AuthError.USER_DOES_NOT_EXIST, None
    encode = user.password.encode('utf-8')
    if not bcrypt.checkpw(encode, details[5].encode('utf-8')):
        return None, AuthError.WRONG_PASSWORD, None
    user = Person(id=details[0], email=details[1], username=details[2], firstName=details[3], lastName=details[4])
    return user, None, getOrganisationByID(details[6])


def getUserByID(user: int) -> UserInfo | None:
    details = getUserDetailsByID(user)
    if not details:
        return None
    return UserInfo(
        user=Person(id=user, email=details[0], username=details[1], firstName=details[2], lastName=details[3]),
        activeOrganisation=getOrganisationByID(details[4]))


def createUser(user: UserSignUp) -> [Person, CreateUserError]:
    if checkUserEmail(user.email) is not None:
        return None, CreateUserError.EMAIL_ALREADY_EXISTS
    if checkUserUsername(user.username) is not None:
        return None, CreateUserError.USER_ALREADY_EXISTS
    encode = user.password.encode('utf-8')
    hashed_password = bcrypt.hashpw(encode, bcrypt.gensalt()).decode('utf-8')
    id = createNewUser(user.username, user.email, hashed_password, user.firstName, user.lastName)
    forceJoin(user.email)
    return Person(id=id, email=user.email, username=user.username, lastName=user.lastName,
                  firstName=user.firstName), None


def getOrganisationsByID(userId: int) -> List[Organisation]:
    return getOrgs(userId)


def setOrganisationActive(userId: int, name: str):
    setActiveOrganisation(userId, getOrganisationByName(name))


def inviteOrAddUser(userId, email, role, organisation) -> InviteOutput:
    organisation = getOrganisationByName(organisation)
    if getRoleByID(organisation, userId) == Roles.USER.value:
        AuthenticationError("Only admins can invite users.")
    if checkUserEmail(email):
        userId = getUserDetailsByEmail(email)[0]
        if checkUserOrg(userId, organisation):
            raise HTTPException(status_code=400, detail="User already exists in Organisation")
        else:
            addUserToOrg(orgId=organisation, userId=userId, role=role)
        id = userId
    else:
        id = addToPending(email, role, organisation)
    return InviteOutput(id=id, email=email, role=role)


'''
makes and sets the cookie in browser with user id.
The method is hardcoded to accept only user id for now as we want to minimise 
identifying information used in cookie.
Having a common method helps keeps the cookies consistent
'''


def bakeCookie(userId: int, response: Response):
    encoded = jwt.encode({"exp": datetime.datetime.now(tz=datetime.timezone.utc) + EXPIRY_TIME, "userId": userId},
                         secret, algorithm="HS512")
    response.set_cookie("credentials", encoded, samesite='none', secure=True, httponly=True)


'''
validates and unpacks cookie.
'''


def eatCookie(credentials: Annotated[str, Cookie()] = None) -> int:
    if credentials is None:
        AuthenticationError("No credentials provided")
    try:
        id: int = jwt.decode(credentials, secret, algorithms="HS512")['userId']
    except ExpiredSignatureError:
        AuthenticationError("Token Expired")
    except jwt.InvalidIssuerError:
        AuthenticationError("Forged JWT")
    except jwt.InvalidTokenError:
        AuthenticationError("Invalid JWT")
    return id
