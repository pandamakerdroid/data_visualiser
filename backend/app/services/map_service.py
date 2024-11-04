# app/services/map_service.py

import os
import tempfile
import subprocess
from pathlib import Path
from azure.storage.blob import BlobServiceClient
from app.exceptions import TileSetNotFoundError, GeoTIFFProcessingError
from app.core.config import map_settings
import shutil

# Initialize the BlobServiceClient with the SAS URL
blob_service_client = BlobServiceClient(
    account_url=map_settings.blob_account_url, 
    credential=map_settings.blob_sas_token
)
container_name = map_settings.container_name

def available_maps():
    """Lists all available map directories in Azure Blob Storage."""
    try:
        container_client = blob_service_client.get_container_client(container_name)
        blobs = container_client.list_blobs()
        maps = {}
        for blob in blobs:
            dataset_name = blob.name.split('/')[0]
            if dataset_name not in maps:
                maps[dataset_name] = {
                    "name": dataset_name,
                    "url": f"/maps/{dataset_name}"
                }
        return list(maps.values())
    except Exception as e:
        raise GeoTIFFProcessingError(f"Failed to list available maps: {e}")

def get_tile_path(dataset: str, z: int, x: int, y: int):
    """Constructs the URL for a specific tile in Azure Blob Storage."""
    blob_name = f"{dataset}/{z}/{x}/{y}.png"
    blob_url = f"{map_settings.blob_account_url}/{container_name}/{blob_name}?{map_settings.blob_sas_token}"
    return blob_url



def save_and_process_geotiff(file):
    """Processes a GeoTIFF file, generates map tiles, and uploads them to Azure Blob Storage."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".tif") as temp_file:
        temp_file.write(file.file.read())
        temp_file_path = temp_file.name

    output_folder = Path(tempfile.mkdtemp())  # Temporary local folder for tiles

    try:
        create_tiles(temp_file_path, output_folder, map_settings.zoom_levels)
        upload_tiles_to_azure(output_folder, Path(file.filename).stem)
    except Exception as e:
        raise GeoTIFFProcessingError(f"Failed to process and upload GeoTIFF: {e}")
    finally:
        os.remove(temp_file_path)
        # Clean up the entire temporary directory
        shutil.rmtree(output_folder)
        
    return {"map_name":Path(file.filename).stem,
            "map_url": f"/maps/{Path(file.filename).stem}"}

def create_tiles(input_path, output_folder, zoom_levels):
    """Generates map tiles from a GeoTIFF file."""
    temp_8bit_path = "temp_8bit_wgs84.tif"

    # Convert to 8-bit, provided files are 24bit and not compatible
    subprocess.run([
        "gdal_translate",
        "-ot", "Byte",
        "-scale",
        input_path,
        temp_8bit_path
    ], check=True)

    os.makedirs(output_folder, exist_ok=True)
    subprocess.run([
        "gdal2tiles.py",
        "-z", zoom_levels,
        "-r", "bilinear",
        temp_8bit_path,
        output_folder
    ], check=True)

    os.remove(temp_8bit_path)

def upload_tiles_to_azure(local_tile_folder, dataset_name):
    """Uploads all generated tiles in a local folder to Azure Blob Storage."""
    container_client = blob_service_client.get_container_client(container_name)
    for root, dirs, files in os.walk(local_tile_folder):
        for file in files:
            local_file_path = os.path.join(root, file)
            relative_path = os.path.relpath(local_file_path, local_tile_folder)
            blob_name = f"{dataset_name}/{relative_path.replace(os.path.sep, '/')}"

            blob_client = container_client.get_blob_client(blob_name)
            with open(local_file_path, "rb") as data:
                blob_client.upload_blob(data, overwrite=True)
