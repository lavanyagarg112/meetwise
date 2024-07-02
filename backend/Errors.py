import enum


class AuthError(enum.Enum):
    USER_DOES_NOT_EXIST = 0
    WRONG_PASSWORD = 1

class CreateUserError(enum.Enum):
    USER_ALREADY_EXISTS = 0
    EMAIL_ALREADY_EXISTS = 1