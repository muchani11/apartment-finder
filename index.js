var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
require('dotenv').config();
var fs = require('fs');
const app = express();
const port = process.env.port || 8080;
var ejs = require('ejs');
var cors = require('cors');
var multer = require('multer');
var nodemailer = require('nodemailer');
var helmet = require('helmet');


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname.replace(',',''));
    }
});

const upload = multer({storage: storage});

var pool = mysql.createPool({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
    multipleStatements: true
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD
    }
  });

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));


app.get('/', (req, res) => {
});

app.get('/search', (req, res) => {
    var beds = (req.query.beds) ? req.query.beds.split(',') : [];
    var baths = (req.query.baths) ? req.query.baths.split(',') : [];
    var prices = (req.query.price) ? req.query.price.split(',') : [];
    var sizes = (req.query.size) ? req.query.size.split(',') : [];
    if (req.query.name){
        req.query.name = decodeURI(req.query.name);
        req.query.name = req.query.name.replace(/'/g, "");
    }
    var names = (req.query.name) ? req.query.name.split(',') : [];

    if (req.query.sort === "Price")
        req.query.sort = "MinPrice";
    if (req.query.sort === "Size")
        req.query.sort = "MinSize";

    var query = assembleQuery(beds, baths, prices, sizes, names);
    var queryArr = query[1];
    query = query[0];

    if (req.query.sort) {
        query += " ORDER BY " + req.query.sort + " asc";
    }

    var path; 
    if (req.url.indexOf("page=") !== -1) {
        path = req.url.substring(0, req.url.lastIndexOf("page="));
    }

    else {
        if (req.url.indexOf("?") !== -1) {
            path = req.url + "&";
        }
        else path = req.url + "?";
    }

    const limit = 12;
    const page = req.query.page || 1;

    const offset = (page - 1) * limit;
    query += " LIMIT ? OFFSET ?";
    var arr = [limit, offset];
    queryArr.push.apply(queryArr, arr);
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, queryArr, function (err, result, fields) {
            if (err) console.log(err);
            var numPages;
            if (result && result.length > 0)
                numPages = Math.ceil(result[0].full_count / parseFloat(limit));
            else numPages = 0;
            
            res.render('display', {data: result, currentPage: parseInt(page), pages: numPages, path: path, sortBy: req.query.sort});
            connection.release();
          });
    });
});


app.get('/search/favorites', (req, res) => {
    if (!req.query.data){
        res.send([]);
        return;
    }
    var query = getFavorites(req.query.data)[0];
    var arr = getFavorites(req.query.data)[1];
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, arr, function (err, result, fields) {
            if (err) {
                res.status(404).render('error404', {path: req.path});
                connection.release();
                return;
            }
            res.send(result);
            connection.release();
          });
    });
});

app.post('/search/report', (req, res) => {
    var name = req.body.name;
    var apt = req.body.apt;
    var beds = req.body.beds;
    var baths = req.body.baths;

    var mailOptions = {
        from: process.env.USER_EMAIL,
        to: process.env.USER_EMAIL,
        subject: 'User reported a unit listing called ' + name + ' from ' + apt,
        text: `A user reported a unit listing titled '${name}' from '${apt}'. The unit has ${beds} bedrooms and ${baths} bathrooms. Take a look and decide if it is necessary to take it down!`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Successful');
        }
    });

})
app.post('/furniture', upload.single('furnitureImage'), (req, res) => {
    var file;
    if (req.file && req.file.path) {
        file = req.file.path.substring(req.file.path.indexOf('public')+6);
    }
    else {
        file = 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSADPzrYm_hQg2XMNc_9KTr9Axmn35s0DbsIQ&usqp=CAU';
    }

    var private = Math.random().toString(36).slice(2);
    var query = `
SET @recentUUID = UUID(); \
START TRANSACTION; \
INSERT INTO furniture_data(ProductName, ProductPrice, ProductDescription, University, Date, Email, Image, PublicID, PrivateID) \
VALUES(?, ?, ?, ?, ?, ?, ?, @recentUUID, CONCAT('${private}', @recentUUID)); \
SELECT * FROM furniture_data WHERE PublicID=@recentUUID; \
COMMIT;`;
    var recUUID;
    var arr = [req.body.name, req.body.price, req.body.description, req.body.university, 
        req.body.dateTime, req.body.email, file];
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, arr, function (err, result, fields) {
            if (err) console.log(err);
            
            recUUID = result[result.length - 2];

            res.send("Successful");
            connection.release();

            recUUID = recUUID[0];
            var html = createFurnitureEmail(req.body.name, req.body.price, req.body.description, req.body.university,
            `www.leazy.org/furniture/posts/delete/${recUUID.PublicID}/${recUUID.PrivateID}`, `www.leazy.org/furniture/posts/${recUUID.PublicID}`);
            var mailOptions = {
                from: process.env.USER_EMAIL,
                to: req.body.email,
                subject: 'Your furniture item has been posted!',
                html: html
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        });
    });
});

