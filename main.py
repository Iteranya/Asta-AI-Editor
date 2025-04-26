import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
# Import routers
from routes import asta_routes,config_routes

app = FastAPI()

# For static HTML tools
app.mount("/builder", StaticFiles(directory="templates/doc-builder"), name = "doc-builder")

# For templates
templates = Jinja2Templates(directory="templates")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(asta_routes.router)
app.include_router(config_routes.router)

# Run the application with: uvicorn main:app --reload
if __name__ == "__main__":
    
    uvicorn.run("main:app", host="0.0.0.0", port=5452, reload=True)