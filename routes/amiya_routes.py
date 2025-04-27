from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import HTMLResponse, FileResponse
import os
import shutil

router = APIRouter(tags=["Workshop"])

PROJECT_PATH = "projects"

@router.get("/", response_class=HTMLResponse)
async def get_html():
    template_path = "templates/workshop/index.html"
    
    with open(template_path, "r") as f:
        html = f.read()

    return html

os.makedirs(PROJECT_PATH, exist_ok=True)

@router.get("/files/{filelocation:path}", response_class=FileResponse)
async def get_file(filelocation: str):
    file_path = os.path.join(PROJECT_PATH, filelocation)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=file_path)


@router.post("/files")
async def upload_media(file: UploadFile = File(...)):
    file_path = os.path.join(PROJECT_PATH, file.filename)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"status": "success", "filename": file.filename}
