import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClaimService, ClaimStatus, InsuranceType, Employer, Underwriter } from '../services/claim.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main implements OnInit {
  searchForm: FormGroup;
  
  // Lookups
  insuranceTypes = signal<InsuranceType[]>([]);
  statuses = signal<ClaimStatus[]>([]);
  
  // Typeahead Results
  employerResults = signal<Employer[]>([]);
  underwriterResults = signal<Underwriter[]>([]);
  
  showEmployerDropdown = signal(false);
  showUnderwriterDropdown = signal(false);

  constructor(private fb: FormBuilder, private claimService: ClaimService) {
    this.searchForm = this.fb.group({
      // API Params
      status: [[]],
      dolStart: [''],
      dolEnd: [''],
      minAmount: [''],
      maxAmount: [''],
      
      // Lookups & other UI fields (kept for UI layout mapping)
      claimNumber: [''],
      examiner: [''],
      insuranceType: [''], // Mapped to Organization1
      emailId: [''],
      employer: [''], // Typeahead
      organizer2: [''],
      phoneNumber: [''],
      quickSearch: [''],
      ssn: [''],
      program: [''],
      jurisdictionClaimNumber: [''],
      dob: [''],
      claimantFirstName: [''],
      claimantLastName: [''],
      employeeNumber: [''],
      afiliateClaimNumber: [''],
      claimantType: [''],
      underwriter: [''], // Mapped to Broker Name
      adjustingOffice: ['']
    });
    
    // Sync form to service whenever fields change so footer can just use it
    this.searchForm.valueChanges.subscribe(val => {
       this.claimService.currentSearchCriteria.set(val);
    });
  }

  ngOnInit() {
    this.claimService.getStatuses().subscribe((res: ClaimStatus[]) => this.statuses.set(res));
    this.claimService.getInsuranceTypes().subscribe((res: InsuranceType[]) => this.insuranceTypes.set(res));

    // Employer Typeahead
    this.searchForm.get('employer')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || typeof query !== 'string') {
          this.employerResults.set([]);
          this.showEmployerDropdown.set(false);
          return of([]);
        }
        return this.claimService.searchEmployers(query).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe(results => {
      if (results.length > 0) {
        this.employerResults.set(results);
        this.showEmployerDropdown.set(true);
      } else {
        this.showEmployerDropdown.set(false);
      }
    });

    // Underwriter Typeahead
    this.searchForm.get('underwriter')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || typeof query !== 'string') {
          this.underwriterResults.set([]);
          this.showUnderwriterDropdown.set(false);
          return of([]);
        }
        return this.claimService.searchUnderwriters(query).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe(results => {
      if (results.length > 0) {
        this.underwriterResults.set(results);
        this.showUnderwriterDropdown.set(true);
      } else {
        this.showUnderwriterDropdown.set(false);
      }
    });
  }

  selectEmployer(emp: Employer) {
    this.searchForm.patchValue({ employer: emp.insured }, { emitEvent: false });
    this.showEmployerDropdown.set(false);
  }

  selectUnderwriter(uw: Underwriter) {
    this.searchForm.patchValue({ underwriter: uw.underwriter_name }, { emitEvent: false });
    this.showUnderwriterDropdown.set(false);
  }
}
