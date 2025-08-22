// Cart state management
const SHIPPING_THRESHOLD = 100; // Free shipping above $100
const SHIPPING_COST = 10;

// Initialize global cart state if not already initialized
if (!window.shopCart) {
    window.shopCart = {
        items: JSON.parse(localStorage.getItem('cart')) || [],
        
        loadFromLocalStorage() {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
                this.updateCount();
            }
        },

        saveToLocalStorage() {
            localStorage.setItem('cart', JSON.stringify(this.items));
        },

        updateCount() {
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
                cartCount.textContent = totalItems;
                cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
            }
        },

        getCart() {
            return this.items;
        },

        addItem(item) {
            const existingItem = this.items.find(i => i.id === item.id);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                this.items.push(item);
            }
            this.saveToLocalStorage();
            this.updateCount();
        },

        removeItem(itemId) {
            const index = this.items.findIndex(i => i.id === itemId);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.saveToLocalStorage();
                this.updateCount();
            }
        },

        updateQuantity(itemId, quantity) {
            const item = this.items.find(i => i.id === itemId);
            if (item) {
                item.quantity = quantity;
                this.saveToLocalStorage();
                this.updateCount();
            }
        }
    };
}

export function updateCartItemQuantity(itemId, quantity) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity = quantity;
        saveCartToLocalStorage();
        updateCartCount();
    }
}

export function clearCart() {
    cart.length = 0;
    saveCartToLocalStorage();
    updateCartCount();
}