app.get('/furniture', (req, res) => {
    var query = "SELECT * FROM furniture_data ORDER BY DATE desc";
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, function (err, result, fields) {
            if (err) {
                res.status(404).render('error404', {path: req.path});
                connection.release();
                return;
            }
            res.render('furniture', {data: result, diff: timeDifference, path: req.path});
            connection.release();
        });
    });
});


app.get('/furniture/posts/:id', (req, res) => {
    var query = `SELECT * FROM furniture_data WHERE PublicID=?`;
    var id = req.params.id;
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, id, function (err, result, fields) {
            if (err) {
                res.status(404).render('error404', {path: req.path});
                connection.release();
                return;
            }
            res.render('furniture-post', {data: result, diff: timeDifference, path: req.path});
            connection.release();
        });
    });
});


app.post('/email-furniture', (req, res) => {
    var query = `SELECT Email, PublicID, PrivateID FROM furniture_data WHERE PublicID=?`;
    var id = req.body.id;
    var deletionLink; 

    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, id, function (err, result, fields) {
            if (err) {
                res.send('Unsuccessful');
                connection.release();
                return;
            }
            deletionLink = `www.leazy.org/furniture/posts/delete/${result[0].PublicID}/${result[0].PrivateID}`;
            var viewLink = `www.leazy.org/furniture/posts/${result[0].PublicID}`;
            var html = createFurnitureReply(req.body.name, req.body.university, req.body.description, req.body.email, deletionLink, viewLink);
            var mailOptions = {
                from: process.env.USER_EMAIL,
                to: result[0].Email,
                subject: req.body.name + ' is interested in buying your furniture!',
                html: html
              };

            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                res.send('Successful');
            }
            });
        });
        var updateInterested = "UPDATE furniture_data SET NumInterested = NumInterested + 1 WHERE PublicID=?";
        connection.query(updateInterested, id, function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            connection.release();
        });
    });
});

app.get('/furniture/posts/search/:search', (req, res) => {
    req.params.search = "%" + req.params.search + "%";
    var query = `SELECT * FROM furniture_data WHERE ProductName LIKE ? OR ProductDescription LIKE ? OR University LIKE ? ORDER BY DATE desc`;
    var arr = [req.params.search, req.params.search, req.params.search];
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, arr, function (err, result, fields) {
            if (err) {
                res.status(404).render('error404', {path: req.path});
                connection.release();
                return;
            }
            res.render('furniture', {data: result, diff: timeDifference, path: req.path});
            connection.release();
        });
    });
});

app.get('/furniture/posts/delete/:publicId/:privateId', (req, res) => {
    var query = `SELECT * FROM furniture_data WHERE PublicID=? AND PrivateID=?`;
    var arr = [req.params.publicId, req.params.privateId];
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, arr, function(err, result, fields) {
            if (err || result.length === 0) {
                res.status(404).render('error404', {path: req.path});
                connection.release();
                return;
            }
            
            res.render('deletion', {data: result, diff: timeDifference, path: req.path});
            connection.release();
        });
    });
});

