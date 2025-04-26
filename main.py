import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
# Import routers
from routes import asta_routes,config_routes,media_route,amiya_routes,db_route,ender_route,file_route

app = FastAPI()

# For static HTML tools
app.mount("/builder", StaticFiles(directory="templates/doc-builder"), name = "doc-builder")
app.mount("/latex", StaticFiles(directory="templates/latex-exporter"), name = "latex-exporter")
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
app.include_router(media_route.router)
app.include_router(amiya_routes.router)
app.include_router(db_route.router)
app.include_router(ender_route.router)
app.include_router(file_route.router)

# Run the application with: uvicorn main:app --reload
if __name__ == "__main__":
    
    uvicorn.run("main:app", host="localhost", port=5452, reload=True)