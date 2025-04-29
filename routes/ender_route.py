from fastapi import APIRouter, Form, Body, HTTPException, Request
from fastapi.responses import HTMLResponse, FileResponse
from pathlib import Path
import tempfile
import subprocess
import shutil
import os
from pydantic import BaseModel
from src.ender import MarkdownToLatexConverter, zip_latex


router = APIRouter(tags=["Latex"])

@router.get("/latex-editor", response_class=HTMLResponse)
async def get_html(request:Request):
    template_path = "templates/latex-exporter/index.html"
    slug = request.query_params.get("slug", "")
    # Read HTML template
    with open(template_path, "r") as f:
        html = f.read()

    html = html.replace(
        '<div id="slug-container" style="display: none;" data-slug=""></div>', 
        f'<div id="slug-container" style="display: none;" data-slug="{slug}">{slug}</div>'
    )

    return html

class LatexInput(BaseModel):
    directory: str  # relative to project root
    latex_filename: str = "content.tex"
    output_filename: str = "content.pdf"

@router.post("/generate-pdf/")
async def generate_pdf(input: LatexInput):
    # Get project root and construct paths properly using Path objects
    project_root = Path(__file__).parent.parent
    print("The Project Root Is: " + str(project_root))
    print("The Text Dir is: " + str(input.directory))
    
    # Handle the input directory by removing leading slash if present
    clean_directory = input.directory.lstrip("/")
    print("Clean directory: " + clean_directory)
    
    # Build proper path objects
    tex_dir = project_root / clean_directory
    print("Final tex_dir: " + str(tex_dir))
    tex_dir.mkdir(parents=True, exist_ok=True)
    tex_file = tex_dir / input.latex_filename
    output_pdf = tex_dir / input.output_filename
    
    # Run tectonic from the tex directory
    subprocess.run(
        ["tectonic", str(tex_file), "-Z", "continue-on-errors"],
        check=True,
        cwd=str(tex_dir)
    )
    
    return {
        "message": "PDF generated successfully",
        "path": f"{clean_directory}/{input.output_filename}"
    }


class MarkdownInput(BaseModel):
    markdown: str
    output_path: str
    template: str = "default.tex"

@router.post("/generate-latex/")
async def generate_latex(input: MarkdownInput):
    converter = MarkdownToLatexConverter(
        markdown_content=input.markdown,
        output_path=input.output_path,
        template=input.template
    )
    print("Output Path:", converter.output_path)
    
    # Create directories if they don't exist
   
    os.makedirs(os.path.dirname(converter.output_path), exist_ok=True)
    
    converter.generate_latex()
    
    # After writing to file, also return the LaTeX string
    try:
        with open(converter.output_path, 'r', encoding='utf-8') as f:
            latex_content = f.read()
    except FileNotFoundError:
        return {"message": "Error: Output file not found", "latex": ""}
        
    return {"message": "LaTeX generated successfully", "latex": latex_content}

@router.get("/generate_project_zip/{slug}")  
async def generate_project_zip(slug: str):
    try:
        zip_path = zip_latex(slug)
        
        # Check if zip file was created successfully
        if not os.path.exists(zip_path):
            raise HTTPException(status_code=500, detail="Failed to create zip file")
            
        # Return the file as a downloadable response
        return FileResponse(
            zip_path,
            media_type='application/zip',
            filename=f"{slug}.zip"
        )
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating zip: {str(e)}")
    