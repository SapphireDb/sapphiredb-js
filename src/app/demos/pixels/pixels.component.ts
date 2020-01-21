import { Component, OnInit } from '@angular/core';
import {DefaultCollection} from 'sapphiredb';
import {Observable} from 'rxjs';
import {take} from 'rxjs/operators';
import {Lists} from 'ng-metro4';
import { SapphireDb } from 'ng-sapphiredb';

interface Pixel {
  id?: string;
  color: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-pixels',
  templateUrl: './pixels.component.html',
  styleUrls: ['./pixels.component.less']
})
export class PixelsComponent implements OnInit {

  size = 10;
  showLabels = false;

  private collection: DefaultCollection<Pixel>;
  public pixels$: Observable<Pixel[]>;

  constructor(private db: SapphireDb) {
    this.collection = this.db.collection<Pixel>('demo.pixels');
    this.pixels$ = this.collection.orderBy('x').thenOrderBy('y').values();
  }

  changeColor(pixel: Pixel, change: number) {
    const allColors = Lists.colors();
    let colorIndex = allColors.indexOf(pixel.color);
    colorIndex = (colorIndex + change) % allColors.length;

    if (colorIndex < 0) {
      colorIndex = allColors.length - 1;
    }

    this.collection.update({
      ...pixel,
      color: allColors[colorIndex]
    });
    return false;
  }

  reset(pixels: Pixel[]) {
    const updateValues: Pixel[] = pixels.map((pixel) => {
      return {
        ...pixel,
        color: 'darkBlue'
      };
    });

    this.collection.update(...updateValues);
  }

  delete(pixels: Pixel[]) {
    this.collection.remove(...pixels);
  }

  ngOnInit() {
  }

}
