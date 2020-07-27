window.onload = function() {
    var keys = Object.keys(localStorage);
    var arr = [];
    for (let i = 0; i < keys.length; ++i) {
        var name = keys[i].substring(0, keys[i].indexOf("?"));
        var apt = keys[i].substring(keys[i].indexOf("?")+1);
        var obj = {name: name, aptName: apt};
        arr.push(obj);
    }

    var url = "http://localhost:8080/search/favorites";
    $.get(url, {data: arr}, 
        function(returnedData){
            handleRender(returnedData);
    }).fail(function(){
          console.log("error");
    });

}



function handleRender(data) {
    var div = document.getElementsByClassName('card-deck')[0];
    if (!data || data.length === 0) {
        var disclaimer = document.createElement('p');
        disclaimer.setAttribute('class', 'disclaimer');
        disclaimer.innerHTML = "You currently have no favorites added.";
        div.appendChild(disclaimer);
        return;
    }

    for (let i = 0; i < data.length; ++i) {
        addTop(data[i], div);
        addModal(data[i], div);
    }

    $(".heart.fa").click(function() {
        $(this).toggleClass("fa-heart fa-heart-o");
        if ($(this).attr('class').indexOf("fa-heart-o") === -1) {
          favoriteUnit($(this).attr('name'), $(this).attr('apt'));
          $(".modal-title").html("<b>Unit added to favorites </b>");
          $(".modal-body").html("<p style='font-size:15px;'>Refresh the favorites page to view this unit. \
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
}

function addTop(data, div) {
    $('[data-toggle="tooltip"]').tooltip();
    $(".tiptext").mouseover(function() {
        $(this).children(".description").show();
    }).mouseout(function() {
        $(this).children(".description").hide();
    });
    
    var colMd = document.createElement('div');
    colMd.setAttribute('class', 'col-md-4');

    var complex = document.createElement('div');
    complex.setAttribute('class', 'complex-info');

    var aptName = document.createElement('a');
    aptName.setAttribute('class', 'tiptext aptName');
    aptName.setAttribute('href', data.Website);
    aptName.setAttribute('target', '_blank');
    aptName.innerHTML = data.Apartment;
    complex.appendChild(aptName);

    var mapPhone = document.createElement('div');
    mapPhone.setAttribute('class', 'map-phone');
    mapPhone.innerHTML = `<i class="fa fa-map-marker tiptext" aria-hidden="true"> \
    <iframe class="description" src="${data.Map}" width="600" height="450" \
    frameborder="0" style="border:0;" aria-hidden="false" tabindex="0" allowfullscreen></iframe></i><text> &nbsp;|&nbsp; </text> \
    <a data-toggle="tooltip" data-placement="right" title="${data.PhoneNum}" ><i class="fa fa-phone" aria-hidden="true"></i></a>`;
    var cardMd = document.createElement('div');
    cardMd.setAttribute('class', 'card mb-5');
    cardMd.style.minHeight = '30rem';
    cardMd.style.maxHeight = '30rem';

    var icons = document.createElement('div');
    icons.setAttribute('class', 'icons');
    var img = document.createElement('img');
    setAttributes(img, {'class': 'card-img-top', 'src': data.Image, 
    'alt': data.Name, 'title': 'Click to enlarge', 'onclick': `displayFull('${data.Image}', '${data.Name}')`});

    var heart = document.createElement('div');
    heart.innerHTML = '<i id="favorite" class="heart fa fa-heart" title="Unfavorite this Unit"' +  
    'name="' + data.Name + '" apt="'+ data.Apartment + '" beds="' +  data.Beds + '" baths="' + data.Baths + 
    '" data-toggle="modal" data-target="#favoriteModal" data-backdrop="false"></i>'
    div.appendChild(colMd);
    colMd.appendChild(complex);
    colMd.appendChild(mapPhone);
    colMd.appendChild(cardMd);
    cardMd.appendChild(icons);
    icons.appendChild(img);
    icons.appendChild(heart);

    addBody(data, cardMd);

}

function addBody(data, cardMd) {
    $('[data-toggle="tooltip"]').tooltip();
    $(".tiptext").mouseover(function() {
        $(this).children(".description").show();
    }).mouseout(function() {
        $(this).children(".description").hide();
    });
    
    var body = document.createElement('div');
    body.setAttribute('class', 'card-body');
    var h5 = document.createElement('h5');
    h5.setAttribute('class', 'card-title');
    h5.innerHTML = data.Name;
    body.appendChild(h5);

    var h6 = document.createElement('h6');
    if (data.MinPrice === 0) {
        h6.innerHTML = 'Price not listed';
    }
    else if (data.MinPrice === data.MaxPrice) {
        h6.innerHTML = "<strong>$" + addCommas(data.MinPrice) + "</strong>/mo";
    }
    else {
        h6.innerHTML = "<strong>$" + addCommas(data.MinPrice) + " - " + addCommas(data.MaxPrice) + "</strong>/mo";
    }

    body.appendChild(h6);
    var text = document.createElement('p');
    text.setAttribute('class', 'card-text');

    if (data.Beds === 0) {
        text.innerHTML = "<strong>Studio</strong> bd &nbsp;|&nbsp;"; 
    }
    else {
        text.innerHTML = "<strong>" + data.Beds + "</strong> bd &nbsp;|&nbsp;";
    }

    text.innerHTML += "<strong>" + data.Baths + "</strong> ba &nbsp;|&nbsp;";

    console.log(data.MinSize);
    if (data.MinSize === 0) {
        text.innerHTML += "<strong>Unlisted</strong> sqft";
    }
    else if (data.MinSize === data.MaxSize) {
        text.innerHTML += "<strong>" + addCommas(data.MinSize) + "</strong> sqft";
    }
    else {
        text.innerHTML += "<strong>" + addCommas(data.MinSize) + " - " + addCommas(data.MaxSize) + "</strong> sqft";
    }

    body.appendChild(text);

    var availability = document.createElement('span');
    availability.setAttribute('class', 'availabilityText');
    if (data.Waitlist !== 0) {
        availability.setAttribute('style', 'background-color:indianred;font-weight: normal;');
        availability.innerHTML = "Waitlist";
    }
    else {
        availability.setAttribute('style', 'background-color: rgb(23, 169, 135);font-weight: normal;');
        availability.innerHTML = "✓ Available";
    }
    var spaceSpan = document.createElement('span');
    spaceSpan.innerHTML = "&nbsp;";

    body.appendChild(availability);
    body.appendChild(spaceSpan);
    if (data.Deposits !== 0) { 
        var dep = document.createElement('span');
        dep.setAttribute('class', 'availabilityText');
        dep.setAttribute('style', 'background-color: darkorange;font-weight: normal;');
        dep.innerHTML = "$" + data.Deposits + "Deposit";
        body.appendChild(dep);
    }

    var link = document.createElement('a');
    link.setAttribute('href', data.Link);
    link.setAttribute('class', 'btn btn-block btn-primary');
    link.innerHTML = "View Unit";
    body.appendChild(link);
    cardMd.appendChild(body);
}

function addModal(data, cardDeck) {
    var modal = document.createElement('div');
    setAttributes(modal, {'id': 'myModal', 'class': 'modal'});
    var close = document.createElement('span');
    close.setAttribute('class', 'close');
    close.setAttribute('onclick', 'closeModal()');
    close.innerHTML = "&times";

    var img = document.createElement('img');
    setAttributes(img, {'id': 'img01', 'class': 'modal-content'});
    var caption = document.createElement('div');
    caption.setAttribute('id', 'caption');
    caption.innerHTML = data.Name;
    modal.appendChild(close);
    modal.appendChild(img);
    modal.appendChild(caption);
    cardDeck.appendChild(modal);
}

function displayFull(img, name) {
    console.log(img);
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

function setAttributes(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

function addCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function favoriteUnit(name, apartment) {
    localStorage.setItem(name + "?" + apartment, 'favorited');
  }

  function unFavoriteUnit(name, apartment) {
    localStorage.removeItem(name + "?" + apartment);
  }


