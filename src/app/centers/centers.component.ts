/** Angular Imports */
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** rxjs Imports */
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

/** Custom Services */
import { CentersService } from './centers.service';

/** Custom Data Source */
import { CentersDataSource } from './centers.datasource';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatIcon } from '@angular/material/icon';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { NgClass, NgFor, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatusLookupPipe } from '../pipes/status-lookup.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-app-centers',
  templateUrl: './centers.component.html',
  styleUrls: ['./centers.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FormsModule,
    FaIconComponent,
    MatIcon,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    NgClass,
    NgFor,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    AsyncPipe,
    StatusLookupPipe
  ]
})
export class CentersComponent implements OnInit, AfterViewInit {
  /** Columns to be displayed in centers table. */
  displayedColumns = ['name', 'accountNo', 'externalId', 'status', 'officeName'];
  /** Data source for centers table. */
  dataSource: CentersDataSource;
  /** Centers filter. */
  filterCentersBy = [
    { type: 'name', value: '' },
    { type: 'externalId', value: '' }
  ];

  // Filter chip state
  activeFilter: string | null = null;
  statuses = ['Active', 'Pending', 'Closed'];
  showClosed = false;

  appliedFilters: { [key: string]: string | null } = {
    name: null,
    externalId: null,
    status: null
  };

  /** Paginator for centers table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for centers table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private centersService: CentersService) {}

  ngOnInit() {
    this.getCenters();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadCentersPage()))
      .subscribe();
  }

  // --- Filter chip methods (matches Clients pattern) ---

  openFilter(name: string) {
    this.activeFilter = this.activeFilter === name ? null : name;
  }

  applyFilterValue(key: string, value: string) {
    this.appliedFilters[key] = value || null;
    this.activeFilter = null;
    this.syncFiltersAndReload();
  }

  removeFilter(key: string) {
    this.appliedFilters[key] = null;
    this.syncFiltersAndReload();
  }

  clearAllFilters() {
    Object.keys(this.appliedFilters).forEach(k => this.appliedFilters[k] = null);
    this.syncFiltersAndReload();
  }

  get hasActiveFilters(): boolean {
    return Object.values(this.appliedFilters).some(v => v !== null);
  }

  /** Push applied filters into the server-side filterBy array and reload. */
  private syncFiltersAndReload() {
    // Update name filter
    const nameIdx = this.filterCentersBy.findIndex(f => f.type === 'name');
    this.filterCentersBy[nameIdx].value = this.appliedFilters['name'] || '';

    // Update externalId filter
    const extIdx = this.filterCentersBy.findIndex(f => f.type === 'externalId');
    this.filterCentersBy[extIdx].value = this.appliedFilters['externalId'] || '';

    this.paginator.pageIndex = 0;
    this.loadCentersPage();
  }

  loadCentersPage() {
    if (!this.sort.direction) {
      delete this.sort.active;
    }
    // Show closed = pass false for centerActive so all statuses come back
    const showOnlyActive = !this.showClosed && !this.appliedFilters['status'];
    this.dataSource.getCenters(
      this.filterCentersBy,
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize,
      showOnlyActive
    );
  }

  getCenters() {
    this.dataSource = new CentersDataSource(this.centersService);
    this.dataSource.getCenters(
      this.filterCentersBy,
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }
}
