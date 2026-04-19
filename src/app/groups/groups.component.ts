/** Angular Imports */
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';

/** rxjs Imports */
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

/** Custom Services */
import { GroupsService } from './groups.service';

/** Custom Data Source */
import { GroupsDataSource } from './groups.datasource';
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
  selector: 'mifosx-app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
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
export class GroupsComponent implements OnInit, AfterViewInit {
  /** Columns to be displayed in groups table. */
  displayedColumns = ['name', 'accountNo', 'externalId', 'status', 'officeName'];
  /** Data source for groups table. */
  dataSource: GroupsDataSource;
  /** Groups filter. */
  filterGroupsBy = [
    { type: 'name', value: '' }
  ];

  // Filter chip state
  activeFilter: string | null = null;
  statuses = ['Active', 'Pending', 'Closed'];

  appliedFilters: { [key: string]: string | null } = {
    name: null,
    status: null
  };

  /** Paginator for groups table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for groups table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private groupsService: GroupsService) {}

  ngOnInit() {
    this.getGroups();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadGroupsPage()))
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
    const nameIdx = this.filterGroupsBy.findIndex(f => f.type === 'name');
    this.filterGroupsBy[nameIdx].value = this.appliedFilters['name'] || '';

    this.paginator.pageIndex = 0;
    this.loadGroupsPage();
  }

  loadGroupsPage() {
    if (!this.sort.direction) {
      delete this.sort.active;
    }
    const showOnlyActive = !this.appliedFilters['status'];
    this.dataSource.getGroups(
      this.filterGroupsBy,
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize,
      showOnlyActive
    );
  }

  getGroups() {
    this.dataSource = new GroupsDataSource(this.groupsService);
    this.dataSource.getGroups(
      this.filterGroupsBy,
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }
}
