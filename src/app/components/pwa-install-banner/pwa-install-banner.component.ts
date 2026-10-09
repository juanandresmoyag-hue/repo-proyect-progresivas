import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-pwa-install-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Banner de Instalación PWA -->
    <div *ngIf="pwaService.isInstallable() && !dismissed" class="pwa-banner animate-fade-in">
      <div class="banner-content container">
        <div class="banner-left">
          <div class="app-icon">🍔</div>
          <div class="banner-text">
            <strong>Instala FastOrder en tu Móvil</strong>
            <span>Pide más rápido, recibe ofertas exclusivas y úsalo sin internet.</span>
          </div>
        </div>
        <div class="banner-actions">
          <button class="install-btn" (click)="install()">📲 Instalar App</button>
          <button class="dismiss-btn" (click)="dismiss()">✕</button>
        </div>
      </div>
    </div>

    <!-- Banner de Actualización Disponible -->
    <div *ngIf="pwaService.hasUpdate()" class="update-banner animate-fade-in">
      <div class="banner-content container">
        <span>🎉 Hay una nueva versión de FastOrder disponible con mejoras.</span>
        <button class="update-btn" (click)="pwaService.reloadToUpdate()">Actualizar Ahora</button>
      </div>
    </div>
  `,
  styles: [`
    .pwa-banner {
      background: linear-gradient(90deg, #1e1e24 0%, #2b2c34 100%);
      color: white;
      padding: 10px 0;
      border-bottom: 2px solid var(--accent);
    }
    .update-banner {
      background: var(--primary);
      color: white;
      padding: 8px 0;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .banner-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .banner-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .app-icon {
      font-size: 1.6rem;
      background: #ffffff;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .banner-text {
      display: flex;
      flex-direction: column;
      font-size: 0.85rem;
    }
    .banner-text strong {
      font-size: 0.95rem;
      color: var(--accent);
    }
    .banner-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .install-btn {
      background: var(--accent);
      color: #1e1e24;
      font-weight: 800;
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 0.85rem;
    }
    .install-btn:hover {
      background: var(--accent-hover);
    }
    .dismiss-btn {
      background: transparent;
      color: #aaa;
      font-size: 1rem;
      padding: 4px 8px;
    }
    .update-btn {
      background: white;
      color: var(--primary);
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 6px;
      margin-left: 10px;
      font-size: 0.8rem;
    }
    @media (max-width: 600px) {
      .banner-text span { display: none; }
    }
  `]
})
export class PwaInstallBannerComponent {
  dismissed = false;

  constructor(public pwaService: PwaService) {}

  install(): void {
    this.pwaService.installApp();
  }

  dismiss(): void {
    this.dismissed = true;
  }
}
