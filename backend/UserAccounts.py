import datetime
from typing import List, Annotated

import bcrypt
import jwt
from fastapi import Cookie, HTTPException, Response
from jwt import ExpiredSignatureError
from dotenv import load_dotenv
from IOSchema import Person, UserSignUp, UserLogIn, UserInfo, Organisation
import os

from Errors import CreateUserError, AuthError, AuthenticationError
from Organisations import getOrganisationByID, getOrganisationByName,getOrgs
from database import setActiveOrganisation, getUserDetailsByName, getUserDetailsByEmail, getUserDetailsByID

load_dotenv('.env')
secret = os.environ["JWT_SIGNING_KEY"]
EXPIRY_TIME = datetime.timedelta(minutes=10)


def getUserDetails(user: UserLogIn) -> [Person, AuthError, str | None]:
    details = []
    if user.username is not None:
        details = getUserDetailsByName(user.username)
    else:
        details = getUserDetailsByEmail(user.email)
    if details is None:
        return None, AuthError.USER_DOES_NOT_EXIST, None
    encode = user.password.encode('utf-8')
    if not bcrypt.checkpw(encode, details[5]):
        return None, AuthError.WRONG_PASSWORD, None
    user = Person(id=details[0], email=details[1], username=details[2], firstName=details[3], lastName=details[4])
    return user, None, getOrganisationByID(details[6])


def getUserByID(user: int) -> UserInfo:
    details = getUserDetailsByID(user)
    return UserInfo(
        user=Person(id=user, email=details[0], username=details[1], firstName=details[2], lastName=details[3]),
        activeOrganisation=getOrganisationByID(details[4]))


#TODO:Database operations to create a new user
def createUser(user: UserSignUp) -> [UserLogIn, CreateUserError]:
    # Database operations to create a new user
    return UserLogIn(email=user.email, password=user.password), None


def getOrganisationsByID(userId: int) -> List[Organisation]:
    return getOrgs(userId)


def setOrganisationActive(userId: int, name: str):
    setActiveOrganisation(userId, getOrganisationByName(name))


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
