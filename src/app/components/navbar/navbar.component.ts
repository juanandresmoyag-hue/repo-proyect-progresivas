import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PwaService } from '../../services/pwa.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="main-header">
      <div class="container header-container">
        <!-- Bloque Izquierdo: Volver y Logo -->
        <div class="left-section">
          <!-- Botón Global de Retroceso -->
          <button 
            *ngIf="navService.canGoBack()" 
            class="global-back-btn" 
            (click)="navService.goBack()"
            title="Volver a la página anterior">
            ⬅️ <span class="btn-text">Volver</span>
          </button>

          <!-- Logo -->
          <a routerLink="/menu" class="brand-link">
            <span class="brand-emoji">🍔</span>
            <div class="brand-titles">
              <span class="brand-main">FastOrder<span class="brand-dot">.SA</span></span>
              <span class="brand-sub">PWA Progresiva</span>
            </div>
          </a>
        </div>

        <!-- Bloque Central: Selector de Espacio (Cliente vs Negocio) -->
        <div class="mode-switcher-wrap">
          <div class="mode-pill">
            <button 
              type="button" 
              class="mode-btn" 
              [class.active]="navService.currentMode() === 'client'"
              (click)="navService.setMode('client')">
              👤 Cliente
            </button>
            <button 
              type="button" 
              class="mode-btn mode-business" 
              [class.active]="navService.currentMode() === 'business'"
              (click)="navService.setMode('business')">
              🏢 Negocio
            </button>
          </div>
        </div>

        <!-- Bloque Derecho: Estado de Red, Enlaces y Carrito -->
        <div class="right-section">
          <!-- Estado de Red -->
          <div class="network-badge" [class.offline]="!pwaService.isOnline()">
            <span class="status-dot"></span>
            <span class="network-text">{{ pwaService.isOnline() ? 'Online' : 'Offline' }}</span>
          </div>

          <!-- Sincronización pendiente -->
          <button 
            *ngIf="orderService.pendingSyncCount() > 0" 
            class="sync-pill-btn animate-fade-in" 
            (click)="orderService.syncOfflineOrders()"
            title="Sincronizar pedidos pendientes">
            🔄 {{ orderService.pendingSyncCount() }}
          </button>

          <!-- Enlaces Desktop para Modo Cliente -->
          <nav class="desktop-nav" *ngIf="navService.currentMode() === 'client'">
            <a routerLink="/menu" routerLinkActive="active" class="nav-link">
              <span>📋 Menú</span>
            </a>
            <a routerLink="/my-orders" routerLinkActive="active" class="nav-link">
              <span>📦 Mis Pedidos</span>
              <span *ngIf="orderService.activeOrdersCount() > 0" class="nav-badge">
                {{ orderService.activeOrdersCount() }}
              </span>
            </a>
            <a routerLink="/profile" routerLinkActive="active" class="nav-link">
              <span>👤 Perfil</span>
            </a>
          </nav>

          <!-- Enlaces Desktop para Modo Negocio -->
          <nav class="desktop-nav business-nav" *ngIf="navService.currentMode() === 'business'">
            <a routerLink="/business/kitchen" routerLinkActive="active" class="nav-link">
              <span>👨‍🍳 Cocina (KDS)</span>
            </a>
            <a routerLink="/business/history" routerLinkActive="active" class="nav-link">
              <span>📋 Historial Clientes</span>
            </a>
            <a routerLink="/business/metrics" routerLinkActive="active" class="nav-link">
              <span>📈 Métricas</span>
            </a>
          </nav>

          <!-- Botón de Carrito Desplegable -->
          <button 
            *ngIf="navService.currentMode() === 'client'" 
            class="cart-trigger-btn" 
            (click)="cartService.toggleCart(true)">
            <span class="c-icon">🛒</span>
            <span class="c-label">Mi Pedido</span>
            <span *ngIf="cartService.itemCount() > 0" class="c-badge">
              {{ cartService.itemCount() }}
            </span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .main-header {
      background: #ffffff;
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    .header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
      gap: 12px;
    }
    .left-section {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .global-back-btn {
      background: #f4f4f5;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 7px 12px;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--dark);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }
    .global-back-btn:hover {
      background: #e4e4e7;
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: inherit;
    }
    .brand-emoji {
      font-size: 1.8rem;
    }
    .brand-titles {
      display: flex;
      flex-direction: column;
    }
    .brand-main {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--primary);
      line-height: 1.1;
      letter-spacing: -0.5px;
    }
    .brand-dot {
      color: var(--dark);
    }
    .brand-sub {
      font-size: 0.7rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .mode-switcher-wrap {
      display: flex;
      align-items: center;
    }
    .mode-pill {
      display: flex;
      background: #f0f0f2;
      padding: 4px;
      border-radius: 999px;
      border: 1px solid #e4e4e7;
    }
    .mode-btn {
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 0.82rem;
      font-weight: 700;
      color: #666;
      background: transparent;
      transition: all 0.2s;
    }
    .mode-btn.active {
      background: var(--primary);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(211, 47, 47, 0.3);
    }
    .mode-business.active {
      background: #7e22ce;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(126, 34, 206, 0.3);
    }
    .right-section {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .network-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      background: #e8f5e9;
      color: #2e7d32;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #2e7d32;
    }
    .network-badge.offline {
      background: #fff3e0;
      color: #e65100;
    }
    .network-badge.offline .status-dot {
      background: #e65100;
    }
    .sync-pill-btn {
      background: #f57c00;
      color: white;
      padding: 5px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      border-radius: 8px;
      text-decoration: none;
      color: var(--dark);
      font-weight: 700;
      font-size: 0.88rem;
      position: relative;
    }
    .nav-link:hover, .nav-link.active {
      background: #f4f4f5;
      color: var(--primary);
    }
    .business-nav .nav-link:hover, .business-nav .nav-link.active {
      background: #faf5ff;
      color: #7e22ce;
    }
    .nav-badge {
      background: var(--primary);
      color: white;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 999px;
      margin-left: 2px;
    }
    .cart-trigger-btn {
      background: var(--primary);
      color: white;
      padding: 9px 16px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
    }
    .cart-trigger-btn:hover {
      background: var(--primary-dark);
    }
    .c-badge {
      background: var(--accent);
      color: #1e1e24;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 999px;
    }
    @media (max-width: 900px) {
      .desktop-nav { display: none; }
      .brand-sub { display: none; }
      .c-label { display: none; }
      .btn-text { display: none; }
    }
    @media (max-width: 500px) {
      .network-text { display: none; }
      .header-container { height: 60px; }
      .brand-main { font-size: 1.05rem; }
    }
  `]
})
export class NavbarComponent {
  constructor(
    public pwaService: PwaService,
    public cartService: CartService,
    public orderService: OrderService,
    public notifService: NotificationService,
    public navService: NavigationService
  ) {}
}
