from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import case, func, or_, select
from sqlalchemy.orm import selectinload

from app.core.db import DBSession
from app.models import Note, Ticket
from app.schemas.note import NoteCreate
from app.schemas.ticket import (
    Priority,
    Status,
    TicketCreate,
    TicketDetailedResponse,
    TicketResposne,
    TicketStats,
)

router = APIRouter()


@router.post(
    "/tickets", status_code=status.HTTP_201_CREATED, response_model=TicketResposne
)
async def create_ticket(ticket: TicketCreate, db: DBSession):
    new_ticket = Ticket(
        customer_name=ticket.customer_name,
        customer_email=ticket.customer_email,
        subject=ticket.subject,
        description=ticket.description,
        priority=ticket.priority,
    )
    db.add(new_ticket)
    await db.commit()
    await db.refresh(new_ticket)
    return new_ticket


@router.get(
    "/tickets", status_code=status.HTTP_200_OK, response_model=list[TicketResposne]
)
async def list_tickets(
    db: DBSession,
    status: Status = Query(default=None),
    priority: Priority = Query(default=None),
    search: str = Query(default=None),
    limit: int = 20,
    offset: int = 0,
):
    priority_rank = case(
        (Ticket.priority == "High", 1),
        (Ticket.priority == "Medium", 2),
        (Ticket.priority == "Low", 3),
        else_=4,
    )
    query = select(Ticket)
    if status:
        query = query.where(Ticket.status == status)
    if priority:
        query = query.where(Ticket.priority == priority)

    if search:
        term = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(Ticket.customer_name).like(term),
                func.lower(Ticket.ticket_id).like(term),
                func.lower(Ticket.customer_email).like(term),
                func.lower(Ticket.description).like(term),
            )
        )
    query = (
        query
        .order_by(priority_rank, Ticket.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    results = await db.execute(query)
    ticket_list = results.scalars().all()
    return ticket_list


@router.get(
    "/tickets/stats", status_code=status.HTTP_200_OK, response_model=TicketStats
)
async def fetch_ticket_stats(db: DBSession):
    results = await db.execute(select(func.count(Ticket.id)))
    total = results.scalar() or 0
    results = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.status == "Open")
    )
    open = results.scalar() or 0
    results = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.status == "Closed")
    )
    closed = results.scalar() or 0
    results = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.status == "In Progress")
    )
    in_progress = results.scalar() or 0
    results = await db.execute(
        select(func.count(Ticket.id)).where(
            Ticket.status == "Open", Ticket.priority == "High"
        )
    )
    high_open = results.scalar() or 0

    return TicketStats(
        total=total,
        open=open,
        closed=closed,
        in_progress=in_progress,
        high_open=high_open,
    )


@router.get(
    "/tickets/{ticket_id}",
    status_code=status.HTTP_200_OK,
    response_model=TicketDetailedResponse,
)
async def fetch_ticket(ticket_id: str, db: DBSession):
    results = await db.execute(
        select(Ticket)
        .options(selectinload(Ticket.notes))
        .where(func.lower(Ticket.ticket_id) == ticket_id.lower())
    )
    ticket = results.scalars().first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )
    return ticket


@router.put(
    "/tickets/{ticket_id}",
    status_code=status.HTTP_200_OK,
)
async def update_ticket(
    ticket_id: str, note: NoteCreate, status: Status, db: DBSession
):
    results = await db.execute(
        select(Ticket).where(func.lower(Ticket.ticket_id) == ticket_id.lower())
    )
    ticket = results.scalars().first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )
    ticket.status = status
    ticket.updated_at = datetime.now(UTC)
    if note.note_text and note.note_text.strip():
        new_note = Note(ticket_id=ticket.ticket_id, note_text=note.note_text)
        db.add(new_note)

    await db.commit()
    await db.refresh(ticket)
    return {"success": True, "updated_at": ticket.updated_at}
