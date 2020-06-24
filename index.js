var express = require('express');
var mysql = require('mysql');
var cors = require('cors');
var bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const port = 8080;

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/all', (req, res) => {
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query("SELECT * FROM apartment_data", function (err, result, fields) {
            if (err) throw err;
            
            res.send(result);
            connection.release();
          });
    });
});

app.get('/beds=:num', (req, res) => {
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM apartment_data WHERE Beds=${req.params.num}`, function (err, result, fields) {
            if (err) throw err;
            
            res.send(result);
            connection.release();
          });
    });
});

app.get('/baths=:num', (req, res) => {
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM apartment_data WHERE Baths=${req.params.num}`, function (err, result, fields) {
            if (err) throw err;
            
            res.send(result);
            connection.release();
          });
    });
});

app.get('/location=:apartmentName', (req, res) => {
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM apartment_data WHERE Apartment="${req.params.apartmentName}"`, function (err, result, fields) {
            if (err) throw err;
            
            res.send(result);
            connection.release();
          });
    });
});

app.get('/size=:num', (req, res) => {
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM apartment_data WHERE Size=${req.params.num}`, function (err, result, fields) {
            if (err) throw err;
            
            res.send(result);
            connection.release();
          });
    });
});

app.get('/price=:num', (req, res) => {
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM apartment_data WHERE Price="${req.params.num}"`, function (err, result, fields) {
            if (err) throw err;
            
            res.send(result);
            connection.release();
          });
    });
});


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))




