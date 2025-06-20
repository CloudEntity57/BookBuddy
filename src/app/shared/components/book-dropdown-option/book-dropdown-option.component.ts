import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { OpenLibraryBookResults, OpenLibraryBookSearchInfo } from '../../../interfaces/book.interface';
import { BaseBook } from '../../../components/base-book';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-book-dropdown-option',
  imports: [ MatSelectModule, MatInputModule, MatAutocompleteModule, ],
  templateUrl: './book-dropdown-option.component.html',
  styleUrl: './book-dropdown-option.component.scss'
})
export class BookDropdownOptionComponent extends BaseBook{
  constructor(router: Router){
    super(router);
  }
  @Input() books_input!: Array<OpenLibraryBookSearchInfo>;


}

