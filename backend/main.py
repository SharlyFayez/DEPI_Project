from prometheus_fastapi_instrumentator import Instrumentator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from database import engine, SessionLocal
from models import TrafficData, Base

app = FastAPI()
Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"message": "Traffic System Running 🚦"}

@app.post("/traffic")
def add_traffic(count: int):

    db = SessionLocal()

    traffic = TrafficData(
        count=count,
        time=str(datetime.now())
    )

    db.add(traffic)
    db.commit()

    return {"status": "added"}

@app.get("/stats")
def stats():

    db = SessionLocal()

    data = db.query(TrafficData).all()

    total = sum(item.count for item in data)

    return {
        "total_cars": total,
        "records": len(data)
    }
