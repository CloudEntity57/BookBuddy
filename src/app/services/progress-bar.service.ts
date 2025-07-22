import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressBarService {
  public isLoading = new BehaviorSubject<boolean>(false);
  constructor() { }
  public startProgressBar(): void{
    this.isLoading.next(true);
  }
  public stopProgressBar(): void{
    this.isLoading.next(false);
  }
}
