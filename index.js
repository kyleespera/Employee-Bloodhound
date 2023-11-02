// Required modules and files
const inquirer = require('inquirer');
const figlet = require('figlet');
const connection = require("./lib/sql_login");
const commandMenuChoices = require('./lib/commandMenuChoices'); // assuming you renamed this file earlier
const questions = require('./lib/questions');

const InquirerFunctions = require('./lib/inquirer'); // It's good practice to use camelCase for filenames, ensuring they match the exported class name.
const SQLquery = require('./lib/SQL_queries'); // Again, camelCase filename is recommended.
const inquirerTypes = [
    'input', 'confirm', 'list'
]
const { viewAllEmpRole, viewAllDep } = require('./lib/functions');



console.log(figlet.textSync('Employee Management', {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default'
}));

// Begin the app by calling the main menu function
mainMenu();

async function mainMenu() {
    // Create a new InquirerFunctions instance using the questions object
    const menuPrompt = new InquirerFunctions(questions.mainMenu.type, questions.mainMenu.name, questions.mainMenu.message, commandMenuChoices);
    
    const operation = await inquirer.prompt([menuPrompt.ask()]);

    // General SQL query to grab all roles from the database
    const rolesQuery = "SELECT role.role_title FROM role";
    const compRolesArrayQuery = new SQLquery(rolesQuery);

    // General SQL query to grab all departments from the database
    const depNameQuery = "SELECT departments.dept_name FROM departments";
    const depNamesArrayQuery = new SQLquery(depNameQuery);


       
    

switch (operation.menuChoice) {

    case commandMenuChoices[2]:
        return viewAllEmp();

    case commandMenuChoices[3]:
        depNamesArrayQuery.queryReturnResult(viewAllEmpDep);
        break;

    case commandMenuChoices[4]:
        const actionChoice5 = "VIEW BY MANAGER";
        let dummyArr = [];
        EmpInfoPrompts(dummyArr, actionChoice5);
        break;

    case commandMenuChoices[5]:
        compRolesArrayQuery.getQueryNoRepeats(viewAllEmpRole);
        break;

    case commandMenuChoices[6]:
        return viewAllManager();

    case commandMenuChoices[11]:
        const actionChoice1 = "ADD";
        compRolesArrayQuery.getQueryNoRepeats(EmpInfoPrompts, actionChoice1);
        break;

    case commandMenuChoices[12]:
        const actionChoice2 = "DELETE";
        compRolesArrayQuery.getQueryNoRepeats(EmpInfoPrompts, actionChoice2);
        break;

    case commandMenuChoices[13]:
        const actionChoice3 = "UPDATE EMP ROLE";
        compRolesArrayQuery.getQueryNoRepeats(EmpInfoPrompts, actionChoice3);
        break;

    case commandMenuChoices[14]:
        const actionChoice4 = "UPDATE EMP MANAGER";
        compRolesArrayQuery.getQueryNoRepeats(EmpInfoPrompts, actionChoice4);
        break;

    case commandMenuChoices[1]:
        return viewAllRoles();

    case commandMenuChoices[9]:
        return addRole();

    case commandMenuChoices[10]:
        const actionChoice7 = "DELETE ROLE";
        compRolesArrayQuery.getQueryNoRepeats(deleteRole, actionChoice7);
        break;

    case commandMenuChoices[0]:
        return viewAllDep();

    case commandMenuChoices[7]:
        depNamesArrayQuery.queryReturnResult(addDep);
        break;

    case commandMenuChoices[8]:
        depNamesArrayQuery.queryReturnResult(removeDep);
        break;
}
};

// This function displays a table with all the employees on the console
function viewAllEmp() {
    const query = 
        `SELECT staff.staff_id, staff.first, staff.last, role.role_title, role.role_salary, departments.dept_name
        FROM staff
        INNER JOIN role ON role.role_id = staff.role_ref
        INNER JOIN departments ON departments.dept_id = role.dept_id_ref;
    `;

    const empTable = new SQLquery(query);
    empTable.generalTableQuery(mainMenu);
}

// This function displays a table of all employees by a chosen departments to the console
// It receives an array of departments names as a parameter
function viewAllEmpDep(depNamesArray) {
    const departmentNamePrompt = new InquirerFunctions(inquirerTypes[2], 'department_Name', questions.viewAllEmpByDep, depNamesArray);

    inquirer.prompt(departmentNamePrompt.ask()).then(userResp => {
        const query = `
            SELECT staff.staff_id, staff.first, staff.last, role.role_title, role.role_salary, departments.dept_name
            FROM staff
            INNER JOIN role ON role.role_id = staff.role_ref
            INNER JOIN departments ON departments.dept_id = role.dept_id_ref AND departments.dept_name = ? ;
        `;

        const empByDepTable = new SQLquery(query, userResp.department_Name);
        empByDepTable.generalTableQuery(mainMenu);
    });
}

