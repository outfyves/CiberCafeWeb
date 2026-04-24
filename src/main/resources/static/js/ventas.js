/**
 * ventas.js - Punto de Venta (POS) conectado a Spring Boot
 */

const API_PRODUCTOS = '/api/productos';
const API_VENTAS = '/api/ventas';

document.addEventListener('DOMContentLoaded', () => {
    CyberManager.ventas.init();
});

CyberManager.ventas = {
    inventory: [],
    cart: [],

    init: async function() {
        await this.loadInventory();
        this.renderProducts();
        this.renderInventory();
        this.updateCartUI();
        this.setupEventListeners();
    },

    loadInventory: async function() {
        try {
            const response = await fetch(API_PRODUCTOS);
            this.inventory = await response.json();
        } catch (error) {
            console.error('Error al cargar inventario:', error);
        }
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
                    <p class="price">$${prod.precio.toFixed(2)}</p>
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
                    <td>$${prod.precio.toFixed(2)}</td>
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
        const currentQtyInCart = cartItem ? cartItem.cantidad : 0;

        if (currentQtyInCart < prod.stock) {
            if (cartItem) {
                cartItem.cantidad++;
            } else {
                this.cart.push({ ...prod, cantidad: 1 });
            }
            this.updateCartUI();
        } else {
            alert('No hay suficiente stock disponible');
        }
    },

    updateCartUI: function() {
        const list = document.getElementById('cartList');
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
                    <span class="item-price">$${(item.precio * item.cantidad).toFixed(2)}</span>
                    <button class="btn-remove" onclick="removeFromCart(${index})">&times;</button>
                </div>
            `).join('');

        const total = this.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    },

    removeFromCart: function(index) {
        this.cart.splice(index, 1);
        this.updateCartUI();
    },

    processSale: async function() {
        if (this.cart.length === 0) return;

        const total = this.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const detalle = this.cart.map(item => `${item.cantidad}x ${item.nombre}`).join(', ');

        if (confirm(`¿Confirmar venta por $${total.toFixed(2)}?`)) {
            try {
                const response = await fetch(API_VENTAS, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        total: total,
                        detalle: detalle,
                        items: this.cart.map(i => ({ id: i.id, cantidad: i.cantidad }))
                    })
                });

                if (response.ok) {
                    this.cart = [];
                    await this.loadInventory();
                    this.renderProducts();
                    this.renderInventory();
                    this.updateCartUI();
                    alert('Venta procesada con éxito y stock actualizado');
                }
            } catch (error) {
                console.error('Error al procesar venta:', error);
            }
        }
    },

    restock: async function(id) {
        const cantidad = prompt('¿Cuántas unidades nuevas llegaron?', '10');
        if (cantidad && !isNaN(cantidad)) {
            try {
                const response = await fetch(`${API_PRODUCTOS}/${id}/stock?cantidad=${cantidad}`, {
                    method: 'PUT'
                });
                if (response.ok) {
                    await this.loadInventory();
                    this.renderProducts();
                    this.renderInventory();
                }
            } catch (error) {
                console.error('Error al actualizar stock:', error);
            }
        }
    }
};

// Global exports
window.addToCart = (id) => CyberManager.ventas.addToCart(id);
window.removeFromCart = (index) => CyberManager.ventas.removeFromCart(index);
window.restock = (id) => CyberManager.ventas.restock(id);
window.filterCategory = (cat) => {
    // Implementar si es necesario, por ahora recarga
    CyberManager.ventas.loadInventory().then(() => CyberManager.ventas.renderProducts());
};
