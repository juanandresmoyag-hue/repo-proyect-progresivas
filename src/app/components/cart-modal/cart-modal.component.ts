import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div 
      class="cart-overlay animate-fade-in" 
      *ngIf="cartService.isCartOpen()" 
      (click)="cartService.toggleCart(false)">
      
      <div class="cart-drawer" (click)="$event.stopPropagation()">
        <!-- Encabezado -->
        <div class="cart-header">
          <div class="cart-header-title">
            <h3>🛒 Tu Pedido</h3>
            <span class="count-pill">{{ cartService.itemCount() }} items</span>
          </div>
          <button class="close-btn" (click)="cartService.toggleCart(false)">✕</button>
        </div>

        <!-- Banner Offline si aplica -->
        <div *ngIf="!pwaService.isOnline()" class="offline-banner">
          📶 <strong>Modo Sin Conexión:</strong> Tu pedido se guardará en tu móvil y se enviará automáticamente a cocina al volver internet.
        </div>

        <!-- Lista de items o estado vacío -->
        <div class="cart-body">
          <div *ngIf="cartService.items().length === 0" class="empty-cart">
            <div class="empty-icon">🍽️</div>
            <h4>Tu carrito está vacío</h4>
            <p>Explora nuestro delicioso menú y añade tus hamburguesas y combos favoritos.</p>
          </div>

          <div *ngFor="let item of cartService.items()" class="cart-item">
            <img [src]="item.image" [alt]="item.name" class="item-thumb" />
            <div class="item-info">
              <div class="item-name-row">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-total">\${{ (item.finalUnitPrice * item.quantity).toFixed(2) }}</span>
              </div>
              
              <!-- Detalles personalizados -->
              <div class="item-customizations" *ngIf="item.options">
                <span *ngIf="item.options.size" class="custom-pill">📏 {{ item.options.size }}</span>
                <span *ngFor="let ext of item.options.selectedExtras" class="custom-pill">
                  + {{ ext.name }}
                </span>
                <span *ngFor="let rm of item.options.removedIngredients" class="custom-pill removed">
                  - Sin {{ rm }}
                </span>
                <span *ngIf="item.options.specialNotes" class="custom-note">
                  💬 "{{ item.options.specialNotes }}"
                </span>
              </div>

              <!-- Controles de Cantidad -->
              <div class="item-controls">
                <div class="qty-group">
                  <button (click)="cartService.updateQuantity(item.id, -1)">-</button>
                  <span>{{ item.quantity }}</span>
                  <button (click)="cartService.updateQuantity(item.id, 1)">+</button>
                </div>
                <button class="delete-btn" (click)="cartService.removeItem(item.id)">🗑️ Quitar</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario de Entrega & Totales -->
        <div class="cart-footer" *ngIf="cartService.items().length > 0">
          <div class="checkout-form">
            <div class="form-row">
              <label>Tipo de Pedido:</label>
              <div class="service-selector">
                <button 
                  type="button" 
                  [class.active]="cartService.serviceType() === 'MESA'" 
                  (click)="cartService.serviceType.set('MESA')">
                  🍽️ En Mesa
                </button>
                <button 
                  type="button" 
                  [class.active]="cartService.serviceType() === 'LLEVAR'" 
                  (click)="cartService.serviceType.set('LLEVAR')">
                  🛍️ Para Llevar
                </button>
              </div>
            </div>

            <div class="form-row form-inline">
              <div class="input-group">
                <label>Tu Nombre *</label>
                <input 
                  type="text" 
                  [value]="cartService.clientName()" 
                  (input)="cartService.clientName.set($any($event.target).value)" 
                  placeholder="Ej. Carlos Mendoza" />
              </div>
              
              <div class="input-group" *ngIf="cartService.serviceType() === 'MESA'">
                <label>N° Mesa</label>
                <select 
                  [value]="cartService.tableNumber()" 
                  (change)="cartService.tableNumber.set($any($event.target).value)">
                  <option *ngFor="let num of [1,2,3,4,5,6,7,8,9,10,11,12]" [value]="num">
                    Mesa {{ num }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Resumen de Costos -->
          <div class="summary-box">
            <div class="summary-line">
              <span>Subtotal</span>
              <span>\${{ cartService.subtotal().toFixed(2) }}</span>
            </div>
            <div class="summary-line discount" *ngIf="cartService.discount() > 0">
              <span>Descuento Especial (5%)</span>
              <span>-\${{ cartService.discount().toFixed(2) }}</span>
            </div>
            <div class="summary-line total-line">
              <span>Total a Pagar</span>
              <span class="total-amount">\${{ cartService.total().toFixed(2) }}</span>
            </div>
          </div>

          <!-- Botón de Envío a Cocina -->
          <button 
            class="submit-order-btn" 
            [disabled]="isSubmitting"
            (click)="submitOrder()">
            <span *ngIf="!isSubmitting">
              🚀 Enviar Pedido a Cocina (\${{ cartService.total().toFixed(2) }})
            </span>
            <span *ngIf="isSubmitting">Procesando comanda...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 2500;
      display: flex;
      justify-content: flex-end;
    }
    .cart-drawer {
      width: 100%;
      max-width: 460px;
      height: 100%;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 20px rgba(0,0,0,0.15);
    }
    .cart-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cart-header-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .count-pill {
      background: #ffebee;
      color: var(--primary);
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .close-btn {
      background: #f0f0f0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-weight: bold;
    }
    .offline-banner {
      background: #fff3e0;
      color: #e65100;
      padding: 10px 16px;
      font-size: 0.8rem;
      border-bottom: 1px solid #ffe0b2;
    }
    .cart-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }
    .empty-cart {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
    }
    .empty-icon {
      font-size: 3.5rem;
      margin-bottom: 12px;
    }
    .cart-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .item-thumb {
      width: 65px;
      height: 65px;
      border-radius: 8px;
      object-fit: cover;
    }
    .item-info {
      flex: 1;
    }
    .item-name-row {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 0.95rem;
    }
    .item-total {
      color: var(--primary);
    }
    .item-customizations {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin: 4px 0;
    }
    .custom-pill {
      font-size: 0.7rem;
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
      color: #555;
    }
    .custom-pill.removed {
      background: #ffebee;
      color: #d32f2f;
    }
    .custom-note {
      font-size: 0.75rem;
      color: #777;
      font-style: italic;
      width: 100%;
    }
    .item-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
    }
    .qty-group {
      display: flex;
      align-items: center;
      background: #f5f5f5;
      border-radius: 6px;
    }
    .qty-group button {
      padding: 4px 10px;
      font-weight: bold;
      background: transparent;
    }
    .qty-group span {
      padding: 0 8px;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .delete-btn {
      background: none;
      color: #888;
      font-size: 0.75rem;
    }
    .cart-footer {
      border-top: 1px solid var(--border-color);
      padding: 16px;
      background: #fafafa;
    }
    .checkout-form {
      margin-bottom: 12px;
    }
    .form-row {
      margin-bottom: 8px;
    }
    .form-row label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 4px;
    }
    .form-inline {
      display: flex;
      gap: 8px;
    }
    .input-group {
      flex: 1;
    }
    .input-group input, .input-group select {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 0.85rem;
    }
    .service-selector {
      display: flex;
      gap: 6px;
    }
    .service-selector button {
      flex: 1;
      padding: 8px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: #fff;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .service-selector button.active {
      border-color: var(--primary);
      background: #ffebee;
      color: var(--primary);
    }
    .summary-box {
      background: #ffffff;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid #eee;
      margin-bottom: 12px;
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 4px;
    }
    .summary-line.discount {
      color: #2e7d32;
      font-weight: 600;
    }
    .total-line {
      border-top: 1px dashed #eee;
      padding-top: 6px;
      margin-top: 6px;
      font-size: 1rem;
      font-weight: 800;
      color: var(--dark);
    }
    .total-amount {
      color: var(--primary);
    }
    .submit-order-btn {
      width: 100%;
      background: var(--primary);
      color: white;
      padding: 14px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 1rem;
      box-shadow: 0 4px 14px rgba(211, 47, 47, 0.35);
    }
    .submit-order-btn:hover {
      background: var(--primary-dark);
    }
  `]
})
export class CartModalComponent {
  isSubmitting = false;

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    public pwaService: PwaService,
    private router: Router
  ) {}

  submitOrder(): void {
    if (this.cartService.items().length === 0) return;

    const name = this.cartService.clientName().trim() || 'Cliente';
    const estimatedMinutes = Math.max(10, this.cartService.items().length * 4);

    this.isSubmitting = true;

    setTimeout(() => {
      const newOrder = this.orderService.placeOrder({
        clientName: name,
        serviceType: this.cartService.serviceType(),
        tableNumber: this.cartService.serviceType() === 'MESA' ? this.cartService.tableNumber() : undefined,
        items: [...this.cartService.items()],
        subtotal: this.cartService.subtotal(),
        discount: this.cartService.discount(),
        total: this.cartService.total(),
        notes: this.cartService.generalNotes().trim() || undefined,
        estimatedMinutes
      });

      this.isSubmitting = false;
      this.cartService.clearCart();
      this.cartService.toggleCart(false);

      // Redirigir a la vista de seguimiento de pedidos
      this.router.navigate(['/orders'], { queryParams: { active: newOrder.id } });
    }, 400);
  }
}
