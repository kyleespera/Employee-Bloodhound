// functions.js in ./lib/

const connection = require('./sql_login'); // Assuming you have a connection setup in SQL_login.js

const viewAllEmpRole = () => {
    const query = 'SELECT * FROM role';
 // Assuming 'employee_role' is your table's name
    connection.query(query, (err, results) => {
        if (err) throw err;

        console.log("List of all Employee Roles:");
        results.forEach(role => {
            console.log(`ID: ${role.role_id}, Title: ${role.role_title}, Salary: ${role.role_salary}, Department ID: ${role.dept_id_ref}`);

        });
    });
}

const viewAllDep = () => {
    const query = 'SELECT * FROM departments'; // Assuming 'departments' is your table's name
    connection.query(query, (err, results) => {
        if (err) throw err;

        console.log("List of all Departments:");
        results.forEach(departments => {
            console.log(`ID: ${departments.dept_id}, Name: ${departments.dept_name}`); // Adjust based on your table columns
        });
    });
}

module.exports = {
    viewAllEmpRole,
    viewAllDep
};
