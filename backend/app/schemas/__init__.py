from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Message(BaseModel):
    detail: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserOut(UserBase, ORMModel):
    id: int
    is_active: bool
    created_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    sku: str = Field(min_length=1, max_length=64)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: Decimal = Field(ge=0, decimal_places=2)
    quantity_in_stock: int = Field(ge=0)

    @field_validator("sku")
    @classmethod
    def _strip_sku(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("SKU cannot be blank")
        return v


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    sku: Optional[str] = Field(default=None, min_length=1, max_length=64)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    quantity_in_stock: Optional[int] = Field(default=None, ge=0)


class ProductOut(ProductBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


class CustomerBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(min_length=3, max_length=32)
    address: Optional[str] = Field(default=None, max_length=500)


class CustomerCreate(CustomerBase):
    pass


class CustomerOut(CustomerBase, ORMModel):
    id: int
    created_at: datetime


class OrderItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_id: int = Field(gt=0)
    items: List[OrderItemCreate] = Field(min_length=1)


class OrderItemOut(ORMModel):
    id: int
    product_id: int
    product_name: str
    product_sku: str
    quantity: int
    unit_price: Decimal
    line_total: Decimal


class OrderOut(ORMModel):
    id: int
    customer_id: int
    customer_name: str
    customer_email: EmailStr
    status: str
    total_amount: Decimal
    items: List[OrderItemOut]
    created_at: datetime


class OrderListItem(ORMModel):
    id: int
    customer_id: int
    customer_name: str
    status: str
    total_amount: Decimal
    item_count: int
    created_at: datetime


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_count: int
    low_stock_threshold: int
    low_stock_products: List[ProductOut]
