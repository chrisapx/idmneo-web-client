/** Angular Imports */
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { UntypedFormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** rxjs Imports */
import { merge } from 'rxjs';
import { tap, startWith, map, distinctUntilChanged, debounceTime } from 'rxjs/operators';

/** Custom Services */
import { AccountingService } from '../accounting.service';
import { SettingsService } from 'app/settings/settings.service';
/** Custom Data Source */
import { JournalEntriesDataSource } from './journal-entry.datasource';
import { Dates } from 'app/core/utils/dates';
import { MatAutocompleteTrigger, MatOption, MatAutocomplete } from '@angular/material/autocomplete';
import { GlAccountSelectorComponent } from '../../shared/accounting/gl-account-selector/gl-account-selector.component';
import { NgFor, NgIf, NgClass, AsyncPipe } from '@angular/common';
import {
  MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell,
  MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { DatetimeFormatPipe } from '../../pipes/datetime-format.pipe';
import { FormatNumberPipe } from '../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-search-journal-entry',
  templateUrl: './search-journal-entry.component.html',
  styleUrls: ['./search-journal-entry.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FormsModule,
    MatIcon,
    MatButton,
    MatAutocompleteTrigger,
    GlAccountSelectorComponent,
    MatAutocomplete,
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
    DateFormatPipe,
    DatetimeFormatPipe,
    FormatNumberPipe
  ]
})
export class SearchJournalEntryComponent implements OnInit, AfterViewInit {
  /** Office data. */
  officeData: any;
  /** Filtered office data for autocomplete. */
  filteredOfficeData: any;
  /** Gl Account data. */
  glAccountData: any;
  /** Entry type filter data. */
  entryTypeFilterData = [
    { option: 'All', value: '' },
    { option: 'Manual Entries', value: true },
    { option: 'System Entries', value: false }
  ];

  // Form controls (kept for server-side subscriptions)
  officeName = new UntypedFormControl();
  glAccount = new UntypedFormControl();
  entryTypeFilter = new UntypedFormControl('');
  transactionId = new UntypedFormControl();
  transactionDateFrom = new UntypedFormControl(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  transactionDateTo = new UntypedFormControl(new Date());
  submittedOnDateFrom = new UntypedFormControl();
  submittedOnDateTo = new UntypedFormControl();

  /** Columns to be displayed in journal entries table. */
  displayedColumns: string[] = [
    'id', 'officeName', 'transactionId', 'transactionDate', 'glAccountType',
    'createdByUserName', 'submittedOnDate', 'glAccountCode', 'glAccountName',
    'currency', 'debit', 'credit'
  ];
  /** Data source for journal entries table. */
  dataSource: JournalEntriesDataSource;
  /** Journal entries filter. */
  filterJournalEntriesBy = [
    { type: 'officeId', value: '' },
    { type: 'glAccountId', value: '' },
    { type: 'manualEntriesOnly', value: '' },
    { type: 'transactionId', value: '' },
    { type: 'fromDate', value: this.dateUtils.formatDate(new Date(new Date().setMonth(new Date().getMonth() - 1)), this.settingsService.dateFormat) },
    { type: 'toDate', value: this.dateUtils.formatDate(new Date(), this.settingsService.dateFormat) },
    { type: 'submittedOnDateFrom', value: '' },
    { type: 'submittedOnDateTo', value: '' },
    { type: 'dateFormat', value: this.settingsService.dateFormat },
    { type: 'locale', value: this.settingsService.language.code }
  ];

  // --- Filter chip state ---
  activeFilter: string | null = null;
  showMoreFilters = false;
  appliedFilters: { [key: string]: string | null } = {
    office: null,
    type: null,
    transactionId: null,
    glAccount: null,
    glAccountDisplay: null,
    dateFrom: null,
    dateTo: null
  };

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private accountingService: AccountingService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private route: ActivatedRoute
  ) {
    this.route.data.subscribe((data: { offices: any; glAccounts: any }) => {
      this.officeData = data.offices;
      this.glAccountData = data.glAccounts;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setFilteredOffices();
    this.getJournalEntries();
  }

  maxDate = new Date();

  ngAfterViewInit() {
    // GL account changes still feed into the server filter
    this.glAccount.valueChanges
      .pipe(
        map((value) => (value ? value : '')),
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(filterValue, 'glAccountId');
        })
      )
      .subscribe();

    // Date controls feed into server filter
    this.transactionDateFrom.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(),
        tap((v) => {
          this.appliedFilters['dateFrom'] = this.dateUtils.formatDate(v, this.settingsService.dateFormat);
          this.applyFilter(this.appliedFilters['dateFrom'], 'fromDate');
        })
      ).subscribe();