app.post('/furniture/posts/delete/:publicId/:privateId', (req, res) => {
    var queryFindImage = `SELECT Image FROM furniture_data WHERE PublicID=? AND PrivateID=?`;
    var query = `DELETE FROM furniture_data WHERE PublicID=? AND PrivateID=?`;
    var arr = [req.params.publicId, req.params.privateId];
    var img;
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(queryFindImage, arr, function(err, result, fields) {
            if (err) {
                res.status(400).send('Unsuccessful');
                connection.release();
                return;
            }
            if (result.affectedRows === 0) {
                img = null;
            }
            else img = result[0].Image;
        });

        connection.query(query, arr, function(err, result, fields) {
            if (err) {
                res.status(400).send("Unsuccessful");
                connection.release();
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).send("<h1>The post you requested does not exist. </h1>");
                connection.release();
                return;
            }
            else {
                if (img && img !== 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSADPzrYm_hQg2XMNc_9KTr9Axmn35s0DbsIQ&usqp=CAU') {
                    fs.unlink('public' + img, (err) => {
                        if (err) {
                            console.log("failed to delete local image:"+err);
                        } 
                        else {
                            console.log('successfully deleted local image');                                
                        }
                    });
                }
                res.send("Successful");
            }
            connection.release();

        });
    });

});


app.post('/furniture/report', (req, res) => {
    var publicId = req.body.publicID;
    var name = req.body.name;
    var price = req.body.price;
    var university = req.body.university;
    var mailOptions = {
        from: process.env.USER_EMAIL,
        to: process.env.USER_EMAIL,
        subject: 'User reported a furniture post with ID ' + publicId,
        text: `A user reported a furniture post titled '${name}' that costs $${price}. The \
        post was made by a student from ${university}. Take a look and decide if it is necessary to take it down!`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Successful');
        }
    });
});

app.post('/sublet', upload.array('unitImages', 6), (req, res) => {
    var files = [];
    if (!(req.files && req.files.length > 0)){
        files = ['https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSADPzrYm_hQg2XMNc_9KTr9Axmn35s0DbsIQ&usqp=CAU'];
    }
    for (let i = 0; i < req.files.length; ++i) {
        if (req.files[i] && req.files[i].path){
            files.push(req.files[i].path.substring(req.files[i].path.indexOf('public')+6));
        }
    }

    var private = Math.random().toString(36).slice(2);
    var inserts = insertImages(files.length);
var query = 
`SET @recentUUID = UUID(); \
START TRANSACTION; \
INSERT INTO sublet_data(UnitName, UnitBeds, UnitBaths, UnitPrice, UnitDescription, Furnished, University, ApartmentName, AptWebsite, Gender, Duration, StartDate, EndDate, \
Date, Email, PublicID, PrivateID) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @recentUUID, CONCAT('${private}', @recentUUID)); \
${inserts}; \
SELECT * FROM sublet_data WHERE PublicID=@recentUUID;\
COMMIT;`;
var recUUID;
    var arr = [req.body.name, req.body.beds, req.body.baths, req.body.rent, req.body.description, req.body.furnished, req.body.university, req.body.complex, req.body.website, req.body.gender,
        req.body.duration, req.body.startDate, req.body.endDate, req.body.dateTime, req.body.email];
    arr.push.apply(arr, files);
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, arr, function (err, result, fields) {
            if (err) console.log(err);
            recUUID = result[result.length - 2];

            res.send("Successful");
            connection.release();

            var furnished = "No";
            if (req.body.furnished === 1) {
                furnished = "Yes";
            }
            recUUID = recUUID[0];
            var html = createSubletEmail(req.body.beds, req.body.baths, req.body.rent, req.body.complex, req.body.university, furnished, req.body.gender, `${req.body.startDate} - ${req.body.endDate}`,
            req.body.duration, req.body.description, `www.leazy.org/sublet/posts/delete/${recUUID.PublicID}/${recUUID.PrivateID}`,
            `www.leazy.org/sublet/posts/${recUUID.PublicID}`);
            var mailOptions = {
                from: process.env.USER_EMAIL,
                to: req.body.email,
                subject: 'Your unit for subletting has been posted!',
                html: html
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    res.send('Successful');
                }
            });
        });
    });

});


