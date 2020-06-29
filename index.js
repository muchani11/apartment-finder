var express = require('express');
var mysql = require('mysql');
var cors = require('cors');
var bodyParser = require('body-parser');
//var paginate = require('paginate')();
require('dotenv').config();
const app = express();
const port = 8080;
var ejs = require('ejs');

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

app.use(cors());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));


app.get('/', (req, res) => {
    res.send("HELLO WORLD");
});

app.get('/search/beds=:beds/baths=:baths/price=:price/size=:size/aptName=:apartmentName', (req, res) => {
    var query = assembleQuery(req.params.beds, req.params.baths, req.params.price, req.params.size, req.params.apartmentName);
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, function (err, result, fields) {
            if (err) throw err;
            
            //res.send(result);
            console.log(result[0].Name);
            res.render('display', {data: result})
            connection.release();
          });
    });
});

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

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))




