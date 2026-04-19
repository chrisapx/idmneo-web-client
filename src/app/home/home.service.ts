import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) {}

  getCollectedAmount(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
      .set('R_officeId', officeId.toString())
      .set('genericResultSet', 'false');
    return this.http.get('/runreports/Demand Vs Collection', { params: httpParams });
  }

  getDisbursedAmount(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
      .set('R_officeId', officeId.toString())
      .set('genericResultSet', 'false');
    return this.http.get('/runreports/Disbursal Vs Awaitingdisbursal', { params: httpParams });
  }

  getClientTrendsByDay(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
      .set('R_officeId', officeId.toString())
      .set('genericResultSet', 'false');
    return this.http.get('/runreports/ClientTrendsByDay', { params: httpParams });
  }

  getClientTrendsByWeek(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
      .set('R_officeId', officeId.toString())
      .set('genericResultSet', 'false');
    return this.http.get('/runreports/ClientTrendsByWeek', { params: httpParams });
  }

  getClientTrendsByMonth(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
      .set('R_officeId', officeId.toString())
      .set('genericResultSet', 'false');
    return this.http.get('/runreports/ClientTrendsByMonth', { params: httpParams });
  }

  getLoanTrendsByDay(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
      .set('R_officeId', officeId.toString())
      .set('genericResultSet', 'false');
    return this.http.get('/runreports/LoanTrendsByDay', { params: httpParams });
  }

  getLoanTrendsByWeek(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
      .set('R_officeId', officeId.toString())
      .set('genericResultSet', 'false');
    return this.http.get('/runreports/LoanTrendsByWeek', { params: httpParams });
  }

  getLoanTrendsByMonth(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
      .set('R_officeId', officeId.toString())
      .set('genericResultSet', 'false');
    return this.http.get('/runreports/LoanTrendsByMonth', { params: httpParams });
  }

  getOffices(): Observable<any> {
    return this.http.get('/offices');
  }

  getClients(params?: any): Observable<any> {
    let httpParams = new HttpParams().set('limit', '5').set('orderBy', 'id').set('sortOrder', 'DESC');
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get('/clients', { params: httpParams });
  }

  getLoans(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get('/loans', { params: httpParams });
  }

  getRecentTransactions(): Observable<any> {
    const httpParams = new HttpParams()
      .set('limit', '10')
      .set('orderBy', 'id')
      .set('sortOrder', 'DESC');
    return this.http.get('/journalentries', { params: httpParams });
  }

  getGroupSummary(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
      .set('R_officeId', officeId.toString())
      .set('genericResultSet', 'false');
    return this.http.get('/runreports/GroupSummaryCounts', { params: httpParams });
  }
}
