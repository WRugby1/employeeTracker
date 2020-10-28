// Dependencies
const express = require("express");
const mysql = require("mysql");
const inquirer = require("inquirer");
const { connect } = require("http2");
const { isBuffer } = require("util");

// Create express app instance.
const app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
const PORT = process.env.PORT || 8080;

// MySQL DB Connection Information (remember to change this with our specific credentials)
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "_employeecms"
});

homepage();
// Inquirer prompt for adding departments, viewing departments, and updating employee roles
function homepage() {
    inquirer.prompt({
        type: "list",
        message: "What would you like to access?",
        choices: ["View departments", "View roles", "View employees", "Add department", "Add roles", "Add employees", "Update employee role"],
        name: "choice"
    }).then(data => {
        if (data.choice == "View departments") {
            viewDepartments();
        }
        else if (data.choice == "View roles") {
            viewRoles();
        }
        else if (data.choice == "View employees") {
            viewEmployees();
        }
        else if (data.choice == "Add department") {
            addDepartment();
        }
        else if (data.choice == "Add roles") {
            addRoles();
        }
        else if (data.choice == "Add employees") {
            addEmployee();
        }
        else if (data.choice == "Update employee role") {
            // select employee
            connection.query("SELECT * FROM employee", function (err, results) {
                if (err) throw (err);
                let employeeName = [];
                for (var i = 0; i < results.length; i++) {
                    employeeName.push(results[i].first_name)
                };
                inquirer.prompt([{
                    type: "list",
                    message: "Please select an employee",
                    choices: employeeName,
                    name: "employeeChoice"
                },
                {
                    type: "list",
                    message: "What would you like to edit?",
                    choices: ["Title", "Salary", "Department"],
                    name: "roleChoice"
                }]).then(data => {
                    var employeeId;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].first_name == data.employeeChoice) {
                            employeeId = results[i].id;
                            break
                        }
                    }
                    if (data.roleChoice == "Title") {
                        inquirer.prompt({
                            type: "input",
                            message: "Please enter a new title: ",
                            name: "newTitle"
                        }).then(title =>
                            connection.query("UPDATE role SET ? WHERE ?",
                                [{
                                    title: title.newTitle
                                },
                                {
                                    id: employeeId
                                }], function () {
                                    homepage();
                                }))
                    }
                    else if (data.roleChoice == "Salary") {
                        inquirer.prompt({
                            type: "input",
                            message: "Please enter a new salary: ",
                            name: "newSalary"
                        }).then(salary =>
                            connection.query("UPDATE role SET ? WHERE ?",
                                [{
                                    title: salary.newSalary
                                },
                                {
                                    id: employeeId
                                }], function () {
                                    homepage();
                                }))
                    }
                    else if (data.roleChoice == "Department") {
                        var departmentsEdit = [];
                        connection.query("SELECT * FROM department", function (err, departmentData) {
                            if (err) throw err;
                            for (var i = 0; i < departmentData.length; i++) {
                                departmentsEdit.push(departmentData[i].name)
                            }
                            inquirer.prompt({
                                type: "list",
                                message: "Please select a new department: ",
                                choices: departmentsEdit,
                                name: "newDepartment"
                            }).then(updateDepartment => {
                                connection.query("SELECT id FROM department WHERE ?",
                                    {
                                        name: updateDepartment.newDepartment
                                    },
                                    function (err, data) {
                                        if (err) throw err;
                                        connection.query("UPDATE role SET ? WHERE ?",
                                            [{
                                                department_id: data[0].id
                                            },
                                            {
                                                id: employeeId
                                            }], function () {
                                                homepage();
                                            })
                                    }
                                )
                            })

                        })
                    }
                }
                )
            })
        }
    });
}

connection.connect(function (err) {
    if (err) {
        return;
    }
    app.listen(PORT, function () {
    });
});

function viewDepartments() {
    connection.query("SELECT * FROM department", function (err, data) {
        if (err) throw err;
        console.table(data);
        homepage();
    });
}