// Generates a console table of employees grouped by a selected manager
function displayEmployeesByManager(managerData, managerNames) {
    const managerPrompt = new InquirerFunctions(inquirerTypes[2], 'selectedManager', questions.searchByManager, managerNames);

    inquirer.prompt([managerPrompt.ask()]).then(selection => {
        console.log(`Manager Searched By: ${selection.selectedManager}`);

        const managerNameComponents = selection.selectedManager.split(" ", 2);
        let managerID = managerData.find(manager => manager.lastName === managerNameComponents[1]).ID;

        const managerQuery = `
            SELECT staff.last, staff.first, role.role_title, departments.dept_name
            FROM staff
            INNER JOIN role ON role.role_id = staff.role_ref
            INNER JOIN departments ON departments.dept_id = role.dept_id_ref
            WHERE staff.manager_id = (?)
        `;

        const managerResults = new SQLquery(managerQuery, managerID);
        managerResults.generalTableQuery(mainMenu);
    });
}

// Generates a console table of all employees based on a selected role
function displayEmployeesByRole(roleOptions) {
    const roleSelectionPrompt = new InquirerFunctions(inquirerTypes[2], 'selectedRole', questions.viewAllEmpByRole, roleOptions);
    
    inquirer.prompt(roleSelectionPrompt.ask()).then(response => {
        const roleQuery = `
            SELECT staff.staff_id, staff.first, staff.last, role.role_title, role.role_salary, departments.dept_name
            FROM staff 
            INNER JOIN role ON role.role_id = staff.role_ref AND role.role_title = (?)
            INNER JOIN departments ON departments.dept_id = role.dept_id_ref;
        `;

        const roleResultsTable = new SQLquery(roleQuery, response.selectedRole);
        roleResultsTable.generalTableQuery(mainMenu);
    });
}
// Generates a console table of managers
function displayAllManagers() {
    const managerQuery = `
        SELECT staff.staff_id, staff.first, staff.last, departments.dept_name
        FROM staff
        INNER JOIN role ON role.role_id = staff.role_ref
        INNER JOIN departments ON departments.dept_id = role.dept_id_ref
        WHERE staff.staff_id IN ( SELECT staff.manager_id FROM staff );
    `;

    const managerResultsTable = new SQLquery(managerQuery);
    managerResultsTable.generalTableQuery(mainMenu);
}

// Handles user prompts for staff actions (either adds or deletes an staff)
function handleEmployeeAction(roleOptions, userAction) {
    const employeeManagerQuery = "SELECT id, first_name, last_name FROM staff WHERE staff.staff_id IN ( SELECT staff.manager_id FROM staff )";

    connection.query(employeeManagerQuery, function (err, queryResults) {
        if (err) throw err;

        const managerInfoList = [];
        const managerNameList = [];

        // Extract manager info from the query results
        for (const manager of queryResults) {
            const managerInfo = {
                ID: manager.id,
                firstName: manager.first_name,
                lastName: manager.last_name
            };

            managerInfoList.push(managerInfo);
            managerNameList.push(`${manager.first_name} ${manager.last_name}`);
        }

        // ... rest of the code for handling the staff actions based on the user's choice ...
    });
}

class EmployeePrompt {
    constructor(type, name, question, choices = null) {
        this.type = type;
        this.name = name;
        this.question = question;
        this.choices = choices;
    }

    getPrompt() {
        return {
            type: this.type,
            name: this.name,
            message: this.question,
            choices: this.choices
        };
    }
}

function promptForEmployeeDetails() {
    const firstNamePrompt = new EmployeePrompt('input', 'first_name', questions.addEmployee1);
    const lastNamePrompt = new EmployeePrompt('input', 'last_name', questions.addEmployee2);
    const rolePrompt = new EmployeePrompt('list', 'employee_role', questions.addEmployee3, compRoles);
    const managerPrompt = new EmployeePrompt('list', 'employee_manager', questions.addEmployee4, managerNamesArr);

    return [firstNamePrompt, lastNamePrompt, rolePrompt, managerPrompt].map(prompt => prompt.getPrompt());
}

function handleAddEmployee() {
    const prompts = promptForEmployeeDetails();
    inquirer.prompt(prompts).then(empInfo => {
        addEmployeeToDB(empInfo, managerObjArr);
    });
}

