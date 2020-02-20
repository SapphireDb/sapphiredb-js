import {Component} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
import {ActivityService, DialogService, ToastService} from 'ng-metro4';
import {debounceTime, distinctUntilChanged, filter, skip, switchMap} from 'rxjs/operators';
import {SwUpdate} from '@angular/service-worker';
import {SapphireDbService} from 'ng-sapphiredb';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  enableAnalytics = true;
  showConsent: boolean;

  constructor(public router: Router, private activityService: ActivityService, private swUpdate: SwUpdate,
              private dialogService: DialogService, private db: SapphireDbService, private toastService: ToastService) {
    this.db.online().pipe(debounceTime(100), distinctUntilChanged()).subscribe((state) => {
      if (state) {
        this.toastService.create('The application is online');
      } else {
        this.toastService.create('The application is offline');
      }
    });

    this.showConsent = !localStorage.getItem('docs_consent_showed');

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

        if (event instanceof NavigationEnd) {
          (<any>window).ga('set', 'page', event.urlAfterRedirects);
          (<any>window).ga('send', 'pageview');
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

  closeConsent(setDisableAnalyticsCookie: boolean) {
    localStorage.setItem('docs_consent_showed', 'true');
    this.showConsent = false;

    if (setDisableAnalyticsCookie) {
      document.cookie = 'ga-disable-UA-155987289-1=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/';
    }
  }
}
