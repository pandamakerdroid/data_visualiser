from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from app.core.config import csv_settings,app_settings
from  app.services import csv_service
import os
from app.exceptions import FileSaveError, FileReadError

csv_router = APIRouter(prefix=f"{app_settings.api_prefix}{csv_settings.api_prefix}")

os.makedirs(csv_settings.csv_dir, exist_ok=True)


@csv_router.get("/all")
async def available_csvs():
    maps = csv_service.available_csvs()
    if not maps:
        return JSONResponse({"message": "No csvs available"}, status_code=404)
    return JSONResponse({"maps": maps})


@csv_router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    try:
        file_path = csv_service.save_csv(file)
        return {"message": "File saved successfully", "file_path": file_path}
    except FileSaveError as e:
        raise HTTPException(status_code=500, detail=str(e))


@csv_router.get("/{filename}")
async def get_csv_content(filename: str):
    file_path = f"{csv_settings.csv_dir}/{filename}"
    try:
        content = csv_service.read_csv(file_path)
        return {"filename": filename, "content": content}
    except FileReadError as e:
        raise HTTPException(status_code=404, detail=str(e))