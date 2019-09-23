import { Component, ViewChild } from '@angular/core';
import { AuctionsService } from '../auctions.service';
import { Categories } from './../category.model';
import { MatMenuTrigger } from '@angular/material';

@Component({
  selector: 'app-cat-picker',
  templateUrl: './category-picker.component.html',
  styleUrls: ['./category-picker.component.css']
})
export class CategoryPickerComponent {

  categories: Categories[][] = [[], [], [], [], [], [], []];

  @ViewChild(MatMenuTrigger, null) trigger: MatMenuTrigger;

  constructor(private auctionsService: AuctionsService) {}

  onPickCategory(parentId: string, categoryLevel: number) {
    this.auctionsService.getCategories(parentId)
      .subscribe( res => {
        this.categories[categoryLevel] = res.categories;
      });
  }

  onCategoryChosen(id: string) {
    this.auctionsService.findPath(id);
  }

  onNextLevel(id: string) {
    this.trigger.openMenu();
  }
}
