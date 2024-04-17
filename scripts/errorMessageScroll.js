
    // JavaScript code to scroll to the error message
    document.addEventListener('DOMContentLoaded', function() {
        var errorMessage = document.getElementById('error');
        if (errorMessage) {
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
