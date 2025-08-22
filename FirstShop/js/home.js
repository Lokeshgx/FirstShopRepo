document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Load cart from localStorage
    loadCartFromLocalStorage();
    
    // Initialize contact form
    initializeContactForm();
});

function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navOptions = document.getElementById('navOptions');
    
    if (mobileMenuBtn && navOptions) {
        mobileMenuBtn.addEventListener('click', () => {
            navOptions.classList.toggle('active');
        });

        // Close menu when clicking links
        navOptions.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navOptions.classList.remove('active');
            });
        });
    }
}

function loadCartFromLocalStorage() {
    const cartCount = document.querySelector('.cart-count');
    const savedCart = localStorage.getItem('cart');
    
    if (savedCart && cartCount) {
        const cart = JSON.parse(savedCart);
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function initializeContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };

            // Show success message (in real app, you would send this to a server)
            showSuccessMessage(contactForm);
        });
    }
}

function showSuccessMessage(form) {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <p>Thank you for your message! We'll get back to you soon.</p>
    `;
    
    // Replace form with success message
    form.replaceWith(successMessage);
    
    // Optional: Reset form and remove success message after 5 seconds
    setTimeout(() => {
        successMessage.replaceWith(form);
        form.reset();
    }, 5000);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
