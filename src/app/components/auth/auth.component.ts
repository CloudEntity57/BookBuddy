import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-auth',
  imports: [
    MatButtonModule,
    FontAwesomeModule
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  constructor(private authService: AuthService) {}
  public faGoogle = faGoogle;
  public faFaceBook = faFacebook;
  public loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  public loginWithFacebook() {
  }

}
