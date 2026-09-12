from datetime import datetime

from pydantic import BaseModel


class NoteCreate(BaseModel):
    note_text: str


class NoteResponse(BaseModel):
    note_text: str
    created_at: datetime
