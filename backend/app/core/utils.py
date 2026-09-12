from sqlalchemy import text

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
