import {Component} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
import {ActivityService, DialogService} from 'ng-metro4';
import {debounceTime, filter, switchMap} from 'rxjs/operators';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  constructor(public router: Router, private activityService: ActivityService, private swUpdate: SwUpdate,
              private dialogService: DialogService) {
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

    this.swUpdate.available.pipe(
      switchMap(() => this.dialogService.confirm('New version',
        'A new version of the application is available. Reload to update?', 'Yes', 'No'))
    ).subscribe((reload: boolean) => {
      if (reload) {
        location.reload();
      }
    });
  }
}
