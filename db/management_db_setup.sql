-- Removing the database. Only do this if you are sure!
-- DROP DATABASE EmpMgmtDB;

-- Creating a new database with a different name for clarity
CREATE DATABASE IF NOT EXISTS EmpMgmtDB; 

-- Setting the newly created database for use
USE EmpMgmtDB;

-- Creating the 'departments' table, renaming for brevity
DROP TABLE IF EXISTS departments;
CREATE TABLE departments(
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(30) NOT NULL
);

-- Creating the 'job_role' table, renaming for clarity and brevity
-- Creating the 'role' table
DROP TABLE IF EXISTS role;
CREATE TABLE role(
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_title VARCHAR(30) NOT NULL,
    role_salary DECIMAL(10, 2) NOT NULL,
    dept_id_ref INT,
    FOREIGN KEY (dept_id_ref) REFERENCES departments(dept_id) ON DELETE CASCADE
);


-- Creating the 'staff' table, renaming for distinction
DROP TABLE IF EXISTS staff;
CREATE TABLE staff(
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    first VARCHAR(30) NOT NULL,
    last VARCHAR(30) NOT NULL,
    role_ref INT NOT NULL,
    mgr_id INT DEFAULT NULL,
    FOREIGN KEY (role_ref) REFERENCES role(role_id) ON DELETE CASCADE,
    FOREIGN KEY (mgr_id) REFERENCES staff(staff_id) ON DELETE SET NULL
);
