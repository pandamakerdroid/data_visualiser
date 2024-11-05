import os
import shutil
from pathlib import Path
from fastapi import UploadFile, File, HTTPException
from app.core.config import csv_settings
from app.exceptions import FileSaveError, FileReadError
from azure.storage.blob import BlobServiceClient

blob_service_client = BlobServiceClient(
    account_url=csv_settings.blob_account_url, 
    credential=csv_settings.blob_sas_token
)
container_name = csv_settings.container_name


def available_csvs():
    """Lists all csvs in azure blob container."""
    try:
        container_client = blob_service_client.get_container_client(container_name)
        blob_list = container_client.list_blobs()

        csv_files = [
            {"name": blob.name}
            for blob in blob_list
            if blob.name.endswith('.csv')
        ]
        
        return csv_files
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list CSV files: {e}")

def save_csv(file: UploadFile = File(...)):
    try:
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=file.filename)
        blob_client.upload_blob(file.file, overwrite=True)
    
        return file.filename
    except (OSError, shutil.Error) as e:
        raise FileSaveError(f"Failed to save the file '{file.filename} to azure blob container': {e}")

def read_csv(filename):
    try:
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=filename)
        download_stream = blob_client.download_blob()
        
        return download_stream.readall().decode("utf-8")
    except (OSError, IOError) as e:
        raise FileReadError(f"Failed to read the file '{filename} from the azure blob container': {e}")