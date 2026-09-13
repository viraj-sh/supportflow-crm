import os
import sys

from sqlalchemy import text


def static_path() -> str:
    if hasattr(sys, "_MEIPASS"):
        base_dir = sys._MEIPASS  # type: ignore
    elif os.path.basename(sys.executable).startswith("python"):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    else:
        base_dir = os.path.dirname(sys.executable)
    return os.path.join(base_dir, "static")


TICKET_ID_PREFIX = "TKT-"
TICKET_ID_PREFIX_LEN = len(TICKET_ID_PREFIX)


def generate_ticket_id(context) -> str:

    connection = context.connection

    current_max = connection.execute(
        text(
            """
            SELECT MAX(CAST(SUBSTR(ticket_id, :start) AS INTEGER))
            FROM tickets
            """
        ),
        {"start": TICKET_ID_PREFIX_LEN + 1},
    ).scalar()

    next_num = (current_max or 0) + 1
    return f"{TICKET_ID_PREFIX}{next_num:03d}"
