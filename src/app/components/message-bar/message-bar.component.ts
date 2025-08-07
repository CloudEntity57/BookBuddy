import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-message-bar',
  imports: [],
  templateUrl: './message-bar.component.html',
  styleUrl: './message-bar.component.scss'
})
export class MessageBarComponent {
  constructor(){}
  public isOpen: boolean = false;
  public toggleBar(isOpen: boolean): void {
    if(!isOpen){
      this.isOpen = true;
    }else{
      this.isOpen = false;
    }
  }
}
