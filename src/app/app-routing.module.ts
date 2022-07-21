import { CommonOperatorComponent } from './common-operator/common-operator.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdvancedOperatorComponent } from './advanced-operator/advanced-operator.component';

const routes: Routes = [
  { path: 'common-operators', component: CommonOperatorComponent },
  { path: 'advanced-operators', component: AdvancedOperatorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
