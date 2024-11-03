from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from app.services import map_service
from app.exceptions import TileSetNotFoundError, GeoTIFFProcessingError
from app.core.config import map_settings, app_settings

map_router = APIRouter(prefix=f"{app_settings.api_prefix}{map_settings.api_prefix}", tags=["maps"])

@map_router.get("/all")
async def available_maps():
    maps = map_service.available_maps()
    if not maps:
        return JSONResponse({"message": "No maps available"}, status_code=404)
    return JSONResponse({"maps": maps})


@map_router.get("/{dataset}/{z}/{x}/{y}.png")
async def get_tile(dataset: str, z: int, x: int, y: int):
    try:
        tile_path = map_service.get_tile_path(dataset, z, x, y)
        return FileResponse(tile_path, media_type="image/png")
    except TileSetNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@map_router.post("/upload")
async def process_geotiff(file: UploadFile = File(...)):
    try:
        response_data = map_service.save_and_process_geotiff(file)
        return response_data
    except GeoTIFFProcessingError as e:
        raise HTTPException(status_code=500, detail=str(e))