var beds = tail.select(".bedrooms",{

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

var baths = tail.select(".bathrooms",{
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

var apartments = tail.select(".apartments",{
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
  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: function(res) {
    }
});

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
    if (temp === 'Studio' || temp.indexOf('Studio') > -1) {
      temp = '0 ';
    }
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
