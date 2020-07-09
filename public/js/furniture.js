$('#post-form').on('submit', function(event) {
    event.preventDefault();

    var name = $('#furniture-title').val();
    var price = $('#furniture-price').val();
    var email = $('#author-email').val();
    var description = $('#furniture-description').val();
    var university = $('#university').val();
    var image = document.getElementById('furniture-image').files[0];
    var form = new FormData();
    
    document.getElementById('post-form').reset();
    $('.close').click();
    var date = Date.now();
    form.append('name', name);
    form.append('price', price);
    form.append('email', email);
    form.append('description', description);
    form.append('university', university);
    form.append('furnitureImage', image);
    form.append('dateTime', date);
    form.append('author', 'me');
    //var data = {name: name, price: price, email: email, description: description, university: university, furnitureImage: image, dateTime: date, author: "Me"};
    $.ajax({
        type: 'POST',
        url: 'http://localhost:8080/furniture',
        processData: false,
        contentType: false,
        data: form,
        success: function(res) {
            if (res === "Successful") {
                window.location.reload();
            }
            
        }
    });
})



// function updateHTML(data) {
//     var card = document.createElement('div');
//     card.setAttribute('class', 'card mb-3');
//     card.style.maxWidth = "540px";
//     var inner = `<div class="row no-gutters"><div class="col-md-4"><img src="" class="card-img" alt=""></div>\
//                 <div class="col-md-8"><div class="card-body"><h5 class="card-title">${data.name} </h5>\
//                 <p class="card-text">${data.price} </p><p class="card-text"><small class="text-muted">\
//                 ${data.dateTime} </small></p></div></div></div>`;
//     card.innerHTML = inner;
//     var container = document.getElementsByClassName('container-cards')[0];
//     container.prepend(card);

//     card.style.maxWidth = '540px';
//     var gutter = document.createElement('div').setAttribute('class', 'row no-gutters');
//     var col4 = document.createElement('div').setAttribute('class', 'col md-4');
//     col4.innerHTML = '<img src="..." class="card-img" alt="...">';
//     var col8 = document.createElement('div').setAttribute('class', 'col md-8');
//     var body = document.createElement('div').setAttribute('class', 'card-body');
//     var 
//     gutter.appendChild(col4);
//     card.appendChild(col4);
// }
