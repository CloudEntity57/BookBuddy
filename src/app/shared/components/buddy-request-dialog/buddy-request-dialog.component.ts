import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

interface DialogData{
  name: string;
  requestNote: string;
}

@Component({
  selector: 'app-buddy-request-dialog',
  imports: [    
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,  ],
  templateUrl: './buddy-request-dialog.component.html',
  styleUrl: './buddy-request-dialog.component.scss'
})
export class BuddyRequestDialogComponent {
  readonly dialogRef = inject(MatDialogRef<BuddyRequestDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly buddyNote = model(this.data.requestNote);
  sendRequest(): void {
    this.dialogRef.close(this.buddyNote);
  }
  onNoClick(): void{
    this.dialogRef.close();
  }
}
