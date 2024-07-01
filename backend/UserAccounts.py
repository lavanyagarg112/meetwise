import datetime
from typing import List, Annotated

import jwt
from fastapi import Cookie, HTTPException, Response
from jwt import ExpiredSignatureError
from dotenv import load_dotenv
from IOSchema import Person, UserSignUp, UserLogIn, UserInfo, Organisation
import os

from Errors import CreateUserError, AuthError
from database import setActiveOrganisation, getUserDetailsByName, getUserDetailsByEmail

load_dotenv('.env')
secret = os.environ["JWT_SIGNING_KEY"]
EXPIRY_TIME = datetime.timedelta(minutes=10)


#TODO: Query DB and return Person
def getUserDetails(user: UserLogIn) -> [Person, AuthError, str]:
    details =[]
    if user.username is not None:
     details = getUserDetailsByName(user.username)
    else :
     details = getUserDetailsByEmail(user.email)
    if details is None:
        return None, AuthError.USER_DOES_NOT_EXIST, None
    if details[5] != user.password:
        return None, AuthError.WRONG_PASSWORD, None
    user = Person(id=details[0], email=details[1], username=details[2], firstName=details[3], lastName=details[4])
    return user, None, details[6]


def getUserByID(user: int) -> UserInfo:
    return UserInfo(user=Person(id=user, email="dummyEmail", username="DummyUser", firstName="Dummy"),
                    activeOrganisation="Dummy")


#TODO:Database operations to create a new user
def createUser(user: UserSignUp) -> [UserLogIn, CreateUserError]:
    # Database operations to create a new user
    return UserLogIn(email=user.email, password=user.password), None


def getOrganisationsByID(userId: int) -> List[Organisation]:
    return [Organisation(id=0, name="Hi"), Organisation(id=1, name="How are you")]


def setOrganisationActive(userId: int, name: str):
    setActiveOrganisation(userId, name)


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


'''
wrapper for throwing HTTP exceptions with status code 401
'''


def AuthenticationError(detail: str):
    raise HTTPException(status_code=401, detail=detail)
