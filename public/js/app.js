var currChecked = [];
$('.dropdown-menu a').on('click', function(event) {
   
   var $target = $(event.currentTarget),
       val = $target.attr('data-value'),
       $inp = $target.find('input'),
       idx;

   if ((idx = currChecked.indexOf(val)) > -1) {
      currChecked.splice(idx, 1);
      setTimeout(function() {$inp.prop('checked', false)}, 0);
   } else {
      currChecked.push(val);
      setTimeout(function() {$inp.prop('checked', true)}, 0);
   }
   $(event.target).blur();
   return false;
});


function displayPrice() {
  if ($('.menu-3').css('display') === 'none'){
    $('.menu-3').css('display', 'flex');
  }
  else {
    $('.menu-3').css('display', 'none');
}
}

$('.min-price').on('click', function(event) {
  var chosen = $(event.currentTarget).text();
  chosen = parseInt(chosen.substring(1, chosen.indexOf("+")));
  document.getElementById('min-value').setAttribute('value', "$" + chosen);

  var maxPrices = document.getElementsByClassName("max-price");
  for (let i = 0; i < maxPrices.length; ++i) {
    chosen += 200;
    maxPrices[i].innerHTML = "$" + chosen;
  }
});

$('.max-price').on('click', function(event) {
  var chosen = $(event.currentTarget).text();
  chosen = parseInt(chosen.substring(1));
  document.getElementById('max-value').setAttribute('value', "$" + chosen);
  if (document.getElementById('min-value').getAttribute('value') !== '')
    return;
})

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
