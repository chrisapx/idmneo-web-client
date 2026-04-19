import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatProgressBar } from '@angular/material/progress-bar';
import { SmsRelayerService } from '../sms-relayer.service';
import * as ExcelJS from 'exceljs';

@Component({
  selector: 'mifosx-send-sms',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCard, MatCardContent, MatFormField, MatLabel, MatHint,
    MatInput, MatButton, MatIconButton, MatIcon, MatSnackBarModule,
    MatTabGroup, MatTab, MatProgressBar
  ],
  templateUrl: './send-sms.component.html',
  styleUrls: ['./send-sms.component.scss']
})
export class SendSmsComponent implements OnInit {
  // Business name prefix
  businessName = '';
  prefixLength = 0;

  // ─── Single Send ───
  phoneNumber = '';
  message = '';
  scheduled = false;
  scheduledAt = '';
  sending = false;
  lastResult: any = null;

  // ─── Bulk Send ───
  bulkMessages: BulkRow[] = [];
  bulkSending = false;
  bulkProgress = 0;
  bulkResults: any = null;
  bulkResultRows: BulkResultRow[] = [];
  bulkFileName = '';

  // Credits
  balance = 0;

  // Phone mockup status bar
  previewTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  constructor(
    private smsService: SmsRelayerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.smsService.getBalance().subscribe(data => {
      this.balance = data.balance;
      this.businessName = data.fspName || '';
      this.prefixLength = this.businessName ? `${this.businessName}: `.length : 0;
    });
  }

  // ─── Character / Credit Calculations ───

  get fullMessage(): string {
    if (!this.message) return '';
    return this.businessName ? `${this.businessName}: ${this.message}` : this.message;
  }

  get totalCharCount(): number { return this.fullMessage.length; }

  get segmentCount(): number {
    const len = this.totalCharCount;
    if (len === 0) return 0;
    if (len <= 160) return 1;
    return Math.ceil(len / 153);
  }

  get creditCost(): number { return this.segmentCount; }

  get messageCharCount(): number { return this.message.length; }

  get maxMessageChars(): number {
    // First segment: 160 - prefix. Concat segments: 153 each.
    return 160 - this.prefixLength;
  }

  // Bulk helpers
  bulkSegments(msg: string): number {
    const full = this.businessName ? `${this.businessName}: ${msg}` : msg;
    const len = full.length;
    if (len === 0) return 0;
    if (len <= 160) return 1;
    return Math.ceil(len / 153);
  }

  get totalBulkCredits(): number {
    return this.bulkMessages.reduce((sum, row) => sum + this.bulkSegments(row.message), 0);
  }

  get validBulkRows(): number {
    return this.bulkMessages.filter(r => r.contact && r.message).length;
  }

  // ─── Single Send ───

  send(): void {
    if (!this.phoneNumber || !this.message) return;
    this.sending = true;
    this.lastResult = null;

    this.smsService.sendSms({
      phoneNumber: this.phoneNumber,
      message: this.fullMessage
    }).subscribe({
      next: (result) => {
        this.lastResult = result;
        this.sending = false;
        if (result.status === 'SENT' || result.status === 'PENDING') {
          this.snackBar.open('SMS sent successfully', 'OK', { duration: 3000 });
          this.phoneNumber = '';
          this.message = '';
        } else {
          this.snackBar.open('SMS failed: ' + (result.errorMessage || 'Unknown error'), 'OK', { duration: 5000 });
        }
      },
      error: () => {
        this.sending = false;
        this.snackBar.open('Failed to send SMS', 'OK', { duration: 5000 });
      }
    });
  }

  // ─── Template Download (from backend) ───

