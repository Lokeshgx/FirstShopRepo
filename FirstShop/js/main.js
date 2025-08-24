let currentPage = 1;
const productsPerPage = 10;
let currentCategory = 'all';

// Fetch products from JSON file
async function fetchProducts() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) {
        console.error('Product grid element not found!');
        return;
    }
    
    productGrid.innerHTML = '<div style="text-align: center; width: 100%;">Loading products...</div>';
    
    try {
        // Initialize global products state if needed
        if (!window.shopProducts) {
            console.error('Global products state not initialized!');
            return;
        }
        
        await window.shopProducts.load();
        products = window.shopProducts.getAll();
        console.log('Products loaded:', products); // Debug log
        
        if (products && products.length > 0) {
            generateCategoryMenu();
            renderProducts();
        } else {
            throw new Error('No products loaded');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productGrid.innerHTML = `<div style="text-align: center; width: 100%; color: red;">
            Error loading products. Please try again later.<br>
            Error details: ${error.message}
        </div>`;
    }
}

function calculateDiscount(original, discounted) {
    const discount = ((original - discounted) / original) * 100;
    return Math.round(discount);
}

// Cart management
let cart = [];

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartCount();
    saveCartToLocalStorage();
    showAddToCartToast(product.title);
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

function showAddToCartToast(productTitle) {
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
    toast.textContent = `${productTitle} added to cart!`;

    toastContainer.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createProductCard(product) {
    const discount = calculateDiscount(product.price, product.discountedPrice);
    return `
        <div class="product-card">
            <div class="product-info">
                <a target="_blank" class="productDetails" onclick="viewProductDetails(${product.id})">
                    <img src="${product.images[0]}" alt="${product.title}" class="product-banner">
                    <h3 class="product-title">${product.title}</h3>
                </a>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="original-price">&#x20b9;${product.price}</span>
                    <span class="discounted-price">&#x20b9;${product.discountedPrice}</span>
                    <span class="discount-badge">-${discount}%</span>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart-btn" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

function filterProducts(category) {
    currentCategory = category;
    currentPage = 1;
    
    // Save scroll position
    const scrollPosition = window.scrollY;
    
    renderProducts();
    updateCategoryUI(category);
    
    // Smooth scroll to previous position or top if filtered
    if (category === currentCategory) {
        window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    } else {
        // If category changed, scroll to top of products
        const productSection = document.querySelector('.product-section');
        if (productSection) {
            productSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function generateCategoryMenu() {
    const categoryList = document.querySelector('.category-list');
    if (!categoryList) return;

    // Get unique categories from products
    const categories = [...new Set(products.map(product => product.category))];
    
    // Count products in each category
    const categoryCounts = {};
    products.forEach(product => {
        categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    });

    // Category icon mapping
    const categoryIcons = {
        'all': 'th-large',
        'electronics': 'laptop',
        'clothing': 'tshirt',
        'furniture': 'couch',
        'books': 'book',
        'sports': 'futbol',
        'beauty': 'spa',
        'jewelry': 'gem',
        'food': 'utensils',
        'toys': 'gamepad',
        'health': 'heartbeat',
        'automotive': 'car',
        'garden': 'leaf',
        'home': 'home',
        'fitness': 'dumbbell',
        'tools': 'tools'
    };

    // Generate HTML for categories
    let categoryHTML = `
        <li class="category-item" data-category="all" onclick="filterProducts('all')">
            <span class="category-link ${currentCategory === 'all' ? 'active' : ''}">
                <i class="fas fa-th-large"></i>
                <span>All Products</span>
                <span class="category-count">${products.length}</span>
            </span>
        </li>`;

    // Sort categories alphabetically
    categories.sort();

    // Add category items
    categories.forEach(category => {
        const icon = categoryIcons[category] || 'tag';
        const count = categoryCounts[category] || 0;
        const displayName = category.charAt(0).toUpperCase() + category.slice(1);
        
        categoryHTML += `
        <li class="category-item" data-category="${category}" onclick="filterProducts('${category}')">
            <span class="category-link ${currentCategory === category ? 'active' : ''}">
                <i class="fas fa-${icon}"></i>
                <span>${displayName}</span>
                <span class="category-count">${count}</span>
            </span>
        </li>`;
    });

    categoryList.innerHTML = categoryHTML;
}

function updateCategoryUI(category) {
    document.querySelectorAll('.category-list .category-item .category-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const selectedCategory = document.querySelector(`.category-item[data-category="${category}"] .category-link`);
    if (selectedCategory) {
        selectedCategory.classList.add('active');
    }
}

function renderProducts() {
    const productGrid = document.getElementById('productGrid');
    const allProducts = window.shopProducts.getAll();
    const filteredProducts = currentCategory === 'all' 
        ? allProducts 
        : allProducts.filter(product => product.category === currentCategory);

    // Get current sort option
    const sortSelect = document.querySelector('.sort-select');
    const sortOption = sortSelect ? sortSelect.value : 'popular';

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortOption) {
            case 'price-low':
                return a.discountedPrice - b.discountedPrice;
            case 'price-high':
                return b.discountedPrice - a.discountedPrice;
            case 'newest':
                return b.id - a.id;
            case 'popular':
            default:
                // Sort by rating and number of ratings
                const aScore = (a.rating || 0) * Math.log(a.ratingCount || 1);
                const bScore = (b.rating || 0) * Math.log(b.ratingCount || 1);
                return bScore - aScore;
        }
    });

    // Calculate pagination
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = sortedProducts.slice(startIndex, endIndex);

    // Render products
    productGrid.innerHTML = currentProducts.map(product => createProductCard(product)).join('');
    
    // Render pagination
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    let paginationHTML = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            Previous
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" class="${currentPage === i ? 'active' : ''}">
                ${i}
            </button>
        `;
    }

    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            Next
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navOptions = document.getElementById('navOptions');
    
    if (mobileMenuBtn && navOptions) {
        mobileMenuBtn.addEventListener('click', () => {
            navOptions.classList.toggle('active');
        });
    }
}

// Handle sort change
function handleSortChange() {
    currentPage = 1; // Reset to first page when sorting changes
    renderProducts();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing...');
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Load cart from localStorage
    loadCartFromLocalStorage();
    
    // Verify elements exist
    const productGrid = document.getElementById('productGrid');
    const pagination = document.getElementById('pagination');
    const sortSelect = document.querySelector('.sort-select');
    
    if (!productGrid) console.error('Product grid element not found!');
    if (!pagination) console.error('Pagination element not found!');
    
    // Add sort select event listener
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    } else {
        console.error('Sort select element not found!');
    }
    
    fetchProducts();

    // Add event listeners to category items
    const categoryItems = document.querySelectorAll('.category-list li');
    console.log('Found category items:', categoryItems.length);
    
    categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            console.log('Category clicked:', e.target.dataset.category);
            const category = e.target.dataset.category;
            filterProducts(category);
        });
    });
});

function viewProductDetails(productId) {
    // Get the current path relative to the root
    const currentPath = window.location.pathname;
    const isInRoot = currentPath.endsWith('index.html') || currentPath.endsWith('/');
    
    // Construct the correct path to product-detail.html
    const basePath = isInRoot ? 'pages/' : '';
    window.location.href = `${basePath}product-detail.html?id=${productId}`;
}