app.get('/sublet', (req, res) => {
    var query = "SELECT sublet_data.*, (SELECT GROUP_CONCAT(sublet_images.ImageName) \
    FROM sublet_images WHERE sublet_images.PublicID = sublet_data.PublicID) AS allImages FROM sublet_data ORDER BY Date desc";

    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, function (err, result, fields) {
            if (err) {
                res.status(404).render('error404', {path: req.path});
                connection.release();
                return;
            }
            res.render('sublet', {data: result, diff: timeDifference, path: req.path});
            connection.release();
        });
    });
});

app.get('/sublet/posts/:id', (req, res) => {
    var query = "SELECT sublet_data.*, (SELECT GROUP_CONCAT(sublet_images.ImageName) \
    FROM sublet_images WHERE sublet_images.PublicID = sublet_data.PublicID) AS allImages FROM sublet_data \
    WHERE sublet_data.PublicID=? ORDER BY Date desc"
    var publicId = req.params.id;
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, publicId, function (err, result, fields) {
            if (err) {
                res.status(404).render('error404', {path: req.path});
                connection.release();
                return;
            }
            res.render('sublet', {data: result, diff: timeDifference, path: req.path});
            connection.release();
        });
    });
});

app.get('/sublet/posts/search/:search', (req, res) => {
    req.params.search = "%" + req.params.search + "%";
    var query = "SELECT sublet_data.*, (SELECT GROUP_CONCAT(sublet_images.ImageName) \
    FROM sublet_images WHERE sublet_images.PublicID = sublet_data.PublicID) AS allImages FROM sublet_data \
    WHERE UnitName LIKE ? OR UnitDescription LIKE ? OR University LIKE ? OR Gender LIKE ? ORDER BY Date desc"
    var arr = [req.params.search, req.params.search, req.params.search, req.params.search];
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, arr, function (err, result, fields) {
            if (err) {
                res.status(404).render('error404', {path: req.path});
                connection.release();
                return;
            }
            res.render('sublet', {data: result, diff: timeDifference, path: req.path});
            connection.release();
        });
    });
});

app.post('/email-sublet', (req, res) => {
    var query = `SELECT Email, PublicID, PrivateID FROM sublet_data WHERE PublicID=?`;
    var id = req.body.id;
    var deletionLink; 
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, id, function (err, result, fields) {
            if (err) {
                res.send('Unsuccessful');
                connection.release();
                return;
            }
            deletionLink = `www.leazy.org/sublet/posts/delete/${result[0].PublicID}/${result[0].PrivateID}`;
            var viewLink = `www.leazy.org/sublet/posts/${result[0].PublicID}`;
            var html = createSubletReply(req.body.name, req.body.university, req.body.description, req.body.email, deletionLink, viewLink);
            var mailOptions = {
                from: process.env.USER_EMAIL,
                to: result[0].Email,
                subject: req.body.name + ' is interested in subleasing your apartment!',
                html: html
              };

            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                res.send('Successful');
            }
        });
    });
        var updateInterested = "UPDATE sublet_data SET NumInterested = NumInterested + 1 WHERE PublicID=?";
        connection.query(updateInterested, id, function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            connection.release();
        });
    });

});

app.post('/sublet/report', (req, res) => {
    var publicId = req.body.publicID;
    var beds = req.body.beds;
    var baths = req.body.baths;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var university = req.body.university;
    var mailOptions = {
        from: process.env.USER_EMAIL,
        to: process.env.USER_EMAIL,
        subject: 'User reported a subletting post with ID ' + publicId,
        text: `A user reported a subletting post for ${beds} bedrooms and ${baths} bathrooms \
        with a start date of ${startDate} and end date of ${endDate}, made by a student from ${university}. Take a look and decide if it is necessary to take it down!`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Successful');
        }
    });
})

