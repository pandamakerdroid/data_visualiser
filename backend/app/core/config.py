from pydantic_settings import BaseSettings
import toml

class MapsConfig(BaseSettings):
    zoom_levels: str
    map_dir: str
    api_prefix: str
    container_name: str
    blob_account_url: str
    blob_sas_token: str

class CsvConfig(BaseSettings):
    csv_dir: str
    api_prefix: str

class AppConfig(BaseSettings):
    title: str
    version: str
    api_prefix: str

class AuthConfig(BaseSettings):
    api_prefix: str

def load_config():
    config_data = toml.load("config.toml")
    
    map_settings = MapsConfig(**config_data.get("map_settings", {}))
    csv_settings = CsvConfig(**config_data.get("csv_settings", {}))
    app_settings = AppConfig(**config_data.get("app_settings", {}))
    auth_settings = AuthConfig(**config_data.get("auth_settings", {}))

    return map_settings, csv_settings, app_settings, auth_settings

# Access configuration sections as attributes
map_settings, csv_settings, app_settings, auth_settings = load_config()