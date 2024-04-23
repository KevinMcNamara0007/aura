from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException
from starlette.responses import RedirectResponse, FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi import Request

import converse_controller

app = FastAPI(
    title="IRIS",
    summary="Interface and API for IRIS",
    version="1",
    swagger_ui_parameters={
        "syntaxHighlight.theme": "obsidian",
        "docExpansion": "none"
    }
)
app.mount("/iris", StaticFiles(directory="static", html=True), name="static")

app.include_router(converse_controller.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"]
)


@app.get("/", include_in_schema=False)
async def docs_redirect():
    return RedirectResponse(url='/docs')
