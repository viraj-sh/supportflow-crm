FROM python:3.12-alpine AS builder

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --target=/install -r requirements.txt

FROM python:3.12-alpine AS runner

WORKDIR /app

COPY --from=builder /install /install

ENV PYTHONPATH=/install
ENV PATH="/install/bin:$PATH"

COPY . .

CMD ["uvicorn", "app.main:app","--host", "0.0.0.0", "--port", "8000"]

EXPOSE 8000