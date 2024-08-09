import enum

from fastapi import HTTPException


class AuthError(enum.Enum):
    USER_DOES_NOT_EXIST = "User does not exist"
    WRONG_PASSWORD = "Invalid Credentials"


class CreateUserError(enum.Enum):
    USER_ALREADY_EXISTS = "User already exists"
    EMAIL_ALREADY_EXISTS = "Email already exists"


'''
wrapper for throwing HTTP exceptions with status code 401
'''


def AuthenticationError(detail: str):
    raise HTTPException(status_code=401, detail=detail)
