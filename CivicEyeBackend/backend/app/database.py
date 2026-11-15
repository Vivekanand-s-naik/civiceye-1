"""
Database Configuration Module

Sets up SQLAlchemy engine, session maker, and base model.
Provides get_db dependency for FastAPI dependency injection.
"""

# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker, Session
# from typing import Generator
# from app.config import settings

# # Create SQLAlchemy engine
# # Using synchronous engine for simplicity. For async, use create_async_engine with asyncpg
# engine = create_engine(
#     settings.DATABASE_URL,
#     pool_pre_ping=True,  # Verify connections before using
#     pool_size=10,  # Connection pool size
#     max_overflow=20,  # Max connections beyond pool_size
#     echo=settings.DEBUG  # Log SQL queries in debug mode
# )

# # Create session factory
# SessionLocal = sessionmaker(
#     autocommit=False,
#     autoflush=False,
#     bind=engine
# )

# # Base class for all ORM models
# Base = declarative_base()


# def get_db() -> Generator[Session, None, None]:
#     """
#     Database session dependency for FastAPI.
    
#     Yields a database session and ensures it's properly closed after use.
#     Use this in FastAPI route dependencies:
    
#     @app.get("/users")
#     def get_users(db: Session = Depends(get_db)):
#         ...
#     """
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# def init_db():
#     """
#     Initialize database - create all tables.
#     This is mainly for development. In production, use Alembic migrations.
#     """
#     Base.metadata.create_all(bind=engine)

# app/database.py
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

# Search and load root .env and local .env
CURRENT_DIR = Path(__file__).resolve().parent
ROOT_ENV = CURRENT_DIR.parent.parent.parent / ".env"
LOCAL_ENV = CURRENT_DIR.parent.parent / ".env"

if ROOT_ENV.exists():
    load_dotenv(dotenv_path=ROOT_ENV, override=False)
if LOCAL_ENV.exists():
    load_dotenv(dotenv_path=LOCAL_ENV, override=False)

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    pg_user = os.getenv("PGUSER")
    pg_pass = os.getenv("PGPASSWORD")
    pg_host = os.getenv("PGHOST", "localhost")
    pg_port = os.getenv("PGPORT", "5432")
    pg_db = os.getenv("PGDATABASE", "CivicEyeDB")
    if pg_user and pg_pass:
        DATABASE_URL = f"postgresql://{pg_user}:{pg_pass}@{pg_host}:{pg_port}/{pg_db}"

if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be configured in root .env file.")

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to True for SQL query logging
    future=True
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True
)

# Base class for models
Base = declarative_base()

# Dependency for FastAPI
def get_db():
    """
    FastAPI dependency to get DB session.
    Usage: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
