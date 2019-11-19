import {Component} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
import {ActivityService} from 'ng-metro4';
import {debounceTime, filter} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  constructor(private router: Router, private activityService: ActivityService) {
    let activity;

    this.router.events.pipe(
      filter(v => v instanceof NavigationStart || v instanceof NavigationEnd ||
        v instanceof NavigationError || v instanceof NavigationCancel), debounceTime(50))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          if (activity) {
            return;
          }

          activity = this.activityService.open({
            type: 'square',
            style: 'color',
            overlayColor: '#fff',
            overlayAlpha: .1,
            autoHide: 0,
            text: '<div class="mt-2 text-small">Loading ...</div>'
          });
        } else {
          window.scroll(0, 0);

          if (activity) {
            this.activityService.close(activity);
            activity = null;
          }
        }
      });
  }
}
