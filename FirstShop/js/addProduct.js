document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('addProductForm');
    const imageInput = document.getElementById('images');
    const imagePreview = document.querySelector('.image-preview');
    const resetBtn = document.querySelector('.reset-btn');
    const submitBtn = document.querySelector('.submit-btn');

    // Handle image preview
    let selectedFiles = [];
    imageInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        // Add new files to the existing selection
        selectedFiles = [...selectedFiles, ...files];
        
        // Clear preview and show all selected files
        imagePreview.innerHTML = '';
        selectedFiles.forEach(file => {
            if (file.type.startsWith('image/')) {
                const previewContainer = document.createElement('div');
                previewContainer.className = 'preview-item';
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = file.name;
                    
                    // Add remove button
                    const removeBtn = document.createElement('button');
                    removeBtn.innerHTML = '×';
                    removeBtn.className = 'remove-image';
                    removeBtn.onclick = function() {
                        selectedFiles = selectedFiles.filter(f => f !== file);
                        previewContainer.remove();
                        // Update the file input
                        const newFileList = new DataTransfer();
                        selectedFiles.forEach(file => newFileList.items.add(file));
                        imageInput.files = newFileList.files;
                    };
                    
                    previewContainer.appendChild(img);
                    previewContainer.appendChild(removeBtn);
                    imagePreview.appendChild(previewContainer);
                }
                reader.readAsDataURL(file);
            }
        });
    });

    // Handle form reset
    resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        productForm.reset();
        imagePreview.innerHTML = '';
        selectedFiles = [];
        clearErrors();
    });

    // Form validation
    function validateForm() {
        let isValid = true;
        clearErrors();

        // Required fields validation
        const requiredFields = productForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showError(field, 'This field is required');
                isValid = false;
            }
        });

        // Price validation
        const price = document.getElementById('price');
        if (price.value && (isNaN(price.value) || parseFloat(price.value) <= 0)) {
            showError(price, 'Please enter a valid price');
            isValid = false;
        }

        // Stock validation
    /*    const stock = document.getElementById('stock');
        if (stock.value && (isNaN(stock.value) || parseInt(stock.value) < 0)) {
            showError(stock, 'Please enter a valid stock quantity');
            isValid = false;
        } */

        return isValid;
    }

    // Show error message
    function showError(field, message) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    // Clear all error messages
    function clearErrors() {
        const errorFields = productForm.querySelectorAll('.error');
        const errorMessages = productForm.querySelectorAll('.error-message');
        
        errorFields.forEach(field => field.classList.remove('error'));
        errorMessages.forEach(msg => msg.remove());
    }

    // Handle form submission
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = 'Saving... <span class="loading-spinner">↻</span>';

        try {
            // Get form data
            const formData = new FormData(productForm);
            const productData = {
                id: Date.now(),
                title: formData.get('title'),
                description: formData.get('description'),
                productType: formData.get('productType'),
                brand: formData.get('brand'),
                category: formData.get('category'),
                subCategory1: formData.get('subCategory1'),
                subCategory2: formData.get('subCategory2'),
                price: parseFloat(formData.get('price')),
                discountedPrice: parseFloat(formData.get('discountedPrice')),
                colors: Array.from(formData.getAll('colors')),
                productSizes: Array.from(formData.getAll('productSizes')),
                sizes: Array.from(formData.getAll('sizes')), // Keep this for clothing-specific sizes
                fabric: formData.get('fabric') || null,
                fitting: formData.get('fitting') || null,
                gender: formData.get('gender') || null,
                images: selectedFiles.map(file => file.name)
            };

            // Get existing products or create new array
            let products = [];
            try {
                const response = await fetch('../js/data.json');
                if (response.ok) {
                    const data = await response.json();
                    // Ensure products is always an array
                    products = Array.isArray(data) ? data : [];
                }
            } catch (error) {
                console.warn('No existing products found, creating new array');
                // Ensure products is initialized as an empty array if file doesn't exist
                products = [];
            }

            // Add new product
            if (!Array.isArray(products)) {
                products = [];
            }
            products.push(productData);

            // Save to data.json
            const jsonData = JSON.stringify(products, null, 2);
            
            // Create a blob and download
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data.json';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Also save images
            for (const file of selectedFiles) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imgBlob = new Blob([e.target.result], { type: file.type });
                    const imgUrl = URL.createObjectURL(imgBlob);
                    const link = document.createElement('a');
                    link.href = imgUrl;
                    link.download = file.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(imgUrl);
                };
                reader.readAsArrayBuffer(file);
            }

            // Show success message
            alert('Product added successfully!');
            productForm.reset();
            imagePreview.innerHTML = '';

        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product. Please try again.');
        } finally {
            // Reset loading state
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = 'Save Product';
        }
    });

    // Initialize category select with sample categories
    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Other'];
    const categorySelect = document.getElementById('category');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        categorySelect.appendChild(option);
    });
});
