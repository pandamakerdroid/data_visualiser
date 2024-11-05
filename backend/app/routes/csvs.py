from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from app.core.config import csv_settings,app_settings
from app.services import csv_service
import os
from app.exceptions import FileSaveError, FileReadError
from .dependencies import get_current_user

csv_router = APIRouter(prefix=f"{app_settings.api_prefix}{csv_settings.api_prefix}")

os.makedirs(csv_settings.csv_dir, exist_ok=True)


@csv_router.get("/all")
async def available_csvs(current_user: dict = Depends(get_current_user)):
    csvs = csv_service.available_csvs()
    if not csvs:
        return JSONResponse({"message": "No csvs available"}, status_code=404)
    return JSONResponse({"csvs": csvs})


@csv_router.post("/upload")
async def upload_csv(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        filename = csv_service.save_csv(file)
        return {"message": "File saved successfully", "file_path":  f"{csv_settings.api_prefix}/{filename}"}
    except FileSaveError as e:
        raise HTTPException(status_code=500, detail=str(e))


@csv_router.get("/{filename}")
async def get_csv_content(filename: str, current_user: dict = Depends(get_current_user)):
    file_path = f"{csv_settings.csv_dir}/{filename}"
    try:
        content = csv_service.read_csv(file_path)
        return {"filename": filename, "content": content}
    except FileReadError as e:
        raise HTTPException(status_code=404, detail=str(e))