from decimal import Decimal

from sqlalchemy import select

from app.core.security import hash_password
from app.database import SessionLocal
from app.models import Customer, Order, OrderItem, Product, User

DEMO_USER_EMAIL = "admin@ioms.local"
DEMO_USER_PASSWORD = "Admin12345!"


def run() -> None:
    db = SessionLocal()
    try:
        if not db.scalar(select(User).where(User.email == DEMO_USER_EMAIL)):
            db.add(
                User(
                    email=DEMO_USER_EMAIL,
                    full_name="Demo Admin",
                    hashed_password=hash_password(DEMO_USER_PASSWORD),
                )
            )

        if db.scalar(select(Product).limit(1)) is None:
            products = [
                Product(name="Wireless Mouse", sku="WM-001", description="Ergonomic 2.4GHz mouse", price=Decimal("19.99"), quantity_in_stock=120),
                Product(name="Mechanical Keyboard", sku="MK-002", description="RGB tactile switches", price=Decimal("89.50"), quantity_in_stock=45),
                Product(name="USB-C Hub 7-in-1", sku="HUB-003", description="HDMI, SD, 3xUSB-A, PD", price=Decimal("39.00"), quantity_in_stock=8),
                Product(name="27\" 4K Monitor", sku="MON-004", description="IPS, 60Hz", price=Decimal("319.00"), quantity_in_stock=22),
                Product(name="Noise-Cancelling Headphones", sku="HP-005", description="Bluetooth 5.3", price=Decimal("199.00"), quantity_in_stock=3),
                Product(name="Webcam 1080p", sku="CAM-006", description="Auto-focus", price=Decimal("49.00"), quantity_in_stock=60),
            ]
            db.add_all(products)

        if db.scalar(select(Customer).limit(1)) is None:
            customers = [
                Customer(full_name="Alice Chen", email="alice@example.com", phone="+1-415-555-0101", address="100 Market St, San Francisco, CA"),
                Customer(full_name="Bob Patel", email="bob@example.com", phone="+1-415-555-0102", address="200 Mission St, San Francisco, CA"),
                Customer(full_name="Carla Diaz", email="carla@example.com", phone="+1-628-555-0103", address="300 Howard St, San Francisco, CA"),
            ]
            db.add_all(customers)

        db.commit()

        if db.scalar(select(Order).limit(1)) is None:
            alice = db.scalar(select(Customer).where(Customer.email == "alice@example.com"))
            mouse = db.scalar(select(Product).where(Product.sku == "WM-001"))
            keyboard = db.scalar(select(Product).where(Product.sku == "MK-002"))
            if alice and mouse and keyboard:
                total = mouse.price * 2 + keyboard.price * 1
                mouse.quantity_in_stock -= 2
                keyboard.quantity_in_stock -= 1
                order = Order(
                    customer_id=alice.id,
                    status="confirmed",
                    total_amount=total,
                    items=[
                        OrderItem(product_id=mouse.id, quantity=2, unit_price=mouse.price),
                        OrderItem(product_id=keyboard.id, quantity=1, unit_price=keyboard.price),
                    ],
                )
                db.add(order)
                db.commit()

        print(f"Seed complete. Demo login: {DEMO_USER_EMAIL} / {DEMO_USER_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
