"""
Pydantic-схемы для админ-эндпоинтов.
"""
from typing import Optional, List
from pydantic import BaseModel, Field


class PartContentUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    brand: Optional[str] = Field(None, max_length=255)
    category_name: Optional[str] = Field(None, max_length=255)


class ImageReorderItem(BaseModel):
    url: str
    sort_order: int
    is_primary: bool = False


class ImageReorderRequest(BaseModel):
    images: List[ImageReorderItem]


class AddImageByUrlRequest(BaseModel):
    url: str
    set_as_primary: bool = False


class RevertToSyncRequest(BaseModel):
    confirm: bool = True
