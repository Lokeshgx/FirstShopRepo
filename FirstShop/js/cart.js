// Cart configuration
const SHIPPING_THRESHOLD = 100; // Free shipping above $100
const SHIPPING_COST = 10;

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
    initializeMobileMenu();
    window.shopCart.loadFromLocalStorage();
    renderCart();
});

function formatPrice(price) {
    return price.toFixed(2);
}

function calculateSubtotal() {
    if (!window.shopCart) {
        console.error('Cart not initialized');
        return 0;
    }
    const cartItems = window.shopCart.getCart();
    return cartItems.reduce((sum, item) => sum + (item.discountedPrice * item.quantity), 0);
}

function calculateShipping(subtotal) {
    return subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

function proceedToCheckout() {
    if (!window.shopCart) {
        console.error('Cart not initialized');
        return;
    }
    const cartItems = window.shopCart.getCart();
    if (!cartItems || cartItems.length === 0) {
        alert('Your cart is empty. Add some items before checking out.');
        return;
    }

    try {
        // Calculate all totals
        const subtotal = calculateSubtotal();
        const shipping = calculateShipping(subtotal);
        const total = subtotal + shipping;

        // Save detailed checkout data
        const checkoutData = {
            items: cartItems,
            subtotal: subtotal,
            shipping: shipping,
            total: total,
            timestamp: new Date().toISOString(),
            itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
        };

        // Save to localStorage
        localStorage.setItem('checkout_data', JSON.stringify(checkoutData));

        // Double-check the data was saved
        const savedData = localStorage.getItem('checkout_data');
        if (!savedData) {
            throw new Error('Failed to save checkout data');
        }

        // Redirect to order page
        window.location.href = 'order.html';
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('There was an error proceeding to checkout. Please try again.');
    }
}

function updateSummary() {
    if (!window.shopCart) {
        console.error('Cart not initialized');
        return;
    }

    const subtotal = calculateSubtotal();
    const shipping = calculateShipping(subtotal);
    const total = subtotal + shipping;

    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = `${formatPrice(subtotal)}`;
    if (shippingElement) shippingElement.textContent = `${formatPrice(shipping)}`;
    if (totalElement) totalElement.textContent = `${formatPrice(total)}`;

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        const cartItems = window.shopCart.getCart();
        const isEmpty = !cartItems || cartItems.length === 0;
        
        // Disable button if cart is empty
        checkoutBtn.disabled = isEmpty;
        checkoutBtn.classList.toggle('disabled', isEmpty);
        
        // Add click handler if not already added
        if (!checkoutBtn.hasAttribute('data-handler-attached')) {
            checkoutBtn.setAttribute('data-handler-attached', 'true');
            checkoutBtn.addEventListener('click', proceedToCheckout);
        }
    }
}

function updateCartQuantity(productId, newQuantity) {
    if (!window.shopCart) {
        console.error('Cart not initialized');
        return;
    }

    if (newQuantity < 1) {
        window.shopCart.removeItem(productId);
    } else {
        window.shopCart.updateQuantity(productId, newQuantity);
    }
    renderCart();
}

function removeCartItem(productId) {
    if (!window.shopCart) {
        console.error('Cart not initialized');
        return;
    }

    window.shopCart.removeItem(productId);
    renderCart();
}

function renderCartItem(item) {
    if (!item) return '';
    
    const formattedDiscount = formatPrice(item.discountedPrice || 0);
    const formattedOriginal = formatPrice(item.price || 0);
    const formattedTotal = formatPrice((item.discountedPrice || 0) * (item.quantity || 0));
    
    return `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.images[0] || ''}" alt="${item.title || ''}" class="cart-item-image">
            <div class="cart-item-details">
                <h3>${item.title || ''}</h3>
                <div class="cart-item-price">
                    <span class="discounted-price">&#x20b9;${formattedDiscount}</span>
                    <span class="original-price">&#x20b9;${formattedOriginal}</span>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${Math.max(0, (item.quantity || 0) - 1)})">-</button>
                    <span class="quantity-display">${item.quantity || 0}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${(item.quantity || 0) + 1})">+</button>
                </div>
                <button class="remove-btn" onclick="removeCartItem(${item.id})">
                    <i class="fas fa-trash"></i>
                    Remove
                </button>
            </div>
            <div class="cart-item-total">
                <strong>&#x20b9;${formattedTotal}</strong>
            </div>
        </div>
    `;
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) {
        console.error('Cart container not found');
        return;
    }

    if (!window.shopCart) {
        console.error('Shop cart not initialized');
        return;
    }

    const cartItems = window.shopCart.getCart();
    
    if (!cartItems || cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any items to your cart yet.</p>
                <a href="product.html" class="continue-shopping">
                    <i class="fas fa-arrow-left"></i>
                    Start Shopping
                </a>
            </div>
        `;
    } else {
        cartItemsContainer.innerHTML = cartItems.map(renderCartItem).join('');
    }

    window.shopCart.updateCount();
    updateSummary();
}

function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navOptions = document.getElementById('navOptions');
    
    if (mobileMenuBtn && navOptions) {
        mobileMenuBtn.addEventListener('click', () => {
            navOptions.classList.toggle('active');
        });
    }
}
