// dependencies
var inquirer = require("inquirer");
var mysql = require("mysql");
// var colors = require("colors");
const cTable = require('console.table');

// connect to the database
const connection  = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});

// initial prompt sowing options
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  initialList()
});

function initialList() {
  inquirer
    .prompt({
      name: "selectOption",
      type: "list",
      message: "Select one",
      choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
    })
    .then(function (answer) {
      console.log(answer)
      var answer1 = answer.selectOption
      switch (answer1) {
        case "View Products for Sale":
          displayItems()
          break;
        case "View Low Inventory":
          lowInventory()
          break;
        case "Add to Inventory":
          addInventory()
          break;
        case "Add New Product":
          addNewProduct()
          break;
      }
    });
}
function displayItems() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    console.log(res)
    console.table(res);
    initialList()
  });

}

function lowInventory() {
  console.log("Update the quantity of following products")

  connection.query("SELECT * FROM products WHERE stock_quantity < 40",
    function (err, res) {

      if (err) throw err;
      console.table(res)
      initialList()
    })

}

function addInventory() {
  connection.query("SELECT * FROM products", function (err, response) {

    if (err) throw err;

    console.table(response);
    inquirer.prompt([
      {
        type: "input",
        message: "Enter the id of the product you would like to add",
        name: "item_id"
      },
      {
        type: "input",
        message: "Enter the quantity of the product you would like to add",
        name: "new_quantity"
      }
    ]).then(function (response) {
      connection.query("UPDATE products SET ? WHERE ?", [{
        stock_quantity: response.new_quantity
      }, {
        id: response.item_id
      }], function (err, res) {
        if (err) throw err;
        console.log(`${res.affectedRows} product updated`);
        initialList()
      })
    })
  })
}

function addNewProduct() {
  inquirer.prompt([
    {
      type: "input",
      message: "Enter the name of the product you would like to sale",
      name: "item_name"
    },
    {
      type: "input",
      message: "please enter the department  of the product you would like to sale?",
      name: "dept"
    }, {
      type: "input",
      message: "please enter the selling price for the product you would like to sale?",
      name: "selling_price"
    },
    {
      type: "input",
      message: "How many units of the product you would like to sale?",
      name: "quantity"
    }
  ]).then(function (response) {
    connection.query("INSERT INTO products SET ?", {
      product_name: response.item_name,
      department_name: response.dept,
      price: parseFloat(response.selling_price),
      stock_quantity: parseInt(response.quantity)
    }
      , function (err, response) {
        if (err) throw err;
        console.log(response);
        initialList()
      })
  })
}