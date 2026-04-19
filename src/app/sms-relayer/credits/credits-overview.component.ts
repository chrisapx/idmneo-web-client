import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { SmsRelayerService } from '../sms-relayer.service';
import { FspSmsAccount, SmsCreditTransaction } from '../shared/sms-relayer.models';

@Component({
  selector: 'mifosx-credits-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCard, MatCardContent, MatPaginator, MatIcon],
  templateUrl: './credits-overview.component.html',
  styleUrls: ['./credits-overview.component.scss']
})
export class CreditsOverviewComponent implements OnInit {
  balance: FspSmsAccount | null = null;
  transactions: SmsCreditTransaction[] = [];
  totalTransactions = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(private smsService: SmsRelayerService) {}

  ngOnInit(): void {
    this.smsService.getBalance().subscribe(data => this.balance = data);
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.smsService.getCreditTransactions(this.pageIndex, this.pageSize).subscribe(data => {
      this.transactions = data.content || [];
      this.totalTransactions = data.totalElements || 0;
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTransactions();
  }

  usagePercent(): number {
    if (!this.balance || this.balance.smsPurchased === 0) return 0;
    return Math.round((this.balance.smsUsed / this.balance.smsPurchased) * 100);
  }
}
