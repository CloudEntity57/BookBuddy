// Component TypeScript (expandable-textarea.component.ts)
import { Component, ElementRef, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expandable-textarea',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <mat-form-field 
      appearance="outline" 
      class="expandable-textarea-field"
      [class.expanded]="isExpanded">
      <textarea 
        #textareaRef
        matInput
        [formControl]="textControl"
        placeholder="Aa"
        [rows]="currentRows"
        (input)="onInput()"
        (focus)="onFocus()"
        (blur)="onBlur()"
        class="expandable-textarea">
      </textarea>
    </mat-form-field>
  `,
  styleUrl: './expandable-textarea.scss'
})
export class ExpandableTextareaComponent implements AfterViewInit {
  @ViewChild('textareaRef', { static: true }) textareaRef!: ElementRef<HTMLTextAreaElement>;
  
  @Input() initialValue: string = '';
  @Input() maxRows: number = 10;
  @Input() minRows: number = 1;
  
  @Output() valueChange = new EventEmitter<string>();
  @Output() enterPressed = new EventEmitter<string>();

  textControl = new FormControl('');
  currentRows = 1;
  isExpanded = false;
  private lineHeight = 5; // Approximate line height in pixels

  ngAfterViewInit() {
    if (this.initialValue) {
      this.textControl.setValue(this.initialValue);
      this.adjustHeight();
    }

    // Subscribe to value changes
    this.textControl.valueChanges.subscribe(value => {
      this.valueChange.emit(value || '');
    });
  }

  onInput() {
    this.adjustHeight();
  }

  onFocus() {
    this.isExpanded = true;
    this.adjustHeight();
  }

  onBlur() {
    // Only collapse if there's no content or single line
    const textarea = this.textareaRef.nativeElement;
    const lineCount = this.getLineCount(textarea.value);
    
    if (lineCount <= 1 && !textarea.value.trim()) {
      this.isExpanded = false;
      this.currentRows = 1;
    }
  }

  private adjustHeight() {
    const textarea = this.textareaRef.nativeElement;
    const value = textarea.value;
    
    if (!value.trim()) {
      this.currentRows = 1;
      return;
    }

    // Calculate required rows based on content
    const lineCount = this.getLineCount(value);
    const wrappedLines = this.getWrappedLineCount(textarea);
    
    const requiredRows = Math.max(lineCount, wrappedLines);
    this.currentRows = Math.min(Math.max(requiredRows, this.minRows), this.maxRows);
    
    // Auto-expand if content requires it
    if (this.currentRows > 1) {
      this.isExpanded = true;
    }
  }

  private getLineCount(text: string): number {
    return text.split('\n').length;
  }

  private getWrappedLineCount(textarea: HTMLTextAreaElement): number {
    // Create a temporary element to measure text wrapping
    const temp = document.createElement('div');
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.height = 'auto';
    temp.style.width = textarea.clientWidth + 'px';
    temp.style.fontSize = window.getComputedStyle(textarea).fontSize;
    temp.style.fontFamily = window.getComputedStyle(textarea).fontFamily;
    temp.style.lineHeight = window.getComputedStyle(textarea).lineHeight;
    temp.style.padding = window.getComputedStyle(textarea).padding;
    temp.style.border = window.getComputedStyle(textarea).border;
    temp.style.whiteSpace = 'pre-wrap';
    temp.style.wordWrap = 'break-word';
    
    temp.textContent = textarea.value || 'A'; // Use 'A' to ensure minimum height
    
    document.body.appendChild(temp);
    const height = temp.scrollHeight;
    document.body.removeChild(temp);
    
    return Math.max(1, Math.ceil(height / this.lineHeight));
  }

  // Public methods for external control
  public setValue(value: string) {
    this.textControl.setValue(value);
    this.adjustHeight();
  }

  public getValue(): string {
    return this.textControl.value || '';
  }

  public focus() {
    this.textareaRef.nativeElement.focus();
  }
}