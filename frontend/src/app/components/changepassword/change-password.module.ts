import { NgModule } from '@angular/core';
import { ChangePasswordComponent } from './changepassword.component';

@NgModule({
  imports: [
    ChangePasswordComponent // Just import the standalone component
  ],
  exports: [
    ChangePasswordComponent
  ]
})
export class ChangePasswordModule {}
