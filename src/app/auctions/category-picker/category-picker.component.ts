import { Component } from '@angular/core';
import { AuctionsService } from '../auctions.service';
import { Categories } from './../category.model';

@Component({
  selector: 'app-cat-picker',
  templateUrl: './category-picker.component.html'
})
export class CategoryPickerComponent {

  categories: Categories[];

  constructor(private auctionsService: AuctionsService) {}


  onPickCategory() {
    this.auctionsService.getCategories(null)
      .subscribe( res => {
        this.categories = res.categories;
      });
  }
}
