from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.core.utils import generate_ticket_id

if TYPE_CHECKING:
    from app.models import Note


class Ticket(Base):
    __tablename__ = "tickets"
    id: Mapped[int] = mapped_column(
        Integer, nullable=False, primary_key=True, index=True
    )
    ticket_id: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=True,
        index=True,
        default=generate_ticket_id,
    )
    customer_name: Mapped[str] = mapped_column(String, nullable=False)
    customer_email: Mapped[str] = mapped_column(String, nullable=False)
    subject: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="Open")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.now(UTC)
    )
    notes: Mapped[list["Note"]] = relationship(
        "Note",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="Note.created_at",
    )
