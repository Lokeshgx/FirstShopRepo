// Function to get the correct path based on current location
function getHeaderPath() {
    const pathSegments = window.location.pathname.split('/');
    const isInPagesDir = pathSegments.includes('pages');
    const basePath = isInPagesDir ? '../' : '';
    return `${basePath}pages/header.html`;
}

// Function to handle fetch errors
async function fetchWithErrorHandling(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Failed to fetch from ${path}, trying alternative path...`);
        const altPath = path.includes('../') ? 
            path.replace('../', '') : 
            '../' + path;
        
        const response = await fetch(altPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    }
}

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

// Initialize global products state if not already initialized
if (!window.shopProducts) {
    window.shopProducts = {
        items: [],
        async load() {
            try {
                const response = await fetch('../js/data.json');
                if (!response.ok) {
                    throw new Error('Failed to load products');
                }
                const data = await response.json();
                this.items = data.products;
            } catch (error) {
                console.error('Error loading products:', error);
            }
        },
        getAll() {
            return this.items;
        },
        search(query) {
            return this.items.filter(product => 
                product.title.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase())
            );
        }
    };
}

// Function to update hrefs in the header based on current location
function updateHeaderLinks(headerElement) {
    const isInPages = window.location.pathname.includes('/pages/');
    const links = headerElement.querySelectorAll('a');
    
    links.forEach(link => {
        let href = link.getAttribute('href');
        if (!href) return;

        // Skip external links or absolute URLs
        if (href.startsWith('http') || href.startsWith('//')) return;

        // Update paths based on location
        if (isInPages) {
            // If in pages directory and link doesn't start with ../, add it
            if (!href.startsWith('../')) {
                link.href = '../' + href;
            }
        } else {
            // If in root, remove any ../ from the beginning
            link.href = href.replace(/^\.\.\//, '');
        }
    });
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchResults) return;

    // Load products when search is first interacted with
    searchInput.addEventListener('focus', () => {
        if (window.shopProducts.items.length === 0) {
            window.shopProducts.load();
        }
    });

    // Handle input with debounce
    const searchTimeoutRef = { value: null };
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeoutRef.value);
        searchTimeoutRef.value = setTimeout(() => performSearch(searchInput.value), 300);
    });

    // Handle click outside to close results
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.classList.remove('active');
        }
    });

    // Handle search button click
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            performSearch(searchInput.value);
        });
    }
}

// Function to perform search
function performSearch(query) {
    const searchResults = document.getElementById('searchResults');
    if (!query.trim() || !searchResults) {
        if (searchResults) {
            searchResults.classList.remove('active');
        }
        return;
    }

    const results = window.shopProducts.search(query).slice(0, 5);

    if (results.length > 0) {
        searchResults.innerHTML = results.map(product => `
            <div class="search-result-item" onclick="goToProduct(${product.id})">
                <img src="${product.image}" alt="${product.title}" class="search-result-image">
                <div class="search-result-info">
                    <div class="search-result-title">${product.title}</div>
                    <div class="search-result-price">$${product.discountedPrice}</div>
                </div>
            </div>
        `).join('');
        searchResults.classList.add('active');
    } else {
        searchResults.innerHTML = '<div class="search-result-item">No products found</div>';
        searchResults.classList.add('active');
    }
}

// Function to navigate to product
function goToProduct(productId) {
    const isInPages = window.location.pathname.includes('/pages/');
    const productPath = isInPages ? 'product-detail.html' : 'pages/product-detail.html';
    window.location.href = `${productPath}?id=${productId}`;
}

// Function to load header
async function loadHeader() {
    console.log('Loading header...');
    const headerElement = document.querySelector('header.header');
    if (!headerElement) {
        console.error('Header element not found');
        return;
    }

    try {
        const headerPath = getHeaderPath();
        console.log('Header path:', headerPath);
        
        // Use our error handling fetch
        const html = await fetchWithErrorHandling(headerPath);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const headerContent = doc.querySelector('header.header');
        
        if (!headerContent) {
            throw new Error('Could not find header content in the loaded HTML');
        }

        // Update header links before inserting
        updateHeaderLinks(headerContent);
        
        // Replace the existing header with the new content
        headerElement.innerHTML = headerContent.innerHTML;
        console.log('Header content loaded');

        // Initialize mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileNav = document.getElementById('mobileNav');
        if (mobileMenuToggle && mobileNav) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
            });
        }

        // Initialize cart
        window.shopCart.loadFromLocalStorage();
        
        // Initialize search functionality
        initializeSearch();
        
        console.log('Header loaded successfully');
    } catch (error) {
        console.error('Error loading header:', error);
        // Try to show a minimal header if the main one fails
        headerElement.innerHTML = '<div class="header-container"><a href="/" class="brand"><span class="brand-name">FirstShop</span></a></div>';
    }
}

// Event listener for updating cart when storage changes (for cross-tab sync)
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        window.shopCart.loadFromLocalStorage();
    }
});

// Initialize everything when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    loadHeader();
}

// Function to get the correct path based on current location
function getHeaderPath() {
    // Get the current path segments
    const pathSegments = window.location.pathname.split('/');
    const currentFile = pathSegments[pathSegments.length - 1];
    
    // Check if we're in the pages directory
    if (currentFile && pathSegments.includes('pages')) {
        return '../pages/header.html';
    }
    
    // We're in the root or the path is not what we expect
    return 'pages/header.html';
}

// Function to handle fetch errors
async function fetchWithErrorHandling(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Failed to fetch from ${path}, trying alternative path...`);
        // If the first attempt fails, try the alternative path
        const altPath = path.includes('../') ? 
            path.replace('../', '') : 
            '../' + path;
        
        const response = await fetch(altPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    }
}

