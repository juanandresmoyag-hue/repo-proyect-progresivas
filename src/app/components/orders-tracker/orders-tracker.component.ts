import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { PwaService } from '../../services/pwa.service';
import { NavigationService } from '../../services/navigation.service';
import { OrderStatus } from '../../models/product.model';

@Component({
  selector: 'app-orders-tracker',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="tracker-page container">
      <!-- Barra Superior con Botón Volver -->
      <div class="page-top-bar">
        <div class="left-group">
          <button class="btn-back" (click)="navService.goBack()">
            <span class="arrow">⬅️</span>
            <span>Volver</span>
          </button>
          <div>
            <h1>📦 Estado de Mis Pedidos</h1>
            <p class="subtitle">Sigue en tiempo real la preparación de tus alimentos en FastOrder S.A.</p>
          </div>
        </div>

        <button 
          *ngIf="orderService.pendingSyncCount() > 0" 
          class="manual-sync-btn"
          (click)="orderService.syncOfflineOrders()">
          🔄 Sincronizar ({{ orderService.pendingSyncCount() }} en cola)
        </button>
      </div>

      <!-- Alerta si hay pedidos generados offline -->
      <div *ngIf="orderService.pendingSyncCount() > 0" class="offline-warning-card animate-fade-in">
        <div class="warning-icon">📶</div>
        <div class="warning-info">
          <strong>Tienes pedidos pendientes de sincronización</strong>
          <p>Se crearon mientras no tenías conexión. Se transmitirán automáticamente a la cocina cuando te conectes a internet.</p>
        </div>
      </div>

      <!-- Si no hay pedidos registrados -->
      <div *ngIf="orderService.orders().length === 0" class="empty-orders animate-fade-in">
        <div class="empty-illustration">📋</div>
        <h2>Aún no tienes pedidos registrados</h2>
        <p>Visita nuestro menú, escoge tu hamburguesa favorita y envíala a cocina.</p>
        <a routerLink="/menu" class="cta-menu-btn">Ver Menú FastOrder</a>
      </div>

      <!-- Lista de Pedidos del Cliente -->
      <div class="orders-list">
        <div 
          *ngFor="let order of orderService.orders()" 
          class="order-card animate-fade-in"
          [class.highlight-active]="activeOrderId === order.id">
          
          <!-- Cabecera del pedido -->
          <div class="order-header">
            <div class="order-main-info">
              <span class="order-id">Orden #{{ order.id }}</span>
              <span class="order-date">{{ order.createdAt | date:'shortTime' }}</span>
              <span class="service-pill">
                {{ order.serviceType === 'MESA' ? '🍽️ Mesa ' + (order.tableNumber || '1') : '🛍️ Para Llevar' }}
              </span>
            </div>

            <div class="order-badges">
              <span 
                *ngIf="!order.isSynced" 
                class="badge badge-warning" 
                title="Guardado localmente, pendiente de enviar a cocina">
                ⏳ Pendiente de Enviar
              </span>
              <span 
                *ngIf="order.isSynced" 
                class="badge badge-success">
                ✓ Recibido en Cocina
              </span>
            </div>
          </div>

          <!-- Stepper Visual del Estado del Pedido -->
          <div class="stepper-container">
            <div class="step-bar">
              <div 
                class="step-progress" 
                [style.width.%]="getProgressPercentage(order.status)">
              </div>
            </div>

            <div class="steps-labels">
              <div class="step" [class.completed]="isStepDone(order.status, 'RECIBIDO')">
                <div class="step-circle">1</div>
                <span>Recibido</span>
              </div>
              <div class="step" [class.completed]="isStepDone(order.status, 'EN_PREPARACION')">
                <div class="step-circle">2</div>
                <span>En Cocina 🔥</span>
              </div>
              <div class="step" [class.completed]="isStepDone(order.status, 'LISTO')">
                <div class="step-circle">3</div>
                <span>¡Listo! 🎉</span>
              </div>
              <div class="step" [class.completed]="isStepDone(order.status, 'ENTREGADO')">
                <div class="step-circle">4</div>
                <span>Entregado ✅</span>
              </div>
            </div>
          </div>

          <!-- Items y detalles -->
          <div class="order-details-box">
            <div class="items-summary">
              <h4>Detalle de la Comanda:</h4>
              <div *ngFor="let item of order.items" class="ticket-item">
                <span class="item-qty">{{ item.quantity }}x</span>
                <span class="item-title">{{ item.name }}</span>
                <span class="item-cost">\${{ (item.finalUnitPrice * item.quantity).toFixed(2) }}</span>
              </div>
            </div>

            <div class="ticket-footer">
              <div class="client-tag">Cliente: <strong>{{ order.clientName }}</strong></div>
              <div class="total-tag">Total: <strong>\${{ order.total.toFixed(2) }}</strong></div>
            </div>
          </div>

          <!-- Estado especial para el cliente -->
          <div class="order-action-footer">
            <div *ngIf="order.status === 'RECIBIDO'" class="status-tip tip-recibido">
              ⏱️ Tiempo estimado: ~{{ order.estimatedMinutes }} minutos. La cocina está por procesar tu orden.
            </div>
            <div *ngIf="order.status === 'EN_PREPARACION'" class="status-tip tip-cocinando">
              👨‍🍳 El equipo de cocina está asando y ensamblando tu comida en este momento.
            </div>
            <div *ngIf="order.status === 'LISTO'" class="status-tip tip-listo">
              🔔 <strong>¡Tu pedido está listo!</strong> Acércate al mostrador de entrega o espera en tu mesa.
            </div>
            <div *ngIf="order.status === 'ENTREGADO'" class="status-tip tip-entregado">
              ⭐ ¡Pedido completado! Gracias por disfrutar en FastOrder S.A.
            </div>
            <div *ngIf="order.status === 'CANCELADO'" class="status-tip tip-cancelado">
              ❌ Este pedido fue cancelado.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracker-page {
      padding: 24px 16px 90px 16px;
      max-width: 1000px;
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
    .manual-sync-btn {
      background: var(--warning);
      color: white;
      padding: 8px 16px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .offline-warning-card {
      background: #fff8e1;
      border: 1px solid #ffe082;
      padding: 14px 18px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
    }
    .warning-icon {
      font-size: 1.8rem;
    }
    .warning-info strong {
      color: #b78103;
      font-size: 0.95rem;
    }
    .warning-info p {
      color: #6d4c00;
      font-size: 0.85rem;
      margin-top: 2px;
    }
    .empty-orders {
      text-align: center;
      padding: 60px 20px;
      background: #fff;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }
    .empty-illustration {
      font-size: 4rem;
      margin-bottom: 12px;
    }
    .cta-menu-btn {
      display: inline-block;
      margin-top: 18px;
      background: var(--primary);
      color: white;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      text-decoration: none;
    }
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .order-card {
      background: #ffffff;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      padding: 20px;
    }
    .order-card.highlight-active {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.2);
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .order-main-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .order-id {
      font-weight: 800;
      font-size: 1.15rem;
      color: var(--dark);
    }
    .order-date {
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .service-pill {
      background: #f0f0f0;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .stepper-container {
      position: relative;
      margin: 24px 0;
      padding: 0 10px;
    }
    .step-bar {
      position: absolute;
      top: 15px;
      left: 30px;
      right: 30px;
      height: 4px;
      background: #e0e0e0;
      z-index: 1;
    }
    .step-progress {
      height: 100%;
      background: var(--primary);
      transition: width 0.4s ease;
    }
    .steps-labels {
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 2;
    }
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: #aaa;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.85rem;
      transition: all 0.3s ease;
    }
    .step.completed {
      color: var(--dark);
    }
    .step.completed .step-circle {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }
    .order-details-box {
      background: #f9f9fa;
      border-radius: 10px;
      padding: 14px;
      margin: 16px 0;
    }
    .items-summary h4 {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 8px;
    }
    .ticket-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
      margin-bottom: 4px;
    }
    .item-qty {
      font-weight: 800;
      color: var(--primary);
      margin-right: 6px;
    }
    .item-title {
      flex: 1;
      font-weight: 600;
    }
    .item-cost {
      font-weight: 700;
    }
    .ticket-footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px dashed #e0e0e0;
      padding-top: 8px;
      margin-top: 8px;
      font-size: 0.95rem;
    }
    .total-tag strong {
      color: var(--primary);
      font-size: 1.15rem;
    }
    .status-tip {
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
    }
    .tip-recibido { background: #e3f2fd; color: #0d47a1; }
    .tip-cocinando { background: #fff3e0; color: #e65100; }
    .tip-listo { background: #e8f5e9; color: #1b5e20; border: 1px solid #c8e6c9; }
    .tip-entregado { background: #f5f5f5; color: #616161; }
    .tip-cancelado { background: #ffebee; color: #c62828; }
  `]
})
export class OrdersTrackerComponent implements OnInit {
  activeOrderId: string | null = null;

  constructor(
    public orderService: OrderService,
    public pwaService: PwaService,
    public navService: NavigationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.activeOrderId = params['active'] || null;
    });
  }

  getProgressPercentage(status: OrderStatus): number {
    switch (status) {
      case 'RECIBIDO': return 0;
      case 'EN_PREPARACION': return 50;
      case 'LISTO': return 85;
      case 'ENTREGADO': return 100;
      default: return 0;
    }
  }

  isStepDone(orderStatus: OrderStatus, step: OrderStatus): boolean {
    const ranks: Record<OrderStatus, number> = {
      'RECIBIDO': 1,
      'EN_PREPARACION': 2,
      'LISTO': 3,
      'ENTREGADO': 4,
      'CANCELADO': 0
    };
    return (ranks[orderStatus] || 0) >= (ranks[step] || 0);
  }
}
