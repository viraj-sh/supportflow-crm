from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr

from app.schemas.note import NoteResponse

Status = Literal["Open", "In Progress", "Closed"]
Priority = Literal["Low", "Medium", "High"]


class TicketCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str
    priority: Priority = "Medium"


class TicketResposne(BaseModel):
    ticket_id: str
    customer_name: str
    subject: str
    status: Status
    priority: Priority
    created_at: datetime


class TicketDetailedResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str
    status: Status
    priority: str
    notes: list[NoteResponse] = []


class TicketStats(BaseModel):
    total: int
    open: int
    closed: int
    in_progress: int
    high_open: int
