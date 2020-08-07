$(".tiptext").mouseover(function() {
    $(this).children(".description").show();
}).mouseout(function() {
    $(this).children(".description").hide();
});
var beds = tail.select(".bedrooms-display",{

    width: '165px',
  
    // custom placeholder
    placeholder: "Bedrooms",
  
    // allows to deselect options or not
    deselect: true,
  
    // enables animations
    animate: true,
  
    // determines where to place the select
    openAbove: null,
  
    // stays open
    stayOpen: false,
  
    // opens the select on init
    startOpen: false,
  
    // enables multiple selection
    multiple: true,
  
    // maximum number of options allowed to select
    multiLimit: Infinity,
  
    // pins selected options on the top of the dropdown list.
    multiPinSelected: false, 
  
    // shows a counter
    multiShowCount: true,
  
  
    // shows "Select All" / "Unselect All" buttons
    multiSelectAll: true,
  
    // shows "All" / "None" buttons on each Optgroup
    multiSelectGroup: true,
  
    // enables descriptions for options
    descriptions: false,
  
  
    // set the display: none styling, to the source select element.
    sourceHide: true, 
  
    // enables live search
    search: true,
  
    // auto sets the focus
    searchFocus: true,
  
    // highlights matched options
    searchMarked: true,
  
    searchMinLength: 0,  
  
    // allows to exclude disabled options on the search
    searchDisabled: true,
  
    // hide options
    hideSelect: true,
  
    // function(item , group , search <string|false>){}
    cbLoopItem: undefined,
  
    // function(label , search <string|false>){}
    cbLoopGroup: undefined,
  
    // gets fired every time when the .init() process of the tail.select instance has been finished / reached the end
    cbComplete: undefined,
  
    // gets fired every time when the Dropdown List gets rendered with no single option
    cbEmpty: undefined
    
  });
  
  var baths = tail.select(".bathrooms-display",{
    width: '165px',
    placeholder: "Bathrooms",
    deselect: true,
    animate: true,
    openAbove: null,
    stayOpen: false,
    multiple: true,
    multiLimit: Infinity,
    multiPinSelected: false, 
    multiShowCount: true,
    multiSelectAll: true,
    multiSelectGroup: true,
    descriptions: false,
    sourceHide: true, 
    search: true,
    searchFocus: false,
    searchMarked: true,
    searchMinLength: 0,  
    searchDisabled: true,
    hideSelect: true,
    cbLoopItem: undefined,
    cbLoopGroup: undefined,
    cbComplete: undefined,
    cbEmpty: undefined
  });
  
  var apartments = tail.select(".apartments-display",{
    width: '215px',
    placeholder: "Apartment Name",
    deselect: true,
    animate: true,
    openAbove: null,
    stayOpen: false,
    multiple: true,
    multiLimit: Infinity,
    multiPinSelected: false, 
    multiShowCount: true,
    multiSelectAll: true,
    multiSelectGroup: true,
    descriptions: true,
    sourceHide: true, 
    search: true,
    searchFocus: false,
    searchMarked: true,
    searchMinLength: 0,  
    searchDisabled: true,
    hideSelect: true,
    cbLoopItem: undefined,
    cbLoopGroup: undefined,
    cbComplete: undefined,
    cbEmpty: undefined
  });

  var sort = tail.select(".sort-display",{
    width: '150px',
    placeholder: "Sort Units...",
    deselect: true,
    animate: true,
    openAbove: null,
    stayOpen: false,
    multiple: false,
    multiLimit: Infinity,
    multiPinSelected: false, 
    descriptions: false,
    sourceHide: true, 
    search: true,
    searchFocus: false,
    searchMarked: true,
    searchMinLength: 0,  
    searchDisabled: true,
    hideSelect: true,
    cbLoopItem: undefined,
    cbLoopGroup: undefined,
    cbComplete: undefined,
    cbEmpty: undefined
  });
  
  var searches = document.getElementsByClassName('search-input');
  for (let i = 0; i < searches.length; ++i) {
    searches[i].setAttribute('placeholder', 'Search');
  }
  
  $( function() {
    $( "#slider-range-price" ).slider({
      range: true,
      min: 0,
      max: 2500,
      values: [ 0, 2500 ],
      animate: 'fast',
      slide: function( event, ui ) {
        $( "#amount-price" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
      }
    });
    $( "#amount-price" ).val( "$" + $( "#slider-range-price" ).slider( "values", 0 ) +
      " - $" + $( "#slider-range-price" ).slider( "values", 1 ) );
  } );
  
  $( function() {
    $( "#slider-range-size" ).slider({
      range: true,
      min: 0,
      max: 2500,
      values: [ 0, 2500 ],
      animate: 'fast',
      slide: function( event, ui ) {
        $( "#amount-size" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      }
    });
    $( "#amount-size" ).val($( "#slider-range-size" ).slider( "values", 0 ) +
      " - " + $( "#slider-range-size" ).slider( "values", 1 ) );
  } );
  
  
  $('.price-size-menu').on('click', function(event) {
    event.stopPropagation();
  });

function getData() {
    var bedrooms = beds.select.getElementsByClassName('selected');
    var bathrooms = baths.select.getElementsByClassName('selected');
    var prices = $("#slider-range-price").slider("option", "values");
    var sizes = $("#slider-range-size").slider("option", "values");
    var names = apartments.select.getElementsByClassName('selected');
  
    if (prices[0] == $("#slider-range-price").slider("option", "min") && prices[1] == $("#slider-range-price").slider("option", "max")) {
      prices = [];
    }
  
    if (sizes[0] == $("#slider-range-size").slider("option", "min") && sizes[1] && $("#slider-range-size").slider("option", "max")) {
      sizes = [];
    }
  
  var url = assembleURL(bedrooms, bathrooms, prices, sizes, names);
  
  window.location.href = url;
    }

    function assembleURL(bedrooms, bathrooms, prices, sizes, names) {
        var bedData = "";
        var bathData = "";
        var priceData = "";
        var sizeData = "";
        var nameData = "";
        var atLeastOne = false;
        var url = "/search";
      
        for (let i = 0; i < bedrooms.length; ++i) {
          var temp = bedrooms[i].dataset.key;
          bedData += temp.substring(0, temp.indexOf(" "));
          if (i !== (bedrooms.length-1)){
            bedData += ',';
          }
        }
      
        if (bedData !== "") {
          url += "?beds=" + bedData;
          atLeastOne = true;
        }
      
        for (let i = 0; i < bathrooms.length; ++i) {
          var temp = bathrooms[i].dataset.key;
          bathData += temp.substring(0, temp.indexOf(" "));
          if (i !== (bathrooms.length-1)){
            bathData += ',';
          }
        }
      
        if (bathData !== "") {
          if (atLeastOne) 
            url += "&baths=";
          else url += "?baths=";
          url += bathData;
          atLeastOne = true;
        }
      
        for (let i = 0; i < prices.length; ++i) {
          priceData += prices[i];
          if (i !== (prices.length-1)){
            priceData += ',';
          }
        }
      
        if (priceData !== "") {
          if (atLeastOne) 
            url += "&price=";
          else url += "?price=";
          url += priceData;
          atLeastOne = true;
        }
      
        for (let i = 0; i < sizes.length; ++i) {
          sizeData += sizes[i];
          if (i !== (sizes.length-1)){
            sizeData += ',';
          }
        }
      
        if (sizeData !== "") {
          if (atLeastOne) 
            url += "&size=";
          else url += "?size=";
          url += sizeData;
          atLeastOne = true;
        }
      
        for (let i = 0; i < names.length; ++i) {
          nameData += "'" + names[i].dataset.key + "'";
          if (i !== (names.length-1)){
            nameData += ',';
          }
        }
      
        if (nameData !== "") {
          if (atLeastOne) 
            url += "&name=";
          else url += "?name=";
          url += encodeURIComponent(nameData);
          atLeastOne = true;
        }
      
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

    $(".flag.fa").click(function() {
      if ($(this).attr('class').indexOf('fa-flag-o') !== -1) {
        toastr.options.timeOut = 6000;
        toastr.info("Thank you for reporting this listing as inaccurate. We will take a look into it!");
        var url = '/search/report';
        var data = {name: $(this).attr('name'), apt: $(this).attr('apt'), beds: $(this).attr('beds'), baths: $(this).attr('baths')};
        var succeeded = true;
        $.ajax({
          url: url,
          type: 'POST',
          data: data,
          success: function(res) {
          }
      }).fail(function() {
        toastr.error("Something went wrong. Please refresh the page and try again.");
        succeeded = false;
      });
      }
      
      if (succeeded) {
        $(this).attr('class', 'flag fa fa-flag');
        $(this).css('color', 'red');
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
    
    if (!chosen || chosen == '') {
      toastr.options.timeOut = 5000;
      toastr.error('Please select a category to sort these items by.');
      return;
    }
    var option = chosen.substring(0, chosen.indexOf(" "));

    var currUrl;
    let url = new URL(window.location.href);
    let params = new URLSearchParams(url.search.slice(1));
    if (params.get('sort')) { 
        params.delete('sort'); 
    }

    if (params.get('page')) {
        params.delete('page');
    }
    params.append('sort', option);
    params.append('page', '1');
    currUrl = "/search?" + params.toString();

    window.location.href = currUrl;
}