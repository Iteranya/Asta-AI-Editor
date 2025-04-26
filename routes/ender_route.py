from fastapi import APIRouter, Form, Body, HTTPException, Request
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
from pathlib import Path
import tempfile
import subprocess
import shutil

from pydantic import BaseModel

router = APIRouter(prefix="/latex", tags=["Latex"])

@router.get("/", response_class=HTMLResponse)
async def get_html():
    template_path = "templates/latex-exporter/index.html"
    
    # Read HTML template
    with open(template_path, "r") as f:
        html = f.read()

    return html

class LatexInput(BaseModel):
    tex_content: str
    output_filename: str

@router.post("/generate-pdf/")
async def generate_pdf(input: LatexInput):
    # 1. Create a temp directory
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = Path(tmpdir)
        tex_file = tmpdir_path / "input.tex"
        
        # 2. Save the tex content
        tex_file.write_text(input.tex_content, encoding="utf-8")
        
        # 3. Run tectonic
        subprocess.run(
            ["tectonic", str(tex_file), "-o", str(tmpdir_path)],
            check=True
        )
        
        # 4. Move the output pdf to the desired location
        generated_pdf = tmpdir_path / "input.pdf"
        final_path = Path("data/file") / input.output_filename
        link = Path("file") / input.output_filename
        shutil.move(str(generated_pdf), str(final_path))
        
    return {"message": "PDF generated successfully", "path": str(link)}