import datetime
from typing import List

import jwt
from jwt import ExpiredSignatureError
from dotenv import load_dotenv
from IOSchema import UserDetails, UserSignUp, UserLogIn, UserInfo, Organisation
import os

from Errors import CreateUserError, AuthError
from database import setActiveOrganisation

load_dotenv()
secret = os.environ["JWT_SIGNING_KEY"]
EXPIRY_TIME = datetime.timedelta(minutes=10)


#TODO: Query DB and return UserDetails
def getUserDetails(user: UserLogIn, activeOrgNeeded: bool) -> [UserDetails, AuthError, str]:
    user = UserDetails(id=1, email=user.email, username="DummyUser"), None
    if activeOrgNeeded:
        return user, str
    else:
        return user, None


def getUserByID(user: int) -> UserInfo:
    return UserInfo(user=UserDetails(id=user, email="dummyEmail", username="DummyUser", firstName="Dummy"),
                    activeOrganisation="Dummy")


#TODO:Database operations to create a new user
def createUser(user: UserSignUp) -> [UserLogIn, CreateUserError]:
    # Database operations to create a new user
    return UserLogIn(email=user.email, password=user.password), None


def userCredentials(userId: int) -> str:
    encoded = jwt.encode({"exp": datetime.now(tz=datetime.timezone.utc) + EXPIRY_TIME, "userId": userId}, secret,
                         algorithm="HS512")
    return encoded


def getOrganisationsByID(userId: int) -> List[Organisation]:
    return [Organisation(id=0, name="Hi"), Organisation(id=1, name="How are you")]


def validateCookie(user) -> [int, str]:
    try:
        id: int = jwt.decode(user, secret, algorithm="HS512")
    except ExpiredSignatureError:
        return None, "Token Expired"
    except jwt.InvalidIssuerError:
        return None, "Forged JWT"
    except jwt.InvalidTokenError:
        return None, "Invalid JWT"
    return id, None


def setOrganisationActive(userId: int,name: str):
    setActiveOrganisation(userId,name)
