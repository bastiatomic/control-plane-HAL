import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap, timeout } from 'rxjs';

import { apiUrl } from './api';
import { AuthUser, UserRole } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storageKey = 'hal-control-plane-user';
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.readStoredUser());

  readonly user$ = this.userSubject.asObservable();

  get user() {
    return this.userSubject.value;
  }

  isAuthenticated() {
    return Boolean(this.userSubject.value);
  }

  login(email: string, password: string) {
    return this.http.post<AuthUser>(apiUrl('/session'), { email, password }).pipe(
      timeout({ first: 5_000 }),
      tap((user) => this.setUser(user)),
    );
  }

  logout() {
    localStorage.removeItem(this.storageKey);
    this.userSubject.next(null);
    this.router.navigateByUrl('/login');
  }

  setActiveRole(role: UserRole) {
    const user = this.userSubject.value;

    if (!user || !user.roles.includes(role)) {
      return;
    }

    this.setUser({ ...user, activeRole: role });
  }

  private setUser(user: AuthUser) {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.userSubject.next(user);
  }

  private readStoredUser() {
    const stored = localStorage.getItem(this.storageKey);

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