    this.transactionDateTo.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(),
        tap((v) => {
          this.appliedFilters['dateTo'] = this.dateUtils.formatDate(v, this.settingsService.dateFormat);
          this.applyFilter(this.appliedFilters['dateTo'], 'toDate');
        })
      ).subscribe();

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadJournalEntriesPage()))
      .subscribe();
  }

  // --- Filter chip methods ---

  openFilter(name: string) {
    this.activeFilter = this.activeFilter === name ? null : name;
    this.showMoreFilters = false;
  }

  toggleMoreFilters() {
    this.showMoreFilters = !this.showMoreFilters;
    this.activeFilter = null;
  }

  applyOfficeFilter(office: any) {
    this.appliedFilters['office'] = office.name;
    this.activeFilter = null;
    this.officeName.setValue(office);
    this.applyFilter(office.id, 'officeId');
  }

  applyTypeFilter(filterOption: any) {
    this.appliedFilters['type'] = filterOption.option === 'All' ? null : filterOption.option;
    this.activeFilter = null;
    this.applyFilter(filterOption.value, 'manualEntriesOnly');
  }

  applyFilterValue(key: string, value: string) {
    this.appliedFilters[key] = value || null;
    this.activeFilter = null;
    this.showMoreFilters = false;
    if (key === 'transactionId') {
      this.transactionId.setValue(value);
      this.applyFilter(value || '', 'transactionId');
    }
  }

  removeFilter(key: string) {
    this.appliedFilters[key] = null;
    if (key === 'office') {
      this.officeName.setValue('');
      this.applyFilter('', 'officeId');
    } else if (key === 'type') {
      this.entryTypeFilter.setValue('');
      this.applyFilter('', 'manualEntriesOnly');
    } else if (key === 'transactionId') {
      this.transactionId.setValue('');
      this.applyFilter('', 'transactionId');
    } else if (key === 'glAccount') {
      this.appliedFilters['glAccountDisplay'] = null;
      this.glAccount.setValue('');
      this.applyFilter('', 'glAccountId');
    } else if (key === 'dateFrom') {
      this.transactionDateFrom.setValue(null);
      this.applyFilter('', 'fromDate');
    } else if (key === 'dateTo') {
      this.transactionDateTo.setValue(null);
      this.applyFilter('', 'toDate');
    }
  }

  clearAllFilters() {
    Object.keys(this.appliedFilters).forEach(k => this.appliedFilters[k] = null);
    this.officeName.setValue('');
    this.glAccount.setValue('');
    this.entryTypeFilter.setValue('');
    this.transactionId.setValue('');
    this.transactionDateFrom.setValue(null);
    this.transactionDateTo.setValue(null);
    // Reset server filters
    this.filterJournalEntriesBy.forEach(f => {
      if (!['dateFormat', 'locale'].includes(f.type)) f.value = '';
    });
    this.paginator.pageIndex = 0;
    this.loadJournalEntriesPage();
  }

  get hasActiveFilters(): boolean {
    return Object.values(this.appliedFilters).some(v => v !== null);
  }

  runSearch() {
    this.paginator.pageIndex = 0;
    this.loadJournalEntriesPage();
  }

  // --- Server filter plumbing (unchanged) ---

  loadJournalEntriesPage() {
    if (!this.sort.direction) { delete this.sort.active; }
    this.dataSource.getJournalEntries(
      this.filterJournalEntriesBy, this.sort.active, this.sort.direction,
      this.paginator.pageIndex, this.paginator.pageSize
    );
  }

  applyFilter(filterValue: string, property: string) {
    this.paginator.pageIndex = 0;
    const findIndex = this.filterJournalEntriesBy.findIndex((filter) => filter.type === property);
    this.filterJournalEntriesBy[findIndex].value = filterValue;
    this.loadJournalEntriesPage();
  }

  displayOfficeName(office?: any): string | undefined {
    return office ? office.name : undefined;
  }

  setFilteredOffices() {
    this.filteredOfficeData = this.officeName.valueChanges.pipe(
      startWith(''),
      map((office: any) => (typeof office === 'string' ? office : office.name)),
      map((officeName: string) => (officeName ? this.filterOfficeAutocompleteData(officeName) : this.officeData))
    );
  }

  private filterOfficeAutocompleteData(officeName: string): any {
    return this.officeData.filter((office: any) => office.name.toLowerCase().includes(officeName.toLowerCase()));
  }

  getJournalEntries() {
    this.dataSource = new JournalEntriesDataSource(this.accountingService);
    this.dataSource.getJournalEntries(
      this.filterJournalEntriesBy, this.sort.active, this.sort.direction,
      this.paginator.pageIndex, this.paginator.pageSize
    );
  }
}
