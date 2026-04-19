import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatSort, Sort, MatSortHeader } from '@angular/material/sort';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger, MatMenuItem } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell,
  MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ProductsService } from './products.service';

interface ProductTab {
  key: string;
  label: string;
  singular: string;
  icon: string;
  createLabel: string;
  createRoute: string;
  listRoute: string;
  columns: string[];
  hasStatus: boolean;
  emptyDescription: string;
  fetchMethod: string;
  statusField?: string;
}

@Component({
  selector: 'mifosx-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FormsModule,
    MatIcon,
    MatButton,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow
  ]
})
export class ProductsComponent implements OnInit {
  // Tab definitions
  tabs: ProductTab[] = [
    {
      key: 'loans', label: 'Loans', singular: 'loan product', icon: 'account_balance',
      createLabel: 'Create loan product', createRoute: '/products/loan-products/create',
      listRoute: '/products/loan-products', columns: ['name', 'shortName', 'status'],
      hasStatus: true, emptyDescription: 'Loan products define the rules, terms, and default settings for loan accounts.',
      fetchMethod: 'getLoanProducts', statusField: 'status'
    },
    {
      key: 'savings', label: 'Savings', singular: 'savings product', icon: 'savings',
      createLabel: 'Create savings product', createRoute: '/products/saving-products/create',
      listRoute: '/products/saving-products', columns: ['name', 'shortName'],
      hasStatus: false, emptyDescription: 'Savings products define the rules and default settings for savings accounts.',
      fetchMethod: 'getSavingProducts'
    },
    {
      key: 'shares', label: 'Shares', singular: 'share product', icon: 'pie_chart',
      createLabel: 'Create share product', createRoute: '/products/share-products/create',
      listRoute: '/products/share-products', columns: ['name', 'shortName'],
      hasStatus: false, emptyDescription: 'Share products define the rules for share accounts in your organization.',
      fetchMethod: 'getShareProducts'
    },
    {
      key: 'charges', label: 'Charges', singular: 'charge', icon: 'receipt_long',
      createLabel: 'Create charge', createRoute: '/products/charges/create',
      listRoute: '/products/charges', columns: ['name', 'status'],
      hasStatus: true, emptyDescription: 'Define charges and penalties for loan, savings, and deposit products.',
      fetchMethod: 'getCharges', statusField: 'active'
    },
    {
      key: 'fixed-deposits', label: 'Fixed Deposits', singular: 'fixed deposit product', icon: 'lock',
      createLabel: 'Create fixed deposit product', createRoute: '/products/fixed-deposit-products/create',
      listRoute: '/products/fixed-deposit-products', columns: ['name', 'shortName'],
      hasStatus: false, emptyDescription: 'Fixed deposit products define the rules for term deposit accounts.',
      fetchMethod: 'getFixedDepositProducts'
    },
    {
      key: 'recurring-deposits', label: 'Recurring Deposits', singular: 'recurring deposit product', icon: 'autorenew',
      createLabel: 'Create recurring deposit product', createRoute: '/products/recurring-deposit-products/create',
      listRoute: '/products/recurring-deposit-products', columns: ['name', 'shortName'],
      hasStatus: false, emptyDescription: 'Recurring deposit products define the rules for recurring deposit accounts.',
      fetchMethod: 'getRecurringDepositProducts'
    },
    {
      key: 'floating-rates', label: 'Floating Rates', singular: 'floating rate', icon: 'trending_up',
      createLabel: 'Create floating rate', createRoute: '/products/floating-rates/create',
      listRoute: '/products/floating-rates', columns: ['name', 'status'],
      hasStatus: true, emptyDescription: 'Define floating interest rate charts for loan products.',
      fetchMethod: 'getFloatingRates', statusField: 'isActive'
    },
    {
      key: 'product-mix', label: 'Product Mix', singular: 'product mix', icon: 'shuffle',
      createLabel: 'Create product mix', createRoute: '/products/products-mix/create',
      listRoute: '/products/products-mix', columns: ['name'],
      hasStatus: false, emptyDescription: 'Define rules for which products can be combined together.',
      fetchMethod: 'getProductsMix'
    },
    {
      key: 'collaterals', label: 'Collaterals', singular: 'collateral', icon: 'verified_user',
      createLabel: 'Create collateral', createRoute: '/products/collaterals/create',
      listRoute: '/products/collaterals', columns: ['name'],
      hasStatus: false, emptyDescription: 'Define collateral types for collateral management.',
      fetchMethod: 'getCollaterals'
    },
  ];

