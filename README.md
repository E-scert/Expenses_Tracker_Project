# Expenses_Tracker_Project

Expense Tracker Schema 
##Overview 
This repository contains the **PostgreSQL schema** for a personal expense tracker
it includes:
- Normalized tables (users, categories, expenses and a junction)
- Row Level Security (RLS) policies
- Indexes for performance
- ERD diagram for visualization
----
##Repository Structure
- Docs
  * expenseTracker.sql(migration file)
  * ExpenseTrackerSchema.png
 -README.md

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
- Categories are personal per user
- Expenses are scoped to the logged-in user
- Junction links only connect a user’s own categories and expenses

