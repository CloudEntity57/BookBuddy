import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LoginRequestWithEmail } from '../../interfaces/user.interface';
import { Subscription } from 'rxjs';
import { ValidationHandler } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-auth',
  imports: [
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit, OnDestroy{
  constructor() {}
  private authService: AuthService = inject(AuthService);
  public faGoogle = faGoogle;
  public faFaceBook = faFacebook;
  public formBuilder = inject(FormBuilder);
  public router = inject(Router);
  public emailForm!: FormGroup;
  public get emailControl(): FormControl { return this.emailForm.controls['email'] as FormControl; };
  public get passwordControl(): FormControl { return this.emailForm.controls['password'] as FormControl; };

  public hidePassword = signal(true);
  public subscriptions: Array<Subscription> = [];

  public ngOnInit(): void {
    this.emailForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    })
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  public submit(){
    if(this.emailForm.invalid) return;
    const formData = this.emailForm.value;
    console.log('form data: ', formData);
    const request: LoginRequestWithEmail = {
      username: formData.email,
      password: formData.password
    }
    this.subscriptions.push(this.authService.loginWithEmail(request).subscribe({
      next: res => {
        const token: string = res.token;
        if(token){
          this.authService.initUser(token);
        }
      },
      error: err => {
        console.error('There was an error logging in: ', err);
      }
    }));
  }

  public createAccount(){
    this.router.navigate(['create-account']);
  }

  public toggleVisibility(event: MouseEvent){
    this.hidePassword.update(value => !value);
    event.preventDefault();
  }

}
