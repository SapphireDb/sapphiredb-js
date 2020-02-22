import { Component, OnInit } from '@angular/core';
import {DefaultCollection, CreateRangeResponse, UpdateRangeResponse, SapphireOfflineEntity} from 'sapphiredb';
import { SapphireDbService} from 'ng-sapphiredb';
import {Observable} from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';
import {take} from 'rxjs/operators';
import {M4FormGroup} from 'ng-metro4';

@Component({
  selector: 'app-model-validation',
  templateUrl: './model-validation.component.html',
  styleUrls: ['./model-validation.component.less']
})
export class ModelValidationComponent implements OnInit {

  collection: DefaultCollection<any>;
  values$: Observable<any[]>;

  form: FormGroup;
  formEntity: any = null;

  constructor(private db: SapphireDbService) { }

  ngOnInit() {
    this.collection = this.db.collection('demo.validationDemos');
    this.values$ = this.collection.values();

    this.form = new M4FormGroup('demo_form', {
      id: new FormControl(new SapphireOfflineEntity().id),
      username: new FormControl(''),
      email: new FormControl(''),
      password: new FormControl('')
    });
  }

  resetForm() {
    this.formEntity = null;
    this.form.patchValue({
      id: new SapphireOfflineEntity().id,
      username: '',
      email: '',
      password: ''
    });
  }

  setFormValue(value: any) {
    this.formEntity = value;
    this.form.patchValue(value);
  }

  remove(value: any) {
    this.collection.remove(value);
  }

  store() {
    const rawFormValue = this.form.getRawValue();

    let result$: Observable<CreateRangeResponse|UpdateRangeResponse>;

    if (this.formEntity) {
      result$ = <Observable<UpdateRangeResponse>>this.collection.update(rawFormValue);
    } else {
      result$ = <Observable<CreateRangeResponse>>this.collection.add(rawFormValue);
    }

    result$.pipe(take(1)).subscribe((results: CreateRangeResponse|UpdateRangeResponse) => {
      const result = results.results[0];
      if (!result.error && !result.validationResults) {
        this.resetForm();
      } else {
        Object.keys(result.validationResults).forEach(key => {
          const errors = {};
          result.validationResults[key].forEach(error => errors[error] = true);
          this.form.get(key).setErrors(errors);
        });
      }
    });
  }
}
