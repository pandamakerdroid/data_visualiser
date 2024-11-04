from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import os.path
from app.routes import auth_router,map_router, csv_router


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://0.0.0.0:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(map_router)
app.include_router(csv_router)


