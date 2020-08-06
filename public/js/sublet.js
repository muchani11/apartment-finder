var checkImages = [];
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
  });

if (sessionStorage.getItem('userJustPosted') === 'true') {
  toastr.options.timeOut = 8000;
  toastr.success('Your unit has been posted and a confirmation email has been sent to your inbox! We will notify you when a user is interested in your post.');
  sessionStorage.removeItem('userJustPosted');
}
  

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


  $(function() {
    $(".datepicker").datepicker();
  });

  $(".readonly").keydown(function(e){
    e.preventDefault();
});

clearLocalStorage();

// var listFiles = document.getElementById('unit-image');
// listFiles.addEventListener('change', (event) => {
//     var location = document.getElementById("image-form");
//     var br = document.createElement("br");
//     location.appendChild(br);
//     var input = document.createElement("input");
//     input.type = "file";
//     input.accept = "image/*";
//     input.multiple = true;

//     location.appendChild(input);
//   });
$.fn.fileUploader = function (filesToUpload, sectionIdentifier) {
    var fileIdCounter = 0;

    this.closest(".files").change(function (evt) {
        var output = [];

        for (var i = 0; i < evt.target.files.length; i++) {
            fileIdCounter++;
            var file = evt.target.files[i];
            var fileId = sectionIdentifier + fileIdCounter;

            filesToUpload.push({
                id: fileId,
                file: file
            });

            var removeLink = "<a class=\"removeFile\" href=\"#\" data-fileid=\"" + fileId + "\">Remove</a>";

            output.push("<li><strong>", escape(file.name), "</strong> - ", file.size, " bytes. &nbsp; &nbsp; ", removeLink, "</li> ");
        };

        $(this).children(".fileList")
            .append(output.join(""));

        //reset the input to null - nice little chrome bug!
        evt.target.value = null;
    });

    $(this).on("click", ".removeFile", function (e) {
        e.preventDefault();

        var fileId = $(this).parent().children("a").data("fileid");

        // loop through the files array and check if the name of that file matches FileName
        // and get the index of the match
        for (var i = 0; i < filesToUpload.length; ++i) {
            if (filesToUpload[i].id === fileId)
                filesToUpload.splice(i, 1);
        }

        $(this).parent().remove();
    });

    this.clear = function () {
        for (var i = 0; i < filesToUpload.length; ++i) {
            if (filesToUpload[i].id.indexOf(sectionIdentifier) >= 0)
                filesToUpload.splice(i, 1);
        }

        $(this).children(".fileList").empty();
    }

    return this;
};

(function () {
    var filesToUpload = [];

    var files1Uploader = $("#files1").fileUploader(filesToUpload, "files1");
    checkImages = filesToUpload;
    files1Uploader.clear();

    // $("#uploadBtn").click(function (e) {
    //     e.preventDefault();

    //     var formData = new FormData();

    //     for (var i = 0, len = filesToUpload.length; i < len; i++) {
    //         formData.append("files", filesToUpload[i].file);
    //     }

    //     $.ajax({
    //         url: "http://requestb.in/1k0dxvs1",
    //         data: formData,
    //         processData: false,
    //         contentType: false,
    //         type: "POST",
    //         success: function (data) {
    //             alert("DONE");

    //             files1Uploader.clear();
    //             files2Uploader.clear();
    //             files3Uploader.clear();
    //         },
    //         error: function (data) {
    //             alert("ERROR - " + data.responseText);
    //         }
    //     });
    // });
})()

