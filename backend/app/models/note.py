from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base

if TYPE_CHECKING:
    from app.models import Ticket


class Note(Base):
    __tablename__ = "notes"
    id: Mapped[int] = mapped_column(
        Integer, nullable=False, primary_key=True, index=True
    )
    ticket_id: Mapped[str] = mapped_column(
        String, ForeignKey("tickets.ticket_id"), nullable=False, index=True
    )
    note_text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.now(UTC)
    )
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="notes")
