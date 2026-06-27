import { Component, computed } from '@angular/core';
import { ClaimService } from '../services/claim.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  claims = computed(() => this.claimService.claimsResult()?.items || []);
  
  constructor(private claimService: ClaimService) {}

  onSearch() {
    const criteria = this.claimService.currentSearchCriteria();
    this.claimService.searchClaims(criteria).subscribe((result: any) => {
      this.claimService.claimsResult.set(result);
    });
  }

  onReset() {
    this.claimService.claimsResult.set(null);
  }

  onDownload() {
    this.claimService.exportClaims();
  }
}
