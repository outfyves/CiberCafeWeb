/**
 * ventas.js - Punto de Venta (POS) e Inventario
 * Gestión de productos, carrito y stock
 */

document.addEventListener('DOMContentLoaded', () => {
    CyberManager.ventas.init();
});

CyberManager.ventas = {
    // Inventario inicial (se priorizará el de localStorage si existe)
    inventory: [
        { id: 1, nombre: 'Coca Cola 600ml', categoria: 'bebidas', precio: 18.00, stock: 24, icono: 'fa-wine-bottle' },
        { id: 2, nombre: 'Papas Originales', categoria: 'snacks', precio: 15.00, stock: 10, icono: 'fa-cookie' },
        { id: 3, nombre: 'Agua Natural', categoria: 'bebidas', precio: 12.00, stock: 5, icono: 'fa-tint' },
        { id: 4, nombre: 'Galletas Chispas', categoria: 'snacks', precio: 14.00, stock: 15, icono: 'fa-cookie-bite' }
    ],
    cart: [],

    init: function() {
        this.loadData();
        this.renderProducts();
        this.renderInventory();
        this.updateCartUI();
        this.setupEventListeners();
    },

    loadData: function() {
        const savedInventory = localStorage.getItem('cyber_inventory');
        if (savedInventory) {
            this.inventory = JSON.parse(savedInventory);
        }
    },

    saveData: function() {
        localStorage.setItem('cyber_inventory', JSON.stringify(this.inventory));
    },

    setupEventListeners: function() {
        const btnProcess = document.getElementById('processSaleBtn');
        if (btnProcess) btnProcess.addEventListener('click', () => this.processSale());
        
        const btnClear = document.getElementById('clearCartBtn');
        if (btnClear) btnClear.addEventListener('click', () => {
            this.cart = [];
            this.updateCartUI();
        });
    },

    renderProducts: function() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        grid.innerHTML = this.inventory.map(prod => `
            <div class="product-card ${prod.stock <= 0 ? 'out-of-stock' : ''}" 
                 onclick="${prod.stock > 0 ? `addToCart(${prod.id})` : ''}">
                <div class="product-icon"><i class="fas ${prod.icono}"></i></div>
                <div class="product-info">
                    <h4>${prod.nombre}</h4>
                    <p class="price">${CyberManager.utils.formatMoney(prod.precio)}</p>
                    <p class="stock-tag">Stock: ${prod.stock}</p>
                </div>
                ${prod.stock <= 0 ? '<div class="badge-oos">Agotado</div>' : ''}
            </div>
        `).join('');
    },

    renderInventory: function() {
        const table = document.getElementById('inventoryTable');
        if (!table) return;

        table.innerHTML = this.inventory.map(prod => {
            const lowStock = prod.stock <= 5;
            return `
                <tr>
                    <td><strong>${prod.nombre}</strong></td>
                    <td><span class="category-tag">${prod.categoria}</span></td>
                    <td>${CyberManager.utils.formatMoney(prod.precio)}</td>
                    <td><span class="${lowStock ? 'text-danger fw-bold' : ''}">${prod.stock}</span></td>
                    <td>
                        <span class="status-pill ${lowStock ? 'bg-warning' : 'bg-success'}">
                            ${lowStock ? 'Stock Bajo' : 'Normal'}
                        </span>
                    </td>
                    <td>
                        <button onclick="restock(${prod.id})" class="btn-sm btn-outline-primary">
                            <i class="fas fa-plus"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    addToCart: function(id) {
        const prod = this.inventory.find(p => p.id === id);
        if (!prod || prod.stock <= 0) return;

        const cartItem = this.cart.find(item => item.id === id);
        
        // Verificar que no agregue más de lo que hay en stock
        const currentQtyInCart = cartItem ? cartItem.cantidad : 0;
        if (currentQtyInCart < prod.stock) {
            if (cartItem) {
                cartItem.cantidad++;
            } else {
                this.cart.push({ ...prod, cantidad: 1 });
            }
            this.updateCartUI();
            CyberManager.ui.showMessage('success', `Agregado: ${prod.nombre}`);
        } else {
            CyberManager.ui.showMessage('error', 'No hay suficiente stock disponible');
        }
    },

    updateCartUI: function() {
        const list = document.getElementById('cartList');
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');
        if (!list) return;

        list.innerHTML = this.cart.length === 0 
            ? '<p class="text-center text-muted">El carrito está vacío</p>'
            : this.cart.map((item, index) => `
                <div class="cart-item">
                    <div class="item-details">
                        <span class="item-name">${item.nombre}</span>
                        <span class="item-qty">x${item.cantidad}</span>
                    </div>
                    <span class="item-price">${CyberManager.utils.formatMoney(item.precio * item.cantidad)}</span>
                    <button class="btn-remove" onclick="removeFromCart(${index})">&times;</button>
                </div>
            `).join('');

        const subtotal = this.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const total = subtotal; // Sin impuestos por ahora
        
        if (subtotalEl) subtotalEl.textContent = CyberManager.utils.formatMoney(subtotal);
        if (totalEl) totalEl.textContent = CyberManager.utils.formatMoney(total);
    },

    clearCart: function() {
        this.cart = [];
        this.updateCartUI();
        CyberManager.ui.showMessage('info', 'Carrito vaciado');
    },

    removeFromCart: function(index) {
        this.cart.splice(index, 1);
        this.updateCartUI();
    },

    processSale: function() {
        if (this.cart.length === 0) {
            CyberManager.ui.showMessage('error', 'El carrito está vacío');
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const confirmMsg = `¿Confirmar venta de ${CyberManager.utils.formatMoney(total)}?`;

        if (confirm(confirmMsg)) {
            // Descontar del inventario real
            this.cart.forEach(item => {
                const prod = this.inventory.find(p => p.id === item.id);
                if (prod) prod.stock -= item.cantidad;
            });

            this.saveData();
            this.cart = [];
            this.updateCartUI();
            this.renderProducts();
            this.renderInventory();
            
            CyberManager.ui.showMessage('success', 'Venta procesada. Stock actualizado');
        }
    },

    restock: function(id) {
        const prod = this.inventory.find(p => p.id === id);
        const cantidad = parseInt(prompt(`Actualizar stock de ${prod.nombre}. ¿Cuántas unidades nuevas llegaron?`, "10"));
        
        if (!isNaN(cantidad) && cantidad > 0) {
            prod.stock += cantidad;
            this.saveData();
            this.renderProducts();
            this.renderInventory();
            CyberManager.ui.showMessage('success', 'Inventario actualizado');
        }
    },

    filterCategory: function(category) {
        // Actualizar tabs activos
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        // Filtrar productos
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        const filtered = category === 'todos' 
            ? this.inventory 
            : this.inventory.filter(p => p.categoria === category);

        grid.innerHTML = filtered.map(prod => `
            <div class="product-card ${prod.stock <= 0 ? 'out-of-stock' : ''}" 
                 onclick="${prod.stock > 0 ? `addToCart(${prod.id})` : ''}">
                <div class="product-icon"><i class="fas ${prod.icono}"></i></div>
                <div class="product-info">
                    <h4>${prod.nombre}</h4>
                    <p class="price">${CyberManager.utils.formatMoney(prod.precio)}</p>
                    <p class="stock-tag">Stock: ${prod.stock}</p>
                </div>
                ${prod.stock <= 0 ? '<div class="badge-oos">Agotado</div>' : ''}
            </div>
        `).join('');
    }
};

// Exportar funciones al scope global para usar en onclick
window.addToCart = (id) => CyberManager.ventas.addToCart(id);
window.removeFromCart = (index) => CyberManager.ventas.removeFromCart(index);
window.filterCategory = (category) => CyberManager.ventas.filterCategory(category);
window.restock = (id) => CyberManager.ventas.restock(id);