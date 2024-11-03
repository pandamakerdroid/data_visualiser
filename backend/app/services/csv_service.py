import os
import shutil
from pathlib import Path
from fastapi import UploadFile, File
from app.core.config import csv_settings
from app.exceptions import FileSaveError, FileReadError


def available_csvs():
    """Lists all available map directories."""
    if not os.path.isdir(csv_settings.csv_dir):
        return []

    return [
        {"name": file.name, "url": f"{csv_settings.api_prefix}/{file.name}"} 
            for file in Path(csv_settings.csv_dir).iterdir() 
            if file.is_file() and file.suffix=='.csv'
    ]

def save_csv(file: UploadFile = File(...)):
    try:
        os.makedirs(csv_settings.csv_dir, exist_ok=True)
        file_path = os.path.join(csv_settings.csv_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return file_path
    except (OSError, shutil.Error) as e:
        raise FileSaveError(f"Failed to save the file '{file.filename}': {e}")

def read_csv(file_path):
    try:
        with open(file_path, "r") as file:
            return file.read()
    except (OSError, IOError) as e:
        raise FileReadError(f"Failed to read the file '{file_path}': {e}")