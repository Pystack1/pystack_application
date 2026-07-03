# pystack_application

# PyStack

PyStack is an Online Python Learning Platform built using FastAPI, SQLModel, MySQL, React, and Vite.

---

# Frontend Setup

## Prerequisites

Install Node.js (LTS Version).

Verify installation:

```bash
node -v
npm -v
```

---

## Install Frontend Dependencies

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the frontend application:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:8080
```

---

# Backend Setup

## Prerequisites

Python Version:

```bash
python --version
```

Expected Output:

```text
Python 3.11.9
```

---

## Install Backend Dependencies

Navigate to backend folder:

```bash
cd backend
```

Install requirements:

```bash
pip install -r requirements.txt
```

Run backend:

```bash
python main.py
```

Backend URL:

```text
http://localhost:8000
```

Swagger Documentation:

```text
http://localhost:8000/docs
```

---

# Database Setup

## Step 1: Install MySQL

Install MySQL Server and ensure it is running.

---

## Step 2: Create Database

Execute:

```sql
CREATE DATABASE pystack_db;
```

---

## Step 3: Configure Database Credentials

Open:

```text
backend/database.py
```

Find:

```python
DATABASE_URL = "mysql+pymysql://root:password@localhost:3306/pystack_db"
```

Update with your MySQL credentials:

```python
DATABASE_URL = "mysql+pymysql://root:Prasad123@localhost:3306/pystack_db"
```

### Format

```python
DATABASE_URL = "mysql+pymysql://<username>:<password>@localhost:3306/pystack_db"
```

Example:

```python
DATABASE_URL = "mysql+pymysql://root:root@localhost:3306/pystack_db"
```

Save the file and restart the backend.

---

# Application Ports

| Service  | Port |
| -------- | ---- |
| Frontend | 8080 |
| Backend  | 8000 |
| MySQL    | 3306 |

---

# Initial Roles Setup

Insert the default roles:

```sql
INSERT INTO roles (id, name)
VALUES
(1, 'SuperAdmin'),
(2, 'Admin'),
(3, 'User');
```

Verify:

```sql
SELECT * FROM roles;
```

---

# Super Admin Setup

## Step 1: Register First User

Register the first user using the Registration Page.

By default:

```text
role_id = 3 (User)
is_active = 0
```

---

## Step 2: Activate User

```sql
UPDATE users
SET is_active = 1
WHERE id = 1;
```

---

## Step 3: Assign SuperAdmin Role

```sql
UPDATE user_roles
SET role_id = 1
WHERE user_id = 1;
```

Verify:

```sql
SELECT * FROM user_roles;
```

Expected:

```text
user_id = 1
role_id = 1
```

---

# Technology Stack

## Frontend

* React
* Vite
* JavaScript
* CSS

## Backend

* FastAPI
* SQLModel
* SQLAlchemy
* JWT Authentication
* PyMySQL

## Database

* MySQL

---

# Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### URLs

Frontend:

```text
http://localhost:8080
```

Backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```
