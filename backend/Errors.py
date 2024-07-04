import enum

from fastapi import HTTPException


class AuthError(enum.Enum):
    USER_DOES_NOT_EXIST = 0
    WRONG_PASSWORD = 1


class CreateUserError(enum.Enum):
    USER_ALREADY_EXISTS = 0
    EMAIL_ALREADY_EXISTS = 1


'''
wrapper for throwing HTTP exceptions with status code 401
'''


def AuthenticationError(detail: str):
    raise HTTPException(status_code=401, detail=detail)
