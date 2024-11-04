from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse, RedirectResponse
from app.services import map_service
from app.exceptions import TileSetNotFoundError, GeoTIFFProcessingError
from app.core.config import map_settings, app_settings

map_router = APIRouter(prefix=f"{app_settings.api_prefix}{map_settings.api_prefix}", tags=["maps"])

@map_router.get("/all")
async def available_maps():
    """Endpoint to get all available maps."""
    maps = map_service.available_maps()
    if not maps:
        return JSONResponse({"message": "No maps available"}, status_code=404)
    return JSONResponse({"maps": maps})

@map_router.get("/{dataset}/{z}/{x}/{y}.png")
async def get_tile(dataset: str, z: int, x: int, y: int):
    """Endpoint to retrieve a specific tile, proxied through the backend."""
    try:
        tile_url = map_service.get_tile_path(dataset, z, x, y)
        return RedirectResponse(tile_url)  # Redirect to the actual Azure Blob URL
    except TileSetNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@map_router.post("/upload")
async def process_geotiff(file: UploadFile = File(...)):
    """Endpoint to upload a GeoTIFF and process it into map tiles."""
    try:
        response = map_service.save_and_process_geotiff(file)
        return JSONResponse(response)
    except GeoTIFFProcessingError as e:
        raise HTTPException(status_code=500, detail=str(e))