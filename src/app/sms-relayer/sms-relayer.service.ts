import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  SmsMessage, SmsSendRequest, SmsSendResponse, FspSmsAccount,
  SmsCreditTransaction, SmsModuleStatus, SmsMessageFilter, PagedResult
} from './shared/sms-relayer.models';

@Injectable({ providedIn: 'root' })
export class SmsRelayerService {

  /** Absolute URL so the ApiPrefixInterceptor skips it (it only prefixes relative URLs). */
  private base: string;

  constructor(private http: HttpClient) {
    // Gateway routes: /core -> fineract, /sms -> sms-relayer
    const gatewayHost = environment.baseApiUrl.replace(/\/core(-sandbox)?$/, '');
    this.base = `${gatewayHost}/sms`;
  }

  // ─── Module ───

  getModuleStatus(): Observable<SmsModuleStatus> {
    return this.http.get<SmsModuleStatus>(`${this.base}/api/v1/modules/sms-bridge/status`);
  }

  enableModule(fspName?: string): Observable<SmsModuleStatus> {
    return this.http.post<SmsModuleStatus>(`${this.base}/api/v1/modules/sms-bridge/enable`,
      fspName ? { fspName } : {});
  }

  disableModule(): Observable<SmsModuleStatus> {
    return this.http.post<SmsModuleStatus>(`${this.base}/api/v1/modules/sms-bridge/disable`, {});
  }

  getModuleConfig(): Observable<any> {
    return this.http.get(`${this.base}/api/v1/modules/sms-bridge/config`);
  }

  updateModuleConfig(config: any): Observable<any> {
    return this.http.put(`${this.base}/api/v1/modules/sms-bridge/config`, config);
  }

  // ─── Send ───

  sendSms(request: SmsSendRequest): Observable<SmsSendResponse> {
    return this.http.post<SmsSendResponse>(`${this.base}/api/v1/sms/send`, request);
  }

  sendBulkSms(messages: SmsSendRequest[]): Observable<any> {
    return this.http.post(`${this.base}/api/v1/sms/send/bulk`, { messages });
  }

  // ─── Messages ───

  getMessages(filter: SmsMessageFilter): Observable<PagedResult<SmsMessage>> {
    let params = new HttpParams();
    Object.keys(filter).forEach(key => {
      const val = (filter as any)[key];
      if (val !== null && val !== undefined && val !== '') {
        params = params.set(key, val.toString());
      }
    });
    return this.http.get<PagedResult<SmsMessage>>(`${this.base}/api/v1/sms/messages`, { params });
  }

  getMessage(id: number): Observable<SmsMessage> {
    return this.http.get<SmsMessage>(`${this.base}/api/v1/sms/messages/${id}`);
  }

  // ─── Credits ───

  getBalance(): Observable<FspSmsAccount> {
    return this.http.get<FspSmsAccount>(`${this.base}/api/v1/sms/credits/balance`);
  }

  purchaseCredits(amount: number, reference?: string): Observable<any> {
    return this.http.post(`${this.base}/api/v1/sms/credits/purchase`, { amount, reference });
  }

  getCreditTransactions(page = 0, size = 20): Observable<PagedResult<SmsCreditTransaction>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<PagedResult<SmsCreditTransaction>>(
      `${this.base}/api/v1/sms/credits/transactions`, { params });
  }

  // ─── Bulk Template ───

  downloadBulkTemplate(): Observable<Blob> {
    return this.http.get(`${this.base}/api/v1/sms/send/bulk/template`, { responseType: 'blob' });
  }

  // ─── Providers ───

  getProviders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/api/v1/sms/providers`);
  }
}
