class FileSaveError(Exception):
    """Raised when there is an error saving the file."""
    pass

class FileReadError(Exception):
    """Raised when there is an error reading the file."""
    pass

class TileSetNotFoundError(Exception):
    """Exception raised when a tile is not found."""
    pass

class GeoTIFFProcessingError(Exception):
    """Exception raised when processing a GeoTIFF fails."""
    pass