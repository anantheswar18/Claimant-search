import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces for API responses
export interface Claim {
  id: number;
  claimNumber: string;
  claimStatusCode: number;
  incidentDate: string;
  stateCode: string;
  totalPayoutOnIncident: number;
}

export interface PaginatedClaims {
  total: number;
  pageSize: number;
  page: number;
  items: Claim[];
}

export interface InsuranceType {
  insuranceType: number;
  insuranceTypeDesc: string;
}

export interface ClaimStatus {
  statusCode: number;
  statusDesc: string;
}

export interface Employer {
  insured_id: string;
  insured: string;
}

export interface Underwriter {
  underwriter_id: string;
  underwriter_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private baseUrl = 'http://localhost:8080/api';

  // State to hold search results
  public claimsResult = signal<PaginatedClaims | null>(null);
  
  // State to hold current search criteria for export
  public currentSearchCriteria = signal<any>({});

  constructor(private http: HttpClient) {}

  // 1. Claims Search Grid
  searchClaims(criteria: any): Observable<PaginatedClaims> {
    let params = new HttpParams();
    
    if (criteria.status && criteria.status.length > 0) {
      const statusVal = Array.isArray(criteria.status) ? criteria.status.join(',') : criteria.status;
      params = params.set('status', statusVal);
    }
    if (criteria.dolStart) {
      const start = criteria.dolStart.includes('T') ? criteria.dolStart : `${criteria.dolStart}T00:00:00`;
      params = params.set('dolStart', start);
    }
    if (criteria.dolEnd) {
      const end = criteria.dolEnd.includes('T') ? criteria.dolEnd : `${criteria.dolEnd}T23:59:59`;
      params = params.set('dolEnd', end);
    }
    if (criteria.minAmount) {
      params = params.set('minAmount', criteria.minAmount);
    }
    if (criteria.maxAmount) {
      params = params.set('maxAmount', criteria.maxAmount);
    }
    if (criteria.page) {
      params = params.set('page', criteria.page);
    }
    if (criteria.pageSize) {
      params = params.set('pageSize', criteria.pageSize);
    }
    
    // Save criteria for export later
    this.currentSearchCriteria.set(criteria);

    return this.http.get<PaginatedClaims>(`${this.baseUrl}/claims`, { params });
  }

  // 2. Claims CSV Export
  exportClaims(): void {
    const criteria = this.currentSearchCriteria();
    let params = new HttpParams();
    
    if (criteria.status && criteria.status.length > 0) {
      const statusVal = Array.isArray(criteria.status) ? criteria.status.join(',') : criteria.status;
      params = params.set('status', statusVal);
    }
    if (criteria.dolStart) {
      const start = criteria.dolStart.includes('T') ? criteria.dolStart : `${criteria.dolStart}T00:00:00`;
      params = params.set('dolStart', start);
    }
    if (criteria.dolEnd) {
      const end = criteria.dolEnd.includes('T') ? criteria.dolEnd : `${criteria.dolEnd}T23:59:59`;
      params = params.set('dolEnd', end);
    }
    if (criteria.minAmount) {
      params = params.set('minAmount', criteria.minAmount);
    }
    if (criteria.maxAmount) {
      params = params.set('maxAmount', criteria.maxAmount);
    }

    // Use window.location or create an invisible link to trigger download natively
    // A simple approach since it's a GET request:
    const queryString = params.toString();
    const url = `${this.baseUrl}/claims/export${queryString ? '?' + queryString : ''}`;
    window.open(url, '_blank');
  }

  // 3. Static Dropdown: Insurance Types
  getInsuranceTypes(): Observable<InsuranceType[]> {
    return this.http.get<InsuranceType[]>(`${this.baseUrl}/lookups/insurance-types`);
  }

  // 4. Static Dropdown: Claim Statuses
  getStatuses(): Observable<ClaimStatus[]> {
    return this.http.get<ClaimStatus[]>(`${this.baseUrl}/lookups/statuses`);
  }

  // 5. Dynamic Typeahead: Employers (Insured)
  searchEmployers(query: string): Observable<Employer[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Employer[]>(`${this.baseUrl}/lookups/employers/search`, { params });
  }

  // 6. Dynamic Typeahead: Underwriters
  searchUnderwriters(query: string): Observable<Underwriter[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Underwriter[]>(`${this.baseUrl}/lookups/underwriters/search`, { params });
  }
}
