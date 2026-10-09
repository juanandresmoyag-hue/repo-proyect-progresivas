import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { NavigationService } from '../../services/navigation.service';
import { Order, OrderStatus } from '../../models/product.model';

@Component({
  selector: 'app-kitchen-kds',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="kds-page">
      <!-- Barra superior de control de Cocina -->
      <header class="kds-header">
        <div class="container kds-header-content">
          <div class="left-group">
            <button class="btn-back-kds" (click)="navService.goBack()">
              ⬅️ Volver
            </button>
            <div class="kds-title-group">
              <h1>👨‍🍳 Pantalla de Comandas de Cocina (KDS)</h1>
              <span class="live-pulse">🔴 EN VIVO</span>
            </div>
          </div>

          <!-- Pestañas de Negocio -->
          <div class="business-nav-pills">
            <a routerLink="/business/kitchen" class="pill-link active">👨‍🍳 Cocina KDS</a>
            <a routerLink="/business/history" class="pill-link">📋 Historial</a>
            <a routerLink="/business/metrics" class="pill-link">📈 Métricas</a>
          </div>

          <div class="kds-stats">
            <div class="stat-pill stat-pending">
              <span>Recibidos:</span>
              <strong>{{ pendingOrders().length }}</strong>
            </div>
            <div class="stat-pill stat-cooking">
              <span>En Cocina:</span>
              <strong>{{ cookingOrders().length }}</strong>
            </div>
            <div class="stat-pill stat-ready">
              <span>Listos:</span>
              <strong>{{ readyOrders().length }}</strong>
            </div>
          </div>
        </div>
      </header>

      <!-- Tablero Kanban de Comandas -->
      <main class="container kds-board">
        <!-- Columna 1: Por Preparar (RECIBIDO) -->
        <section class="kds-column column-received">
          <div class="column-header">
            <h3>📥 1. Por Preparar ({{ pendingOrders().length }})</h3>
          </div>

          <div class="tickets-container">
            <div *ngIf="pendingOrders().length === 0" class="empty-column">
              <p>Sin comandas pendientes</p>
            </div>

            <div *ngFor="let order of pendingOrders()" class="kds-ticket animate-fade-in">
              <div class="ticket-top">
                <span class="ticket-id">#{{ order.id }}</span>
                <span class="ticket-service">
                  {{ order.serviceType === 'MESA' ? '🍽️ Mesa ' + (order.tableNumber || '1') : '🛍️ Llevar' }}
                </span>
              </div>
              
              <div class="ticket-client">
                👤 <strong>{{ order.clientName }}</strong>
                <small>{{ order.createdAt | date:'shortTime' }}</small>
              </div>

              <div class="ticket-items">
                <div *ngFor="let item of order.items" class="ticket-item-row">
                  <div class="item-main">
                    <span class="qty-badge">{{ item.quantity }}x</span>
                    <span class="name">{{ item.name }}</span>
                  </div>
                  <!-- Modificaciones para cocina -->
                  <div *ngIf="item.options" class="item-options">
                    <span *ngIf="item.options.size" class="opt-tag size">📏 {{ item.options.size }}</span>
                    <span *ngFor="let ext of item.options.selectedExtras" class="opt-tag extra">+ {{ ext.name }}</span>
                    <span *ngFor="let rm of item.options.removedIngredients" class="opt-tag remove">❌ SIN {{ rm }}</span>
                    <span *ngIf="item.options.specialNotes" class="opt-tag note">⚠️ {{ item.options.specialNotes }}</span>
                  </div>
                </div>
              </div>

              <div class="ticket-actions">
                <button class="btn-action btn-start" (click)="advanceStatus(order, 'EN_PREPARACION')">
                  🔥 Empezar a Cocinar
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Columna 2: En Preparación (EN_PREPARACION) -->
        <section class="kds-column column-cooking">
          <div class="column-header">
            <h3>🔥 2. En la Parrilla / Cocinando ({{ cookingOrders().length }})</h3>
          </div>

          <div class="tickets-container">
            <div *ngIf="cookingOrders().length === 0" class="empty-column">
              <p>No hay platos en la parrilla</p>
            </div>

            <div *ngFor="let order of cookingOrders()" class="kds-ticket ticket-active animate-fade-in">
              <div class="ticket-top">
                <span class="ticket-id">#{{ order.id }}</span>
                <span class="ticket-service">
                  {{ order.serviceType === 'MESA' ? '🍽️ Mesa ' + (order.tableNumber || '1') : '🛍️ Llevar' }}
                </span>
              </div>
              
              <div class="ticket-client">
                👤 <strong>{{ order.clientName }}</strong>
                <small class="time-cooking">🔥 Cocinando...</small>
              </div>

              <div class="ticket-items">
                <div *ngFor="let item of order.items" class="ticket-item-row">
                  <div class="item-main">
                    <span class="qty-badge">{{ item.quantity }}x</span>
                    <span class="name">{{ item.name }}</span>
                  </div>
                  <div *ngIf="item.options" class="item-options">
                    <span *ngIf="item.options.size" class="opt-tag size">📏 {{ item.options.size }}</span>
                    <span *ngFor="let ext of item.options.selectedExtras" class="opt-tag extra">+ {{ ext.name }}</span>
                    <span *ngFor="let rm of item.options.removedIngredients" class="opt-tag remove">❌ SIN {{ rm }}</span>
                    <span *ngIf="item.options.specialNotes" class="opt-tag note">⚠️ {{ item.options.specialNotes }}</span>
                  </div>
                </div>
              </div>

              <div class="ticket-actions">
                <button class="btn-action btn-ready" (click)="advanceStatus(order, 'LISTO')">
                  🔔 ¡Listo! (Notificar Cliente)
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Columna 3: Listos para Entrega (LISTO) -->
        <section class="kds-column column-ready">
          <div class="column-header">
            <h3>🎉 3. Listos para Entregar ({{ readyOrders().length }})</h3>
          </div>

          <div class="tickets-container">
            <div *ngIf="readyOrders().length === 0" class="empty-column">
              <p>Sin pedidos esperando entrega</p>
            </div>

            <div *ngFor="let order of readyOrders()" class="kds-ticket ticket-done animate-fade-in">
              <div class="ticket-top">
                <span class="ticket-id">#{{ order.id }}</span>
                <span class="ticket-service">
                  {{ order.serviceType === 'MESA' ? '🍽️ Mesa ' + (order.tableNumber || '1') : '🛍️ Llevar' }}
                </span>
              </div>
              
              <div class="ticket-client">
                👤 <strong>{{ order.clientName }}</strong>
                <span class="ready-stamp">LISTO</span>
              </div>

              <div class="ticket-items">
                <div *ngFor="let item of order.items" class="ticket-item-row">
                  <span class="qty-badge">{{ item.quantity }}x</span>
                  <span class="name">{{ item.name }}</span>
                </div>
              </div>

              <div class="ticket-actions">
                <button class="btn-action btn-deliver" (click)="advanceStatus(order, 'ENTREGADO')">
                  ✅ Marcar como Entregado
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .kds-page {
      background: #18181f;
      min-height: calc(100vh - 70px);
      color: #fff;
      padding-bottom: 60px;
    }
    .kds-header {
      background: #111116;
      border-bottom: 1px solid #2b2b36;
      padding: 14px 0;
      margin-bottom: 24px;
    }
    .kds-header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
    }
    .left-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-back-kds {
      background: #2a2a35;
      color: #fff;
      border: 1px solid #3c3c4a;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .btn-back-kds:hover {
      background: #3c3c4a;
    }
    .kds-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .kds-title-group h1 {
      font-size: 1.3rem;
      font-weight: 800;
      color: #fff;
    }
    .live-pulse {
      background: #d32f2f;
      color: white;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 999px;
      animation: pulse 1.5s infinite;
    }
    .business-nav-pills {
      display: flex;
      gap: 6px;
      background: #23232e;
      padding: 4px;
      border-radius: 10px;
    }
    .pill-link {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      text-decoration: none;
      color: #aaa;
    }
    .pill-link.active {
      background: #7e22ce;
      color: #ffffff;
    }
    .kds-stats {
      display: flex;
      gap: 8px;
    }
    .stat-pill {
      background: #23232e;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 0.8rem;
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .stat-pending strong { color: #fbc02d; }
    .stat-cooking strong { color: #ff7043; }
    .stat-ready strong { color: #66bb6a; }
    .kds-board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }
    .kds-column {
      background: #21212c;
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      height: calc(100vh - 190px);
      border: 1px solid #30303f;
    }
    .column-header {
      padding: 12px 16px;
      border-bottom: 1px solid #30303f;
    }
    .column-header h3 {
      font-size: 0.95rem;
      font-weight: 700;
    }
    .column-received .column-header { color: #fbc02d; border-top: 3px solid #fbc02d; border-radius: var(--radius-md) var(--radius-md) 0 0; }
    .column-cooking .column-header { color: #ff7043; border-top: 3px solid #ff7043; border-radius: var(--radius-md) var(--radius-md) 0 0; }
    .column-ready .column-header { color: #66bb6a; border-top: 3px solid #66bb6a; border-radius: var(--radius-md) var(--radius-md) 0 0; }
    .tickets-container {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .empty-column {
      text-align: center;
      padding: 40px 10px;
      color: #777;
      font-size: 0.85rem;
    }
    .kds-ticket {
      background: #ffffff;
      color: #212121;
      border-radius: 10px;
      padding: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      border-left: 5px solid #fbc02d;
    }
    .ticket-active { border-left-color: #ff7043; }
    .ticket-done { border-left-color: #66bb6a; }
    .ticket-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .ticket-id {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--primary);
    }
    .ticket-service {
      background: #f0f0f0;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
    }
    .ticket-client {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px dashed #e0e0e0;
    }
    .ready-stamp {
      background: #e8f5e9;
      color: #2e7d32;
      font-weight: 800;
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .ticket-items {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }
    .ticket-item-row {
      font-size: 0.9rem;
    }
    .item-main {
      display: flex;
      gap: 6px;
      align-items: baseline;
    }
    .qty-badge {
      font-weight: 800;
      color: var(--primary);
    }
    .name {
      font-weight: 700;
    }
    .item-options {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 3px;
      margin-left: 18px;
    }
    .opt-tag {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .opt-tag.extra { background: #fff8e1; color: #f57f17; }
    .opt-tag.remove { background: #ffebee; color: #d32f2f; }
    .opt-tag.size { background: #e3f2fd; color: #1976d2; }
    .opt-tag.note { background: #fff3e0; color: #e65100; width: 100%; }
    .ticket-actions {
      border-top: 1px solid #f0f0f0;
      padding-top: 10px;
    }
    .btn-action {
      width: 100%;
      padding: 9px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 0.85rem;
    }
    .btn-start { background: #ff9800; color: white; }
    .btn-start:hover { background: #f57c00; }
    .btn-ready { background: #4caf50; color: white; }
    .btn-ready:hover { background: #388e3c; }
    .btn-deliver { background: #2196f3; color: white; }
    .btn-deliver:hover { background: #1976d2; }
    @media (max-width: 900px) {
      .kds-board { grid-template-columns: 1fr; }
      .kds-column { height: auto; min-height: 320px; }
    }
  `]
})
export class KitchenKdsComponent {
  pendingOrders = computed(() => this.orderService.orders().filter(o => o.status === 'RECIBIDO'));
  cookingOrders = computed(() => this.orderService.orders().filter(o => o.status === 'EN_PREPARACION'));
  readyOrders = computed(() => this.orderService.orders().filter(o => o.status === 'LISTO'));

  constructor(
    public orderService: OrderService,
    public navService: NavigationService
  ) {}

  advanceStatus(order: Order, nextStatus: OrderStatus): void {
    this.orderService.updateOrderStatus(order.id, nextStatus);
  }
}
