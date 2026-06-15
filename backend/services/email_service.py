import os
import smtplib
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from fastapi import BackgroundTasks

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_NAME = os.getenv("FROM_NAME", "Pystack Academy")

def load_template(template_name: str, **kwargs) -> str:
    template_path = Path(__file__).resolve().parent.parent / "templates" / f"{template_name}.html"
    with open(template_path, "r", encoding="utf-8") as f:
        template = f.read()
    
    for key, value in kwargs.items():
        template = template.replace(f"{{{{{key}}}}}", str(value))
    
    return template

def send_email_sync(to_email: str, subject: str, html_body: str):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{FROM_NAME} <{SMTP_EMAIL}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        
        return True
    except Exception as e:
        print(f"Email failed: {e}")
        return False

def send_otp_email(background_tasks: BackgroundTasks, to_email: str, otp: str, purpose: str = "password_reset"):
    html = load_template("otp_email", OTP=otp, FROM_NAME=FROM_NAME)
    
    subject = "Password Reset OTP" if purpose == "password_reset" else "Email Verification"
    
    background_tasks.add_task(
        send_email_sync,
        to_email,
        f"{subject} - {FROM_NAME}",
        html
    )

def send_registration_success_email(background_tasks: BackgroundTasks, to_email: str):
    html = load_template("success_email", FROM_NAME=FROM_NAME)
    
    background_tasks.add_task(
        send_email_sync,
        to_email,
        f"Welcome to {FROM_NAME} - Registration Successful!",
        html
    )