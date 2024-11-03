import os
import tempfile
import subprocess
from pathlib import Path
from app.exceptions import TileSetNotFoundError, GeoTIFFProcessingError
from app.core.config import map_settings
    

def available_maps():
    """Lists all available map directories."""
    if not os.path.isdir(map_settings.map_dir):
        return []

    return [{"name": subdir.name, "url": f"{map_settings.api_prefix}/{subdir.name}"} for subdir in Path(map_settings.map_dir).iterdir() if subdir.is_dir()]


def get_tile_path(dataset: str, z: int, x: int, y: int):
    """Constructs the path for a specific tile and raises an exception if not found."""
    tile_path = os.path.join(map_settings.map_dir, dataset, str(z), str(x), f"{y}.png")
    if not os.path.isfile(tile_path):
        raise TileSetNotFoundError("Tile not found")
    return tile_path


def save_and_process_geotiff(file):
    """Processes a GeoTIFF file and generates map tiles and a legend."""

    with tempfile.NamedTemporaryFile(delete=False, suffix=".tif") as temp_file:
        temp_file.write(file.file.read())
        temp_file_path = temp_file.name

    output_folder = os.path.join(map_settings.map_dir, Path(file.filename))

    # create tileset
    try:
        create_tiles(temp_file_path, output_folder, map_settings.zoom_levels)
    except Exception as e:
        raise GeoTIFFProcessingError(f"Failed to process GeoTIFF: {e}")
    finally:
        os.remove(temp_file_path)
    return f"/maps/{Path(file.filename)}"


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