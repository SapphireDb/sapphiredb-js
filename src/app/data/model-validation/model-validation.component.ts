import { Component, OnInit } from '@angular/core';
import {DefaultCollection, CreateResponse, UpdateResponse } from 'sapphiredb';
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

  constructor(private db: SapphireDbService) { }

  ngOnInit() {
    this.collection = this.db.collection('demo.validationDemos');
    this.values$ = this.collection.values();

    this.form = new M4FormGroup('demo_form', {
      id: new FormControl(null),
      username: new FormControl(''),
      email: new FormControl(''),
      password: new FormControl('')
    });
  }

  resetForm() {
    this.form.patchValue({
      id: null,
      username: '',
      email: '',
      password: ''
    });
  }

  setFormValue(value: any) {
    this.form.patchValue(value);
  }

  remove(value: any) {
    this.collection.remove(value);
  }

  store() {
    const rawFormValue = this.form.getRawValue();

    let result$: Observable<CreateResponse|UpdateResponse>;

    if (!!rawFormValue.id) {
      result$ = <Observable<UpdateResponse>>this.collection.update(rawFormValue);
    } else {
      delete rawFormValue.id;
      result$ = <Observable<CreateResponse>>this.collection.add(rawFormValue);
    }

    result$.pipe(take(1)).subscribe((results: CreateResponse|UpdateResponse) => {
      if (!results.error && !results.validationResults) {
        this.resetForm();
      } else {
        Object.keys(results.validationResults).forEach(key => {
          const errors = {};
          results.validationResults[key].forEach(error => errors[error] = true);
          this.form.get(key).setErrors(errors);
        });
      }
    });
  }
}
