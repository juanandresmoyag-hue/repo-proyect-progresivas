import { Routes } from '@angular/router';
import { MenuComponent } from './components/menu/menu.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { OrdersTrackerComponent } from './components/orders-tracker/orders-tracker.component';
import { ClientProfileComponent } from './components/client-profile/client-profile.component';
import { KitchenKdsComponent } from './components/kitchen-kds/kitchen-kds.component';
import { BusinessOrdersHistoryComponent } from './components/business-orders-history/business-orders-history.component';
import { BusinessMetricsComponent } from './components/business-metrics/business-metrics.component';

export const routes: Routes = [
  // Redirección por defecto al menú del cliente
  { path: '', redirectTo: 'menu', pathMatch: 'full' },

  // Espacio del Cliente
  { path: 'menu', component: MenuComponent, title: 'Menú | FastOrder S.A.' },
  { path: 'product/:id', component: ProductDetailComponent, title: 'Detalle de Producto | FastOrder S.A.' },
  { path: 'my-orders', component: OrdersTrackerComponent, title: 'Mis Pedidos | FastOrder S.A.' },
  { path: 'profile', component: ClientProfileComponent, title: 'Mi Perfil | FastOrder S.A.' },

  // Espacio del Negocio / Restaurante
  { path: 'business', redirectTo: 'business/kitchen', pathMatch: 'full' },
  { path: 'business/kitchen', component: KitchenKdsComponent, title: 'Cocina KDS | FastOrder S.A.' },
  { path: 'business/history', component: BusinessOrdersHistoryComponent, title: 'Historial de Clientes | FastOrder S.A.' },
  { path: 'business/metrics', component: BusinessMetricsComponent, title: 'Métricas de Negocio | FastOrder S.A.' },

  // Rutas legacy / fallback
  { path: 'orders', redirectTo: 'my-orders', pathMatch: 'full' },
  { path: 'kitchen', redirectTo: 'business/kitchen', pathMatch: 'full' },
  { path: '**', redirectTo: 'menu' }
];
