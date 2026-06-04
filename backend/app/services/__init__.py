from decimal import Decimal
from typing import List

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app import schemas
from app.config import settings
from app.core.security import hash_password, verify_password
from app.models import Customer, Order, OrderItem, Product, User


def _http(status_code: int, detail: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail=detail)


def create_user(db: Session, payload: schemas.UserCreate) -> User:
    if db.scalar(select(User).where(User.email == payload.email)):
        raise _http(status.HTTP_409_CONFLICT, "Email already registered")
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.scalar(select(User).where(User.email == email))
    if not user or not verify_password(password, user.hashed_password):
        raise _http(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    if not user.is_active:
        raise _http(status.HTTP_403_FORBIDDEN, "User is inactive")
    return user


def list_products(db: Session) -> List[Product]:
    return list(db.scalars(select(Product).order_by(Product.id.desc())))


def get_product(db: Session, product_id: int) -> Product:
    product = db.get(Product, product_id)
    if not product:
        raise _http(status.HTTP_404_NOT_FOUND, "Product not found")
    return product


def create_product(db: Session, payload: schemas.ProductCreate) -> Product:
    if db.scalar(select(Product).where(Product.sku == payload.sku)):
        raise _http(status.HTTP_409_CONFLICT, "SKU already exists")
    product = Product(**payload.model_dump())
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _http(status.HTTP_409_CONFLICT, "SKU already exists")
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, payload: schemas.ProductUpdate) -> Product:
    product = get_product(db, product_id)
    updates = payload.model_dump(exclude_unset=True)
    if "sku" in updates and updates["sku"] != product.sku:
        if db.scalar(select(Product).where(Product.sku == updates["sku"])):
            raise _http(status.HTTP_409_CONFLICT, "SKU already exists")
    for k, v in updates.items():
        setattr(product, k, v)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> None:
    product = get_product(db, product_id)
    has_orders = db.scalar(
        select(func.count(OrderItem.id)).where(OrderItem.product_id == product_id)
    )
    if has_orders:
        raise _http(
            status.HTTP_409_CONFLICT,
            "Cannot delete product referenced by existing orders",
        )
    db.delete(product)
    db.commit()


def list_customers(db: Session) -> List[Customer]:
    return list(db.scalars(select(Customer).order_by(Customer.id.desc())))


def get_customer(db: Session, customer_id: int) -> Customer:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise _http(status.HTTP_404_NOT_FOUND, "Customer not found")
    return customer


def create_customer(db: Session, payload: schemas.CustomerCreate) -> Customer:
    if db.scalar(select(Customer).where(Customer.email == payload.email)):
        raise _http(status.HTTP_409_CONFLICT, "Email already registered")
    customer = Customer(**payload.model_dump())
    db.add(customer)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _http(status.HTTP_409_CONFLICT, "Email already registered")
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: int) -> None:
    customer = get_customer(db, customer_id)
    has_orders = db.scalar(
        select(func.count(Order.id)).where(Order.customer_id == customer_id)
    )
    if has_orders:
        raise _http(
            status.HTTP_409_CONFLICT,
            "Cannot delete customer with existing orders",
        )
    db.delete(customer)
    db.commit()


def _serialize_order(order: Order) -> schemas.OrderOut:
    items = [
        schemas.OrderItemOut(
            id=it.id,
            product_id=it.product_id,
            product_name=it.product.name,
            product_sku=it.product.sku,
            quantity=it.quantity,
            unit_price=it.unit_price,
            line_total=it.unit_price * it.quantity,
        )
        for it in order.items
    ]
    return schemas.OrderOut(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name,
        customer_email=order.customer.email,
        status=order.status,
        total_amount=order.total_amount,
        items=items,
        created_at=order.created_at,
    )


def list_orders(db: Session) -> List[schemas.OrderListItem]:
    rows = db.execute(
        select(
            Order.id,
            Order.customer_id,
            Customer.full_name,
            Order.status,
            Order.total_amount,
            func.count(OrderItem.id).label("item_count"),
            Order.created_at,
        )
        .join(Customer, Customer.id == Order.customer_id)
        .outerjoin(OrderItem, OrderItem.order_id == Order.id)
        .group_by(Order.id, Customer.full_name)
        .order_by(Order.id.desc())
    ).all()
    return [
        schemas.OrderListItem(
            id=r.id,
            customer_id=r.customer_id,
            customer_name=r.full_name,
            status=r.status,
            total_amount=r.total_amount,
            item_count=r.item_count or 0,
            created_at=r.created_at,
        )
        for r in rows
    ]


def get_order(db: Session, order_id: int) -> schemas.OrderOut:
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product), selectinload(Order.customer))
        .where(Order.id == order_id)
    )
    if not order:
        raise _http(status.HTTP_404_NOT_FOUND, "Order not found")
    return _serialize_order(order)


def create_order(db: Session, payload: schemas.OrderCreate) -> schemas.OrderOut:
    customer = db.get(Customer, payload.customer_id)
    if not customer:
        raise _http(status.HTTP_404_NOT_FOUND, "Customer not found")

    consolidated: dict[int, int] = {}
    for item in payload.items:
        consolidated[item.product_id] = consolidated.get(item.product_id, 0) + item.quantity

    product_ids = list(consolidated.keys())
    products = {
        p.id: p
        for p in db.scalars(
            select(Product).where(Product.id.in_(product_ids)).with_for_update()
        )
    }

    missing = [pid for pid in product_ids if pid not in products]
    if missing:
        raise _http(
            status.HTTP_404_NOT_FOUND,
            f"Product(s) not found: {missing}",
        )

    total = Decimal("0.00")
    order_items: List[OrderItem] = []
    for product_id, qty in consolidated.items():
        product = products[product_id]
        if product.quantity_in_stock < qty:
            raise _http(
                status.HTTP_409_CONFLICT,
                f"Insufficient stock for '{product.name}' (sku={product.sku}): "
                f"requested {qty}, available {product.quantity_in_stock}",
            )
        product.quantity_in_stock -= qty
        unit_price = product.price
        total += unit_price * qty
        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=qty,
                unit_price=unit_price,
            )
        )

    order = Order(
        customer_id=customer.id,
        total_amount=total,
        status="confirmed",
        items=order_items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return get_order(db, order.id)


def delete_order(db: Session, order_id: int) -> None:
    order = db.scalar(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    if not order:
        raise _http(status.HTTP_404_NOT_FOUND, "Order not found")

    for item in order.items:
        product = db.get(Product, item.product_id)
        if product:
            product.quantity_in_stock += item.quantity

    db.delete(order)
    db.commit()


def dashboard_summary(db: Session) -> schemas.DashboardSummary:
    total_products = db.scalar(select(func.count(Product.id))) or 0
    total_customers = db.scalar(select(func.count(Customer.id))) or 0
    total_orders = db.scalar(select(func.count(Order.id))) or 0
    threshold = settings.LOW_STOCK_THRESHOLD
    low_stock = list(
        db.scalars(
            select(Product)
            .where(Product.quantity_in_stock <= threshold)
            .order_by(Product.quantity_in_stock.asc())
            .limit(25)
        )
    )
    return schemas.DashboardSummary(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_count=len(low_stock),
        low_stock_threshold=threshold,
        low_stock_products=[schemas.ProductOut.model_validate(p) for p in low_stock],
    )
