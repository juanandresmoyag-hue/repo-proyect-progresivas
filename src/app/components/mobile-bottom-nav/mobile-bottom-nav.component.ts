import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-mobile-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="mobile-bottom-bar" *ngIf="navService.currentMode() === 'client'">
      <a routerLink="/menu" routerLinkActive="active" class="m-nav-item">
        <span class="m-icon">📋</span>
        <span class="m-label">Menú</span>
      </a>

      <a routerLink="/my-orders" routerLinkActive="active" class="m-nav-item">
        <span class="m-icon">📦</span>
        <span class="m-label">Mis Pedidos</span>
        <span *ngIf="orderService.activeOrdersCount() > 0" class="m-badge">
          {{ orderService.activeOrdersCount() }}
        </span>
      </a>

      <button class="m-nav-item m-cart-trigger" (click)="cartService.toggleCart(true)">
        <span class="m-icon">🛒</span>
        <span class="m-label">Carrito</span>
        <span *ngIf="cartService.itemCount() > 0" class="m-badge cart-badge">
          {{ cartService.itemCount() }}
        </span>
      </button>

      <a routerLink="/profile" routerLinkActive="active" class="m-nav-item">
        <span class="m-icon">👤</span>
        <span class="m-label">Mi Perfil</span>
      </a>
    </nav>

    <!-- Barra móvil para Negocio -->
    <nav class="mobile-bottom-bar business-bar" *ngIf="navService.currentMode() === 'business'">
      <a routerLink="/business/kitchen" routerLinkActive="active" class="m-nav-item">
        <span class="m-icon">👨‍🍳</span>
        <span class="m-label">Cocina KDS</span>
      </a>

      <a routerLink="/business/history" routerLinkActive="active" class="m-nav-item">
        <span class="m-icon">📋</span>
        <span class="m-label">Historial</span>
      </a>

      <a routerLink="/business/metrics" routerLinkActive="active" class="m-nav-item">
        <span class="m-icon">📈</span>
        <span class="m-label">Métricas</span>
      </a>
    </nav>
  `,
  styles: [`
    .mobile-bottom-bar {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: #ffffff;
      border-top: 1px solid var(--border-color);
      box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
      z-index: 1500;
      padding: 0 8px;
    }
    .m-nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      color: #666;
      font-size: 0.72rem;
      font-weight: 700;
      position: relative;
      background: none;
      border: none;
      padding: 6px 0;
      cursor: pointer;
    }
    .m-icon {
      font-size: 1.35rem;
      line-height: 1;
      margin-bottom: 2px;
    }
    .m-nav-item.active {
      color: var(--primary);
    }
    .business-bar .m-nav-item.active {
      color: #7e22ce;
    }
    .m-badge {
      position: absolute;
      top: 4px;
      right: 22%;
      background: var(--primary);
      color: white;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 999px;
    }
    .cart-badge {
      background: var(--accent);
      color: #000;
    }
    @media (max-width: 768px) {
      .mobile-bottom-bar {
        display: flex;
        align-items: center;
      }
    }
  `]
})
export class MobileBottomNavComponent {
  constructor(
    public navService: NavigationService,
    public cartService: CartService,
    public orderService: OrderService
  ) {}
}