// Function to update hrefs in the header based on current location
function updateHeaderLinks(headerElement) {
    const isInPages = window.location.pathname.includes('/pages/');
    const links = headerElement.querySelectorAll('a');
    
    links.forEach(link => {
        let href = link.getAttribute('href');
        if (!href) return;

        // Skip external links or absolute URLs
        if (href.startsWith('http') || href.startsWith('//')) return;

        // Update paths based on location
        if (isInPages) {
            // If in pages directory and link doesn't start with ../, add it
            if (!href.startsWith('../')) {
                link.href = '../' + href;
            }
        } else {
            // If in root, remove any ../ from the beginning
            link.href = href.replace(/^\.\.\//, '');
        }
    });
}

// Search functionality
let products = [];
let searchTimeout = null;

async function loadProducts() {
    try {
        const response = await fetch('../js/data.json');
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        const data = await response.json();
        products = data.products;
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchResults) return;

    // Load products when search is first interacted with
    searchInput.addEventListener('focus', () => {
        if (window.shopProducts.items.length === 0) {
            window.shopProducts.load();
        }
    });

    // Handle input with debounce
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => performSearch(searchInput.value), 300);
    });

    // Handle click outside to close results
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.classList.remove('active');
        }
    });

    // Handle search button click
    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
    });
}

function performSearch(query) {
    const searchResults = document.getElementById('searchResults');
    if (!query.trim()) {
        searchResults.classList.remove('active');
        return;
    }

    const results = window.shopProducts.search(query).slice(0, 5);

    if (results.length > 0) {
        searchResults.innerHTML = results.map(product => `
            <div class="search-result-item" onclick="goToProduct(${product.id})">
                <img src="${product.image}" alt="${product.title}" class="search-result-image">
                <div class="search-result-info">
                    <div class="search-result-title">${product.title}</div>
                    <div class="search-result-price">$${product.discountedPrice}</div>
                </div>
            </div>
        `).join('');
        searchResults.classList.add('active');
    } else {
        searchResults.innerHTML = '<div class="search-result-item">No products found</div>';
        searchResults.classList.add('active');
    }
}

function goToProduct(productId) {
    const isInPages = window.location.pathname.includes('/pages/');
    const productPath = isInPages ? 'product-detail.html' : 'pages/product-detail.html';
    window.location.href = `${productPath}?id=${productId}`;
}

// Function to load header
async function loadHeader() {
    console.log('Loading header...');
    const headerElement = document.querySelector('header.header');
    if (!headerElement) {
        console.error('Header element not found');
        return;
    }
    console.log('Header element found:', headerElement);

    try {
        console.log('Loading header...');
        const headerPath = getHeaderPath();
        console.log('Header path:', headerPath);
        
        // Use our new error handling fetch
        const html = await fetchWithErrorHandling(headerPath);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const headerContent = doc.querySelector('header.header');
        
        if (!headerContent) {
            throw new Error('Could not find header content in the loaded HTML');
        }

        // Update header links before inserting
        updateHeaderLinks(headerContent);
        
        // Replace the existing header with the new content
        console.log('Loading header content...');
        headerElement.innerHTML = headerContent.innerHTML;
        console.log('Header content loaded');

        // Initialize mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileNav = document.getElementById('mobileNav');
        if (mobileMenuToggle && mobileNav) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
            });
        }
        
        // Initialize search functionality
        initializeSearch();
        
        // Initialize cart
        if (window.shopCart) {
            window.shopCart.loadFromLocalStorage();
        }
        
        console.log('Header loaded successfully');
    } catch (error) {
        console.error('Error loading header:', error);
        // Try to show a minimal header if the main one fails
        headerElement.innerHTML = '<div class="header-container"><a href="/" class="brand"><span class="brand-name">FirstShop</span></a></div>';
    }
}

// Event listener for updating cart when storage changes (for cross-tab sync)
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        window.shopCart.loadFromLocalStorage();
    }
});

// Initialize header and cart when document is ready
document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    window.shopCart.loadFromLocalStorage();
});
