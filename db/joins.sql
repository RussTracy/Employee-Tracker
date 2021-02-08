-- View all departments
SELECT department.id, department_name AS Department FROM department;

-- View all roles
SELECT employee_role.id, title AS "Job Title", department_name AS Department, salary AS Salary
FROM employee_role
INNER JOIN department
ON employee_role.department_id = department.id;

-- View all employees
SELECT employee.id, employee.first_name AS "First Name", employee.last_name AS "Last Name", title AS "Job Title", department_name AS Department, salary AS Salary, CONCAT(manager.first_name, ' ', manager.last_name) AS Manager
FROM employee
INNER JOIN employee_role
    ON employee_role_id = employee_role.id
INNER JOIN department
    ON employee_role.department_id = department.id
LEFT JOIN employee manager
    ON manager.id = employee.manager_id;


-- SELECT employee.id, employee.first_name, employee.last_name, title, department_name, salary, CONCAT(manager.first_name, ' ', manager.last_name) AS Manager
-- FROM employee
-- INNER JOIN employee_role
--     ON employee_role_id = employee_role.id
-- INNER JOIN department
--     ON employee_role.department_id = department.id
-- LEFT JOIN employee manager
--     ON manager.id = employee.manager_id
-- WHERE department_name = 'Finance';SELECT employee.id, employee.first_name, employee.last_name, title, department_name, salary, CONCAT(manager.first_name, ' ', manager.last_name) AS Manager
-- FROM employee
-- INNER JOIN employee_role
--     ON employee_role_id = employee_role.id
-- INNER JOIN department
--     ON employee_role.department_id = department.id
-- LEFT JOIN employee manager
--     ON manager.id = employee.manager_id
-- WHERE department_name = 'Finance';