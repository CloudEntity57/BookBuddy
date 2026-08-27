import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { ProgressBarService } from '../../services/progress-bar.service';

@Component({
  selector: 'app-create-account',
  imports: [
    MatButtonModule,
    MatInputModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule
],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss'
})
export class CreateAccountComponent implements OnInit, OnDestroy{
  constructor() {}
  private authService: AuthService = inject(AuthService);
  private progressBarService: ProgressBarService = inject(ProgressBarService);
  public faGoogle = faGoogle;
  public faFaceBook = faFacebook;
  public formBuilder = inject(FormBuilder);
  public router = inject(Router);
  public emailForm!: FormGroup;
  public subscriptions: Array<Subscription> = [];
  public get emailController(): FormControl { return this.emailForm.controls['email'] as FormControl; };
  public get userNameController(): FormControl { return this.emailForm.controls['userName'] as FormControl; };
  public get passwordController(): FormControl { return this.emailForm.controls['password'] as FormControl; };

  public hidePassword = signal(true);


  public ngOnInit(): void {
    this.emailForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      userName: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)])
    })
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  public submit(){
    console.log(`password: ${this.passwordController.value}`)
    if(this.emailForm.invalid) return;
    const formData = this.emailForm.value;
    console.log('form data: ', formData)
    this.progressBarService.startProgressBar();
    this.subscriptions.push(this.authService.registerEmailAccount(formData).subscribe({
      next: res => {
        console.log('registered new user: ', res)
        const authToken = res.token;
        if(authToken){
          this.authService.initUser(authToken);
        } else {
          console.error('No auth token found in the callback URL.');
          // Handle error, maybe redirect to an error page or show a message
        }
      },
      error: err => {
        console.log('error submitting user data: ', err)
        this.progressBarService.stopProgressBar();
      }
    }));
  }

  public toggleVisibility(event: MouseEvent){
    this.hidePassword.update(value => !value);
    event.preventDefault();
  }


}
