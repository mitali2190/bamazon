const mysql = require('mysql');
const inquirer = require('inquirer');
const table = require('console.table');

const db = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

let products = []
db.connect(error => {
    if (error) throw error;
    console.log('Connected to db');
    startPrompt();
});


const getProducts = (show) => {
    console.log('Getting Product List');
    db.query("SELECT * FROM products ORDER BY product_name", (error, productList) => {
        if (error) {
            console.log('error')
            throw error;
        } else {
            products = productList;
            let output = table(products);
            console.log('');
            if (show) console.log(output);

        }
    });
}


const startPrompt = () => {
    getProducts(true);
    inquirer.prompt({
        
            name: 'usrOpt',
            type: 'list',
            message: 'Are you?',
            choices: ['Customer', 'Manager', 'Supervisor']
        
    }).then(usrAnswer => {
        switch (usrAnswer.selectOpt) {
            case "Customer":
            getProducts()
                // customerOpt();
                break;
            case "Manager":
                managerOpt();
                break;
            case "Supervisor":
                break;
            default:
                break;
        }
    })

}


const customerOpt = () => {
    inquirer.prompt([
        {
            name: 'cusOpt',
            type: 'input',
            message: 'What item do you want to buy? (id) :',
            validate: function (value) {
                p = products.filter(o => o.item_id == value);
                return p.length > 0
            }
        },
        {
            name: 'numItem',
            type: 'input',
            message: 'How many do you want to buy? :',
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }

        }
    ]).then(usrAnswer => {
        let selectedProd = products.filter(o => o.item_id == usrAnswer.cusOpt);
        let q = selectedProd[0].stock_quantity;
        if (q < usrAnswer.numItem) {
            console.log('Insufficient quantity!');
            customerOpt();
        } else {
            const qTotal = parseInt(q) - parseInt(usrAnswer.numItem);

            console.log(qTotal);
            db.query("UPDATE products SET ? WHERE  ?",
                [
                    {
                        stock_quantity: qTotal
                    },
                    {
                        item_id: selectedProd[0].item_id
                    }
                ], error => {
                    if (error) throw error;
                    let total = parseInt(usrAnswer.numItem) * parseFloat(selectedProd[0].price);
                    console.log(`The order total of ${selectedProd[0].product_name}  is : ${total}`);
                    startPrompt();
                });
        }
    })
}

const managerOpt = () => {
    inquirer.prompt([

        {
            name: 'usrOpt',
            type: 'list',
            message: 'Are you?',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
        }
    ]).then(usrAnswer => {
        switch (usrAnswer.usrOpt) {
            case "View Products for Sale":
                getProducts(true);
                managerOpt();
                break;
            case "View Low Inventory":
                viewLowInv();
                break;
            case "Add to Inventory":
                addInv();
                break;
            case "Add New Product":
                addProd();
                break;
            default:
                break;
        }
    })
}

const viewLowInv = () => {
    db.query("SELECT * FROM products WHERE stock_quantity <5 ORDER BY product_name", (error, productList) => {
        if (error) {
            console.log('error')
            throw error;
        } else {
            let output = table(productList);
            console.log('');
            console.log(output);
            
        }
        managerOpt();
    });
}

const addInv = () => {
    inquirer.prompt([
        {
            name: 'cusOpt',
            type: 'input',
            message: 'What product do you want to add? (id) :',
            validate: function (value) {
                p = products.filter(o => o.item_id == value);
                return p.length > 0
            }
        },
        {
            name: 'numItem',
            type: 'input',
            message: 'How many do you want to add? :',
            validate: function (value) {
                if (isNaN(value) === false && value >0) {
                    return true;
                }
                return false;
            }

        }
    ]).then(usrAnswer => {
        let selectedProd = products.filter(o => o.item_id == usrAnswer.cusOpt);
        let q = selectedProd[0].stock_quantity;

        const qTotal = parseInt(q) + parseInt(usrAnswer.numItem);

        console.log(qTotal);
        db.query("UPDATE products SET ? WHERE  ?",
            [
                {
                    stock_quantity: qTotal
                },
                {
                    item_id: selectedProd[0].item_id
                }
            ], error => {
                if (error) throw error;
                console.log(`Stock updated`);
                startPrompt();
            });

    })
}
const addProd = () => {
    inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'Product name? :',
            validate: function (value) {
                if (value) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        {
            name: 'dept',
            type: 'input',
            message: 'What is the department? :',
            validate: function (value) {
                if (value) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        {
            name: 'price',
            type: 'input',
            message: 'What is the price of each item? :',
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            name: 'qty',
            type: 'input',
            message: 'How many are you goin to  add? :',
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(usrAnswer => {
        console.log('inserting item')
        db.query("INSERT INTO products SET ?",
            {
                product_name: usrAnswer.name.toUpperCase(),
                department_name: usrAnswer.dept.toUpperCase(),
                price: usrAnswer.price,
                stock_quantity: usrAnswer.qty
            }, function (err) {
                if (err) throw err;
                console.log("Item added successfully!");
                startPrompt();
            });

    })
}