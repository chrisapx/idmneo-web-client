import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { SmsRelayerService } from '../sms-relayer.service';
import { FspSmsAccount, SmsMessage } from '../shared/sms-relayer.models';

@Component({
  selector: 'mifosx-sms-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCard, MatCardContent, MatIcon, MatButton],
  templateUrl: './sms-dashboard.component.html',
  styleUrls: ['./sms-dashboard.component.scss']
})
export class SmsDashboardComponent implements OnInit {
  balance: FspSmsAccount | null = null;
  recentMessages: SmsMessage[] = [];
  moduleStatus: string = '';

  constructor(private smsService: SmsRelayerService) {}

  ngOnInit(): void {
    this.smsService.getModuleStatus().subscribe(status => {
      this.moduleStatus = status.status;
    });
    this.smsService.getBalance().subscribe(data => {
      this.balance = data;
    });
    this.smsService.getMessages({ page: 0, size: 5, sort: 'submittedOn,desc' }).subscribe(data => {
      this.recentMessages = data.content || [];
    });
  }
}
