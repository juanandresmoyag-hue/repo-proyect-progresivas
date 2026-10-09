import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-business-metrics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="metrics-page container">
      <!-- Encabezado con Botón Volver -->
      <div class="page-top-bar">
        <div class="left-group">
          <button class="btn-back" (click)="navService.goBack()">
            <span class="arrow">⬅️</span>
            <span>Volver</span>
          </button>
          <div>
            <h1>📈 Métricas y Rendimiento del Restaurante</h1>
            <p class="subtitle">Panel analítico de FastOrder S.A. para toma de decisiones y control de ventas.</p>
          </div>
        </div>

        <div class="business-nav-pills">
          <a routerLink="/business/kitchen" class="pill-link">👨‍🍳 Pantalla Cocina KDS</a>
          <a routerLink="/business/history" class="pill-link">📋 Historial</a>
          <a routerLink="/business/metrics" class="pill-link active">📈 Métricas</a>
        </div>
      </div>

      <!-- Tarjetas de Métricas Clave (KPIs) -->
      <div class="kpis-grid animate-fade-in">
        <div class="kpi-card card-revenue">
          <div class="kpi-header">
            <span>💰 Ingresos Totales</span>
            <span class="badge badge-success">+12% vs ayer</span>
          </div>
          <div class="kpi-value">\${{ orderService.totalSales().toFixed(2) }}</div>
          <div class="kpi-footer">Calculado sobre comandas no canceladas</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span>📦 Total de Comandas</span>
            <span class="badge badge-info">Hoy</span>
          </div>
          <div class="kpi-value">{{ orderService.orders().length }}</div>
          <div class="kpi-footer">{{ orderService.activeOrdersCount() }} en preparación actualmente</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span>⏱️ Tiempo Promedio</span>
            <span class="badge badge-warning">Cocina</span>
          </div>
          <div class="kpi-value">11.4 min</div>
          <div class="kpi-footer">Objetivo del restaurante: &lt; 15 min</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span>🏷️ Ticket Promedio</span>
            <span class="badge badge-success">Rentabilidad</span>
          </div>
          <div class="kpi-value">\${{ averageTicket().toFixed(2) }}</div>
          <div class="kpi-footer">Por cliente en salón y delivery</div>
        </div>
      </div>

      <!-- Gráficos y Detalles -->
      <div class="metrics-details-grid animate-fade-in">
        <div class="detail-panel">
          <h3>🍔 Platos Más Vendidos de la Carta</h3>
          <div class="top-dishes-list">
            <div class="dish-row">
              <div class="dish-info">
                <span class="rank">#1</span>
                <strong>Super Fast Bacon Doble</strong>
              </div>
              <span class="dish-count">48 vendidos (42%)</span>
            </div>
            <div class="dish-progress"><div class="bar" style="width: 84%"></div></div>

            <div class="dish-row">
              <div class="dish-info">
                <span class="rank">#2</span>
                <strong>Mega Combo Dúo Fast</strong>
              </div>
              <span class="dish-count">32 vendidos (28%)</span>
            </div>
            <div class="dish-progress"><div class="bar" style="width: 58%"></div></div>

            <div class="dish-row">
              <div class="dish-info">
                <span class="rank">#3</span>
                <strong>Crispy Chicken Supreme</strong>
              </div>
              <span class="dish-count">24 vendidos (21%)</span>
            </div>
            <div class="dish-progress"><div class="bar" style="width: 42%"></div></div>
          </div>
        </div>

        <div class="detail-panel">
          <h3>⚡ Estado del Flujo Operativo</h3>
          <div class="flow-stats">
            <div class="flow-item">
              <span class="dot dot-green"></span>
              <div class="flow-text">
                <strong>98.5% Pedidos a Tiempo</strong>
                <small>Menos de 15 minutos en preparación</small>
              </div>
            </div>
            <div class="flow-item">
              <span class="dot dot-blue"></span>
              <div class="flow-text">
                <strong>100% Sincronización Offline Exitosa</strong>
                <small>Cero comandas perdidas por fallas de conexión</small>
              </div>
            </div>
            <div class="flow-item">
              <span class="dot dot-orange"></span>
              <div class="flow-text">
                <strong>86% de Clientes Instalan la PWA</strong>
                <small>Acceso directo desde pantalla de inicio</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .metrics-page {
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
    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 18px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 20px;
      box-shadow: var(--shadow-sm);
    }
    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 10px;
    }
    .kpi-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--dark);
      margin-bottom: 6px;
    }
    .card-revenue .kpi-value {
      color: var(--primary);
    }
    .kpi-footer {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .metrics-details-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 20px;
    }
    .detail-panel {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 22px;
      box-shadow: var(--shadow-sm);
    }
    .detail-panel h3 {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--dark);
      margin-bottom: 18px;
    }
    .top-dishes-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .dish-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
    }
    .dish-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .rank {
      background: #ffebee;
      color: var(--primary);
      font-weight: 800;
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .dish-count {
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.85rem;
    }
    .dish-progress {
      height: 8px;
      background: #f0f0f0;
      border-radius: 999px;
      overflow: hidden;
    }
    .dish-progress .bar {
      height: 100%;
      background: var(--primary);
      border-radius: 999px;
    }
    .flow-stats {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .flow-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-top: 4px;
    }
    .dot-green { background: #2e7d32; }
    .dot-blue { background: #1976d2; }
    .dot-orange { background: #f57c00; }
    .flow-text strong {
      display: block;
      font-size: 0.95rem;
      color: var(--dark);
    }
    .flow-text small {
      color: var(--text-muted);
      font-size: 0.8rem;
    }
    @media (max-width: 800px) {
      .metrics-details-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class BusinessMetricsComponent {
  averageTicket = computed(() => {
    const orders = this.orderService.orders().filter(o => o.status !== 'CANCELADO');
    if (orders.length === 0) return 0;
    return this.orderService.totalSales() / orders.length;
  });

  constructor(
    public orderService: OrderService,
    public navService: NavigationService
  ) {}
}