function handleViewByManager() {
    viewAllEmpManager(managerObjArr, managerNamesArr);
}

function handleMultipleEmployeeActions(actionChoice) {
    const prompts = [
        new EmployeePrompt('input', 'first_name', questions.addEmployee1).getPrompt(),
        new EmployeePrompt('input', 'last_name', questions.addEmployee2).getPrompt()
    ];

    inquirer.prompt(prompts).then(empInfo => {
        switch (actionChoice) {
            case "UPDATE EMP ROLE":
                EmpMultiplesCheck(empInfo, actionChoice, compRoles);
                break;
            case "UPDATE EMP MANAGER":
                EmpMultiplesCheck(empInfo, actionChoice, managerObjArr, managerNamesArr);
                break;
            default:
                EmpMultiplesCheck(empInfo, actionChoice);
                break;
        }
    });
}

function manageEmployeeInfo(actionChoice) {
    switch (actionChoice) {
        case "ADD":
            handleAddEmployee();
            break;
        case "VIEW BY MANAGER":
            handleViewByManager();
            break;
        default:
            handleMultipleEmployeeActions(actionChoice);
            break;
    }
}

function addEmployeeToDB(empInfo, managerObjArr) {
    console.log("You've entered staff ADD");

    const queryRoleIdFromTitle = "SELECT role.role_id FROM role WHERE role.role_title = (?) ;";
    connection.query(queryRoleIdFromTitle, empInfo.employee_role, (err, res) => {
        if (err) throw err;

        const { first_name: firstName, last_name: lastName } = empInfo;
        const managerNames = empInfo.employee_manager.split(" ");
        const managerFirstName = managerNames[0];
        const managerLastName = managerNames[1];

        const manager = managerObjArr.find(manager => manager.firstName === managerFirstName && manager.lastName === managerLastName);

        const queryInsertEmpInfo = "INSERT INTO staff (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
        connection.query(queryInsertEmpInfo, [firstName, lastName, res[0].id, manager.ID], (err, result) => {
            if (err) throw err;
            console.log("Employee Added");
            mainMenu();
        });
    });
}

// ... (rest of the code)

class Prompt {
    constructor(type, name, question, choices = null) {
        this.type = type;
        this.name = name;
        this.question = question;
        this.choices = choices;
    }

    getPromptDetails() {
        return {
            type: this.type,
            name: this.name,
            message: this.question,
            choices: this.choices
        };
    }
}

function handleMultipleEmployeesFound(employees, actionChoice, arrayNeededForNextStep) {
    console.log("Multiple Employees Found!");
    const employeeChoices = employees.map(staff => `${staff.staff_id} ${staff.first} ${staff.last} ${staff.title} ${staff.name}`);
    
    const employeeToDeletePrompt = new Prompt('list', 'employee_delete', questions.deleteEmployee1, employeeChoices).getPromptDetails();

    inquirer.prompt([employeeToDeletePrompt]).then(userChoice => {
        const chosenEmployeeDetails = userChoice.employee_delete.split(" ");
        const employeeID = chosenEmployeeDetails[0];

        switch(actionChoice) {
            case "DELETE":
                deleteEmp(employeeID);
                break;
            case "UPDATE EMP ROLE":
                updateEmpRole(employeeID, arrayNeededForNextStep);
                break;
            case "UPDATE EMP MANAGER":
                updateEmpManager(employeeID, arrayNeededForNextStep);
                break;
        }
    });
}

function handleSingleEmployeeFound(staff, actionChoice, arrayNeededForNextStep) {
    console.log("One Employee Found!");

    switch(actionChoice) {
        case "DELETE":
            deleteEmp(staff.staff_id);
            break;
        case "UPDATE EMP ROLE":
            updateEmpRole(staff.staff_id, arrayNeededForNextStep);
            break;
        case "UPDATE EMP MANAGER":
            updateEmpManager(staff.staff_id, arrayNeededForNextStep);
            break;
    }
}

function checkForMultipleEmployeeInstances(empInfo, actionChoice, arrayNeededForNextStep) {
    console.log("You've entered staff multiples check");
    const queryMultipleEmpCheck = `
        SELECT staff.staff_id, staff.first, staff.last, role.role_title, role.role_salary, 
        staff.manager_id, departments.dept_name
        FROM staff 
        INNER JOIN role on role.role_id = staff.role_ref
        INNER JOIN departments on departments.dept_id = role.dept_id_ref
        WHERE staff.first = ? AND staff.last = ?;
    `;

    connection.query(queryMultipleEmpCheck, [empInfo.first_name, empInfo.last_name], (err, employees) => {
        if (err) throw err;

        if (employees.length > 1) {
            handleMultipleEmployeesFound(employees, actionChoice, arrayNeededForNextStep);
        } else if (!employees[0] || typeof employees[0].id === "undefined") {
            console.log("Could not find staff. Rerouted to Main Menu");
            mainMenu();
        } else {
            handleSingleEmployeeFound(employees[0], actionChoice, arrayNeededForNextStep);
        }
    });
}

