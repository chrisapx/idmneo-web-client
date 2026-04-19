import { Component, OnInit, Input, Output, EventEmitter, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthenticationService } from '../../authentication/authentication.service';
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';
import { SettingsService } from 'app/settings/settings.service';

import { NgClass, NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger, MatMenuItem } from '@angular/material/menu';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

import { environment } from '../../../../environments/environment';
import { AuthService } from 'app/zitadel/auth.service';

@Component({
  selector: 'mifosx-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NgClass,
    NgFor,
    UpperCasePipe,
    FormsModule,
    MatIconButton,
    MatTooltip,
    MatDivider,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
    RouterLinkActive
  ]
})
export class SidenavComponent implements OnInit, AfterViewInit {
  @Input() sidenavCollapsed: boolean;
  @Output() toggleCollapse = new EventEmitter<void>();
  tooltipPosition = 'after';
  username: string;
  sidebarSearch = '';
  showBrandMenu = false;

  expandedSections: { [key: string]: boolean } = {};

  sidebarGroups = [
    {
      key: 'accounting', label: 'Accounting', icon: 'account_balance_wallet',
      children: [
        { label: 'Journal Entries', path: '/accounting/journal-entries' },
        { label: 'Chart of Accounts', path: '/accounting/chart-of-accounts' },
        { label: 'Closing Entries', path: '/accounting/closing-entries' },
        { label: 'Accounting Rules', path: '/accounting/accounting-rules' },
        { label: 'Accruals', path: '/accounting/periodic-accruals' },
        { label: 'Financial Mappings', path: '/accounting/financial-activity-mappings' },
        { label: 'Provisioning', path: '/accounting/provisioning-entries' },
      ]
    },
    {
      key: 'reporting', label: 'Reporting', icon: 'bar_chart',
      children: [
        { label: 'All Reports', path: '/reports' },
        { label: 'Client Reports', path: '/reports/Client' },
        { label: 'Loan Reports', path: '/reports/Loan' },
        { label: 'Savings Reports', path: '/reports/Savings' },
        { label: 'Accounting Reports', path: '/reports/Accounting' },
        { label: 'Fund Reports', path: '/reports/Fund' },
      ]
    },
    {
      key: 'org', label: 'Organization', icon: 'corporate_fare',
      children: [
        { label: 'Offices', path: '/organization/offices' },
        { label: 'Employees', path: '/organization/employees' },
        { label: 'Currencies', path: '/organization/currencies' },
        { label: 'Holidays', path: '/organization/holidays' },
        { label: 'SMS Campaigns', path: '/organization/sms-campaigns' },
        { label: 'Bulk Import', path: '/organization/bulk-import' },
        { label: 'Fund Mapping', path: '/organization/fund-mapping' },
        { label: 'Payment Types', path: '/organization/payment-types' },
        { label: 'Password Preferences', path: '/organization/password-preferences' },
      ]
    },
    {
      key: 'more', label: 'More', icon: 'more_horiz',
      children: [
        { label: 'Users', path: '/appusers' },
        { label: 'Groups', path: '/groups' },
        { label: 'Centers', path: '/centers' },
        { label: 'Templates', path: '/templates' },
        { label: 'Approvals', path: '/checker-inbox-and-tasks/checker-inbox' },
        { label: 'Audit Trails', path: '/products/audit-trails' },
      ]
    },
  ];

  allNavItems = [
    { label: 'Home', path: '/home', icon: 'home' },
    { label: 'Clients', path: '/clients', icon: 'people' },
    { label: 'Product Catalog', path: '/products', icon: 'inventory_2' },
    { label: 'Transactions', path: '/accounting/journal-entries', icon: 'swap_horiz' },
    { label: 'Chart of Accounts', path: '/accounting/chart-of-accounts', icon: 'account_tree' },
    { label: 'Accounting', path: '/accounting', icon: 'account_balance_wallet' },
    { label: 'Navigation', path: '/navigation', icon: 'explore' },
    { label: 'Reports', path: '/reports', icon: 'bar_chart' },
    { label: 'Loan Products', path: '/products/loan-products', icon: 'account_balance' },
    { label: 'Charges', path: '/products/charges', icon: 'receipt' },
    { label: 'Saving Products', path: '/products/saving-products', icon: 'savings' },
    { label: 'Offices', path: '/organization/offices', icon: 'corporate_fare' },
    { label: 'Employees', path: '/organization/employees', icon: 'badge' },
    { label: 'Currencies', path: '/organization/currencies', icon: 'currency_exchange' },
    { label: 'Holidays', path: '/organization/holidays', icon: 'event' },
    { label: 'Users', path: '/appusers', icon: 'manage_accounts' },
    { label: 'Groups', path: '/groups', icon: 'groups' },
    { label: 'Centers', path: '/centers', icon: 'business' },
    { label: 'Templates', path: '/templates', icon: 'description' },
    { label: 'Approvals', path: '/checker-inbox-and-tasks/checker-inbox', icon: 'task_alt' },
    { label: 'System', path: '/system', icon: 'terminal' },
    { label: 'SMS Campaigns', path: '/organization/sms-campaigns', icon: 'sms' },
    { label: 'Bulk Import', path: '/organization/bulk-import', icon: 'upload_file' },
    { label: 'Payment Types', path: '/organization/payment-types', icon: 'payment' },
    { label: 'Audit Trails', path: '/products/audit-trails', icon: 'history' },
  ];

  get filteredNavItems() {
    if (!this.sidebarSearch) return [];
    const q = this.sidebarSearch.toLowerCase();
    return this.allNavItems.filter(item => item.label.toLowerCase().includes(q));
  }

  @ViewChild('logo') logo: ElementRef<any>;
  @ViewChild('templateLogo') templateLogo: TemplateRef<any>;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private authenticationService: AuthenticationService,
    private settingsService: SettingsService,
    public configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const credentials = this.authenticationService.getCredentials();
    this.username = credentials.username;
    this.expandActiveSection();
  }

  /** Auto-expand the sidebar group whose child matches the current URL */
  private expandActiveSection() {
    const url = this.router.url;
    for (const g of this.sidebarGroups) {
      if (g.children.some(c => url.startsWith(c.path))) {
        this.expandedSections[g.key] = true;
      }
    }
  }

  toggleSection(section: string) {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  getGroup(key: string) {
    return this.sidebarGroups.find(g => g.key === key);
  }

  // Hover menu helpers — small delay so mouse can travel from icon to menu
  private closeTimer: any;

  scheduleClose(trigger: any) {
    this.closeTimer = setTimeout(() => trigger.closeMenu(), 120);
  }

  cancelClose() {
    clearTimeout(this.closeTimer);
  }

  logout() {
    if (!environment.OIDC.oidcServerEnabled) {
      this.authenticationService.logout().subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
    } else {
      this.authService.logout();
    }
  }

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  ngAfterViewInit() {
    if (this.configurationWizardService.showSideNav === true) {
      setTimeout(() => {
        this.showPopover(this.templateLogo, this.logo?.nativeElement, 'bottom', true);
      });
    }
  }

  nextStep() {
    this.configurationWizardService.showSideNav = false;
    this.configurationWizardService.showSideNavChartofAccounts = false;
    this.configurationWizardService.showBreadcrumbs = true;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/home']);
  }

  previousStep() {
    this.configurationWizardService.showSideNav = false;
    this.configurationWizardService.showSideNavChartofAccounts = false;
    this.configurationWizardService.showToolbarAdmin = true;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/home']);
  }

  get tenantIdentifier(): string {
    return this.settingsService.tenantIdentifier;
  }
}
