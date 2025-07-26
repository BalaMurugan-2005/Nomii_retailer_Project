document.addEventListener('DOMContentLoaded', function() {
    // Update cart count on all pages
    function updateCartCount() {
        fetch('/get_cart_count')
            .then(response => response.json())
            .then(data => {
                const cartCount = document.getElementById('cart-count');
                if (cartCount) {
                    cartCount.textContent = data.count;
                }
            });
    }
    
    // Initialize cart count
    updateCartCount();
    
    // Add event listeners for voice ordering (if on dashboard)
    const voiceOrderBtn = document.getElementById('voiceOrderBtn');
    if (voiceOrderBtn) {
        voiceOrderBtn.addEventListener('click', startVoiceOrder);
    }
    
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const quantity = document.getElementById(`quantity-${productId}`).value;
            
            addToCart(productId, quantity);
        });
    });
    
    // Quantity change in cart
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.getAttribute('data-product-id');
            const quantity = this.value;
            
            updateCartItem(productId, quantity);
        });
    });
    
    // Remove item from cart
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            updateCartItem(productId, 0); // 0 quantity removes the item
        });
    });
    
    // Helper functions
    function addToCart(productId, quantity) {
        fetch('/add_to_cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `product_id=${productId}&quantity=${quantity}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateCartCount();
                showToast('Product added to cart!');
            } else {
                showToast('Error: ' + data.error, 'error');
            }
        })
        .catch(error => {
            showToast('Error: ' + error.message, 'error');
        });
    }
    
    function updateCartItem(productId, quantity) {
        fetch('/update_cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `product_id=${productId}&quantity=${quantity}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.reload();
            } else {
                showToast('Error updating cart: ' + data.error, 'error');
            }
        })
        .catch(error => {
            showToast('Error: ' + error.message, 'error');
        });
    }
    
    function showToast(message, type = 'success') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        // Add to container
        const toastContainer = document.getElementById('toast-container') || createToastContainer();
        toastContainer.appendChild(toast);
        
        // Initialize and show
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove after hide
        toast.addEventListener('hidden.bs.toast', function() {
            toast.remove();
        });
    }
    
    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '1100';
        
        document.body.appendChild(container);
        return container;
    }
});

// Voice order functionality
function startVoiceOrder() {
    const voiceOrderBtn = document.getElementById('voiceOrderBtn');
    const voiceOrderStatus = document.getElementById('voiceOrderStatus');
    const voiceOrderResult = document.getElementById('voiceOrderResult');
    
    voiceOrderBtn.classList.add('d-none');
    voiceOrderStatus.classList.remove('d-none');
    voiceOrderResult.innerHTML = '';
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        voiceOrderResult.innerHTML = '<div class="alert alert-danger">Voice recognition not supported in your browser</div>';
        voiceOrderBtn.classList.remove('d-none');
        voiceOrderStatus.classList.add('d-none');
        return;
    }
    
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        voiceOrderResult.innerHTML = `<div class="alert alert-info">Processing: "${transcript}"</div>`;
        
        // Send to server for processing
        fetch('/voice_order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transcript: transcript })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                voiceOrderResult.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                updateCartCount(data.cart_size);
            } else {
                voiceOrderResult.innerHTML = `<div class="alert alert-danger">Error: ${data.error}</div>`;
            }
        })
        .catch(error => {
            voiceOrderResult.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        })
        .finally(() => {
            voiceOrderBtn.classList.remove('d-none');
            voiceOrderStatus.classList.add('d-none');
        });
    };
    
    recognition.onerror = function(event) {
        voiceOrderResult.innerHTML = `<div class="alert alert-danger">Error: ${event.error}</div>`;
        voiceOrderBtn.classList.remove('d-none');
        voiceOrderStatus.classList.add('d-none');
    };
    
    recognition.start();
}

function stopVoiceOrder() {
    // This would be called by a stop button if implemented
    if (window.recognition) {
        window.recognition.stop();
    }
}

function updateCartCount(count) {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = count;
    }
}