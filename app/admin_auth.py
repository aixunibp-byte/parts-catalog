"""
Простая токен-авторизация для админки.
"""
import os
from fastapi import Header, HTTPException, status

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")

if not ADMIN_TOKEN:
    raise RuntimeError(
        "ADMIN_TOKEN не задан в .env — сгенерируйте: openssl rand -hex 32"
    )


def require_admin(authorization: str = Header(None)) -> None:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется заголовок Authorization: Bearer <token>",
        )
    token = authorization.removeprefix("Bearer ").strip()
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Неверный токен")
