let currentProduct = null;

function fetchProductDetails() {
    // Get product ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        console.error('No product ID provided');
        return;
    }

    // Fetch product data
    fetch('../js/data.json')
        .then(response => response.json())
        .then(data => {
            const product = data.products.find(p => p.id === parseInt(productId));
            if (product) {
                currentProduct = product;
                displayProductDetails(product);
            } else {
                console.error('Product not found');
            }
        })
        .catch(error => console.error('Error:', error));
}

function displayProductDetails(product) {
    // Update main image and thumbnails
    const mainImage = document.getElementById('mainImage');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    
    if (product.images && product.images.length > 0) {
        mainImage.src = product.images[0];
        mainImage.alt = product.title;

        // Create thumbnails
        updateThumbnails(product.images);
    } else {
        // Fallback to single image
        mainImage.src = product.thumbnailImage || product.image;
        mainImage.alt = product.title;
    }
    
    // Update product info
    document.getElementById('productTitle').textContent = product.title;
    document.getElementById('discountedPrice').textContent = `${product.discountedPrice.toFixed(2)}`;
    document.getElementById('originalPrice').textContent = `${product.price.toFixed(2)}`;
    
    // Calculate and display discount percentage
    const discount = calculateDiscount(product.price, product.discountedPrice);
    document.getElementById('discountBadge').textContent = `-${discount}%`;

    // Display product description
    document.querySelector('.description-content').textContent = product.description;

    // Update color options
    if (product.colors) {
        updateColorOptions(product.colors);
    }

    // Update size options
    if (product.sizes) {
        updateSizeOptions(product.sizes);
    }
}

function updateThumbnails(images) {
    const container = document.getElementById('thumbnailContainer');
    if (!container) return;

    container.innerHTML = images.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="updateMainImage('${img}', this)">
            <img src="${img}" alt="Product thumbnail">
        </div>
    `).join('');
}

function updateMainImage(src, thumbnailElement) {
    // Update main image
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = src;
    }
    
    // Update active thumbnail
    if (thumbnailElement) {
        document.querySelectorAll('.thumbnail').forEach(thumb => 
            thumb.classList.remove('active'));
        thumbnailElement.classList.add('active');
    }
}

function updateColorOptions(colors) {
    const container = document.getElementById('colorOptions');
    if (!container) return;

    if (!colors || colors.length === 0) {
        container.parentElement.style.display = 'none';
        return;
    }

    container.parentElement.style.display = 'block';
    container.innerHTML = colors.map(color => `
        <div class="color-option" onclick="selectColor(this)" data-color="${color}"
             style="background-color: ${color.toLowerCase()}">
            <span class="color-name">${color}</span>
        </div>
    `).join('');
}

function updateSizeOptions(sizes) {
    const container = document.getElementById('sizeOptions');
    if (!container) return;

    if (!sizes || sizes.length === 0) {
        container.parentElement.style.display = 'none';
        return;
    }

    container.parentElement.style.display = 'block';
    container.innerHTML = sizes.map(size => `
        <div class="size-option" onclick="selectSize(this)" data-size="${size}">
            ${size}
        </div>
    `).join('');
}

function calculateDiscount(original, discounted) {
    return Math.round(((original - discounted) / original) * 100);
}

function updateQuantity(change) {
    const input = document.getElementById('quantity');
    if (!input) return;

    const newValue = parseInt(input.value) + change;
    if (newValue >= 1 && newValue <= 99) {
        input.value = newValue;
    }
}

function selectColor(element) {
    document.querySelectorAll('.color-option').forEach(opt => 
        opt.classList.remove('selected'));
    element.classList.add('selected');
}

function selectSize(element) {
    document.querySelectorAll('.size-option').forEach(opt => 
        opt.classList.remove('selected'));
    element.classList.add('selected');
}

function getSelectedOptions() {
    const colorElement = document.querySelector('.color-option.selected');
    const sizeElement = document.querySelector('.size-option.selected');
    const quantityInput = document.getElementById('quantity');

    return {
        color: colorElement ? colorElement.dataset.color : null,
        size: sizeElement ? sizeElement.dataset.size : null,
        quantity: quantityInput ? parseInt(quantityInput.value) || 1 : 1
    };
}

function addToCart() {
    if (!currentProduct) {
        console.error('No product selected');
        return;
    }

    const { color, size, quantity } = getSelectedOptions();
    
    if (!color || !size) {
        alert('Please select both color and size');
        return;
    }

    const cartItem = {
        id: currentProduct.id,
        title: currentProduct.title,
        price: currentProduct.price,
        discountedPrice: currentProduct.discountedPrice,
        image: currentProduct.thumbnailImage || currentProduct.images[0],
        color: color,
        size: size,
        quantity: quantity
    };

    if (window.shopCart) {
        window.shopCart.addItem(cartItem);
        showToast('Product added to cart!');
    } else {
        console.error('Cart not initialized');
    }
}

function buyNow() {
    if (!currentProduct) {
        console.error('No product selected');
        return;
    }

    const { color, size, quantity } = getSelectedOptions();
    
    if (!color || !size) {
        alert('Please select both color and size');
        return;
    }

    const orderItem = {
        id: currentProduct.id,
        title: currentProduct.title,
        price: currentProduct.price,
        discountedPrice: currentProduct.discountedPrice,
        image: currentProduct.thumbnailImage || currentProduct.images[0],
        color: color,
        size: size,
        quantity: quantity
    };

    // Save order details to localStorage
    localStorage.setItem('checkout_data', JSON.stringify({
        items: [orderItem],
        subtotal: orderItem.discountedPrice * quantity,
        shipping: orderItem.discountedPrice * quantity >= 100 ? 0 : 10,
        total: (orderItem.discountedPrice * quantity) + (orderItem.discountedPrice * quantity >= 100 ? 0 : 10),
        timestamp: new Date().toISOString(),
        itemCount: quantity
    }));

    // Redirect to order page
    window.location.href = 'order.html';
}

function showToast(message) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(toastContainer);
    }

    // Create toast message
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: #4CAF50;
        color: white;
        padding: 16px 24px;
        border-radius: 4px;
        margin-top: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    fetchProductDetails();
});
