import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_KEY = 'isAuthenticated';
  private readonly USER_KEY = 'currentUser';

  constructor(
    private storageService: StorageService,
    private router: Router
  ) {}

  async login(username: string, password: string): Promise<boolean> {
    if (username === 'admin' && password === 'adminadmin') {
      await this.storageService.set(this.AUTH_KEY, true);
      await this.storageService.set(this.USER_KEY, { username });
      return true;
    }
    return false;
  }

  async logout(): Promise<void> {
    await this.storageService.remove(this.AUTH_KEY);
    await this.storageService.remove(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  async isAuthenticated(): Promise<boolean> {
    const isAuth = await this.storageService.get(this.AUTH_KEY);
    return isAuth === true;
  }

  async getCurrentUser(): Promise<any> {
    return await this.storageService.get(this.USER_KEY);
  }
}
