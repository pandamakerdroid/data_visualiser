from fastapi import APIRouter, Depends, HTTPException, status
from app.core.config import app_settings, auth_settings
from fastapi.security import OAuth2PasswordRequestForm
from app.services import auth_service

auth_router = APIRouter(prefix=f"{app_settings.api_prefix}{auth_settings.api_prefix}")

@auth_router.post("")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credential!",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_service.create_access_token(user["username"])
    return {"access_token": access_token, "token_type": "bearer"}