  downloadTemplate(): void {
    this.smsService.downloadBulkTemplate().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sms-bulk-template.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('Failed to download template', 'OK', { duration: 4000 });
      }
    });
  }

  // ─── Template Upload ───

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.bulkFileName = file.name;
    const buffer = await file.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet('SMS Bulk Send') || workbook.worksheets[0];
    if (!sheet) {
      this.snackBar.open('No worksheet found in file', 'OK', { duration: 4000 });
      return;
    }

    this.bulkMessages = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const contact = (row.getCell(1).value || '').toString().trim();
      const message = (row.getCell(2).value || '').toString().trim();
      const sched = (row.getCell(3).value || '').toString().trim().toLowerCase();
      const schedAt = (row.getCell(4).value || '').toString().trim();
      if (contact || message) {
        this.bulkMessages.push({ contact, message, scheduled: sched === 'yes', scheduledAt: schedAt });
      }
    });

    if (this.bulkMessages.length === 0) {
      this.snackBar.open('No data rows found in template', 'OK', { duration: 4000 });
    }

    // Reset file input so same file can be re-selected
    input.value = '';
  }

  removeRow(index: number): void {
    this.bulkMessages.splice(index, 1);
  }

  clearBulk(): void {
    this.bulkMessages = [];
    this.bulkFileName = '';
    this.bulkResults = null;
  }

  // ─── Bulk Send ───

  sendBulk(): void {
    const valid = this.bulkMessages.filter(r => r.contact && r.message);
    if (valid.length === 0) return;

    this.bulkSending = true;
    this.bulkResults = null;
    this.bulkResultRows = [];
    this.bulkProgress = 0;

    const requests = valid.map(row => ({
      phoneNumber: row.contact,
      message: this.businessName ? `${this.businessName}: ${row.message}` : row.message
    }));

    this.smsService.sendBulkSms(requests).subscribe({
      next: (result) => {
        this.bulkSending = false;
        this.bulkProgress = 100;
        this.bulkResults = result;

        // Merge results back to original rows
        const apiMessages: any[] = result.messages || [];
        this.bulkResultRows = valid.map((row, i) => {
          const res = apiMessages[i] || {};
          return {
            contact: row.contact,
            message: row.message,
            scheduled: row.scheduled,
            scheduledAt: row.scheduledAt,
            status: res.status || 'UNKNOWN',
            providerMessageId: res.providerMessageId || '',
            errorMessage: res.errorMessage || '',
            id: res.id || null
          };
        });

        const sent = result.totalSent || 0;
        const failed = result.totalFailed || 0;
        this.snackBar.open(`Bulk send complete: ${sent} sent, ${failed} failed`, 'OK', { duration: 4000 });
      },
      error: () => {
        this.bulkSending = false;
        this.snackBar.open('Bulk send failed', 'OK', { duration: 5000 });
      }
    });
  }

  // ─── Download Results Excel ───

  async downloadResults(): Promise<void> {
    if (this.bulkResultRows.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Bulk Send Results');

    sheet.columns = [
      { header: '#', key: 'num', width: 6 },
      { header: 'Contact', key: 'contact', width: 20 },
      { header: 'Message', key: 'message', width: 50 },
      { header: 'Scheduled', key: 'scheduled', width: 12 },
      { header: 'Scheduled At', key: 'scheduledAt', width: 22 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Provider Message ID', key: 'providerMessageId', width: 30 },
      { header: 'Error', key: 'errorMessage', width: 40 },
      { header: 'Relayer ID', key: 'id', width: 12 }
    ];

    // Header style
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F8FA' } };

    this.bulkResultRows.forEach((row, i) => {
      const dataRow = sheet.addRow({
        num: i + 1,
        contact: row.contact,
        message: row.message,
        scheduled: row.scheduled ? 'yes' : 'no',
        scheduledAt: row.scheduledAt,
        status: row.status,
        providerMessageId: row.providerMessageId,
        errorMessage: row.errorMessage,
        id: row.id
      });

      // Color the status cell
      const statusCell = dataRow.getCell('status');
      if (row.status === 'SENT' || row.status === 'DELIVERED') {
        statusCell.font = { bold: true, color: { argb: 'FF166534' } };
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
      } else if (row.status === 'FAILED') {
        statusCell.font = { bold: true, color: { argb: 'FF991B1B' } };
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
      } else {
        statusCell.font = { bold: true, color: { argb: 'FF92400E' } };
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
      }
    });

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 15 }
    ];
    summarySheet.getRow(1).font = { bold: true };

    const sent = this.bulkResultRows.filter(r => r.status === 'SENT' || r.status === 'DELIVERED').length;
    const failed = this.bulkResultRows.filter(r => r.status === 'FAILED').length;
    const pending = this.bulkResultRows.length - sent - failed;

    summarySheet.addRow({ metric: 'Total Messages', value: this.bulkResultRows.length });
    summarySheet.addRow({ metric: 'Sent / Delivered', value: sent });
    summarySheet.addRow({ metric: 'Failed', value: failed });
    summarySheet.addRow({ metric: 'Pending / Other', value: pending });
    summarySheet.addRow({ metric: 'Business Name', value: this.businessName || '(none)' });
    summarySheet.addRow({ metric: 'Sent At', value: new Date().toISOString() });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sms-bulk-results-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

interface BulkRow {
  contact: string;
  message: string;
  scheduled: boolean;
  scheduledAt: string;
}

interface BulkResultRow extends BulkRow {
  status: string;
  providerMessageId: string;
  errorMessage: string;
  id: number | null;
}