// ... (rest of the code)

// Refactored function to delete an staff based on given parameters
async function deleteEmployee(firstName, lastName, employeeID) {
    console.log("Entering staff deletion.");

    const confirmDeletionPrompt = new InquirerFunctions(
        inquirerTypes[2],
        'confirm_choice',
        `${questions.deleteEmployee2} ${firstName} ${lastName}?`,
        ["yes", "no"]
    );

    const response = await inquirer.prompt([confirmDeletionPrompt.ask()]);

    if (response.confirm_choice === "yes") {
        const deleteQuery = "DELETE FROM staff WHERE staff.staff_id = (?);";
        const queryExecutor = new SQLquery(deleteQuery, employeeID);
        queryExecutor.delete(mainMenu);
    } else {
        mainMenu();
    }
}

// Refactored function to update the role of an staff
async function updateEmployeeRole(employeeID, rolesArray) {
    console.log("Entering staff role update.");

    const rolePrompt = new InquirerFunctions(inquirerTypes[2], 'employee_role', questions.updateRole, rolesArray);
    const chosenRole = await inquirer.prompt([rolePrompt.ask()]);

    const roleIdQuery = "SELECT role.role_id FROM role WHERE role.role_title = (?);";
    connection.query(roleIdQuery, chosenRole.employee_role, (err, result) => {
        if (err) throw err;

        const updateRoleIdQuery = `UPDATE staff SET staff.role_ref = (?) WHERE staff.staff_id = (?)`;
        const queryExecutor = new SQLquery(updateRoleIdQuery, [result[0].id, employeeID]);
        queryExecutor.update(mainMenu, "Employee Role Updated!");
    });
}

// Refactored function to update the manager of an staff
async function updateEmployeeManager(employeeID, managerObjectArray) {
    console.log("Entering staff manager update.");

    const currentManagerQuery = "SELECT staff.manager_id FROM staff WHERE staff.staff_id = (?);";
    connection.query(currentManagerQuery, employeeID, async (err, currentManager) => {
        if (err) throw err;

        const possibleManagers = managerObjectArray.filter(manager => manager.ID !== currentManager[0].manager_id);
        const managerOptions = possibleManagers.map(manager => `ID: ${manager.ID} ${manager.firstName} ${manager.lastName}`);
        
        const managerPrompt = new InquirerFunctions(inquirerTypes[2], 'new_Manager', questions.newManager, managerOptions);
        const userChoice = await inquirer.prompt([managerPrompt.ask()]);
        const newManagerID = userChoice.new_Manager.split(" ")[1];

        const updateManagerQuery = `UPDATE staff SET staff.manager_id = (?) WHERE staff.staff_id = (?)`;
        connection.query(updateManagerQuery, [newManagerID, employeeID], (err) => {
            if (err) throw err;
            console.log("Manager Updated!");
            mainMenu();
        });
    });
}

// Function to view all roles
function viewAllRoles() {
    const rolesQuery = `SELECT role.role_title, role.role_salary, departments.dept_name FROM role INNER JOIN departments ON departments.dept_id = role.dept_id_ref`;
    const queryExecutor = new SQLquery(rolesQuery);
    queryExecutor.generalTableQuery(mainMenu);
}

