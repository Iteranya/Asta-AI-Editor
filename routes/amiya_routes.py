from pathlib import Path
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, Form, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import ValidationError

router = APIRouter(tags=["Workshop"])

@router.get("/", response_class=HTMLResponse)
async def get_html():
    template_path = "templates/workshop/index.html"
    
    # Read HTML template
    with open(template_path, "r") as f:
        html = f.read()

    return html