import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard/dashboard.page.component';
import { RepositoryAnalyticsPageComponent } from './pages/repository-analytics/repository-analytics.page.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'repository/:id', component: RepositoryAnalyticsPageComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
