from sqlmodel import SQLModel, create_engine, Session

DB_URL = "sqlite:///smart_librarian.db" 
engine = create_engine(DB_URL, echo=False)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    return Session(engine)
