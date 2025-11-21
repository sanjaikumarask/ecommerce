# apps/notifications/worker.py
from apps.common.kafka_client import get_consumer
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from apps.orders.models import Order, OrderItem
from apps.billing.models import Invoice
import os


def run_notification_worker():
    consumer = get_consumer("notification.send", "notifications_group")
    print("🟢 NOTIFICATION EMAIL WORKER: listening on notification.send")

    for msg in consumer:
        data = msg.value
        print("📩 Notification Worker received:", data)

        email = data.get("email")
        order_id = data.get("order_id")
        invoice_id = data.get("invoice_id")
        name = data.get("name", "Customer")
        total = data.get("total")

        if not email or not order_id or not invoice_id:
            print("❌ Invalid notification payload, skipping:", data)
            continue

        # Fetch order + items
        try:
            order = Order.objects.get(id=order_id)
            items = OrderItem.objects.filter(order=order)
        except Exception as e:
            print(f"❌ DB error fetching items for order {order_id}: {e}")
            continue

        # Build HTML and text lists
        items_html = ""
        items_text = ""
        for item in items:
            line = f"{item.name} × {item.qty} — ₹{item.price}"
            items_html += f"<li>{line}</li>"
            items_text += f"- {line}\n"

        # Try to load invoice to attach PDF
        pdf_path = None
        try:
            invoice_obj = Invoice.objects.get(invoice_id=invoice_id)
            if invoice_obj.pdf_file:
                pdf_path = invoice_obj.pdf_file.path
        except Invoice.DoesNotExist:
            print(f"⚠️ Invoice {invoice_id} not found, sending email without PDF")

        subject = f"Your Invoice for Order #{order_id}"

        text_body = f"""
Hi {name},

Your payment for Order #{order_id} was successful.

Items Purchased:
{items_text}

Total: ₹{total}
Invoice ID: {invoice_id}

Thank you for shopping with us.
– MyStore
""".strip()

        html_body = f"""
<h2>Hi {name},</h2>

<p>Your payment for <strong>Order #{order_id}</strong> was successful.</p>

<h3>Items Purchased:</h3>
<ul>
    {items_html}
</ul>

<p><strong>Total:</strong> ₹{total}</p>
<p>Your invoice ID is <strong>{invoice_id}</strong>.</p>

<p>Thank you for shopping with us.<br/>– MyStore</p>
"""

        try:
            msg_email = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=None,  # uses DEFAULT_FROM_EMAIL
                to=[email],
            )
            msg_email.attach_alternative(html_body, "text/html")

            # Attach PDF if available
            if pdf_path and os.path.exists(pdf_path):
                msg_email.attach_file(pdf_path)
                print(f"📎 Attached PDF invoice: {pdf_path}")
            else:
                print("⚠️ No PDF attached for invoice", invoice_id)

            msg_email.send()
            print(f"✅ Email sent to {email} for order {order_id}")

        except Exception as e:
            print(f"❌ Failed to send email to {email}:", e)
