# FussFree Backend — Node.js + MySQL

## Setup

### 1. Install MySQL
Make sure MySQL is running on your machine.

### 2. Configure .env
Edit `backend/.env` and set your MySQL password:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fussfree_db
PORT=5000
```

### 3. Install & start backend
```bash
cd backend
npm install
npm start
```
The backend will auto-create the `fussfree_db` database and seed sample data.

---

## Run the full project

Terminal 1 — Backend:
```bash
cd backend
npm start
```

Terminal 2 — Frontend:
```bash
cd .. (root of FussFree)
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend:  http://localhost:5000

---

## Postman API Reference

Base URL: `http://localhost:5000/api`

---

### Health Check
| Method | URL |
|--------|-----|
| GET | `/api/health` |

Response:
```json
{ "status": "ok", "message": "FussFree backend is running" }
```

---

### Complaints

#### Get all complaints
| Method | URL |
|--------|-----|
| GET | `/api/complaints` |

#### Get single complaint
| Method | URL |
|--------|-----|
| GET | `/api/complaints/:id` |

#### Create complaint
| Method | URL |
|--------|-----|
| POST | `/api/complaints` |

Body (JSON):
```json
{
  "category": "Ragging",
  "description": "Incident in hostel block B",
  "location": "28.6139,77.2090",
  "priority": "High"
}
```
Required: `category`, `description`, `priority`
Optional: `location`
Priority values: `Low` | `Medium` | `High`

#### Resolve complaint
| Method | URL |
|--------|-----|
| PATCH | `/api/complaints/:id/resolve` |

No body needed.

#### Delete complaint
| Method | URL |
|--------|-----|
| DELETE | `/api/complaints/:id` |

---

### Contacts

#### Get all contacts
| Method | URL |
|--------|-----|
| GET | `/api/contacts` |

#### Get single contact
| Method | URL |
|--------|-----|
| GET | `/api/contacts/:id` |

#### Create contact
| Method | URL |
|--------|-----|
| POST | `/api/contacts` |

Body (JSON):
```json
{
  "name": "Campus Security",
  "email": "security@campus.edu",
  "phone": "+91 9876543210"
}
```
Required: `name`, `email`
Optional: `phone`

#### Delete contact
| Method | URL |
|--------|-----|
| DELETE | `/api/contacts/:id` |

---

## MySQL DB Structure

Database: `fussfree_db`

### complaints table
| Column | Type |
|--------|------|
| id | INT AUTO_INCREMENT PK |
| category | VARCHAR(100) |
| description | TEXT |
| location | VARCHAR(255) |
| priority | ENUM('Low','Medium','High') |
| status | ENUM('Pending','Resolved') |
| created_at | TIMESTAMP |

### contacts table
| Column | Type |
|--------|------|
| id | INT AUTO_INCREMENT PK |
| name | VARCHAR(150) |
| email | VARCHAR(150) |
| phone | VARCHAR(50) |
| created_at | TIMESTAMP |
