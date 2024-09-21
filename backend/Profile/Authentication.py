import bcrypt
import jwt
from jwt import ExpiredSignatureError
from dotenv import load_dotenv
import datetime
import os
from fastapi import Cookie, Response
from typing import Annotated

from backend.States.Errors import AuthenticationError

load_dotenv('.env')
secret = os.environ["JWT_SIGNING_KEY"]
EXPIRY_TIME = datetime.timedelta(days=1)


def encrypt(password: str) -> str:
    """
    Encrypts the password and return it as a string
    It uses hashing and salting from bcrypt
    :return: hashed password
    """
    encode = password.encode('utf-8')
    return bcrypt.hashpw(encode, bcrypt.gensalt()).decode('utf-8')


def bakeCookie(userId: int, response: Response):
    """
        makes and sets the cookie in browser with user id.
        The method is hardcoded to accept only user id for now as we want to minimise
        identifying information used in cookie.
        Having a common method helps keeps the cookies consistent
    """
    encoded = jwt.encode({"exp": datetime.datetime.now(tz=datetime.timezone.utc) + EXPIRY_TIME, "userId": userId},
                         secret, algorithm="HS512")
    response.set_cookie("credentials", encoded, samesite='none', secure=True, httponly=True)


def eatCookie(credentials: Annotated[str, Cookie()] = None) -> int:
    """
        validates and unpacks cookie.
    """

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
