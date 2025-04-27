from fastapi import APIRouter, Form, Body, HTTPException, Request
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
from pathlib import Path
import tempfile
import subprocess
import shutil
import os
from pydantic import BaseModel
from src.ender import MarkdownToLatexConverter

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
            ["tectonic", str(tex_file), "-o", str(tmpdir_path), "-Z", "continue-on-errors"],
            check=True
        )
        
        # 4. Move the output pdf to the desired location
        generated_pdf = tmpdir_path / "input.pdf"
        final_path = Path("data/file") / input.output_filename
        link = Path("file") / input.output_filename
        shutil.move(str(generated_pdf), str(final_path))
        
    return {"message": "PDF generated successfully", "path": str(link)}



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
    converter.generate_latex()

    # After writing to file, also return the LaTeX string (optional)
    with open(input.output_path, 'r', encoding='utf-8') as f:
        latex_content = f.read()

    return {"message": "Latex generated successfully", "latex": latex_content}