$('#post-form').on('submit', function(event) {
    event.preventDefault();
    if (checkImages.length > 6) {
        toastr.options.timeOut = 4000;
        toastr.error('You can only upload a maximum of 6 files');
        return;
    }

    var startDate = $('#unit-start-date').val();
    var endDate = $('#unit-end-date').val();

    if (!validDates(startDate, endDate)) {
        toastr.options.timeOut = 4000;
        toastr.error('The start date must be before the end date');
        return;
    }
    document.getElementById('sublease-post').setAttribute('disabled', 'disabled');
    $('#sublease-post').html('Submitting Post...');

    var complex = $('#unit-complex-title').val();
    var website = $('#unit-website').val(); 
    if (!website || website === "") {
        website = "";
    }
    var beds = $('#unit-beds').val();
    var baths = $('#unit-baths').val();
    var name = `${complex} ${beds} beds ${baths} baths ${beds} bd ${baths} ba ${beds} bds ${baths} bas`;
    var rent = $('#unit-price').val();

    var furnished;
    if ($('#furnishedCheck').is(':checked')) {
        furnished = 1;
    }
    else furnished = 0;

    var gender = $('#unit-gender option:selected').text();
    var email = $('#unit-email').val();
    var description = $('#unit-description').val();
    var university = $('#unit-university').val();
    var allFiles = checkImages;

    var form = new FormData();
    var duration = findDuration(startDate, endDate);
    console.log(name, complex, website, beds, baths, rent, startDate, endDate, gender, email, description, university);
    var date = Date.now();
    form.append('name', name);
    form.append('complex', complex);
    form.append('website', website);
    form.append('beds', beds);
    form.append('baths', baths);
    form.append('rent', rent);
    form.append('startDate', startDate);
    form.append('endDate', endDate);
    form.append('furnished', furnished);
    form.append('gender', gender);
    form.append('email', email);
    form.append('duration', duration);
    form.append('description', description);
    form.append('university', university);

    for (let i = 0; i < allFiles.length; ++i) {
        form.append('unitImages', allFiles[i].file);
    }

    form.append('dateTime', date);

    //var data = {name: name, price: price, email: email, description: description, university: university, furnitureImage: image, dateTime: date, author: "Me"};
    $.ajax({
        type: 'POST',
        url: '/sublet',
        processData: false,
        contentType: false,
        data: form,
        success: function(res) {
            if (res === "Successful") {
                document.getElementById('post-form').reset();
                $('.close').click();
            
                sessionStorage.setItem('userJustPosted', 'true');
                window.location.href = "/sublet";
                
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
    $.ajax({
        type: 'POST',
        url: '/email-sublet',
        data: data,
        success: function(res) {
            if (res === "Successful") {
                currElement.trigger("reset");
                currElement.parent().parent().find('.close').click();
                localStorage.setItem(id, 'emailed');
                toastr.options.timeOut = 8000;
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
    var url = "http://localhost:8080/sublet/posts/" + id;
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

function displayFull(img, apt, bed, bath, price) {
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
    if (bed === 0 || bed === '0') {
        bed = 'Studio';
    }
    captionText.innerHTML = `<b><u>${apt}</u>: &nbsp;&nbsp;</b> ${bed} bd &nbsp;&nbsp;| &nbsp;&nbsp;${bath} ba &nbsp;&nbsp;| &nbsp;&nbsp;$${price}/month`;
}

function searchQuery() {
    var search = document.getElementsByClassName('searchTerm')[0].value;
    if (search && search !== '') {
        search = encodeURIComponent(search);
        var url = `/sublet/posts/search/${search}`;
        window.location.href = url;
    }
}


function findDuration(start, end) {
    var startSplit = start.split('/');
    var startDate = startSplit[2] + "/" + startSplit[0] + "/" + startSplit[1];
    var endSplit = end.split('/');
    var endDate = endSplit[2] + "/" + endSplit[0] + "/" + endSplit[1];
    startDate = new Date(startDate);
    endDate = new Date(endDate);

    var months;
    months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += endDate.getMonth();
    return months <= 0 ? '0' : ''+months;
}

function reportSublet(id, beds, baths, start, end, university) {
    var data = {publicID: id, beds: beds, baths: baths, startDate: start, endDate: end, university: university};
    $.ajax({
        type: 'POST',
        url: '/sublet/report',
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

function validDates(start, end) {
    var regExp = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/;

    if(parseInt(end.replace(regExp, "$3$1$2")) > parseInt(start.replace(regExp, "$3$1$2"))){
        return true;
    }
    else return false;
}
