import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-auth',
  imports: [],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  constructor(private authService: AuthService) {}

  public loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  public loginWithFacebook() {
  }

}
