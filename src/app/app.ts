import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CartModalComponent } from './components/cart-modal/cart-modal.component';
import { PwaInstallBannerComponent } from './components/pwa-install-banner/pwa-install-banner.component';
import { MobileBottomNavComponent } from './components/mobile-bottom-nav/mobile-bottom-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    CartModalComponent,
    PwaInstallBannerComponent,
    MobileBottomNavComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'FastOrder S.A. PWA';
}
