import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-message-bar',
  imports: [],
  templateUrl: './message-bar.component.html',
  styleUrl: './message-bar.component.scss'
})
export class MessageBarComponent {
  constructor(private changeDetector: ChangeDetectorRef){}
  public isOpen: boolean = false;
  public toggleBar(isOpen: boolean): void {
    if(!isOpen){
      this.isOpen = true;
      // this.changeDetector.detectChanges();
    }else{
      this.isOpen = false;
    }
  }
}
