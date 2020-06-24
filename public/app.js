function getAllData() {
    $.ajax({
        url: "http://localhost:8080/all",
        type: 'GET',
        dataType: 'json',
        success: function(res) {
           $('#allData').text(JSON.stringify(res));
        }
    });

}

function getByBeds() {
    $.ajax({
        url: "http://localhost:8080/beds=" + '2',
        type: 'GET',
        dataType: 'json',
        success: function(res) {
           $('#beds').text(JSON.stringify(res));
        }
    });
}

function getByBaths() {
    $.ajax({
        url: "http://localhost:8080/baths=" + '2',
        type: 'GET',
        dataType: 'json',
        success: function(res) {
           $('#baths').text(JSON.stringify(res));
        }
    });
}

function getByLocation() {
    $.ajax({
        url: "http://localhost:8080/location=" + 'castilian',
        type: 'GET',
        dataType: 'json',
        success: function(res) {
           $('#locations').text(JSON.stringify(res));
        }
    });
}

function getBySize() {
    $.ajax({
        url: "http://localhost:8080/size=" + '500',
        type: 'GET',
        dataType: 'json',
        success: function(res) {
           $('#sizes').text(JSON.stringify(res));
        }
    });
}


function getByPrice() {
    $.ajax({
        url: "http://localhost:8080/price=" + '$999',
        type: 'GET',
        dataType: 'json',
        success: function(res) {
           $('#prices').text(JSON.stringify(res));
        }
    });
}
