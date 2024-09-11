
from typing import List

import bcrypt

from fastapi import HTTPException

from backend.Profile.Authentication import encrypt
from backend.States.IOSchema import Person, UserSignUp, UserLogIn, UserInfo, Organisation, InviteOutput


from backend.States.Errors import CreateUserError, AuthError, AuthenticationError
from backend.Organisation.OrganisationHelpers import getOrganisationByID, getOrganisationByName, getOrgs, forceJoin, \
    getRoleByID, removeUserUnchecked
from backend.States.Enums import Roles
from backend.database.database import setActiveOrganisation, getUserDetailsByName, getUserDetailsByEmail, \
    getUserDetailsByID, \
    checkUserEmail, createNewUser, checkUserUsername, checkUserOrg, addUserToOrg, addToPending, updateUserName, \
    updatePassWord, deleteUser, isOwner, removeUser


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
    hashed_password = encrypt(user.password)
    id = createNewUser(user.username, user.email, hashed_password, user.firstName, user.lastName)
    forceJoin(user.email)
    return Person(id=id, email=user.email, username=user.username, lastName=user.lastName,
                  firstName=user.firstName), None


def updateUsername(user: int, username: str):
    updateUserName(user, username)


def updatePassword(user: int, password: str):
    password = encrypt(password)
    updatePassWord(user, password)


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


def deleteUserByID(userId: int):
    """
    if owner throw exception
    else delete his trace

    Delete him from all his organisations

    Delete him from Users table

    :param userId:
    :return:
    """
    if isOwner(userId):
        raise HTTPException(status_code=400, detail="Owner cannot be deleted")
    orgs = getOrganisationsByID(userId)
    if orgs:
        for org in orgs:
            removeUserUnchecked(userId, org.id)
    deleteUser(userId)



