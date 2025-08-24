// Constants
const TAX_RATE = 0.08; // 8% tax
const SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 10;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromLocalStorage();
    displayOrderSummary();
    initializeFormValidation();
});

function loadCheckoutData() {
    const checkoutData = localStorage.getItem('checkout_data');
    if (checkoutData) {
        return JSON.parse(checkoutData);
    }
    return null;
}

function loadCartFromLocalStorage() {
    const checkoutData = loadCheckoutData();
    if (checkoutData && checkoutData.items) {
        return checkoutData.items;
    }
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        return JSON.parse(savedCart);
    }
    return [];
}

function displayOrderSummary() {
    const checkoutData = loadCheckoutData();
    
    if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    const orderItems = document.getElementById('orderItems');
    
    // Display order items
    orderItems.innerHTML = checkoutData.items.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.title}" class="order-item-image">
            <div class="order-item-details">
                <div class="order-item-title">${item.title}</div>
                <div class="order-item-price">&#x20b9;${formatPrice(item.discountedPrice)}</div>
                <div class="order-item-quantity">Quantity: ${item.quantity}</div>
            </div>
        </div>
    `).join('');

    // Use the pre-calculated totals from checkout data
    document.getElementById('subtotal').textContent = `${formatPrice(checkoutData.subtotal)}`;
    document.getElementById('shipping').textContent = `${formatPrice(checkoutData.shipping)}`;
    document.getElementById('tax').textContent = `${formatPrice(calculateTax(checkoutData.subtotal))}`;
    document.getElementById('total').textContent = `${formatPrice(checkoutData.total + calculateTax(checkoutData.subtotal))}`;
}

function updateOrderTotals(cart) {
    const subtotal = calculateSubtotal(cart);
    const shipping = calculateShipping(subtotal);
    const tax = calculateTax(subtotal);
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `${formatPrice(subtotal)}`;
    document.getElementById('shipping').textContent = `${formatPrice(shipping)}`;
    document.getElementById('tax').textContent = `${formatPrice(tax)}`;
    document.getElementById('total').textContent = `${formatPrice(total)}`;
}

function calculateSubtotal(cart) {
    return cart.reduce((sum, item) => sum + (item.discountedPrice * item.quantity), 0);
}

function calculateShipping(subtotal) {
    return subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

function calculateTax(subtotal) {
    return subtotal * TAX_RATE;
}

function formatPrice(price) {
    return price.toFixed(2);
}

function initializeFormValidation() {
    const form = document.getElementById('orderForm');
    const inputs = form.querySelectorAll('input');

    // Add input validation
    inputs.forEach(input => {
        input.addEventListener('input', (e) => validateInput(e.target));
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm(form)) {
            return;
        }

        const formData = new FormData(form);
        const orderData = {
            customer: {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: {
                    street: formData.get('address'),
                    city: formData.get('city'),
                    state: formData.get('state'),
                    zipCode: formData.get('zipCode')
                }
            },
            items: loadCartFromLocalStorage(),
            totals: {
                subtotal: calculateSubtotal(loadCartFromLocalStorage()),
                shipping: calculateShipping(calculateSubtotal(loadCartFromLocalStorage())),
                tax: calculateTax(calculateSubtotal(loadCartFromLocalStorage()))
            }
        };

        try {
            await processOrder(orderData);
        } catch (error) {
            showError('An error occurred while processing your order. Please try again.');
        }
    });
}

function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (input.name) {
        case 'fullName':
            isValid = value.length >= 2;
            errorMessage = 'Please enter a valid name';
            break;
        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            errorMessage = 'Please enter a valid email address';
            break;
        case 'phone':
            isValid = /^\d{10}$/.test(value.replace(/\D/g, ''));
            errorMessage = 'Please enter a valid 10-digit phone number';
            break;
        case 'cardNumber':
            isValid = /^\d{16}$/.test(value.replace(/\D/g, ''));
            errorMessage = 'Please enter a valid 16-digit card number';
            break;
        case 'expiryDate':
            isValid = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value);
            errorMessage = 'Please enter a valid expiry date (MM/YY)';
            break;
        case 'cvv':
            isValid = /^\d{3,4}$/.test(value);
            errorMessage = 'Please enter a valid CVV';
            break;
        default:
            isValid = value.length > 0;
            errorMessage = 'This field is required';
    }

    showInputError(input, isValid ? '' : errorMessage);
    return isValid;
}

function showInputError(input, message) {
    const errorDiv = input.parentElement.querySelector('.error');
    if (message) {
        if (!errorDiv) {
            const div = document.createElement('div');
            div.className = 'error';
            div.textContent = message;
            input.parentElement.appendChild(div);
        } else {
            errorDiv.textContent = message;
        }
        input.classList.add('error');
    } else {
        if (errorDiv) errorDiv.remove();
        input.classList.remove('error');
    }
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    return isValid;
}

async function processOrder(orderData) {
    // Show loading state
    const form = document.getElementById('orderForm');
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    form.classList.add('loading');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Success! Clear cart and show success message
    localStorage.removeItem('cart');
    showOrderSuccess(orderData.customer.email);
}

function showOrderSuccess(email) {
    const formSection = document.querySelector('.order-form-section');
    formSection.innerHTML = `
        <div class="success-message show">
            <i class="fas fa-check-circle"></i>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for your order. A confirmation email has been sent to ${email}.</p>
            <p>Your order number is: #${generateOrderNumber()}</p>
            <a href="product.html" class="continue-shopping">
                Continue Shopping
            </a>
        </div>
    `;
}

function generateOrderNumber() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.getElementById('orderForm');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => errorDiv.remove(), 5000);
}
