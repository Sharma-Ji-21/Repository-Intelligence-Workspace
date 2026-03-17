import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { DashboardPageComponent } from './pages/dashboard/dashboard.page.component';
import { RepositoryAnalyticsPageComponent } from './pages/repository-analytics/repository-analytics.page.component';
import { AddRepositoryComponent } from './components/add-repository/add-repository.component';
import { RepoCardComponent } from './components/repo-card/repo-card.component';
import { ContributorCardComponent } from './components/contributor-card/contributor-card.component';

@NgModule({
  declarations: [
    App,
    DashboardPageComponent,
    RepositoryAnalyticsPageComponent,
    AddRepositoryComponent,
    RepoCardComponent,
    ContributorCardComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