app.get('/sublet/posts/delete/:publicId/:privateId', (req, res) => {
    var query = `SELECT * FROM sublet_data WHERE PublicID=? AND PrivateID=?`;
    var arr = [req.params.publicId, req.params.privateId];
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(query, arr, function(err, result, fields) {
            if (err || result.length === 0) {
                res.status(404).render('error404', {path: req.path});
                connection.release();
                return;
            }
            
            res.render('deletion', {data: result, diff: timeDifference, path: req.path});
            connection.release();
        });
    });
});

app.post('/sublet/posts/delete/:publicId/:privateId', (req, res) => {
    var queryFindImage = `SELECT (SELECT GROUP_CONCAT(sublet_images.ImageName) FROM sublet_images WHERE sublet_images.PublicID = sublet_data.PublicID) AS allImages FROM sublet_data \
    WHERE sublet_data.PublicID=? AND PrivateID=?`;
    var query = `
    START TRANSACTION; \
    DELETE FROM sublet_data WHERE PublicID=? AND PrivateID=?; \
    DELETE FROM sublet_images WHERE PublicID=?; \
    COMMIT;`;
    var arr = [req.params.publicId, req.params.privateId, req.params.publicId];
    var img;
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(queryFindImage, arr, function(err, result, fields) {
            if (err) {
                res.status(400).send('Unsuccessful');
                connection.release();
                return;
            }
            if (result.affectedRows === 0) {
                img = null;
            }
            else img = result[0].allImages;
        });

        connection.query(query, arr, function(err, result, fields) {
            if (err) {
                res.status(400).send("Unsuccessful");
                connection.release();
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).send("<h1>The post you requested does not exist. </h1>");
            }
            else {
                if (img && img !== 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSADPzrYm_hQg2XMNc_9KTr9Axmn35s0DbsIQ&usqp=CAU') {
                    img = img.split(',');
                    for (let i = 0; i < img.length; ++i) {
                        fs.unlink('public' + img[i], (err) => {
                            if (err) {
                                console.log("failed to delete local image:"+err);
                            } 
                            else {
                                console.log('successfully deleted local image');                                
                            }
                        });
                    }
                }
                res.send("Successful");
            }
            connection.release();

        });
    });

});


app.get('/privacy', (req, res) => {
    res.render('privacy');
})
function createSubletEmail(beds, baths, price, apartment, university, furnished, gender, term, duration, description, deletionLink, viewLink) {
    var html = `
    <!DOCTYPE html>
    <html lang="en-US">
        <body>
            <h1 style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: darkred;" >Congratulations - Your unit has been posted!</h1>
            <h2>Post information: </h2>
            <ul>
                <li><b><u>Bedrooms:</b></u> ${beds}</li>
                <li><b><u>Bathrooms:</b></u> ${baths}</li>
                <li><b><u>Rent Price:</b></u> $${price} per month</li>
                <li><b><u>Apartment Complex:</b></u> ${apartment} </li>
                <li><b><u>University:</b></u> ${university}</li>
                <li><b><u>Furnished:</b></u> ${furnished}</li>
                <li><b><u>Gender of Subtenant:</b></u> ${gender}</li>
                <li><b><u>Lease Term:</b></u> ${term}</li>
                <li><b><u>Lease Duration:</b></u> ${duration} months</li>
                <li style="white-space:pre-wrap"><b><u>Unit Description:</b></u> ${description}</li>
            </ul>
            <p>We will notify you whenever anyone who is interested in your post decides to contact you!</p>
            <text>If you want to delete this post permanently, please 
                <a href="${deletionLink}">Click Here</a>. 
            </text>
            <br>
            <text>In order to view your post, please 
                <a href="${viewLink}">Click Here</a>.
            </text>
            <br>
            <text>
                <strong>*****PLEASE DO NOT REPLY TO THIS EMAIL*****</strong>
            </text>
        </body>
    </html>`;

    return html;
}

