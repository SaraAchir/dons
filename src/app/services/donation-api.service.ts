import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DonationApiService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getCauses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/causes/`);
  }
  getDonations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/donations/`);
  }

  createDonation(donationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/donations/`, donationData);
  }
}