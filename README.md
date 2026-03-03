# User Management Frontend

This is the frontend application for the User Management project.  
Week 1 focuses on setting up the project structure and ensuring the application runs locally.

Tech Stack:
- React
- TypeScript
- Vite
- Tailwind CSS

Purpose:
- Initialize React + TypeScript project
- Configure Tailwind CSS
- Verify frontend runs successfully
- Display a basic full-screen welcome screen

No backend integration or business logic is implemented in this phase.

Prerequisites:
- Node.js (v18 or above recommended)
- npm

Installation:
npm install

Database Schema Design

Designed and implemented a relational schema supporting RBAC.

Core Entities
1️⃣ Users

id (UUID)

name

email (unique)

password (hashed using bcrypt)

status (ACTIVE / INACTIVE)

role (Many-to-One relationship)

2️⃣ Roles

id (UUID)

name (unique)

permissions (Many-to-Many relationship)

3️⃣ Permissions

id (UUID)

name (unique, e.g., CREATE_USER, UPDATE_USER, DELETE_USER)

4️⃣ Applications (if applicable)

Linked to users where required

✅ Migrations

Implemented TypeORM migrations

Created initial schema migration

Ensured reproducible DB setup

Resolved migration conflicts in Docker environment

Verified schema consistency across local and EC2

✅ Repository & Service Layer

Implemented clean architecture with service abstraction:

UserService

RoleService

PermissionService

AuthService

Responsibilities:

Database interaction via repositories

Business logic separation

Scalable and maintainable backend structure

✅ Backend Deployment (AWS EC2)

Dockerized backend using Dockerfile

Configured docker-compose for:

Backend (Node + Express + TypeORM)

PostgreSQL (v16)

Managed environment variables securely

Deployed on AWS EC2 instance

Verified health endpoint

Confirmed DB connectivity and migrations

✅ Core User APIs Implemented
Authentication APIs

POST /api/auth/signup

POST /api/auth/login

User Management APIs

GET /api/users

GET /api/users/:id

POST /api/users

PUT /api/users/:id

DELETE /api/users/:id

🔐 Security Features Implemented

Password hashing using bcrypt

JWT authentication with 1-hour expiration

Role-based permission loading during login

Status validation (ACTIVE / INACTIVE)

Permission-based middleware enforcement

No role selection allowed in public signup

Clean API response structure (no password exposure)

✅ Role-Based Access Control (RBAC)

Each User belongs to a Role

Each Role contains multiple Permissions

Permissions are included in JWT payload

Backend enforces permission validation

Frontend dynamically renders UI based on permissions

Example permissions:

CREATE_USER

UPDATE_USER

DELETE_USER

VIEW_USER

MANAGE_ROLES

🎨 React Frontend Implementation

Built a fully functional React frontend consuming deployed backend APIs.

Pages Implemented

Login

Signup

Dashboard

Users Management

🔄 Authentication Flow
Signup → Login → Dashboard
→ Users Page → Create User
→ Update User → Delete User
→ Logout
✅ Frontend Features

Protected routes

AuthContext for session management

JWT decoding & session restoration

Permission-based UI rendering

Search and filtering

Create / Update / Delete users

Error handling & loading states

Responsive layout

🌐 Frontend Integration with Deployed Backend

Environment-based API configuration

Connected to AWS EC2 backend

Verified end-to-end data persistence

Confirmed JWT-based authentication

Confirmed complete CRUD lifecycle

🛠 Technology Stack


Frontend

React

TypeScript

Tailwind CSS

React Router

Fetch API
