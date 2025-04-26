from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from src.db import ProjectDB, Project,get_db  # Assume you saved the previous db code in project_db.py
from fastapi import Depends
router = APIRouter(prefix="/projects", tags=["Projects"])

# Initialize database
db = ProjectDB()

# Pydantic model for request/response
class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    ai_notes: Optional[str] = None
    markdown: Optional[str] = None
    latex: Optional[str] = None
    thumb: Optional[str] = None
    metadata: Optional[str] = None
    type: str = "default"

class ProjectOut(ProjectCreate):
    pass

@router.post("/", response_model=ProjectOut)
def create_project(project: ProjectCreate, db: ProjectDB = Depends(get_db)):
    if db.get_by_slug(project.slug):
        raise HTTPException(status_code=400, detail="Project with this slug already exists.")
    db.create(Project(**project.dict()))
    return project

@router.get("/", response_model=List[ProjectOut])
def list_projects(db: ProjectDB = Depends(get_db)):
    return db.list_all()

@router.get("/{slug}", response_model=ProjectOut)
def get_project(slug: str, db: ProjectDB = Depends(get_db)):
    project = db.get_by_slug(slug)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project

@router.put("/{slug}", response_model=ProjectOut)
def update_project(slug: str, project: ProjectCreate, db: ProjectDB = Depends(get_db)):
    existing = db.get_by_slug(slug)
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found.")
    db.update(slug, **project.dict())
    updated = db.get_by_slug(slug)
    return updated

@router.delete("/{slug}")
def delete_project(slug: str, db: ProjectDB = Depends(get_db)):
    project = db.get_by_slug(slug)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    db.delete(slug)
    return {"detail": "Project deleted."}
