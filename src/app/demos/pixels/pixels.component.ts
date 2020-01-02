import { Component, OnInit } from '@angular/core';
import {DefaultCollection, SapphireDb} from 'ng-sapphiredb';
import {Observable} from 'rxjs';
import {take} from 'rxjs/operators';
import {Lists} from 'ng-metro4';

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

    this.pixels$.pipe(take(1)).subscribe((pixels) => {
      if (pixels.length === 0) {
        const values: Pixel[] = [];

        for (let x = 0; x < this.size; x++) {
          for (let y = 0; y < this.size; y++) {
            values.push({
              color: 'darkBlue',
              x: x,
              y: y
            });
          }
        }

        this.collection.add(...values);
      }
    });
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
