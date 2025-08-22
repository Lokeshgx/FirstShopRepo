// Cart initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart if needed
    if (!window.shopCart) {
        console.error('Cart not initialized');
        return;
    }

    // Load cart from localStorage
    window.shopCart.loadFromLocalStorage();
    
    // Get cart container
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) {
        console.error('Cart container not found');
        return;
    }

    // Get cart items
    const cartItems = window.shopCart.getCart();

    if (cartItems && cartItems.length > 0) {
        // Render cart items
        renderCart();
    } else {
        // Show empty cart message
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="product.html" class="continue-shopping">Continue Shopping</a>
            </div>
        `;
    }
});
