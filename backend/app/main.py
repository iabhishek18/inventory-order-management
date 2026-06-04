import logging

from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app import __version__
from app.config import settings
from app.routers import (
    auth_router,
    customers_router,
    dashboard_router,
    orders_router,
    products_router,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ioms")

app = FastAPI(
    title=settings.APP_NAME,
    version=__version__,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    logger.warning("IntegrityError on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": "Database constraint violation"},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": "Validation failed", "errors": exc.errors()}),
    )


@app.get("/", include_in_schema=False)
def root():
    return {
        "name": settings.APP_NAME,
        "version": __version__,
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "version": __version__, "env": settings.APP_ENV}


api_prefix = settings.API_V1_PREFIX
app.include_router(auth_router, prefix=api_prefix)
app.include_router(products_router, prefix=api_prefix)
app.include_router(customers_router, prefix=api_prefix)
app.include_router(orders_router, prefix=api_prefix)
app.include_router(dashboard_router, prefix=api_prefix)
