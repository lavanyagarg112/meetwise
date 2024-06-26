from fastapi import FastAPI, HTTPException, Response, Request, Cookie
from typing import Annotated
from IOSchema import UserSignUp, UserDetails, UserLogIn, Organisation, OrganisationPersonalReport, OrganisationName, \
    OrganisationNameOptional
from UserAccounts import createUser, getUserDetails, userCredentials, getUserByID, validateCookie, getOrganisationsByID, \
    setOrganisationActive
from Organisations import createOrganisation, getOrganisationReport
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


origins = "http://localhost:.*"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["null"],
    allow_origin_regex=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


#TODO : add return types
@app.post("/sign-up")
async def signup(user: UserSignUp, response: Response):
    try:
        userCred, error = createUser(user)
        if error is not None:
            return {"error": error}, 400
            # The calls are separated to ensure data is actually written to DB successfully,
            #  after DB testing can merge them into 1 like current implementation
    except:
        raise HTTPException(status_code=500, detail="Internal Server Error while logging in.")
    userDetails, error, activeOrg = getUserDetails(userCred, False)
    response.set_cookie("credentials", userCredentials(userDetails.id), samesite='none', secure=True, httponly=True)
    return {"user": userDetails}


@app.post("/sign-in")
async def signin(user: UserLogIn, response: Response):
    try:
        userDetails, error, activeOrganisation = getUserDetails(user, True)
        if error is not None:
            return {"error": error}, 401
    except:
        raise HTTPException(status_code=500, detail="Internal Server Error while logging in.")
    response.set_cookie("credentials", userCredentials(userDetails.id), samesite='none', secure=True, httponly=True)
    return {"user": userDetails, "activeOrganisation": activeOrganisation}


@app.get("/logged-in")
async def logged_in(credentials: Annotated[str, Cookie()] = None):
    if credentials is None:
        raise HTTPException(status_code=401, detail="No credentials provided")
    id, error = validateCookie(credentials)
    if error is not None:
        raise HTTPException(status_code=401, detail=error)
    userDetails = getUserByID(id)
    return userDetails


@app.get("/get-organisations")
async def getOrganisations(credentials: Annotated[str, Cookie()] = None):
    if credentials is None:
        raise HTTPException(status_code=401, detail="No credentials provided")
    id, error = validateCookie(credentials)
    if error is not None:
        raise HTTPException(status_code=401, detail=error)
    organisations = getOrganisationsByID(id)
    return {"organisations": organisations}


@app.post("/new-organisation")
async def newOrganisation(name: OrganisationName, credentials: Annotated[str, Cookie()] = None):
    if credentials is None:
        raise HTTPException(status_code=401, detail="No credentials provided")
    id, error = validateCookie(credentials)
    if error is not None:
        raise HTTPException(status_code=401, detail=error)
    # TODO: Implement new organisation logic
    organisation: Organisation = createOrganisation(name.name, id)
    return organisation


@app.post("/organisationpage")
async def organisationPage(name: OrganisationName, credentials: Annotated[str, Cookie()] = None):
    if credentials is None:
        raise HTTPException(status_code=401, detail="No credentials provided")
    id, error = validateCookie(credentials)
    if error is not None:
        raise HTTPException(status_code=401, detail=error)
    # TODO: Implement organisation page logic
    orgReport: OrganisationPersonalReport = getOrganisationReport(id, name.name)
    return orgReport


@app.post("/set-active-organisation")
async def setActiveOrganisation(name: OrganisationNameOptional, credentials: Annotated[str, Cookie()] = None):
    if credentials is None:
        raise HTTPException(status_code=401, detail="No credentials provided")
    id, error = validateCookie(credentials)
    if error is not None:
        raise HTTPException(status_code=401, detail=error)
    setOrganisationActive(id, name.name)


# TODO: remove after hosting
# only for testing purposes
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="localhost", port=8000)
