-- Using the database
USE EmpMgmtDB;

-- Populating 'departments' table
INSERT INTO departments (dept_name)
VALUES 
    ("Tech"),
    ("Manufacturing"),
    ("Dev"),
    ("Finance"),
    ("Outreach");

-- Inserting data into 'job_role' table
INSERT INTO role (role_title, role_salary, dept_id_ref)
VALUES 
    ("Supervisor", 65000, 1),
    ("Tech Specialist", 50000, 1),
    ("Production Head", 50000, 2),
    ("Production Supervisor", 40000, 2),
    ("Machine Operator", 30000, 2),
    ("Project Lead", 110000, 3),
    ("Dev", 85000, 3),
    ("Principal Engineer", 100000, 3),
    ("Finance Head", 85000, 4),
    ("Finance Associate", 70000, 4),
    ("Sales Head", 100000, 5),
    ("Sales Coordinator", 90000, 5),
    ("Sales Exec", 70000, 5);

-- Inserting data into 'staff' table
INSERT INTO staff (first, last, role_ref, mgr_id)
VALUES  
    ("Jack", "Smith", 1, NULL),
    ("Linda", "Rey", 2, 1),
    ("Brian", "Young", 3, NULL),
    ("Daniel", "White", 4, 3),
    ("Chris", "Black", 5, 3),
    ("Liza", "Green", 6, NULL),
    ("Rick", "Brown", 7, 6),
    ("Megan", "Red", 8, 6),
    ("Anna", "Blue", 9, NULL),
    ("Robert", "Grey", 10, 9);
