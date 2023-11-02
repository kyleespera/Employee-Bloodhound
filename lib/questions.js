// questions.js
const questions = {
    mainMenu: {
        type: 'list',
        name: 'menuChoice',
        message: "What would you like to do?"
    },
    addEmployeeFirstName: {
        type: 'input',
        name: 'firstName',
        message: "What is the staff's first name?"
    },
    addEmployeeLastName: {
        type: 'input',
        name: 'lastName',
        message: "What is the staff's last name?"
    },
    addEmployeeRole: {
        type: 'list',
        name: 'role',
        message: "What is the staff's role?",
        // Note: Choices for roles would typically be populated dynamically, but leaving as placeholder
        choices: []
    },
    // ... and so on for each of the other questions

    deleteDep: {
        type: 'list',
        name: 'deleteDepartment',
        message: "What departments would you like to delete?",
        // Note: Choices for departments would typically be populated dynamically
        choices: []
    }
};

module.exports = questions;
