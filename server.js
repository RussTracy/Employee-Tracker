// Require libraries.
const express = require('express')
const mysql = require('mysql2')
const inquirer = require('inquirer');
const cTable = require('console.table');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to MySQL database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '***********',
    database: 'employee_db'
})

connection.connect(err => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId + '\n');
    startApp();
});

const startApp = () => {

    const mainQuestions = () => {
        return inquirer.prompt([
            {
                type: 'list',
                name: 'menu',
                message: 'What would you like to do?',
                choices: [
                    'Finished',
                    'View All Departments',
                    'View All Roles',
                    'View All Employees',
                    'Add a Department',
                    'Add a Role',
                    'Add an Employee',
                    'Update an Employee Role'
                ],
            }

        ])
            .then(answers => {
                if (answers.menu === 'View All Departments') {
                    displayDepartments();
                }
                if (answers.menu === 'View All Roles') {
                    displayRoles();
                }
                if (answers.menu === 'View All Employees') {
                    displayEmployees();
                }
                if (answers.menu === 'Add a Department') {
                    addDepartment();
                }
                if (answers.menu === 'Add a Role') {
                    addRole();
                }
                if (answers.menu === 'Add an Employee') {
                    addEmployee();
                }
                if (answers.menu === 'Update an Employee Role') {
                    updateRole();
                }
                if (answers.menu === 'Finished') {
                    console.log('Goodbye!')
                    return false;
                }

            })
    };


    displayDepartments = () => {
        const query = connection.query(
            'SELECT department.id, department_name AS Department FROM department',
            function (err, res) {
                if (err) throw err;
                console.log('\n Displaying all Departments...\n');
                console.table(res);
                mainQuestions();
                return true;
            }
        );
    };

    displayRoles = () => {
        const query = connection.query(
            `SELECT employee_role.id, title AS "Job Title", department_name AS Department, salary AS Salary
            FROM employee_role
            INNER JOIN department
            ON employee_role.department_id = department.id`,
            function (err, res) {
                if (err) throw err;
                console.log('\n Displaying all Roles...\n');
                console.table(res);
                mainQuestions();
                return true;
            }
        );
    };

    displayEmployees = () => {
        const query = connection.query(
            `SELECT employee.id, employee.first_name AS "First Name", employee.last_name AS "Last Name", title AS "Job Title", department_name AS Department, salary AS Salary, CONCAT(manager.first_name, ' ', manager.last_name) AS Manager
            FROM employee
            INNER JOIN employee_role
                ON employee_role_id = employee_role.id
            INNER JOIN department
                ON employee_role.department_id = department.id
            LEFT JOIN employee manager
                ON manager.id = employee.manager_id`,
            function (err, res) {
                if (err) throw err;
                console.log('\n Displaying all Employees...\n');
                console.table(res);
                mainQuestions();
                return true;
            }
        );
    };

    addDepartment = () => {
        return inquirer.prompt([
            {
                type: 'input',
                name: 'department_name',
                message: 'What is the name of the new Department?',
                validate: answerInput => {
                    if (answerInput) {
                        return true;
                    } else {
                        console.log('Please enter the new Department name!');
                        return false;
                    }
                }
            }
        ])
            .then(answers => {
                console.log(answers);
                console.log('Inserting a new department...\n');
                const query = connection.query(
                    'INSERT INTO department SET ?', answers,
                    function (err, res) {
                        if (err) throw err;
                        console.log(res.affectedRows + ' product inserted!\n');
                    });
                console.log('Department Added');
                displayDepartments();
                return true;
            })
    };

    addRole = () => {
        let choicesDepartments = [];

        connection.query(
            'SELECT id AS value, department_name AS Department FROM department',
            function (err, res) {
                if (err) throw err;
                for (let i = 0; i < res.length; i++) {
                    const department = res[i];
                    choicesDepartments.push({
                        name: department.Department,
                        value: department.value
                    });
                }
                promptRole(choicesDepartments)
            }
        );
    }

    promptRole = (choicesDepartment) => {

        return inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What is the name of the new Role?',
                validate: answerInput => {
                    if (answerInput) {
                        return true;
                    } else {
                        console.log('Please enter the new Role name!');
                        return false;
                    }
                }
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary for the new Role?',
                validate: answerInput => {
                    if (answerInput) {
                        return true;
                    } else {
                        console.log('Please enter the salary for the new Role!');
                        return false;
                    }
                }
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'What department is this role assigned?',
                choices: choicesDepartment,
            }
        ])
            .then(answers => {
                console.log(answers);
                console.log('Inserting a new role...\n');
                const query = connection.query(
                    'INSERT INTO employee_role SET ?', answers,
                    function (err, res) {
                        if (err) throw err;
                        console.log(res.affectedRows + ' new role inserted!\n');
                    });
                console.log('New Role Added');
                displayRoles();
                return true;
            })
    };

    addEmployee = () => {
        let choicesRoles = [];
        let choicesManager = [];

        connection.query(
            'SELECT id AS value, title AS Role FROM employee_role',
            function (err, res) {
                if (err) throw err;
                for (let i = 0; i < res.length; i++) {
                    const roles = res[i];
                    choicesRoles.push({
                        name: roles.Role,
                        value: roles.value
                    });
                }
            }
        );

        connection.query(
            `SELECT employee.id AS value, CONCAT(employee.first_name, ' ', employee.last_name) AS Manager
            FROM employee;`,
            function (err, res) {
                if (err) throw err;
                for (let i = 0; i < res.length; i++) {
                    const roles = res[i];
                    choicesManager.push({
                        name: roles.Manager,
                        value: roles.value
                    });
                }

                employeePrompt(choicesRoles, choicesManager)
            }
        );
    }

    employeePrompt = (choicesRoles, choicesManager) => {
        return inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: 'What is the first name of the new Employee?',
                validate: answerInput => {
                    if (answerInput) {
                        return true;
                    } else {
                        console.log('Please enter the new Employee\'s first name!');
                        return false;
                    }
                }
            },
            {
                type: 'input',
                name: 'last_name',
                message: 'What is the last name of the new Employee?',
                validate: answerInput => {
                    if (answerInput) {
                        return true;
                    } else {
                        console.log('Please enter the new Employee\'s last name!');
                        return false;
                    }
                }
            },
            {
                type: 'list',
                name: 'employee_role_id',
                message: 'What is the role assigned to the new Employee?',
                choices: choicesRoles,
            },
            {
                type: 'list',
                name: 'manager_id',
                message: 'Who is the manager assigned to the new Employee?',
                choices: choicesManager,
            }
        ])
            .then(answers => {
                console.log(answers);
                console.log('Inserting a new employee...\n');
                const query = connection.query(
                    'INSERT INTO employee SET ?', answers,
                    function (err, res) {
                        if (err) throw err;
                        console.log(res.affectedRows + ' new employee inserted!\n');
                    });
                console.log('New Employee Added');
                displayEmployees();
                return true;
            })
    };

    updateRole = () => {
        let choicesRoles = [];
        let choicesEmployee = [];

        connection.query(
            'SELECT id AS value, title AS Role FROM employee_role',
            function (err, res) {
                if (err) throw err;
                for (let i = 0; i < res.length; i++) {
                    const roles = res[i];
                    choicesRoles.push({
                        name: roles.Role,
                        value: roles.value
                    });
                }
            }
        );

        connection.query(
            `SELECT employee.id AS value, CONCAT(employee.first_name, ' ', employee.last_name) AS Manager
            FROM employee;`,
            function (err, res) {
                if (err) throw err;
                for (let i = 0; i < res.length; i++) {
                    const roles = res[i];
                    choicesEmployee.push({
                        name: roles.Manager,
                        value: roles.value
                    });
                }

                updateRolePrompt(choicesEmployee, choicesRoles)
            }
        );
    }

    updateRolePrompt = (choicesEmployee, choicesRoles) => {
        return inquirer.prompt([
            {
                type: 'list',
                name: 'id',
                message: 'Select an Employee to modify Role?',
                choices: choicesEmployee,
            },
            {
                type: 'list',
                name: 'employee_role_id',
                message: 'What is the new Role assigned to the Employee?',
                choices: choicesRoles,
            },

        ])
            .then(answers => {
                console.log(answers);
                console.log('Updating employee with new role...\n');
                const query = connection.query(
                    'UPDATE employee SET ? WHERE ?', [
                    {
                        employee_role_id: answers.employee_role_id,
                    },
                    {
                        id: answers.id,
                    }
                ],
                    function (err, res) {
                        if (err) throw err;
                        console.log(res.affectedRows + ' employee role updated!\n');
                    });
                console.log('Employee\'s Role Updated!');
                displayEmployees();
                return true;
            })
    }
    mainQuestions()
};

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
