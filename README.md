# SingleVendor--ECOMMERCE Using Kafka pipelines
   L-> ordercreation -->  payments --> billing --> notifications to email to user(Using Kafka) containerized with docker 

   Connected React frontend with Django backend using WebSockets + REST API.

Configured Nginx → Django (ASGI) routing for /api/ and /ws/ correctly.

Set up Dockerized environment with services for web, workers, Redis, Postgres, Kafka.

Implemented Kafka pipeline:
order.created → payment.requested → payment.success → billing.invoice_generated → notification.email_sent.

Added 4 Kafka workers (order, payment, billing, notification) using Django management commands (from entrypoint) 

docker-entrypoint

.

Integrated Razorpay real payment API using RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and webhook secret defined in .env 

.env

.

Built payment worker to hit Razorpay API and publish payment.success.

Implemented webhook endpoint to consume Razorpay events.

Billing worker generates real PDF invoices using ReportLab (reportlab installed in requirements) 

requirements

.

Notifications worker sends real emails via Gmail SMTP (EMAIL_HOST, PORT, TLS settings from .env) 

.env

.

Added invoice attachments to email.

Implemented Redis session-based cart + backend validation.

Exposed media URLs so frontend displays product images correctly.

Verified the pipeline end-to-end inside Docker (docker-entrypoint waits for PG, Redis, Kafka) 

docker-entrypoint

.

Completed full real-time ecommerce workflow: order triggers → real payment → invoice → email notification.
   .


