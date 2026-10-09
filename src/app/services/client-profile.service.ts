import { Injectable, signal } from '@angular/core';

export interface ClientProfile {
  name: string;
  phone: string;
  email: string;
  preferredService: 'MESA' | 'LLEVAR' | 'AUTOSERVICIO';
  preferredTable: string;
  deliveryAddress: string;
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientProfileService {
  private readonly STORAGE_KEY = 'fastorder_client_profile';

  public profile = signal<ClientProfile>({
    name: 'Carlos Mendoza',
    phone: '+593 99 123 4567',
    email: 'carlos.mendoza@email.com',
    preferredService: 'MESA',
    preferredTable: '4',
    deliveryAddress: 'Av. Principal #102 y Calle Sol',
    notes: 'Alergia leve a la mostaza'
  });

  constructor() {
    this.loadProfile();
  }

  private loadProfile(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        try {
          this.profile.set(JSON.parse(saved));
        } catch {}
      }
    }
  }

  public updateProfile(updated: Partial<ClientProfile>): void {
    const current = { ...this.profile(), ...updated };
    this.profile.set(current);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
    }
  }
}
