from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.schemas.note import NoteResponse


class TicketCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str


class TicketResposne(BaseModel):
    ticket_id: str
    created_at: datetime


class TicketDetailedResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str
    status: str
    notes: list[NoteResponse] = []


class TicketStats(BaseModel):
    total: int
    open: int
    closed: int
