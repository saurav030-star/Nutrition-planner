"""
Entrypoint alias allowing uvicorn to run from the backend directory:
    uvicorn main:app --reload
as well as from the project root:
    uvicorn app.main:app --app-dir backend --reload
"""
from app.main import app

__all__ = ["app"]
