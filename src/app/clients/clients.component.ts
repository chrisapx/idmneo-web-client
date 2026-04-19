import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell,
  MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';

import { environment } from '../../environments/environment';
import { ClientsService } from './clients.service';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { CreateClientComponent } from './create-client/create-client.component';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatIcon } from '@angular/material/icon';
import { AccountNumberComponent } from '../shared/account-number/account-number.component';
import { ExternalIdentifierComponent } from '../shared/external-identifier/external-identifier.component';
import { StatusLookupPipe } from '../pipes/status-lookup.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox, FormsModule, FaIconComponent, MatProgressBar, MatIcon,
    MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader,
    MatCellDef, MatCell, AccountNumberComponent, ExternalIdentifierComponent,
    NgClass, NgFor, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow,
    MatPaginator, StatusLookupPipe
  ]
})
export class ClientsComponent implements OnInit {
  displayedColumns = ['displayName', 'accountNumber', 'externalId', 'status', 'officeName'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  existsClientsToFilter = false;
  notExistsClientsToFilter = false;
  totalRows = 0;
  isLoading = false;
  pageSize = 10;
  currentPage = 0;
  filterText = '';
  sortAttribute = '';
  sortDirection = '';

  // Tabs
  activeTab = 'all';

  // Filters
  activeFilter: string | null = null;
  offices: any[] = [];
  statuses = ['Active', 'Pending', 'Closed'];

  // Applied filters (null = not applied)
  appliedFilters: { [key: string]: string | null } = {
    name: null,
    status: null,
    office: null,
    accountNo: null,
    externalId: null
  };

  // More filters options
  moreFilterOptions = ['Account No', 'External ID'];
  showMoreFilters = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // Search bar state
  searchQuery = '';
  searchFocused = false;
  suggestions: any[] = [];
  private searchDebounce: any;

  constructor(private clientService: ClientsService, private dialog: MatDialog, private router: Router) {}

  onSearchInput() {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      if (this.searchQuery && this.searchQuery.length >= 2) {
        this.clientService.searchByText(this.searchQuery, 0, 6, '', '').subscribe((data: any) => {
          this.suggestions = (data.content || []).slice(0, 6);
        });
      } else {
        this.suggestions = [];
      }
    }, 300);
  }

  applySearch() {
    this.suggestions = [];
    this.searchFocused = false;
    this.appliedFilters['name'] = this.searchQuery || null;
    this.applyLocalFilters();
  }

  clearSearch() {
    this.searchQuery = '';
    this.suggestions = [];
    this.appliedFilters['name'] = null;
    this.applyLocalFilters();
  }

  onSearchBlur() {
    setTimeout(() => { this.searchFocused = false; }, 150);
  }

  goToClient(client: any) {
    this.router.navigate(['/clients', client.id, 'general']);
  }

  openCreateClient() {
    forkJoin([
      this.clientService.getClientTemplate(),
      this.clientService.getAddressFieldConfiguration()
    ]).subscribe(([template, addressConfig]: [any, any]) => {
      const dialogRef = this.dialog.open(CreateClientComponent, {
        width: '540px',
        maxHeight: '90vh',
        panelClass: 'create-client-dialog',
        data: {
          clientTemplate: template,
          clientAddressFieldConfig: addressConfig
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result?.resourceId) {
          this.router.navigate(['/clients', result.resourceId, 'general']);
        } else if (result) {
          this.getClients();
        }
      });
    });
  }

  ngOnInit() {
    this.loadOffices();
    if (environment.preloadClients) {
      this.getClients();
    }
  }

  loadOffices() {
    this.clientService.getOffices().subscribe((data: any) => {
      this.offices = data || [];
    });
  }

  // Tab switch
  setTab(tab: string) {
    this.activeTab = tab;
    this.applyLocalFilters();
  }

  // Open/close filter popover
  openFilter(name: string) {
    this.activeFilter = this.activeFilter === name ? null : name;
    this.showMoreFilters = false;
  }

  toggleMoreFilters() {
    this.showMoreFilters = !this.showMoreFilters;
    this.activeFilter = null;
  }

  // Apply a filter value
  applyFilterValue(key: string, value: string) {
    this.appliedFilters[key] = value || null;
    this.activeFilter = null;
    this.showMoreFilters = false;
    this.applyLocalFilters();
  }

  // Remove a single filter
  removeFilter(key: string) {
    this.appliedFilters[key] = null;
    this.applyLocalFilters();
  }

  // Clear all filters
  clearAllFilters() {
    Object.keys(this.appliedFilters).forEach(k => this.appliedFilters[k] = null);
    this.activeTab = 'all';
    this.filterText = '';
    this.applyLocalFilters();
  }

  get hasActiveFilters(): boolean {
    return Object.values(this.appliedFilters).some(v => v !== null) || this.activeTab !== 'all';
  }

  // Re-apply filters by reloading from server (page reset to 0)
  applyLocalFilters() {
    this.currentPage = 0;
    if (this.paginator) this.paginator.firstPage();
    this.getClients();
  }

  search(value: string) {
    this.filterText = value;
    this.currentPage = 0;
    if (this.paginator) this.paginator.firstPage();
    this.getClients();
  }

  private getClients() {
    this.isLoading = true;

    // Build the search text from name filter (server-side text search)
    const searchText = this.appliedFilters['name'] || this.filterText || '';

    this.clientService
      .searchByText(searchText, this.currentPage, this.pageSize, this.sortAttribute, this.sortDirection)
      .subscribe(
        (data: any) => {
          let rows = data.content || [];

          // Tab filter (active clients only)
          if (this.activeTab === 'active') {
            rows = rows.filter((c: any) => c.status?.value === 'Active');
          }

          // Local refinements on the current page (status, office, accountNo, externalId)
          if (this.appliedFilters['status']) {
            rows = rows.filter((c: any) => c.status?.value === this.appliedFilters['status']);
          }
          if (this.appliedFilters['office']) {
            rows = rows.filter((c: any) => c.officeName === this.appliedFilters['office']);
          }
          if (this.appliedFilters['accountNo']) {
            const q = this.appliedFilters['accountNo'].toLowerCase();
            rows = rows.filter((c: any) => (c.accountNumber || '').toLowerCase().includes(q));
          }
          if (this.appliedFilters['externalId']) {
            const q = this.appliedFilters['externalId'].toLowerCase();
            rows = rows.filter((c: any) => (c.externalId || '').toLowerCase().includes(q));
          }

          this.dataSource.data = rows;
          this.totalRows = data.totalElements || 0;
          this.existsClientsToFilter = rows.length > 0;
          this.notExistsClientsToFilter = !this.existsClientsToFilter;
          this.isLoading = false;
        },
        () => { this.isLoading = false; }
      );
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.getClients();
  }

  sortChanged(event: Sort) {
    this.sortAttribute = event.direction ? event.active : '';
    this.sortDirection = event.direction || '';
    this.currentPage = 0;
    if (this.paginator) this.paginator.firstPage();
    this.getClients();
  }
}
