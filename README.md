
# Expenses_Tracker_Project

##  Overview
This repository contains the **PostgreSQL schema** and supporting logic for a personal expense tracker.  
It demonstrates the full learning path of a database developer, including:
- Normalization of tables  
- Integrity constraints  
- Indexes for performance  
- Row Level Security (RLS) policies  
- Functions and procedures for business logic  
- Triggers (planned for future expansion)  
- ERD diagram for visualization  

**Note:** Backend and frontend code are generated with AI scaffolding, while the database schema and logic were developed from scratch. My focus is **database development and management**, but I also understand full‑stack principles and can analyze and refine generated code.

---

##  Repository Structure
- **Docs/**
  - `expenseTracker.sql` → migration file  
  - `ExpenseTrackerSchema.png` → ERD diagram  
- **README.md** → project documentation  

---

##  Database Schema

### Core Tables
- **Users** → Authentication and identity  
- **Categories** → Personal categories per user  
- **Expenses** → User expenses with amounts  
- **Categorized_Expenses** → Junction linking expenses to categories  

### Relationships
- Users → Categories (1:N)  
- Users → Expenses (1:N)  
- Categories → Categorized_Expenses (1:N)  
- Expenses → Categorized_Expenses (1:N)  

---

## Security
Row Level Security (RLS) ensures:
- Users can only view/update their own profile  
- Categories are scoped per user  
- Expenses are scoped to the logged‑in user  
- Junction links only connect a user’s own categories and expenses  

---

## Features Implemented
- **Indexes** → Optimized lookups on category names and expense amounts  
- **Policies** → CRUD operations restricted to the current user context  
- **Functions** →  
  - `total_expenses(u_user_id)` → returns total expenses for a user  
  - `category_totals(cat_name, u_id, period)` → returns totals by category and period (overall, monthly, weekly)  
- **Procedures** →  
  - User management: `add_user`, `update_user`, `delete_user`  
  - Category management: `add_category`, `update_category`, `delete_category`  
  - Expense management: `add_expense`, `update_expense`, `delete_expense`  

---

## Next Steps
- Add **triggers** for automatic auditing and logging.  
- Integrate schema with backend (Express/Node.js) and frontend (React/Jetpack Compose for Android).  
- Deploy to Supabase or cloud PostgreSQL once scaling is needed.  

---
## How to run locally 
1. Prerequisites
   * install PostgreSQL (>= 14) on your machine
   * install Node.js (>= 18) and npm.
   * clone this repository
   * git clone https://github.com/E-scert/Expenses_Tracker_Project.git
      cd Expenses_Tracker_Project
2. Set PostgreSQL
   * open psql and create database
     - CREATE DATABASE expense_tracker_db;
   * Run the migration file to apply schema
     - psql -d expense_tracker_db -f docs/expensesTracker.sql
    
   * Verify tables, functions, and proceudres
     - \dt --list tables
     - \df -- list functions/procedures
     - \dy --list triggers
    
  3. Create .env file in the backend folder:
      PORT=5000
      DB_HOST=localhost
      DB_PORT=5432
      DB_NAME=expense_trancter_db
      DB_USER=your_postgres_username
      DB_PASSWORD=your_postgres_password

     * install dependencies
       - npm install
      
      * start sserver
        - npm start
       
     4. Frontend (optional)
        * if u scafolded a frondend
          - navigate to the frontend folder
          - install dependencies
            * npm install
            * npm run dev
            * open http://localhost:3000 locahost in any search engine



## Developer Notes
This project is part of my journey as a **Computer Science student specializing in database development**.  
I use AI tools to scaffold frontend/backend systems, but the **database schema, RLS, functions, and procedures are hand‑crafted** to demonstrate mastery of PostgreSQL fundamentals.

---
