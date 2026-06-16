import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, finalize, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserPayload {
  sub: string; // user id
  exp: number; // expiration timestamp
}

export interface User {
  id: number;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private refreshSubscription$: Observable<TokenResponse> | null = null;


  currentUser = signal<UserPayload | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.autoLogin();
  }

  register(email: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/register`, { email, password }).pipe(
      tap((res) => this.handleAuthentication(res)),
      catchError(err => throwError(() => err))
    );
  }

  login(email: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap((res) => this.handleAuthentication(res)),
      catchError(err => throwError(() => err))
    );
  }

  refresh(): Observable<TokenResponse> {
    if (this.refreshSubscription$) {
      return this.refreshSubscription$;
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.clearSession();
      return throwError(() => new Error('No refresh token available'));
    }

    this.refreshSubscription$ = this.http.post<TokenResponse>(`${this.baseUrl}/refresh`, { refresh_token: refreshToken }).pipe(
      tap((res) => {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('refresh_token', res.refresh_token);
        this.isAuthenticated.set(true);
        const decoded = this.decodeToken(res.access_token);
        this.currentUser.set(decoded);
      }),
      catchError((err) => {
        this.clearSession();
        return throwError(() => err);
      }),
      finalize(() => {
        this.refreshSubscription$ = null;
      }),
      shareReplay(1)
    );

    return this.refreshSubscription$;
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      // Best-effort logout to invalidate refresh token on backend
      this.http.post(`${this.baseUrl}/logout`, { refresh_token: refreshToken }).subscribe({
        next: () => this.clearSession(),
        error: () => this.clearSession()
      });
    } else {
      this.clearSession();
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  searchUsers(email: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/search`, { params: { email } });
  }

  private handleAuthentication(res: TokenResponse): void {
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
    this.isAuthenticated.set(true);
    const decoded = this.decodeToken(res.access_token);
    this.currentUser.set(decoded);
  }

  private autoLogin(): void {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return;

    const decoded = this.decodeToken(accessToken);
    if (!decoded) {
      this.clearSession();
      return;
    }

    // Check if access token is expired
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      // Try to silently refresh token on boot
      this.refresh().subscribe({
        error: () => this.clearSession()
      });
    } else {
      this.isAuthenticated.set(true);
      this.currentUser.set(decoded);
    }
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  private decodeToken(token: string): UserPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedPayload);
    } catch {
      return null;
    }
  }
}