  activeTab = 'loans';
  tabData: any[] = [];
  filteredData: any[] = [];
  isLoading = false;
  filterValue = '';
  statusFilter = '';
  activeChip: string | null = null;
  maxVisibleTabs = 7;
  tabCache: { [key: string]: any[] } = {};

  @ViewChild(MatSort) sort: MatSort;

  get activeTabDef(): ProductTab | undefined {
    return this.tabs.find(t => t.key === this.activeTab);
  }

  get activeColumns(): string[] {
    return this.activeTabDef?.columns || ['name'];
  }

  get visibleTabs(): ProductTab[] {
    return this.tabs.slice(0, this.maxVisibleTabs);
  }

  get overflowTabs(): ProductTab[] {
    return this.tabs.slice(this.maxVisibleTabs);
  }

  get isOverflowActive(): boolean {
    return this.overflowTabs.some(t => t.key === this.activeTab);
  }

  constructor(
    private productsService: ProductsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.calcVisibleTabs();
    this.loadTab(this.activeTab);
  }

  @HostListener('window:resize')
  onResize() {
    this.calcVisibleTabs();
  }

  calcVisibleTabs() {
    const w = window.innerWidth;
    if (w < 600) this.maxVisibleTabs = 3;
    else if (w < 900) this.maxVisibleTabs = 5;
    else if (w < 1200) this.maxVisibleTabs = 7;
    else this.maxVisibleTabs = 9;
  }

  switchTab(key: string) {
    if (this.activeTab === key) return;
    this.activeTab = key;
    this.filterValue = '';
    this.statusFilter = '';
    this.activeChip = null;
    this.loadTab(key);
  }

  loadTab(key: string) {
    if (this.tabCache[key]) {
      this.tabData = this.tabCache[key];
      this.applyFilter();
      return;
    }

    const tab = this.tabs.find(t => t.key === key);
    if (!tab) return;

    this.isLoading = true;
    this.tabData = [];
    this.filteredData = [];

    const method = (this.productsService as any)[tab.fetchMethod];
    if (!method) {
      this.isLoading = false;
      return;
    }

    method.call(this.productsService).subscribe(
      (data: any) => {
        // Some APIs return arrays directly, others return objects with pageItems
        const items = Array.isArray(data) ? data : (data?.pageItems || data?.content || []);
        this.tabData = items;
        this.tabCache[key] = items;
        this.applyFilter();
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
        this.tabData = [];
        this.filteredData = [];
      }
    );
  }

  applyFilter() {
    let data = [...this.tabData];

    if (this.filterValue) {
      const q = this.filterValue.toLowerCase();
      data = data.filter((row: any) => (row.name || '').toLowerCase().includes(q));
    }

    if (this.statusFilter && this.activeTabDef?.hasStatus) {
      data = data.filter((row: any) => this.getStatus(row) === this.statusFilter);
    }

    this.filteredData = data;
  }

  getStatus(row: any): string {
    const tab = this.activeTabDef;
    if (!tab?.statusField) return '';
    const val = row[tab.statusField];
    if (typeof val === 'boolean') return val ? 'Active' : 'Inactive';
    if (typeof val === 'string') {
      if (val.includes('.active') || val === 'Active') return 'Active';
      return 'Inactive';
    }
    if (val?.value) return val.value;
    return '';
  }

  getRowLink(row: any): string[] {
    const tab = this.activeTabDef;
    if (!tab) return [];
    return [tab.listRoute, String(row.id)];
  }

  createProduct() {
    const tab = this.activeTabDef;
    if (tab?.createRoute) {
      this.router.navigate([tab.createRoute]);
    }
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      this.applyFilter();
      return;
    }
    this.filteredData = [...this.filteredData].sort((a, b) => {
      const valA = (a[sort.active] || '').toString().toLowerCase();
      const valB = (b[sort.active] || '').toString().toLowerCase();
      return sort.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }
}
