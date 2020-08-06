var input = document.getElementsByClassName('searchTerm')[0];

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementsByClassName('searchButton')[0].click();
  }
});


if (sessionStorage.getItem('userJustPosted') === 'true') {
    toastr.options.timeOut = 8000;
    toastr.success('Your furniture has been posted and a confirmation email has been sent to your inbox! We will notify you when a user is interested in your post.');
    sessionStorage.removeItem('userJustPosted');
  }

clearLocalStorage();

$('#post-form').on('submit', function(event) {
    event.preventDefault();

    document.getElementById('confirm-furniture-post').setAttribute('disabled', 'disabled');
    $('#confirm-furniture-post').html('Submitting Post...');
    
    var name = $('#furniture-title').val();
    var price = $('#furniture-price').val();
    var email = $('#author-email').val();
    var description = $('#furniture-description').val();
    var university = $('#university').val();
    var image = document.getElementById('furniture-image').files[0];
    var form = new FormData();
    
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
        url: '/furniture',
        processData: false,
        contentType: false,
        data: form,
        success: function(res) {
            if (res === "Successful") {
                document.getElementById('post-form').reset();
                $('.close').click();
                sessionStorage.setItem('userJustPosted', 'true');
                window.location.href = "/furniture";
            }
            
        }
    });
});


$('.interested-form').on('submit', function(event) {
    event.preventDefault();
    
    var btn = $(this).parent().parent().find('.btn-primary');
    btn.attr('disabled', 'disabled');
    btn.html('Sending Email...');

    var name = $(this).find('.interested-title').val();
    var email = $(this).find('.interested-email').val();
    var description = $(this).find('.interested-description').val();
    var university = $(this).find('.interested-university').val();
    var id = $(this).find(".num").html();
    var date = Date.now();
    var data = {name: name, email: email, 
        description: description, university: university, dateTime: date, id: id};

    var currElement = $(this);
    console.log(data);
    $.ajax({
        type: 'POST',
        url: '/email-furniture',
        data: data,
        success: function(res) {
            if (res === "Successful") {
                toastr.options.timeOut = 8000;
                currElement.trigger("reset");
                currElement.parent().parent().find('.close').click();
                toastr.success('Your email and contact information was successfully sent to the owner of the post. Please wait for \
                them to respond directly to you!');
                localStorage.setItem(id, 'emailed');
                btn.removeAttr('disabled');
                btn.html('Send Email');
            }
            
        }
    });
});


function sharePost(id) {
    var url = "http://localhost:8080/furniture/posts/" + id;
    var el = document.createElement('textarea');
    el.value = url;
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(el);
    toastr.options.timeOut = 3000;
    toastr.success('Link copied to clipboard!');
}

function closeModal() {
    // When the user clicks on <span> (x), close the modal
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}

function displayFull(img, name) {
    var modal = document.getElementById("myModal");
    var modalImg = document.getElementById("img01");

    window.addEventListener('click',function(){
        if (event.target === modal && event.target !== modalImg) {
        modal.style.display = "none";
    }
    });
    // Get the image and insert it inside the modal - use its "alt" text as a caption
    var captionText = document.getElementById("caption");
    
    modal.style.display = "block";
    modalImg.src = img;
    captionText.innerHTML = name;
}

function searchQuery() {
    var search = document.getElementsByClassName('searchTerm')[0].value;
    if (search && search !== '') {
        search = encodeURIComponent(search);
        var url = `/furniture/posts/search/${search}`;
        window.location.href = url;
    }
}

function reportSublet(id, name, price, university) {
    var data = {publicID: id, name: name, price: price, university: university};
    $.ajax({
        type: 'POST',
        url: '/furniture/report',
        data: data,
        success: function(res) {
            if (res === "Successful") {
                toastr.options.timeOut = 8000;
                toastr.error('This post has been reported. We will look into it and take it down if it violates our terms of use.');
            }
            
        }
    });
}


function clearLocalStorage() {
    var temp = Array.from(document.getElementsByClassName('num'));
    var savedApts = [];
    temp.forEach(element => {
        savedApts.push(element.innerHTML);
    })
    var keys = Object.keys(localStorage);
    for (let i = 0; i < keys.length; ++i) {
        if (localStorage.getItem(keys[i]) === 'emailed') {
            if (savedApts.indexOf(keys[i]) === -1) {
                localStorage.removeItem(keys[i]);
            }
        }
    }
}
