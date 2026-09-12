from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf8",
        env_ignore_empty=True,
    )
    # App
    project_name: str = "Supportflow CRM"
    version: str = "1.0.0"


settings = Settings()
