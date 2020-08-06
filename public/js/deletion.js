function deleteSubletPost() {
    var url = window.location.href;
    document.getElementById('sublet-button').setAttribute('disabled', 'disabled');
    $('#sublet-button').html('Deleting Post...');
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'text',
        success: function(res) {
            var mainContent = document.getElementsByClassName('message-deletion')[0];
            while (mainContent.firstChild) {
                mainContent.removeChild(mainContent.firstChild);
            }
            mainContent.innerHTML = `<h1 class="message-header"><i class="fa fa-check"></i> Deletion Successful! </h1><p class="message-content">Your post has been deleted and will no longer appear on the 'Sublet' page.</p>`;
        
        }
    }).fail(function() {
        $('#sublet-button').removeAttr('disabled');
        $('#sublet-button').html('Delete Post');
        alert("Something went wrong. Please refresh the page and try again.");
    });
}

function deleteFurniturePost() {
    var url = window.location.href;
    document.getElementById('furniture-button').setAttribute('disabled', 'disabled');
    $('#furniture-button').html('Deleting Post...');
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'text',
        success: function(res) {
            var mainContent = document.getElementsByClassName('message-deletion')[0];
            while (mainContent.firstChild) {
                mainContent.removeChild(mainContent.firstChild);
            }
            mainContent.innerHTML = `<h1 class="message-header"><i class="fa fa-check"></i> Deletion Successful! </h1><p class="message-content">Your post has been deleted and will no longer appear on the 'Furniture' page.</p>`;
        
        }
    }).fail(function() {
        $('#furniture-button').removeAttr('disabled');
        $('#furniture-button').html('Delete Post');
        alert("Something went wrong. Please refresh the page and try again.");
    });
}