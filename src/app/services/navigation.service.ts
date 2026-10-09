import { Injectable, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

export type AppMode = 'client' | 'business';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  public currentMode = signal<AppMode>('client');
  public canGoBack = signal<boolean>(false);
  private history: string[] = [];

  constructor(
    private router: Router,
    private location: Location
  ) {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.history.push(event.urlAfterRedirects);
        this.canGoBack.set(this.history.length > 1);

        // Actualizar modo según la ruta
        if (event.urlAfterRedirects.startsWith('/business')) {
          this.currentMode.set('business');
        } else {
          this.currentMode.set('client');
        }
      });
  }

  public setMode(mode: AppMode): void {
    this.currentMode.set(mode);
    if (mode === 'business') {
      this.router.navigate(['/business/kitchen']);
    } else {
      this.router.navigate(['/menu']);
    }
  }

  public goBack(): void {
    if (this.history.length > 1) {
      this.history.pop(); // Quitar la actual
      this.location.back();
    } else {
      // Fallback
      if (this.currentMode() === 'business') {
        this.router.navigate(['/business/kitchen']);
      } else {
        this.router.navigate(['/menu']);
      }
    }
  }
}
