import { Component } from '@angular/core';
import { AuctionsService } from '../auctions.service';
import { Categories } from './../category.model';

@Component({
  selector: 'app-cat-picker',
  templateUrl: './category-picker.component.html'
})
export class CategoryPickerComponent {

  categories: Categories[][] = [[], [], [], [], [], [], []];

  constructor(private auctionsService: AuctionsService) {}

  onPickCategory(parentId: string, categoryLevel: number) {
    this.auctionsService.getCategories(parentId)
      .subscribe( res => {
        this.categories[categoryLevel] = res.categories;
      });
  }

  onCategoryChosen(id: string) {
    this.auctionsService.findPath(id).subscribe(res => {
      console.log(res.path);
    });
  }
}
