import enum


class AuthError(enum.Enum):
    USER_DOES_NOT_EXIST = "User does not exist"
    WRONG_PASSWORD = "Wrong Password"


class CreateUserError(enum.Enum):
    USER_ALREADY_EXISTS = "User already exists"
    EMAIL_ALREADY_EXISTS = "Email already exists"
