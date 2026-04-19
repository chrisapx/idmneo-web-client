import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { PipesModule } from '../pipes/pipes.module';

import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AmountCollectedPieComponent } from './dashboard/amount-collected-pie/amount-collected-pie.component';
import { AmountDisbursedPieComponent } from './dashboard/amount-disbursed-pie/amount-disbursed-pie.component';
import { ClientTrendsBarComponent } from './dashboard/client-trends-bar/client-trends-bar.component';
import { TranslateModule } from '@ngx-translate/core';
import { WarningDialogComponent } from './warning-dialog/warning-dialog.component';
import { SessionTimeoutDialogComponent } from './timeout-dialog/session-timeout-dialog.component';

@NgModule({
  imports: [
    MatDialogModule,
    SharedModule,
    PipesModule,
    HomeRoutingModule,
    TranslateModule,
    HomeComponent,
    DashboardComponent,
    AmountCollectedPieComponent,
    AmountDisbursedPieComponent,
    ClientTrendsBarComponent,
    WarningDialogComponent,
    SessionTimeoutDialogComponent
  ],
  providers: []
})
export class HomeModule {}
