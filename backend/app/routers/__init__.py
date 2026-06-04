from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import schemas, services
from app.core.security import create_access_token, get_current_user
from app.database import get_db
from app.models import User

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)) -> User:
    return services.create_user(db, payload)


@auth_router.post("/login", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> schemas.Token:
    user = services.authenticate_user(db, form.username, form.password)
    token, expires_in = create_access_token(user.id)
    return schemas.Token(access_token=token, expires_in=expires_in)


@auth_router.post("/login/json", response_model=schemas.Token)
def login_json(payload: schemas.LoginRequest, db: Session = Depends(get_db)) -> schemas.Token:
    user = services.authenticate_user(db, payload.email, payload.password)
    token, expires_in = create_access_token(user.id)
    return schemas.Token(access_token=token, expires_in=expires_in)


@auth_router.get("/me", response_model=schemas.UserOut)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


products_router = APIRouter(
    prefix="/products",
    tags=["products"],
    dependencies=[Depends(get_current_user)],
)


@products_router.get("", response_model=list[schemas.ProductOut])
def list_products(db: Session = Depends(get_db)):
    return services.list_products(db)


@products_router.post("", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db)):
    return services.create_product(db, payload)


@products_router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return services.get_product(db, product_id)


@products_router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, payload: schemas.ProductUpdate, db: Session = Depends(get_db)):
    return services.update_product(db, product_id, payload)


@products_router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    services.delete_product(db, product_id)


customers_router = APIRouter(
    prefix="/customers",
    tags=["customers"],
    dependencies=[Depends(get_current_user)],
)


@customers_router.get("", response_model=list[schemas.CustomerOut])
def list_customers(db: Session = Depends(get_db)):
    return services.list_customers(db)


@customers_router.post("", response_model=schemas.CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(payload: schemas.CustomerCreate, db: Session = Depends(get_db)):
    return services.create_customer(db, payload)


@customers_router.get("/{customer_id}", response_model=schemas.CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return services.get_customer(db, customer_id)


@customers_router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    services.delete_customer(db, customer_id)


orders_router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    dependencies=[Depends(get_current_user)],
)


@orders_router.get("", response_model=list[schemas.OrderListItem])
def list_orders(db: Session = Depends(get_db)):
    return services.list_orders(db)


@orders_router.post("", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: schemas.OrderCreate, db: Session = Depends(get_db)):
    return services.create_order(db, payload)


@orders_router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    return services.get_order(db, order_id)


@orders_router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    services.delete_order(db, order_id)


dashboard_router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(get_current_user)],
)


@dashboard_router.get("", response_model=schemas.DashboardSummary)
def dashboard(db: Session = Depends(get_db)):
    return services.dashboard_summary(db)


__all__ = [
    "auth_router",
    "products_router",
    "customers_router",
    "orders_router",
    "dashboard_router",
]
