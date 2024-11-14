const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

//load enviromental variable
require('dotenv').config();

//start the server
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Middle ware to let frontend app
app.use(cors());

// app.use(cors({
//     origin: 'http://127.0.0.1:5500',
//     methods: ['GET', 'POST'], // Allowed methods
//     allowedHeaders: ['Content-Type'] // Allowed headers
// }));


const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
});





// Connect to the database
connection.connect((err) => {
    // if(err) console.log(err.message);
    // else console.log("connected to database")
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
});







 // Route: /create-table -> To create the tables
app.get('/create-table', (req, res) => {
    // Putting Query on a variable
    let name = `CREATE TABLE if not exists customers(
        customer_id int auto_increment,
        name VARCHAR(255) not null,
        PRIMARY KEY (customer_id)
    );`;

    let address = `CREATE TABLE if not exists address(
        address_id int auto_increment,
        customer_id int(11) not null,
        address VARCHAR(255) not null,
        PRIMARY KEY (address_id),
        FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
    );`;

    let company = `CREATE TABLE if not exists company(
        company_id int auto_increment,
        customer_id int(11) not null,
        company VARCHAR(255) not null,
        PRIMARY KEY (company_id),
        FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
    );`;

    // Executing the queries we wrote above
    connection.query(name, (err, results, fields) => {
        if (err) console.log(`Error Found: ${err}`);
    });
    
    connection.query(address, (err, results, fields) => {
        if (err) console.log(`Error Found: ${err}`);
    });
    
    connection.query(company, (err, results, fields) => {
        if (err) console.log(`Error Found: ${err}`);
    });

    res.send('Tables created successfully');
});


connection.query("USE Jan_2025", (err) => {
    if(err) console.log(err.message);
    else console.log("Database selected")
   
});




// Route: /insert-customers-info -> To insert data to the tables
app.post("/insert-customers-info", (req, res) => {
    // console.log(req.body)
    // Destructure the properties from the request body for easy access
    const { name, address, company } = req.body;

    // Define the SQL queries for each table
    let insertName = "INSERT INTO customers (name) VALUES (?)";
    let insertAddress = "INSERT INTO address (customer_id, address) VALUES (?, ?)";
    let insertCompany = "INSERT INTO company (customer_id, company) VALUES (?, ?)";

    // Insert into the 'customers' table
    connection.query(insertName, [name], (err, results, fields) => {
        if (err) console.log(`Error Found: ${err}`);
         console.table(results);
        
        const id = results.insertId;
        console.log(
            "id from customers table to be used as a foreign key on the other tables >>> ",
            id
        );

        // Insert into the 'address' table using the customer_id as a foreign key
        connection.query(insertAddress, [id, address], (err, results, fields) => {
            if (err) {
                console.log(`Error Found: ${err}`);
                return res.status(500).send("Error inserting customer address");
            }
        });

        // Insert into the 'company' table using the customer_id as a foreign key
        connection.query(insertCompany, [id, company], (err, results, fields) => {
            if (err) {
                console.log(`Error Found: ${err}`);
                return res.status(500).send("Error inserting customer company");
            }
        }); 

        // If all queries succeed, send a success response
        // res.end("Data inserted successfully!");
        // console.log("Data inserted successfully!");
    });
    res.end("Data inserted successfully!");
    console.log("Data inserted successfully!");
});


// Route: /customers-detail-info => To retrieve data from the
app.get("/customers-detail-info", (req,res)=>{

    // let query = "SELECT * FROM customers"
    let query = "SELECT * FROM customers WHERE customer_id=4"
   

    connection.query(
        query,
        (err, results, fields) => {
            if (err) console.log("Error During selection", err);
            console.log(results);
            // console.log(fields);
            res.send(results);
        }
    );
});






// Route: /customers-detail-info => To retrieve data from the
app.get("/customers", (req,res)=>{

    // let query = "SELECT * FROM customers"
    // let query = "SELECT * FROM customers WHERE customer_id=4"
    let query = `SELECT customers.customer_id AS id, customers.name, address.address, company.company FROM
    customers INNER JOIN address INNER JOIN company
    ON
    customers.customer_id = address.customer_id
    AND
    customers.customer_id= company.customer_id`

    connection.query(
        query,
        (err, results, fields) => {
            if (err) console.log("Error During selection", err);
            console.log(results);
            // console.log(fields);
            res.send(results);
        }
    );
});




// Route: /customers-detail-info => To retrieve data from the
app.get("/customers-name", (req,res)=>{

    let query = "SELECT name FROM customers Limit 2"
    
   

    connection.query(
        query,
        (err, results, fields) => {
            if (err) console.log("Error During selection", err);
            console.log(results);
            // console.log(fields);
            res.send(results);
        }
    );
});



// Route: /update => To adjust or update data from the tables
app.put("/update", (req, res) => {
	// console.table(req.body);
	const { newName, id } = req.body;

	let updateName = `UPDATE customers 
						SET name = '${newName}' 
					WHERE customer_id = '${id}'`;

	connection.query(updateName, (err, result) => {
        if (err) {
            console.error("Error updating record:", err);
            return res.status(500).send("Error updating record.");
         }
		console.log(result.affectedRows + " record(s) updated");
		res.send(result);
	});
});




// Route: /remove-user => To delete all data from the tables
app.delete("/remove-user", (req, res) => {
	// console.table(req.body)
	const { id } = req.body;
	let removeName = `DELETE FROM customers WHERE customer_id = '${id}'`;
	let removeAddress = `DELETE FROM address WHERE customer_id = '${id}'`;
	let removeCompany = `DELETE FROM company WHERE customer_id = '${id}'`;

	connection.query(removeAddress, (err, result) => {
		if (err) throw err;
		console.log(result.affectedRows + " record(s) Deleted");
	});

	connection.query(removeCompany, (err, result) => {
		if (err) throw err;
		console.log(result);
		console.log(result.affectedRows + " record(s) Deleted");
	});

	connection.query(removeName, (err, result) => {
		if (err) throw err;
		console.log(result.affectedRows + " record(s) Deleted");
	});

	res.end("Deleted");
});






// Define the port to listen on
const port = 4000;


// GET request handler
app.get('/', (req, res) => {
    res.send('up and running.');
});

// Start the server
app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);
});




