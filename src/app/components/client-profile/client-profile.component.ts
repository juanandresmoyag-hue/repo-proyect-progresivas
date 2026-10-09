import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClientProfileService, ClientProfile } from '../../services/client-profile.service';
import { OrderService } from '../../services/order.service';
import { NavigationService } from '../../services/navigation.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="profile-page container">
      <!-- Navegación Superior con Botón Volver -->
      <div class="top-nav-bar">
        <button class="btn-back" (click)="navService.goBack()">
          <span class="arrow">⬅️</span>
          <span>Volver</span>
        </button>
        <span class="header-tag">👤 Mi Perfil de Cliente</span>
      </div>

      <div class="profile-grid animate-fade-in">
        <!-- Columna Izquierda: Tarjeta de Datos Personales -->
        <div class="profile-card">
          <div class="avatar-header">
            <div class="avatar-circle">👤</div>
            <div class="avatar-title">
              <h2>{{ profileForm.name || 'Cliente FastOrder' }}</h2>
              <span class="member-badge">⭐ Cliente Frecuente</span>
            </div>
          </div>

          <form (ngSubmit)="saveProfile()" class="form-body">
            <div class="form-group">
              <label>Nombre Completo</label>
              <input type="text" [(ngModel)]="profileForm.name" name="name" required class="input-control" />
            </div>

            <div class="form-group">
              <label>Teléfono de Contacto (para avisos de pedido)</label>
              <input type="tel" [(ngModel)]="profileForm.phone" name="phone" class="input-control" />
            </div>

            <div class="form-group">
              <label>Correo Electrónico</label>
              <input type="email" [(ngModel)]="profileForm.email" name="email" class="input-control" />
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Preferencia de Pedido</label>
                <select [(ngModel)]="profileForm.preferredService" name="preferredService" class="input-control">
                  <option value="MESA">🍽️ Comer en Mesa</option>
                  <option value="LLEVAR">🛍️ Para Llevar</option>
                  <option value="AUTOSERVICIO">🚗 Auto-Servicio</option>
                </select>
              </div>

              <div class="form-group flex-1" *ngIf="profileForm.preferredService === 'MESA'">
                <label>Mesa Habitual</label>
                <select [(ngModel)]="profileForm.preferredTable" name="preferredTable" class="input-control">
                  <option *ngFor="let m of [1,2,3,4,5,6,7,8,9,10,11,12]" [value]="m">Mesa {{ m }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Preferencias o Alergias Alimentarias</label>
              <input type="text" [(ngModel)]="profileForm.notes" name="notes" placeholder="Ej. Sin cebolla, alérgico al maní..." class="input-control" />
            </div>

            <div class="actions-row">
              <button type="submit" class="btn-save">
                💾 Guardar Cambios
              </button>
              <span *ngIf="savedMessage" class="save-feedback animate-fade-in">
                ✅ Guardado correctamente
              </span>
            </div>
          </form>
        </div>

        <!-- Columna Derecha: Resumen de Actividad y Notificaciones -->
        <div class="stats-column">
          <div class="card-box">
            <h3>📱 Ajustes de la App PWA</h3>
            <div class="setting-item">
              <div>
                <strong>Notificaciones Push</strong>
                <p class="setting-desc">Recibe avisos cuando tu comida esté en la parrilla o lista.</p>
              </div>
              <button class="btn-toggle-notif" (click)="enableNotifs()">
                {{ notifService.permissionStatus() === 'granted' ? '✅ Activas' : '🔔 Activar' }}
              </button>
            </div>
          </div>

          <div class="card-box">
            <h3>📊 Resumen de Compras</h3>
            <div class="client-stats-grid">
              <div class="stat-box">
                <span class="stat-number">{{ orderService.orders().length }}</span>
                <span class="stat-label">Pedidos Realizados</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ orderService.activeOrdersCount() }}</span>
                <span class="stat-label">Pedidos en Proceso</span>
              </div>
            </div>

            <div class="quick-links">
              <a routerLink="/my-orders" class="link-btn">
                📦 Ver Seguimiento de Mis Pedidos
              </a>
              <a routerLink="/menu" class="link-btn secondary">
                🍔 Ir al Menú de Productos
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding: 24px 16px 90px 16px;
      max-width: 1000px;
    }
    .top-nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-color);
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
    .header-tag {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--dark);
    }
    .profile-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 28px;
    }
    .profile-card, .card-box {
      background: #ffffff;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      padding: 24px;
    }
    .avatar-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
    }
    .avatar-circle {
      font-size: 2.5rem;
      background: #ffebee;
      width: 65px;
      height: 65px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .avatar-title h2 {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--dark);
    }
    .member-badge {
      background: #fff8e1;
      color: #f57f17;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      display: inline-block;
      margin-top: 4px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 6px;
    }
    .input-control {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      background: #fafafa;
    }
    .input-control:focus {
      background: #fff;
      border-color: var(--primary);
    }
    .form-row {
      display: flex;
      gap: 12px;
    }
    .flex-1 { flex: 1; }
    .actions-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 20px;
    }
    .btn-save {
      background: var(--primary);
      color: white;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.95rem;
      box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
    }
    .btn-save:hover { background: var(--primary-dark); }
    .save-feedback {
      color: #2e7d32;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .stats-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 14px;
    }
    .setting-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .btn-toggle-notif {
      background: #ffebee;
      color: var(--primary);
      font-weight: 700;
      padding: 8px 14px;
      border-radius: 8px;
    }
    .client-stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 16px 0;
    }
    .stat-box {
      background: #f9f9fa;
      padding: 14px;
      border-radius: 10px;
      text-align: center;
      border: 1px solid #ededed;
    }
    .stat-number {
      display: block;
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--primary);
    }
    .stat-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .quick-links {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .link-btn {
      display: block;
      text-align: center;
      background: var(--dark);
      color: white;
      text-decoration: none;
      padding: 12px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .link-btn.secondary {
      background: #f0f0f0;
      color: var(--dark);
    }
    @media (max-width: 768px) {
      .profile-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ClientProfileComponent implements OnInit {
  profileForm: ClientProfile = {
    name: '',
    phone: '',
    email: '',
    preferredService: 'MESA',
    preferredTable: '1',
    deliveryAddress: '',
    notes: ''
  };
  savedMessage = false;

  constructor(
    private profileService: ClientProfileService,
    public orderService: OrderService,
    public navService: NavigationService,
    public notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.profileForm = { ...this.profileService.profile() };
  }

  saveProfile(): void {
    this.profileService.updateProfile(this.profileForm);
    this.savedMessage = true;
    setTimeout(() => this.savedMessage = false, 3000);
  }

  enableNotifs(): void {
    this.notifService.requestPermission();
  }
}
