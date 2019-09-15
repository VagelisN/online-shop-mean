import { Component } from '@angular/core';
import { AuctionsService } from '../auctions.service';

@Component({
  selector: 'app-cat-picker',
  templateUrl: './category-picker.component.html'
})
export class CategoryPickerComponent {

  constructor(private auctionsService: AuctionsService) {}

  onPickCategory() {
    this.auctionsService.getCategories(null);
  }
}