function viewEmployees() {
    connection.query("SELECT * FROM employee", function (err, data) {
        if (err) throw err;
        console.table(data);
        homepage();
    });
}

function viewRoles() {
    connection.query("SELECT * FROM role", function (err, data) {
        if (err) throw err;
        console.table(data);
        homepage();
    });
}

function addDepartment() {
    inquirer.prompt(
        {
            type: "input",
            message: "Please enter department name: ",
            name: "name"
        }
    ).then(data =>
        connection.query("INSERT INTO department SET ?",
            {
                name: data.name
            },
            homepage()
        ))
}

// function addRoles() {
//     var departmentsSelect = [];
//     connection.query("SELECT * FROM department", function (err, departmentData) {
//         if (err) throw err;
//         for (var i = 0; i < departmentData.length; i++) {
//             departmentsSelect.push(departmentData[i].name)
//         }
//     }),
//         inquirer.prompt([
//             {
//                 type: "input",
//                 message: "Please enter job title: ",
//                 name: "title"
//             },
//             {
//                 type: "input",
//                 message: "Please enter Salary: ",
//                 name: "salary"
//             },
//             {
//                 type: "list",
//                 message: "Please select a new department: ",
//                 choices: departmentsSelect,
//                 name: "newDepartment"
//             }
//         ])
//             let depid= [],
//             connection.query("SELECT id FROM department WHERE ?",
//                         {
//                             name: data.newDepartment
//                         }).then(data => {
//                             depid.push(data[0].id)
//                         }),
//             connection.query("INSERT INTO role SET ?", 
//                 {
//                     title: data.title,
//                     salary: data.salary,
//                     department_id: 
//                 },
//                 homepage()
//             )
//         )
// }
// var roleSelect = [];
// connection.query("SELECT * FROM role", function (err, roleData) {
//     if (err) throw err;
//     for (var i = 0; i < roleData.length; i++) {
//         roleSelect.push(roleData[i].name)
//     }
// })
// let managers = [];
// connection.query("SELECT * FROM EMPLOYEE", function (err, data) {
//     if (err) throw err;
//     for (var i = 0; i < data.length; i++) {
//         if (data.manager_id == NULL) {
//             managers.push(data[i].first_name)
//         }
//     }
// })
function addEmployee() {
    connection.query("SELECT * FROM role", function (err, roleData) {
        if (err) throw (err);
        var roleSelect = [];
        for (var i = 0; i < roleData.length; i++) {
            roleSelect.push(roleData[i].title)
        };
        inquirer.prompt([{
            type: "input",
            message: "Please enter the first name: ",
            name: "firstName"
        },
        {
            type: "input",
            message: "Please enter the last name: ",
            name: "lastName"
        },
        {
            type: "list",
            message: "Please select a role: ",
            choices: roleSelect,
            name: "role"
        }]).then(data => {
            var roleid = connection.query(
                "SELECT id FROM role WHERE ?", {
                    title: data.role
                }
            );
            console.log(roleid);
            connection.query("INSERT INTO employee SET ?",
                {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    role_id: roleid,
                    // manager_id: manager_id(data)
                },
            )}
            );
        
        // let managers = [];
        // connection.query("SELECT * FROM EMPLOYEE", function (err, data) {
        //     if (err) throw err;
        //     for (var i = 0; i < data.length; i++) {
        //         if (data.manager_id == NULL) {
        //             managers.push(data[i].first_name)
        //         }
        //     };
        //     inquirer.prompt({
        //         type: "list",
        //         message: "Please choose a manager: ",
        //         choices: managers,
        //         name: "managerSelection"
        //     })
        // })
    })
}

function role_id(data) {
    connection.query("SELECT id FROM role WHERE ?",
        {
            title: data.role
        }, function (err, data) {
            if (err) throw err;
            console.log(data[0].id)
            var id = data[0].id
            return id
        });
    return id
}

function manager_id(data) {
    connection.query("SELECT ")
}