// Function to view all departments
function viewAllDepartments() {
    const departmentQuery = "SELECT departments.dept_name FROM departments";
    const queryExecutor = new SQLquery(departmentQuery);
    queryExecutor.generalTableQuery(mainMenu);
}
// This function retrieves all departments names from the database,
// then prompts the user to input details for a new role to add to the database.
function addRoleToDB() {
    const queryDeps = "SELECT departments.dept_name FROM departments;"
    connection.query(queryDeps, function (err, res) {

        if (err) throw err

        let depNameArr = []
        for (let i = 0; i < res.length; i++) {
            depNameArr.push(res[i].name)
        }

        // Creating Inquirer prompts for user input
        const whatRole = new InquirerFunctions(inquirerTypes[0], 'role_to_add', questions.newRole)
        const whatSalary = new InquirerFunctions(inquirerTypes[0], 'role_salary', questions.salary)
        const whatdepartment = new InquirerFunctions(inquirerTypes[2], 'departments', questions.departments, depNameArr)

        Promise.all([whatRole.ask(), whatSalary.ask(), whatdepartment.ask()]).then(prompts => {
            inquirer.prompt(prompts).then(userChoices => {

                const getDepId = `SELECT departments.dept_id FROM departments WHERE departments.dept_name = (?);`
                connection.query(getDepId, userChoices.departments, function (err, res) {
                    if (err) {
                        throw err
                    }

                    // Inserting the new role into the database
                    const addRolequery = `INSERT INTO role (role.role_title, role.role_salary, role.dept_id_ref)
                                    VALUES ( (?), (?), (?));`
                    const addRole = new SQLquery(addRolequery, [userChoices.role_to_add, userChoices.role_salary, res[0].id]);

                    addRole.update(mainMenu, "Role added!");
                })
            })
        })
    })
}

// This function allows the user to delete a specific role from the database.
function deleteRole(compRolesArr) {
    console.log("You've entered role delete")

    // Prompting the user to select a role to delete
    const whatRole = new InquirerFunctions(inquirerTypes[2], 'role_to_delete', questions.deleteRole, compRolesArr);
    inquirer.prompt([whatRole.ask()]).then(userChoice => {

        const role_id_Query = `SELECT role.role_id FROM role WHERE role.role_title = (?);`
        connection.query(role_id_Query, userChoice.role_to_delete, function (err, res) {
            if (err) throw err;

            // Logic to handle roles with the same name but different departments
            if (res.length > 1) {
                // Informs user that the chosen role exists in multiple departments
                console.log("Role found in multiple departments!");

                // Fetching all departments having roles with the given name
                const departmentsWithRolequery = `SELECT departments.dept_name, role.dept_id_ref
                                                FROM departments
                                                INNER JOIN role on role.dept_id_ref = departments.dept_id AND role.role_title = (?);`

                connection.query(departmentsWithRolequery, userChoice.role_to_delete, function (err, res) {
                    if (err) throw err;

                    // Prompting the user to specify which departments's role they want to delete
                    const whichDeparment = new InquirerFunctions(inquirerTypes[2], 'department_to_delete_Role_From', questions.departmentDeleteRole, res);
                    inquirer.prompt([whichDeparment.ask()]).then(userChoice => {
                        const departmentName_ID_Arr = res.filter(departments => {
                            if (departments.dept_name == userChoice.department_to_delete_Role_From) {
                                return true;
                            }
                        })

                        const deleteRoleQuery2 = "DELETE FROM role WHERE role.role_title = (?) AND role.dept_id_ref = (?)"
                        const deleteInstance2 = new SQLquery(deleteRoleQuery2, [roleDeleteTitle, departmentName_ID_Arr[0].department_id])
                        deleteInstance2.delete(mainMenu);
                    })
                })

            } else {
                // If only one role with the chosen name, it gets deleted directly
                const deleteRoleQuery = "DELETE FROM role WHERE role.role_id = (?);"
                const deleteInstance = new SQLquery(deleteRoleQuery, res[0].id);
                deleteInstance.delete(mainMenu);
            }
        })
    })
}

// This function allows the user to add a new departments to the database.
function addDep(depNameArr) {
    const whatDep = new InquirerFunctions(inquirerTypes[0], 'dep_to_add', questions.newDep)

    inquirer.prompt([whatDep.ask()]).then(userChoice => {
        const alreadyExist = depNameArr.filter(departments => {
            if (departments.dept_name == userChoice.dep_to_add) return true;
        })

        // If departments already exists, inform the user and return to the main menu
        if (alreadyExist.length >= 1) {
            console.log("Department Already exists!")
            mainMenu();
        } else {
            // If not, the new departments gets added to the database
            const addDepQuery = `INSERT INTO departments (departments.dept_name) VALUES (?);`
            const addDep = new SQLquery(addDepQuery, userChoice.dep_to_add);

            addDep.update(mainMenu, "Department added!");
        }
    })
}

// This function allows the user to remove a departments from the database.
function removeDep(depNameArr) {
    const whatDepartment = new InquirerFunctions(inquirerTypes[0], 'dep_to_delete', questions.deleteDep)

    inquirer.prompt([whatDepartment.ask()]).then(userChoice => {
        const deleteDepQuery = `DELETE FROM departments WHERE departments.dept_name = (?);`
        const deleteDep = new SQLquery(deleteDepQuery, userChoice.dep_to_delete);

        deleteDep.update(mainMenu, "Department deleted!");
    })
}
