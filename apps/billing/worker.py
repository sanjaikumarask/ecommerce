# apps/billing/worker.py
import os
from django.conf import settings
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

from apps.common.kafka_client import get_consumer, publish
from apps.common.realtime import push_order_update
from apps.orders.models import Order
from apps.billing.models import Invoice


def generate_invoice_pdf(order, invoice_id: str) -> str:
    """
    Create a simple invoice PDF for the given order.
    Returns the ABSOLUTE file path.
    """
    invoices_dir = os.path.join(settings.MEDIA_ROOT, "invoices")
    os.makedirs(invoices_dir, exist_ok=True)

    file_path = os.path.join(invoices_dir, f"{invoice_id}.pdf")

    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    y = height - 50

    # Header
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, y, "INVOICE")
    y -= 40

    c.setFont("Helvetica", 10)
    c.drawString(50, y, f"Invoice ID: {invoice_id}")
    y -= 15
    c.drawString(50, y, f"Order ID: {order.id}")
    y -= 15
    c.drawString(50, y, f"Date: {order.created_at.strftime('%Y-%m-%d %H:%M')}")
    y -= 25

    customer_info = order.customer_info or {}
    name = (customer_info.get("first_name", "") + " " +
            customer_info.get("last_name", "")).strip() or "Customer"
    email = customer_info.get("email", "")

    c.drawString(50, y, f"Customer: {name}")
    y -= 15
    c.drawString(50, y, f"Email: {email}")
    y -= 25

    # Items header
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, "Items")
    y -= 20
    c.setFont("Helvetica", 10)

    # Items list
    for item in order.items.all():
        line = f"{item.name} x {item.qty} — ₹{item.price}"
        c.drawString(50, y, line)
        y -= 15
        if y < 100:
            c.showPage()
            y = height - 50
            c.setFont("Helvetica", 10)

    y -= 20
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, f"Total: ₹{order.total}")
    c.showPage()
    c.save()

    return file_path


def run_billing_worker():
    consumer = get_consumer("payment.success", "billing_group")
    print("🟢 BILLING WORKER: listening on payment.success")

    for msg in consumer:
        data = msg.value
        print("📥 Billing Worker received:", data)

        order_id = data.get("order_id")
        if not order_id:
            print("❌ Invalid billing payload (missing order_id):", data)
            continue

        # Load order from DB
        try:
            order = (
                Order.objects
                .select_related("user")
                .prefetch_related("items")
                .get(id=order_id)
            )
        except Order.DoesNotExist:
            print(f"❌ Order {order_id} not found, skipping")
            continue

        # Create or get invoice
        invoice_id = f"INV-{order.id}"
        invoice_obj, created = Invoice.objects.get_or_create(
            order=order,
            defaults={
                "invoice_id": invoice_id,
                "amount": order.total,
            },
        )

        # Generate PDF
        pdf_path = generate_invoice_pdf(order, invoice_obj.invoice_id)

        # Save relative path in FileField
        rel_path = os.path.relpath(pdf_path, settings.MEDIA_ROOT)
        if invoice_obj.pdf_file.name != rel_path:
            invoice_obj.pdf_file.name = rel_path
            invoice_obj.save(update_fields=["pdf_file"])

        print(f"✅ Invoice generated for order {order_id}: {invoice_obj.invoice_id}")

        # WebSocket update (optional)
        try:
            push_order_update(order_id, {
                "event": "billing.invoice_generated",
                "order_id": order_id,
                "invoice_id": invoice_obj.invoice_id,
            })
            print(f"📡 WebSocket pushed for order {order_id}")
        except Exception as e:
            print("⚠️ Failed to push WebSocket update:", e)

        # Build notification payload for email worker
        customer_info = order.customer_info or {}
        email = (
            customer_info.get("email")
            or (order.user.email if order.user and order.user.email else None)
        )

        if not email:
            print(f"⚠️ No email for order {order_id}, skipping email notification")
            continue

        name = (
            customer_info.get("first_name")
            or customer_info.get("name")
            or (order.user.get_full_name() if order.user else "Customer")
        )

        notification_payload = {
            "order_id": order_id,
            "invoice_id": invoice_obj.invoice_id,
            "email": email,
            "name": name,
            "total": float(order.total),
        }

        try:
            publish("notification.send", notification_payload)
            print(f"📧 Published notification.send for order {order_id} → {email}")
        except Exception as e:
            print("❌ Failed to publish notification.send:", e)