function createSubletReply(name, university, message, email, deletionLink, viewLink) {
    var html = `
    <!DOCTYPE html>
    <html lang="en-US">
        <body>
            <h1 style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: green;" >${name} from ${university} is interested in your unit for subleasing!</h1>
            <p>A student at ${university} is interested in your post on leazy.org and sent you the following message: </p>
            <p style="margin-left: 20px; white-space: pre-wrap"><em>${message}</em></p>
            <p>Contact this person back if you're interested in subletting to them: ${email}</p>
            <text>If you want to delete this post permanently, please 
                <a href="${deletionLink}">Click Here</a>.
            </text>
            <br>
            <text>In order to view your post, please 
                <a href="${viewLink}">Click Here</a>.
            </text>
            <br>
            <text>
                <strong>*****PLEASE DO NOT REPLY TO THIS EMAIL*****</strong>
            </text>
        </body>
    </html>`;

    return html;
}

function createFurnitureEmail(name, price, description, university, deletionLink, viewLink) {

    var html = `
    <!DOCTYPE html>
    <html lang="en-US">
        <body>
            <h1 style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: darkred;" >Congratulations - Your furniture has been posted!</h1>
            <h2>Post information: </h2>
            <ul>
                <li><b><u>Item Name:</b></u> ${name}</li>
                <li><b><u>Item Price:</b></u> $${price}</li>
                <li><b><u>Item Description:</b></u> ${description}</li>
                <li><b><u>University:</b></u> ${university}</li>
            </ul>
            <p>We will notify you whenever anyone who is interested in your post decides to contact you!</p>
            <text>If you want to delete this post permanently, please 
                <a href="${deletionLink}">Click Here</a>.
            </text>
            <br>
            <text>In order to view your post, please 
                <a href="${viewLink}">Click Here</a>.
            </text>
            <br>
            <text>
                <strong>*****PLEASE DO NOT REPLY TO THIS EMAIL*****</strong>
            </text>
        </body>
    </html>`;

    return html;
}

function createFurnitureReply(name, university, message, email, deletionLink, viewLink) {
    var html = `
    <!DOCTYPE html>
    <html lang="en-US">
        <body>
            <h1 style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: green;" >${name} from ${university} is interested in your furniture!</h1>
            <p>A student at ${university} is interested in your post on leazy.org and sent you the following message: </p>
            <p style="margin-left: 20px; white-space: pre-wrap"><em>${message}</em></p>
            <p>Contact this person back if you're interested in selling to them: ${email}</p>
            <text>If you want to delete this post permanently, please 
                <a href="${deletionLink}">Click Here</a>. 
            </text>
            <br>
            <text>In order to view your post, please 
                <a href="${viewLink}">Click Here</a>.
            </text>
            <br>
            <text>
                <strong>*****PLEASE DO NOT REPLY TO THIS EMAIL*****</strong>
            </text>
        </body>
    </html>`;

    return html;
}

function getFavorites(data) {
    var query;
    if (data.length > 0) {
        query = "SELECT apartment_data.*, complex_data.* FROM apartment_data, complex_data WHERE (";
    }
    else return null;

    var arr = [];
    for (let i = 0; i < data.length; ++i) {
        if (i !== 0) {
            query += " OR ";
        }
        query += "(apartment_data.Name=? AND Apartment=?)";
        arr.push(data[i].name, data[i].aptName);
    }

    query += ") AND (apartment_data.AptID=complex_data.ID)";
    return [query, arr];
}

