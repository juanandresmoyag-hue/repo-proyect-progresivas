import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'business';
  phone?: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'fastorder_auth_session';

  public currentUser = signal<UserSession | null>(null);

  public isLoggedIn = computed(() => this.currentUser() !== null);
  public isBusinessUser = computed(() => this.currentUser()?.role === 'business');
  public isClientUser = computed(() => this.currentUser()?.role === 'client');

  constructor(private router: Router) {
    this.loadSession();
  }

  private loadSession(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        try {
          this.currentUser.set(JSON.parse(saved));
        } catch {}
      } else {
        // Sesión por defecto como Cliente para navegación instantánea
        const defaultClient: UserSession = {
          id: 'usr-client-1',
          name: 'Carlos Mendoza',
          email: 'carlos.mendoza@email.com',
          role: 'client',
          phone: '+593 99 123 4567',
          avatar: '👤'
        };
        this.currentUser.set(defaultClient);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultClient));
      }
    }
  }

  public login(email: string, role: 'client' | 'business', name?: string): void {
    const user: UserSession = {
      id: 'usr-' + Date.now(),
      name: name || (role === 'business' ? 'Administrador FastOrder' : 'Cliente Registrado'),
      email: email.trim().toLowerCase(),
      role: role,
      phone: '+593 98 765 4321',
      avatar: role === 'business' ? '👨‍🍳' : '👤'
    };

    this.currentUser.set(user);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }

    if (role === 'business') {
      this.router.navigate(['/business/kitchen']);
    } else {
      this.router.navigate(['/menu']);
    }
  }

  public logout(): void {
    this.currentUser.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.router.navigate(['/login']);
  }
}
