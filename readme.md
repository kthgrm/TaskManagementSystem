# Project Setup Guide

This README explains how to set up and run the project, which consists of a **Django backend** and a **Vite + React - Typescript frontend**.

---

## 📁 Project Structure

```
backend/
  api/
    migrations/
    models/
    serializers/
    urls/
    views/
    apps.py
    admin.py
  tms_backend/
  manage.py
  requirements.txt

frontend/
  node_modules/
  public/
  src/
  index.html
  package.json
  vite.config.ts
```

---

# ⚙️ Backend Setup (Django)

### 1. Navigate to backend folder

```bash
cd backend
```

### 2. Create and activate virtual environment

**Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run migrations

```bash
python manage.py migrate
```

### 5. Start development server

```bash
python manage.py runserver
```

Backend will run at:
**[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**

---

# 🎨 Frontend Setup (Vite)

### 1. Navigate to frontend folder

```bash
cd frontend
```

### 2. Install Node dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

Frontend will run at something like:
**[http://localhost:5173/](http://localhost:5173/)**

---

# 🔗 Connecting Frontend & Backend

If your frontend makes API calls, ensure your URLs point to:

```
http://127.0.0.1:8000/api/
```

---

# 🏁 Summary

| Component    | Command                      |
| ------------ | ---------------------------- |
| Run backend  | `python manage.py runserver` |
| Run frontend | `npm run dev`                |

Backend → Django
Frontend → Vite + React(TS)

Both run independently but communicate through API endpoints.

---
