import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Route } from '../core/route/route.service';

import { SmsDashboardComponent } from './dashboard/sms-dashboard.component';
import { MessageListComponent } from './messages/message-list.component';
import { CreditsOverviewComponent } from './credits/credits-overview.component';
import { SendSmsComponent } from './send/send-sms.component';

const routes: Routes = [
  Route.withShell([
    {
      path: 'sms-relayer',
      data: { title: 'SMS Relayer', breadcrumb: 'SMS Relayer' },
      children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        {
          path: 'dashboard',
          component: SmsDashboardComponent,
          data: { title: 'SMS Dashboard', breadcrumb: 'Dashboard' }
        },
        {
          path: 'send',
          component: SendSmsComponent,
          data: { title: 'Send SMS', breadcrumb: 'Send' }
        },
        {
          path: 'messages',
          component: MessageListComponent,
          data: { title: 'Message History', breadcrumb: 'Messages' }
        },
        {
          path: 'credits',
          component: CreditsOverviewComponent,
          data: { title: 'SMS Credits', breadcrumb: 'Credits' }
        }
      ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SmsRelayerRoutingModule {}
