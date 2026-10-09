import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { NavigationService } from '../../services/navigation.service';
import { Order, OrderStatus } from '../../models/product.model';

@Component({
  selector: 'app-business-orders-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="history-page container">
      <!-- Encabezado con Navegación y Botón Volver -->
      <div class="page-top-bar">
        <div class="left-group">
          <button class="btn-back" (click)="navService.goBack()">
            <span class="arrow">⬅️</span>
            <span>Volver</span>
          </button>
          <div>
            <h1>📋 Historial de Clientes y Comandas</h1>
            <p class="subtitle">Gestión integral de órdenes, tiempos de entrega y cambio de estados.</p>
          </div>
        </div>

        <div class="business-nav-pills">
          <a routerLink="/business/kitchen" class="pill-link">👨‍🍳 Pantalla Cocina KDS</a>
          <a routerLink="/business/history" class="pill-link active">📋 Historial</a>
          <a routerLink="/business/metrics" class="pill-link">📈 Métricas</a>
        </div>
      </div>

      <!-- Filtros de Búsqueda y Estado -->
      <div class="filter-card">
        <div class="search-row">
          <div class="search-input-box">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              [ngModel]="searchQuery()" 
              (ngModelChange)="searchQuery.set($event)" 
              placeholder="Buscar por cliente, N° comanda (ej. FO-5120) o mesa..." 
              class="search-field" />
            <button *ngIf="searchQuery()" (click)="searchQuery.set('')" class="clear-btn">✕</button>
          </div>

          <div class="status-filters">
            <button 
              *ngFor="let s of statusFilterOptions" 
              class="filter-pill" 
              [class.active]="selectedStatus() === s.value"
              (click)="selectedStatus.set(s.value)">
              {{ s.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Conteo de resultados -->
      <div class="results-header">
        <span>Mostrando <strong>{{ filteredOrders().length }}</strong> comandas registradas</span>
      </div>

      <!-- Lista / Tabla de Comandas -->
      <div class="orders-grid">
        <div *ngIf="filteredOrders().length === 0" class="no-orders animate-fade-in">
          <p class="empty-emoji">🔍</p>
          <h3>No se encontraron comandas</h3>
          <p>No hay órdenes que coincidan con los filtros seleccionados.</p>
        </div>

        <div *ngFor="let order of filteredOrders()" class="history-order-card animate-fade-in">
          <div class="card-header">
            <div class="header-main">
              <span class="order-code">#{{ order.id }}</span>
              <span class="service-badge">
                {{ order.serviceType === 'MESA' ? '🍽️ Mesa ' + (order.tableNumber || '1') : '🛍️ Para Llevar' }}
              </span>
              <span *ngIf="!order.isSynced" class="badge badge-warning">Offline</span>
            </div>

            <!-- Modificador de Estado del Negocio -->
            <div class="status-selector-box">
              <label class="status-label">Estado:</label>
              <select 
                [ngModel]="order.status" 
                (ngModelChange)="onStatusChange(order.id, $event)"
                class="status-select"
                [class]="'status-' + order.status.toLowerCase()">
                <option value="RECIBIDO">🟡 Recibido</option>
                <option value="EN_PREPARACION">🔥 En Preparación</option>
                <option value="LISTO">🎉 Listo p/ Entrega</option>
                <option value="ENTREGADO">✅ Entregado</option>
                <option value="CANCELADO">❌ Cancelado</option>
              </select>
            </div>
          </div>

          <div class="card-body">
            <div class="client-meta">
              <div class="meta-item">
                <span class="meta-label">Cliente:</span>
                <strong>👤 {{ order.clientName }}</strong>
              </div>
              <div class="meta-item">
                <span class="meta-label">Hora de Registro:</span>
                <span>🕒 {{ order.createdAt | date:'short' }}</span>
              </div>
              <div class="meta-item" *ngIf="order.notes">
                <span class="meta-label">Nota:</span>
                <span class="order-notes">💬 {{ order.notes }}</span>
              </div>
            </div>

            <!-- Items del Pedido -->
            <div class="items-table">
              <div *ngFor="let item of order.items" class="item-line">
                <div class="item-name-col">
                  <span class="item-qty">{{ item.quantity }}x</span>
                  <span class="item-title">{{ item.name }}</span>
                  <div *ngIf="item.options" class="item-specials">
                    <span *ngIf="item.options.size" class="tag">📏 {{ item.options.size }}</span>
                    <span *ngFor="let ex of item.options.selectedExtras" class="tag extra">+ {{ ex.name }}</span>
                    <span *ngFor="let rm of item.options.removedIngredients" class="tag remove">❌ Sin {{ rm }}</span>
                    <span *ngIf="item.options.specialNotes" class="tag note">⚠️ {{ item.options.specialNotes }}</span>
                  </div>
                </div>
                <div class="item-price-col">
                  \${{ (item.finalUnitPrice * item.quantity).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="footer-totals">
              <span *ngIf="order.discount > 0" class="discount-pill">Desc: -\${{ order.discount.toFixed(2) }}</span>
              <span class="total-text">Total: <strong>\${{ order.total.toFixed(2) }}</strong></span>
            </div>

            <div class="quick-status-buttons">
              <button 
                *ngIf="order.status === 'RECIBIDO'" 
                class="btn-quick btn-cook" 
                (click)="onStatusChange(order.id, 'EN_PREPARACION')">
                🔥 Pasar a Cocina
              </button>
              <button 
                *ngIf="order.status === 'EN_PREPARACION'" 
                class="btn-quick btn-ready" 
                (click)="onStatusChange(order.id, 'LISTO')">
                🔔 Marcar Listo
              </button>
              <button 
                *ngIf="order.status === 'LISTO'" 
                class="btn-quick btn-deliver" 
                (click)="onStatusChange(order.id, 'ENTREGADO')">
                ✅ Entregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-page {
      padding: 24px 16px 90px 16px;
      max-width: 1200px;
    }
    .page-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .left-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #ffffff;
      border: 1px solid var(--border-color);
      padding: 10px 18px;
      border-radius: var(--radius-md);
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--dark);
      box-shadow: var(--shadow-sm);
    }
    .page-top-bar h1 {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--dark);
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .business-nav-pills {
      display: flex;
      gap: 8px;
      background: #eee;
      padding: 4px;
      border-radius: 10px;
    }
    .pill-link {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      text-decoration: none;
      color: var(--dark);
    }
    .pill-link.active {
      background: #ffffff;
      color: var(--primary);
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .filter-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 16px;
      margin-bottom: 20px;
      box-shadow: var(--shadow-sm);
    }
    .search-row {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .search-input-box {
      position: relative;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0.5;
    }
    .search-field {
      width: 100%;
      padding: 12px 42px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 0.95rem;
    }
    .clear-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: #eee;
      border-radius: 50%;
      width: 22px;
      height: 22px;
      font-size: 0.75rem;
    }
    .status-filters {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .status-filters::-webkit-scrollbar { display: none; }
    .filter-pill {
      padding: 8px 14px;
      border-radius: 999px;
      background: #f5f5f5;
      font-size: 0.85rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .filter-pill.active {
      background: var(--dark);
      color: white;
    }
    .results-header {
      margin-bottom: 16px;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px;
    }
    .history-order-card {
      background: #ffffff;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .card-header {
      padding: 14px 16px;
      background: #f9f9fa;
      border-bottom: 1px solid #ededed;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .header-main {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .order-code {
      font-weight: 800;
      color: var(--dark);
      font-size: 1.05rem;
    }
    .service-badge {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .status-selector-box {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #666;
    }
    .status-select {
      padding: 6px 10px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 0.8rem;
      border: 1px solid #ccc;
      cursor: pointer;
    }
    .status-recibido { background: #fffde7; color: #f57f17; }
    .status-en_preparacion { background: #fff3e0; color: #e65100; }
    .status-listo { background: #e8f5e9; color: #2e7d32; }
    .status-entregado { background: #e3f2fd; color: #1565c0; }
    .status-cancelado { background: #ffebee; color: #c62828; }
    .card-body {
      padding: 16px;
      flex: 1;
    }
    .client-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px dashed #eee;
      font-size: 0.85rem;
    }
    .meta-item {
      display: flex;
      gap: 6px;
      align-items: baseline;
    }
    .meta-label {
      color: var(--text-muted);
      font-weight: 600;
    }
    .order-notes {
      color: #e65100;
      font-style: italic;
    }
    .items-table {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .item-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    .item-qty {
      font-weight: 800;
      color: var(--primary);
      margin-right: 6px;
    }
    .item-title {
      font-weight: 600;
    }
    .item-specials {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 2px;
      margin-left: 18px;
    }
    .tag {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: #f0f0f0;
    }
    .tag.extra { background: #fff8e1; color: #f57f17; }
    .tag.remove { background: #ffebee; color: #d32f2f; }
    .tag.note { background: #e8f5e9; color: #2e7d32; }
    .item-price-col {
      font-weight: 700;
    }
    .card-footer {
      padding: 12px 16px;
      background: #fafafa;
      border-top: 1px solid #ededed;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .footer-totals {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .total-text {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--dark);
    }
    .total-text strong {
      color: var(--primary);
    }
    .discount-pill {
      background: #e8f5e9;
      color: #2e7d32;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .quick-status-buttons {
      display: flex;
      gap: 6px;
    }
    .btn-quick {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      color: #fff;
    }
    .btn-cook { background: #ff9800; }
    .btn-ready { background: #4caf50; }
    .btn-deliver { background: #2196f3; }
    .no-orders {
      text-align: center;
      grid-column: 1 / -1;
      padding: 50px 20px;
      background: #fff;
      border-radius: var(--radius-md);
      border: 1px dashed var(--border-color);
    }
    .empty-emoji {
      font-size: 3rem;
      margin-bottom: 8px;
    }
  `]
})
export class BusinessOrdersHistoryComponent {
  searchQuery = signal<string>('');
  selectedStatus = signal<string>('ALL');

  statusFilterOptions = [
    { label: 'Todos', value: 'ALL' },
    { label: '🟡 Recibidos', value: 'RECIBIDO' },
    { label: '🔥 En Cocina', value: 'EN_PREPARACION' },
    { label: '🎉 Listos', value: 'LISTO' },
    { label: '✅ Entregados', value: 'ENTREGADO' },
    { label: '❌ Cancelados', value: 'CANCELADO' }
  ];

  filteredOrders = computed(() => {
    let list = this.orderService.orders();
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.selectedStatus();

    if (st !== 'ALL') {
      list = list.filter(o => o.status === st);
    }

    if (q) {
      list = list.filter(o => 
        o.id.toLowerCase().includes(q) ||
        o.clientName.toLowerCase().includes(q) ||
        (o.tableNumber && o.tableNumber.includes(q))
      );
    }

    return list;
  });

  constructor(
    public orderService: OrderService,
    public navService: NavigationService
  ) {}

  onStatusChange(orderId: string, nextStatus: OrderStatus): void {
    this.orderService.updateOrderStatus(orderId, nextStatus);
  }
}
