function getData() {
    var beds = [];
    var baths = [];
    var prices = [];
    var sizes = [];
    var names = [];
    $("input:checkbox[name=beds]:checked").each(function(){
        beds.push($(this).parent().text().trim());
    });

    $("input:checkbox[name=baths]:checked").each(function(){
        baths.push($(this).parent().text().trim());
    });

    $("input:checkbox[name=prices]:checked").each(function(){
        prices.push($(this).parent().text().trim());
    });

    $("input:checkbox[name=sizes]:checked").each(function(){
        sizes.push($(this).parent().text().trim());
    });

    $("input:checkbox[name=names]:checked").each(function(){
        names.push($(this).parent().text().trim());
    });

    var url = assembleURL(beds, baths, prices, sizes, names);

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        success: function(res) {
        }
    });

    window.location.href = url;
    }

    function assembleURL(beds, baths, prices, sizes, names) {
    var bedData = "[";
    var bathData = "[";
    var priceData = "[";
    var sizeData = "[";
    var nameData = "[";

    for (let i = 0; i < beds.length; ++i) {
        bedData += beds[i];
        if (i !== (beds.length-1)){
        bedData += ',';
        }
    }

    for (let i = 0; i < baths.length; ++i) {
        bathData += baths[i];
        if (i !== (baths.length-1)){
        bathData += ',';
        }
    }

    for (let i = 0; i < prices.length; ++i) {
        priceData += prices[i];
        if (i !== (prices.length-1)){
        priceData += ',';
        }
    }

    for (let i = 0; i < sizes.length; ++i) {
        sizeData += sizes[i];
        if (i !== (sizes.length-1)){
        sizeData += ',';
        }
    }

    for (let i = 0; i < names.length; ++i) {
        nameData += "'" + names[i] + "'";
        if (i !== (names.length-1)){
        nameData += ',';
        }
    }

    bedData += "]";
    bathData += "]";
    priceData += "]";
    sizeData += "]";
    nameData += "]";

    var url = "http://localhost:8080/search/beds=" + bedData
    + "/baths=" + bathData + "/price=" + priceData + "/size=" + sizeData + "/aptName=" + nameData;

    return url;
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

function closeModal() {
    // When the user clicks on <span> (x), close the modal
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}

    window.onload = function() {
    var elements = document.getElementsByClassName('heart');
    for (let i = 0; i < elements.length; ++i) {
        var name = elements[i].getAttribute('name');
        var apt = elements[i].getAttribute('apt');
        if (localStorage.getItem(name + "?" + apt)) {
        elements[i].className = 'heart fa fa-heart';
        elements[i].setAttribute('title', 'Unfavorite this Unit');
        }
    }
    }
    $(".heart.fa").click(function() {
    $(this).toggleClass("fa-heart fa-heart-o");
    if ($(this).attr('class').indexOf("fa-heart-o") === -1) {
        favoriteUnit($(this).attr('name'), $(this).attr('apt'));
        $(".modal-title").html("<b>Unit added to favorites </b>");
        $(".modal-body").html("<p style='font-size:15px;'>Visit the favorites page to view this unit. \
        All favorites are saved to browser cookies and local storage.</p>")
        $(this).attr('title', 'Unfavorite this Unit');
    }
    else {
        unFavoriteUnit($(this).attr('name'), $(this).attr('apt'));
        $(".modal-title").html("<b>Unit removed from favorites </b>");
        $(".modal-body").html("<p style='font-size:15px;'>This unit will no longer appear on your favorites page. \
        It can be added back at any time.</p>")
        $(this).attr('title', 'Favorite this Unit');
    }
    });

    function favoriteUnit(name, apartment) {
    localStorage.setItem(name + "?" + apartment, 'favorited');
    }

function unFavoriteUnit(name, apartment) {
    localStorage.removeItem(name + "?" + apartment);
    }


function sortData() {
    var chosen = $('#sort :selected').text();
    var option = chosen.substring(0, chosen.indexOf(" "));
    var direction = chosen.substring(chosen.indexOf("(")+1, chosen.indexOf(")"));
    if (direction === 'ascending')
    {
        var currUrl;
        if (window.location.href.indexOf("sort") == -1) {
        currUrl = window.location.href;
        }
        else {
        currUrl = window.location.href;
        currUrl = currUrl.substring(0, currUrl.indexOf("sort")-1);
        console.log("current URL: ", currUrl);
        }
        currUrl += "/sort=" + option + "/order=asc";

    }
        $.ajax({
        url: currUrl,
        type: 'GET',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function(res) {
        }
    });

    window.location.href = currUrl;
    }