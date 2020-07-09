var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
//var paginate = require('paginate')();
require('dotenv').config();
var https = require('https');
var fs = require('fs');
const app = express();
const port = 8080;
var ejs = require('ejs');
var cors = require('cors');
var multer = require('multer');


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const upload = multer({storage: storage});

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));


app.get('/', (req, res) => {
});

app.get('/search/beds=:beds/baths=:baths/price=:price/size=:size/aptName=:apartmentName/:page?', (req, res) => {
    var query = assembleQuery(req.params.beds, req.params.baths, req.params.price, req.params.size, req.params.apartmentName);
    var path = req.path.substring(0, req.path.lastIndexOf("]") + 1);
    const limit = 12;
    const page = req.params.page || 1;
    const offset = (page - 1) * limit;
    query += " LIMIT " + limit + " OFFSET " + offset;
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, function (err, result, fields) {
            if (err) throw err;
            
            res.render('display', {data: result, currentPage: page, pages: 16, path: path});
            connection.release();
          });
    });
});

app.get('/search/beds=:beds/baths=:baths/price=:price/size=:size/aptName=:apartmentName/sort=:sortBy/order=:order/:page?', (req, res) => {
    var query = assembleQuery(req.params.beds, req.params.baths, req.params.price, req.params.size, req.params.apartmentName);
    if (req.params.sortBy === "Price")
        req.params.sortBy = "MinPrice";
    if (req.params.sortBy === "Size")
        req.params.sortBy = "MinSize";
    console.log(req.params.sortBy);
    query += " ORDER BY " + req.params.sortBy + " " + req.params.order;
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, function (err, result, fields) {
            if (err) throw err;
            
            res.render('display', {data: result});
            connection.release();
          });
    });
});


app.get('/search/favorites', (req, res) => {
    if (!req.query.data){
        res.send([]);
        return;
    }
    var query = getFavorites(req.query.data);
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, function (err, result, fields) {
            if (err) throw err;
            
            res.send(result);
            connection.release();
          });
    });
});

app.post('/furniture', upload.single('furnitureImage'), (req, res) => {
    var file;
    if (req.file && req.file.path) {
        file = req.file.path.substring(req.file.path.indexOf('public')+6);
    }
    else {
        file = 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSADPzrYm_hQg2XMNc_9KTr9Axmn35s0DbsIQ&usqp=CAU';
    }

    var query = `INSERT INTO furniture_data(ProductName, ProductPrice, ProductDescription, Author, University, Date, Email, Image) \
VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
    var arr = [req.body.name, req.body.price, req.body.description, req.body.author, req.body.university, 
        req.body.dateTime, req.body.email, file];
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, arr, function (err, result, fields) {
            if (err) throw err;
            res.send("Successful");
            connection.release();
        });
    });
});

app.get('/furniture', (req, res) => {
    var query = "SELECT * FROM furniture_data";
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, function (err, result, fields) {
            if (err) throw err;
            res.render('furniture', {data: result, diff: timeDifference});
            connection.release();
        })
    })
})
function getFavorites(data) {
    var query;
    if (data.length > 0) {
        query = "SELECT * FROM apartment_data WHERE ";
    }
    else return null;

    for (let i = 0; i < data.length; ++i) {
        if (i !== 0) {
            query += " OR ";
        }
        query += "(Name='" + data[i].name + "' AND Apartment='" + data[i].aptName + "')";
    }

    return query;
}

function assembleQuery(beds, baths, prices, sizes, names) {
    var atLeastOne = 0;
    var bed="", bath="", price="", size="", name="";
    if (beds === '[]' && baths === '[]' && prices === '[]' && sizes === '[]' && names === '[]')
        return "SELECT * FROM apartment_data";

    if (beds !== '[]') {
        atLeastOne = 1;
        bed = "Beds IN (" + beds.substring(1, beds.length-1) + ")";
    }

    if (baths !== '[]') {
        if (atLeastOne)
            bath = " AND ";
        bath += "Baths IN (" + baths.substring(1, baths.length-1) + ")";
    }

    if (prices !== '[]'){
        if (atLeastOne)
            price = " AND ";
        price += "Price IN (" + prices.substring(1, prices.length-1) + ")";
    }

    if (sizes !== '[]') {
        if (atLeastOne)
            size = " AND ";
        size += "Size IN (" + sizes.substring(1, sizes.length-1) + ")";
    }

    if (names !== '[]') {
        if (atLeastOne)
            name = " AND ";
        name += "Apartment IN (" + names.substring(1, names.length-1) + ")";
    }

    var query = "SELECT * FROM apartment_data WHERE " + bed + bath + price + size + name;
    return query;
}


function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        var check = Math.round(elapsed/1000);
        if (check === 1){
            return check + ' second ago';
        }
        else {
            return check + ' seconds ago';   
        }
    }

    else if (elapsed < msPerHour) {
        var check = Math.round(elapsed/msPerMinute);
        if (check === 1) {
            return check + ' minute ago';
        }
        else {
            return check + ' minutes ago';   
        }
    }

    else if (elapsed < msPerDay ) {
        var check = Math.round(elapsed/msPerHour);
        if (check === 1) {
            return check + ' hour ago';
        }
        else {
            return check + ' hours ago';   
        }
    }

    else if (elapsed < msPerMonth) {
        var check = Math.round(elapsed/msPerDay);
        if (check === 1) {
            return 'approximately ' + check + ' day ago';   
        }
        else {
            return 'approximately ' + check + ' days ago';   
        }  
    }

    else if (elapsed < msPerYear) {
        var check = Math.round(elapsed/msPerMonth)
        if (check === 1) {
            return 'approximately ' + check + ' month ago';   
        }
        else {
            return 'approximately ' + check + ' months ago';   
        }  
    }

    else {
        var check = Math.round(elapsed/msPerYear);
        if (check === 1) {
            return 'approximately ' + check + ' year ago';   
        }
        else {
            return 'approximately ' + check + ' years ago';   
        }    
    }
}


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))






