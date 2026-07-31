---create user table 
CREATE table if not exists users(
 user_id SERIAL PRIMARY KEY,
 user_name varchar(20) not null unique,
 created_at date default now()
); 

--create Categories table
CREATE table if not exists categories(
 category_id SERIAL PRIMARY KEY,
 category_name varchar(20) check(category_name in('food','transport','entertainment')) DEFAULT 'other',
 user_id int references users(user_id),
 created_at date default now(),
 
);

--create expenses
create table if not exists expenses(
expense_id SERIAL PRIMARY KEY,
amount numeric(10,2) not null check(amount > 0),
user_id int references users(user_id),
created_at date default now()
);

--junction of categories and expenses
create table if not exists categorized_expenses(
 category_id int references categories(category_id),
 expense_id int references expenses(expense_id),
 primary key (category_id,expense_id)
);

--on categories
---create INDEXES 
create or replace index idx_category on categories(category_name);
--on expenses
create index idx_expenses_amount on expenses(amount);

---ENABLING ROW LEVEL SECURITY
ALTER TABLE users ENABLE  row level security;
ALTER TABLE categories ENABLE  row level security;
ALTER TABLE expenses ENABLE  row level security;
ALTER TABLE categorized_expenses ENABLE  row level security;

--create policies
--user table
CREATE POLICY view_user_profile
on users
for select 
using (user_id = current_setting('app.current_user_id')::int);

create policy update_user_profile
on users
for update 
using (user_id = current_setting('app.current_user_id')::int)
with check (user_id = current_setting('app.current_user_id')::int);

--category table
CREATE POLICY view_category
on categories
for select 
using (user_id = current_setting('app.current_user_id')::int);

CREATE POLICY insert_category
on categories
for INSERT 
with check (user_id = current_setting('app.current_user_id')::int);

CREATE POLICY update_category
on categories
for UPDATE 
using (user_id = current_setting('app.current_user_id')::int)
with check (user_id = current_setting('app.current_user_id')::int);
--
CREATE POLICY delete_category
on categories
for DELETE
using (user_id = current_setting('app.current_user_id')::int);

--expense POLICY
CREATE POLICY view_expenses
on expenses
for select
using (user_id = current_setting('app.current_user_id')::int);

CREATE POLICY insert_expense
on expenses
for INSERT 
with check (user_id = current_setting('app.current_user_id')::int);

CREATE POLICY delete_expense
on expenses
for delete 
using (user_id = current_setting('app.current_user_id')::int);

CREATE POLICY update_expense
on expenses
for update 
using (user_id = current_setting('app.current_user_id')::int)
with check (user_id = current_setting('app.current_user_id')::int);

--categorzed expenses policies
-- View policy: only see categorized expenses if the linked expense belongs to the current user
CREATE POLICY view_categorized_expense
ON categorized_expenses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM expenses e
    WHERE e.expense_id = categorized_expenses.expense_id
      AND e.user_id = current_setting('app.current_user_id')::int
  )
);

-- Insert policy: only allow linking if the expense belongs to the current user
CREATE POLICY insert_categorized_expense
ON categorized_expenses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM expenses e
    WHERE e.expense_id = categorized_expenses.expense_id
      AND e.user_id = current_setting('app.current_user_id')::int
  )
);

-- Delete policy: only allow unlinking if the expense belongs to the current user
CREATE POLICY delete_categorized_expense
ON categorized_expenses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM expenses e
    WHERE e.expense_id = categorized_expenses.expense_id
      AND e.user_id = current_setting('app.current_user_id')::int
  )
);


--functions
--function of total expenses
CREATE OR REPLACE FUNCTION total_expenses(u_user_id int)
returns numeric as $$
declare total_expense numeric(10,2);

begin
 
 Select SUM(amount) into total_expense
 from expenses
 where user_id = u_user_id;
 
 return COALESCE(total_expense,0);
 
 end;
 $$ language plpgsql;
 
 --function for category_totals
 CREATE OR REPLACE FUNCTION category_totals(cat_name varchar, u_id int)
 returns numeric(10,2) as $$
 
 declare total numeric(10,2);
 
 begin
 
 SELECT SUM(e.amount) into total
 from expenses e 
 join categorized_expenses ce 
  on e.expense_id = ce.expense_id
   join categories c 
   on ce.category_id = c.category_id
   where c.category_name = cat_name
   and e.user_id = u_id;
   
   return COALESCE(total,0);
   end;
   $$ language plpgsql;
   
   
   ---procedures
   --add user PROCEDURE
   CREATE OR REPLACE PROCEDURE add_user(u_name varchar)
   language plpgsql
   as $$ 
   
   begin
    INSERT INTO users(user_name) VALUES(u_name);
	
	EXCEPTION 
	
	WHEN unique_violation THEN 
	RAISE NOTICE 'Username % already exists',u_name;
	WHEN OTHERS THEN 
	raise notice 'Something went wrong';

	END;
	$$;
	--update user procedure
	CREATE OR REPLACE PROCEDURE update_user(u_id int, n_name varchar)
	language plpgsql
	AS $$
	DECLARE 
    rowcount INT;
	
	begin 
	
	UPDATE users SET user_name = n_name
	WHERE user_id = u_id;
	
	GET DIAGNOSTICS rowcount = ROW_COUNT;
	
	if rowcount = 0 then
	
	raise notice 'User id % does not exists',u_id;
	
	end if;

	END;
	$$;
	
	---delete user Procedure
	CREATE OR REPLACE PROCEDURE delete_user(u_id int)
	language plpgsql
	AS $$
	
	declare
	
	rowcount int;
	
	begin
	
	DELETE FROM expenses where user_id = u_id;
	DELETE FROM categories WHERE user_id = u_id;
	DELETE FROM users WHERE user_id = u_id;
	
	GET DIAGNOSTICS rowcount = ROW_COUNT;
	
	if rowcount = 0 then
	
	raise notice 'User id % does not exists',u_id;
	
	end if;
	end;
	$$;
	
	
	---category procedures 
	--add category procedures 
	CREATE OR REPLACE PROCEDURE add_category(u_id int ,c_name varchar)
	language plpgsql
	as $$
	
	begin
	
	INSERT INTO categories(user_id,category_name) values(u_id,c_name);
	
	EXCEPTION 
	WHEN unique_violation then
	raise notice 'The category of % already exists', c_name;
	
	end;
	
	$$;