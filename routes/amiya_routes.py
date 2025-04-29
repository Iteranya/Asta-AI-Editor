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


@router.get("/templates")
async def get_latex_template_list():
    template_path = "latex/"
    # List all files in the template directory
    try:
        # Using os.listdir to get all files in the directory
        import os
        if not os.path.exists(template_path):
            return {"error": "Template directory not found"}
        
        templates = os.listdir(template_path)
        # Filter out any non-LaTeX files if needed
        # latex_templates = [t for t in templates if t.endswith('.tex')]
        
        return {"templates": templates}
    except Exception as e:
        # Return error with appropriate status code
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Error retrieving templates: {str(e)}")

@router.get("/templates/{filename:path}", response_class=FileResponse)
async def get_latex_template(filename: str):
    file_path = "latex/" + filename
    
    # Verify file exists and return it
    import os
    if not os.path.isfile(file_path):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Template '{filename}' not found")
    
    # Return the file for download
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/x-tex"  # MIME type for LaTeX files
    )
