from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class HistoryBase(SQLModel):
    query: str
    title: str
    short_recommendation: Optional[str] = None
    detailed_summary: Optional[str] = None

class History(HistoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HistoryCreate(HistoryBase):
    pass

