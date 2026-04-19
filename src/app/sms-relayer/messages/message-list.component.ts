import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { SmsRelayerService } from '../sms-relayer.service';
import { SmsMessage } from '../shared/sms-relayer.models';

@Component({
  selector: 'mifosx-message-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCard, MatCardContent, MatFormField, MatLabel, MatInput,
    MatSelect, MatOption, MatPaginator, MatIcon, MatButton, MatIconButton
  ],
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements OnInit {
  messages: SmsMessage[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  filterStatus = '';
  filterPhone = '';
  filterSearch = '';

  statusOptions = ['', 'PENDING', 'SENT', 'DELIVERED', 'FAILED', 'RETRY'];

  constructor(private smsService: SmsRelayerService) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.smsService.getMessages({
      status: this.filterStatus || undefined,
      phoneNumber: this.filterPhone || undefined,
      search: this.filterSearch || undefined,
      page: this.pageIndex,
      size: this.pageSize,
      sort: 'submittedOn,desc'
    }).subscribe(data => {
      this.messages = data.content || [];
      this.totalElements = data.totalElements || 0;
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMessages();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadMessages();
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterPhone = '';
    this.filterSearch = '';
    this.pageIndex = 0;
    this.loadMessages();
  }
}
