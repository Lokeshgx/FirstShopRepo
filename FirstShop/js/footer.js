// Function to load the footer
async function loadFooter() {
    try {
        const response = await fetch('../pages/footer.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const footerContent = await response.text();
        
        // Get the footer element
        const footer = document.querySelector('footer.footer');
        if (footer) {
            footer.innerHTML = footerContent;
        }
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

// Load footer when DOM is ready
document.addEventListener('DOMContentLoaded', loadFooter);