function assembleQuery(beds, baths, prices, sizes, names) {
    var atLeastOne = 0;
    var arr = [];
    var bed="", bath="", price="", size="", name="";
    if (beds.length === 0 && baths.length === 0 && prices.length === 0 && sizes.length === 0 && names.length === 0)
        return ["SELECT apartment_data.*, count(*) OVER() AS full_count, complex_data.* FROM apartment_data, complex_data WHERE apartment_data.AptID=complex_data.ID", arr];

    if (beds.length !== 0) {
        atLeastOne = 1;
        bed = "Beds IN (";
        for (let i = 0; i < beds.length; ++i) {
            if (i !== 0) {
                bed += ",";
            }
            bed += "?";
            arr.push(beds[i]);
        }
        bed += ")";
    }

    if (baths.length !== 0) {
        if (atLeastOne)
            bath = " AND ";
        atLeastOne = 1;
        bath += "Baths IN (";

        for (let i = 0; i < baths.length; ++i) {
            if (i !== 0) {
                bath += ",";
            }
            bath += "?";
            arr.push(baths[i]);
        }
        bath += ")";
    }

    if (prices.length !== 0){
        if (atLeastOne)
            price = " AND ";
        atLeastOne = 1;
        price += "(MinPrice BETWEEN ";
        if (prices.length === 1) {
            price += "? AND ?";
            arr.push(prices[0]);
            arr.push(prices[0]);
        }
        else {
            price += "? AND ?";
            arr.push(prices[0]);
            arr.push(prices[1]);
        }

        price += ")";
        atLeastOne = 1;
    }

    if (sizes.length !== 0) {
        if (atLeastOne)
            size = " AND ";

        size += "(MinSize BETWEEN ";

        if (sizes.length === 1) {
            size += "? AND ?";
            arr.push(sizes[0]);
            arr.push(sizes[0]);
        }
        else {
            size += "? AND ?";
            arr.push(sizes[0]);
            arr.push(sizes[1]);
        }

        size += ")";
        atLeastOne = 1;
    }

    if (names.length !== 0) {
        if (atLeastOne)
            name = " AND ";
        atLeastOne = 1;
        name += "Apartment IN (";

        for (let i = 0; i < names.length; ++i) {
            if (i !== 0) {
                name += ",";
            }
            name += "?";
            arr.push(names[i]);
        }
        name += ")";
    }

    var query = "SELECT apartment_data.*, count(*) OVER() AS full_count, complex_data.* FROM apartment_data, complex_data WHERE (apartment_data.AptID=complex_data.ID) AND " + bed + bath + price + size + name;
    return [query, arr];
}

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
    res.status(404).render('error404', {path: req.path});
  });

function insertImages(num) {
    var query = "INSERT INTO sublet_images(PublicID, ImageName)";
    for (let i = 0; i < num; ++i) {
        if (i === 0) {
            query += " VALUES (";
        }
        else if (i !== 0){
            query += ", (";
        }
        query += "@recentUUID, ?)";
    }
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
        var check = Math.floor(elapsed/1000);
        if (check === 1){
            return check + ' second ago';
        }
        else {
            return check + ' seconds ago';   
        }
    }

    else if (elapsed < msPerHour) {
        var check = Math.floor(elapsed/msPerMinute);
        if (check === 1) {
            return check + ' minute ago';
        }
        else {
            return check + ' minutes ago';   
        }
    }

    else if (elapsed < msPerDay ) {
        var check = Math.floor(elapsed/msPerHour);
        if (check === 1) {
            return check + ' hour ago';
        }
        else {
            return check + ' hours ago';   
        }
    }

    else if (elapsed < msPerMonth) {
        var check = Math.floor(elapsed/msPerDay);
        if (check === 1) {
            return check + ' day ago';   
        }
        else {
            return check + ' days ago';   
        }  
    }

    else if (elapsed < msPerYear) {
        var check = Math.floor(elapsed/msPerMonth)
        if (check === 1) {
            return check + ' month ago';   
        }
        else {
            return check + ' months ago';   
        }  
    }

    else {
        var check = Math.floor(elapsed/msPerYear);
        if (check === 1) {
            return check + ' year ago';   
        }
        else {
            return check + ' years ago';   
        }    
    }
}


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));