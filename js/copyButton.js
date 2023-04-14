const copyButtons = document.querySelectorAll('.copy-btn');

copyButtons.forEach(function(copyButton) {
    copyButton.addEventListener('click', function(event) {
        const inputId = copyButton.dataset.inputId;
        const inputField = document.getElementById(inputId);

        navigator.clipboard.writeText(inputField.value)
            .then(function() {
                copyButton.textContent = 'Copied!';
                // Revert the text of the "Copy" button back to "Copy" after 3 seconds
                setTimeout(function() {
                    copyButton.textContent = 'Copy';
                }, 1200);
            })
            .catch(function() {
                console.error(`Failed to copy value to clipboard`);
            });
    });
});