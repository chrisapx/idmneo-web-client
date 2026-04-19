import { Component, OnInit, OnDestroy, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, forkJoin, Subject } from 'rxjs';
import { startWith, map, takeUntil } from 'rxjs/operators';

import { activities } from './activities';
import { WarningDialogComponent } from './warning-dialog/warning-dialog.component';
import { AuthenticationService } from '../core/authentication/authentication.service';
import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';
import { NextStepDialogComponent } from '../configuration-wizard/next-step-dialog/next-step-dialog.component';
import { HomeService } from './home.service';
import { SettingsService } from '../settings/settings.service';
import { Dates } from '../core/utils/dates';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatAutocompleteTrigger, MatAutocomplete, MatOption } from '@angular/material/autocomplete';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDivider } from '@angular/material/divider';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { NgFor, NgIf, AsyncPipe, DecimalPipe, DatePipe, CurrencyPipe } from '@angular/common';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

import Chart from 'chart.js';

@Component({
  selector: 'mifosx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatCardHeader,
    MatCardTitle,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatIcon,
    MatTooltip,
    MatDivider,
    MatMenu,
    MatMenuTrigger,
    MatButtonToggleGroup,
    MatButtonToggle,
    AsyncPipe,
    DecimalPipe,
    DatePipe,
    CurrencyPipe
  ]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  username: string;
  searchText: UntypedFormControl = new UntypedFormControl();
  filteredActivities: Observable<any[]>;
  allActivities: any[] = activities;

  // Today section
  todayDate = new Date();
  grossDisbursements = 0;
  yesterdayDisbursements = 0;
  pendingDisbursements = 0;
  portfolioBalance = 0;
  totalCollections = 0;
  pendingCollections = 0;
  totalClients = 0;
  newClients = 0;
  activeLoans = 0;

  // Overview section
  dateRangeControl = new UntypedFormControl('Day');
  officeControl = new UntypedFormControl(1);
  officeData: any[] = [];

  // Charts
  todayChart: any;
  disbursementTrendChart: any;
  collectionTrendChart: any;

  // Recent transactions
  recentTransactions: any[] = [];

  // Quick actions
  quickActions = [
    { label: 'Create new client', icon: 'user', path: '/clients/create' },
    { label: 'Create loan account', icon: 'money-bill', path: '/loans/create' },
    { label: 'Journal entry', icon: 'money-bill-alt', path: '/accounting/journal-entries/create' },
    { label: 'Run reports', icon: 'chart-bar', path: '/reports' }
  ];

  // Top borrowers / recent clients
  recentClients: any[] = [];

  // System info
  tenantId: string;

  // Loading states
  loadingToday = true;
  loadingOverview = true;
  loadingTransactions = true;

  private destroy$ = new Subject<void>();

  @ViewChild('buttonDashboard', { static: false }) buttonDashboard: ElementRef<any>;
  @ViewChild('templateButtonDashboard', { static: false }) templateButtonDashboard: TemplateRef<any>;
  @ViewChild('searchActivity', { static: false }) searchActivity: ElementRef<any>;
  @ViewChild('templateSearchActivity', { static: false }) templateSearchActivity: TemplateRef<any>;
  @ViewChild('todayChartCanvas', { static: false }) todayChartCanvas: ElementRef<any>;
  @ViewChild('disbursementChartCanvas', { static: false }) disbursementChartCanvas: ElementRef<any>;
  @ViewChild('collectionChartCanvas', { static: false }) collectionChartCanvas: ElementRef<any>;

  constructor(
    private authenticationService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService,
    private homeService: HomeService,
    private settingsService: SettingsService,
    private dateUtils: Dates
  ) {}

  ngOnInit() {
    const credentials = this.authenticationService.getCredentials();
    this.username = credentials.username;
    this.tenantId = this.settingsService.tenantIdentifier || 'default';

    this.setFilteredActivities();
    this.loadOffices();
    this.loadTodayData();
    this.loadRecentTransactions();
    this.loadRecentClients();
  }

  ngAfterViewInit() {
    if (this.configurationWizardService.showHome === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonDashboard, this.buttonDashboard.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showHomeSearchActivity === true) {
      setTimeout(() => {
        this.showPopover(this.templateSearchActivity, this.searchActivity.nativeElement, 'bottom', true);
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.todayChart) this.todayChart.destroy();
    if (this.disbursementTrendChart) this.disbursementTrendChart.destroy();
    if (this.collectionTrendChart) this.collectionTrendChart.destroy();
  }

  loadOffices() {
    this.homeService.getOffices().subscribe((offices: any) => {
      this.officeData = offices;
      this.loadOverviewData();
    });
  }

  loadTodayData() {
    this.loadingToday = true;
    const officeId = this.officeControl.value || 1;

    forkJoin([
      this.homeService.getDisbursedAmount(officeId),
      this.homeService.getCollectedAmount(officeId)
    ]).subscribe({
      next: ([disbursed, collected]: [any, any]) => {
        if (disbursed && disbursed[0]) {
          const d = disbursed[0];
          this.grossDisbursements = d.disbursedAmount || d.Disbursed || d['Disbursed Amount'] || 0;
          this.pendingDisbursements = d.awaitingDisbursalAmount || d.AwaitingDisbursal || d['Awaiting Disbursal'] || 0;
        }
        if (collected && collected[0]) {
          const c = collected[0];
          this.totalCollections = c.collected || c.Collected || c['Collection'] || c['Actual Collection'] || 0;
          this.pendingCollections = c.pending || c.Pending || c['Demand'] || c['Expected Collection'] || 0;
        }
        this.portfolioBalance = this.grossDisbursements + this.pendingDisbursements;
        this.loadingToday = false;
        this.initTodayChart();
      },
      error: () => {
        this.loadingToday = false;
        this.initTodayChart();
      }
    });
  }

  loadOverviewData() {
    this.loadingOverview = true;
    const officeId = this.officeControl.value || 1;
    const timescale = this.dateRangeControl.value || 'Day';

    let clientTrends$: Observable<any>;
    let loanTrends$: Observable<any>;

    switch (timescale) {
      case 'Week':
        clientTrends$ = this.homeService.getClientTrendsByWeek(officeId);
        loanTrends$ = this.homeService.getLoanTrendsByWeek(officeId);
        break;
      case 'Month':
        clientTrends$ = this.homeService.getClientTrendsByMonth(officeId);
        loanTrends$ = this.homeService.getLoanTrendsByMonth(officeId);
        break;
      default:
        clientTrends$ = this.homeService.getClientTrendsByDay(officeId);
        loanTrends$ = this.homeService.getLoanTrendsByDay(officeId);
    }

    forkJoin([
      clientTrends$,
      loanTrends$,
      this.homeService.getDisbursedAmount(officeId),
      this.homeService.getCollectedAmount(officeId)
    ]).subscribe({
      next: ([clients, loans, disbursed, collected]: [any, any, any, any]) => {
        const labels = this.getLabels(timescale);
        const loanCounts = this.getCounts(loans, labels, timescale, 'loan');
        const clientCounts = this.getCounts(clients, labels, timescale, 'client');
        this.initOverviewCharts(labels, loanCounts, clientCounts);
        this.loadingOverview = false;
      },
      error: () => {
        this.loadingOverview = false;
      }
    });
  }

  loadRecentTransactions() {
    this.loadingTransactions = true;
    this.homeService.getRecentTransactions().subscribe({
      next: (data: any) => {
        this.recentTransactions = (data?.pageItems || data || []).slice(0, 8);
        this.loadingTransactions = false;
      },
      error: () => {
        this.loadingTransactions = false;
      }
    });
  }

  loadRecentClients() {
    this.homeService.getClients().subscribe({
      next: (data: any) => {
        const all = data?.pageItems || data || [];
        this.recentClients = all.slice(0, 5);
        this.totalClients = data?.totalFilteredRecords || all.length || 0;
        this.newClients = all.length;
      },
      error: () => {}
    });
  }

  onTimescaleChange() {
    this.loadOverviewData();
  }

  onOfficeChange() {
    this.loadTodayData();
    this.loadOverviewData();
  }

  // Chart initialization
  initTodayChart() {
    setTimeout(() => {
      const canvas = document.getElementById('today-chart') as HTMLCanvasElement;
      if (!canvas) return;

      const hours = [];
      for (let i = 0; i <= 23; i++) {
        hours.push(i === 0 ? '12 AM' : i === 12 ? '12 PM' : i < 12 ? `${i} AM` : `${i - 12} PM`);
      }

      const data = hours.map(() => 0);

      if (this.todayChart) this.todayChart.destroy();
      this.todayChart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: hours,
          datasets: [{
            data: data,
            borderColor: '#635BFF',
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: { display: false },
          scales: {
            x: {
              display: true,
              grid: { display: false },
              ticks: {
                maxTicksLimit: 5,
                color: '#8898AA',
                font: { size: 11 }
              }
            },
            y: {
              display: false,
              beginAtZero: true
            }
          },
          tooltips: {
            mode: 'index',
            intersect: false
          }
        }
      });
    }, 100);
  }

  initOverviewCharts(labels: any[], loanCounts: number[], clientCounts: number[]) {
    setTimeout(() => {
      // Disbursement Trends chart
      const disbCanvas = document.getElementById('disbursement-trend-chart') as HTMLCanvasElement;
      if (disbCanvas) {
        if (this.disbursementTrendChart) this.disbursementTrendChart.destroy();
        this.disbursementTrendChart = new Chart(disbCanvas, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              data: loanCounts,
              borderColor: '#635BFF',
              backgroundColor: 'rgba(99, 91, 255, 0.08)',
              borderWidth: 2,
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 4,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: false },
            scales: {
              x: {
                display: true,
                grid: { display: false },
                ticks: { color: '#8898AA', font: { size: 10 }, maxTicksLimit: 4 }
              },
              y: {
                display: true,
                beginAtZero: true,
                grid: { color: '#F0F2F5', drawBorder: false },
                ticks: { color: '#8898AA', font: { size: 10 }, maxTicksLimit: 4 }
              }
            },
            tooltips: { mode: 'index', intersect: false }
          }
        });
      }

      // Collection Trends chart
      const collCanvas = document.getElementById('collection-trend-chart') as HTMLCanvasElement;
      if (collCanvas) {
        if (this.collectionTrendChart) this.collectionTrendChart.destroy();
        this.collectionTrendChart = new Chart(collCanvas, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              data: clientCounts,
              borderColor: '#635BFF',
              backgroundColor: 'rgba(99, 91, 255, 0.08)',
              borderWidth: 2,
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 4,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: false },
            scales: {
              x: {
                display: true,
                grid: { display: false },
                ticks: { color: '#8898AA', font: { size: 10 }, maxTicksLimit: 4 }
              },
              y: {
                display: true,
                beginAtZero: true,
                grid: { color: '#F0F2F5', drawBorder: false },
                ticks: { color: '#8898AA', font: { size: 10 }, maxTicksLimit: 4 }
              }
            },
            tooltips: { mode: 'index', intersect: false }
          }
        });
      }
    }, 100);
  }

  // Labels and counts helpers (from existing dashboard)
  getLabels(timescale: string): any[] {
    const date = new Date();
    const labelsArray: any[] = [];
    switch (timescale) {
      case 'Day':
        while (labelsArray.length < 7) {
          date.setDate(date.getDate() - 1);
          const d = this.dateUtils.formatDate(date, 'd/M');
          labelsArray.push(d);
        }
        break;
      case 'Week':
        const onejan = new Date(date.getFullYear(), 0, 1);
        while (labelsArray.length < 7) {
          date.setDate(date.getDate() - 7);
          const weekNumber = Math.ceil(((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
          labelsArray.push(weekNumber);
        }
        break;
      case 'Month':
        while (labelsArray.length < 7) {
          const m = this.dateUtils.formatDate(date, 'MMMM');
          labelsArray.push(m);
          date.setMonth(date.getMonth() - 1);
        }
        break;
    }
    return labelsArray.reverse();
  }

  getCounts(response: any[], labels: any[], timescale: string, type: string): number[] {
    const counts: number[] = [];
    labels.forEach((label: any) => {
      let match: any;
      switch (timescale) {
        case 'Day':
          match = response.find((entry: any) => {
            const d = this.dateUtils.formatDate(entry.days, 'd/M');
            return d === label;
          });
          break;
        case 'Week':
          match = response.find((entry: any) => entry.Weeks === label);
          break;
        case 'Month':
          match = response.find((entry: any) => entry.Months === label);
          break;
      }
      if (match) {
        counts.push(type === 'client' ? (match.count || 0) : (match.lcount || 0));
      } else {
        counts.push(0);
      }
    });
    return counts;
  }

  // Activity search
  setFilteredActivities() {
    this.filteredActivities = this.searchText.valueChanges.pipe(
      map((activity: any) => (typeof activity === 'string' ? activity : activity.activity)),
      map((activityName: string) => (activityName ? this.filterActivity(activityName) : this.allActivities))
    );
  }

  private filterActivity(activityName: string): any {
    const filterValue = activityName.toLowerCase();
    return this.allActivities.filter((activity) => activity.activity.toLowerCase().indexOf(filterValue) === 0);
  }

  // Navigation
  navigateTo(path: string) {
    this.router.navigateByUrl(path);
  }

  // Configuration wizard
  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  nextStep() {
    this.configurationWizardService.showHome = false;
    this.configurationWizardService.showHomeSearchActivity = false;
    this.openNextStepDialog();
  }

  openNextStepDialog() {
    const nextStepDialogRef = this.dialog.open(NextStepDialogComponent, {
      data: {
        nextStepName: 'Setup Organization',
        previousStepName: 'Home Tour',
        stepPercentage: 10
      }
    });
    nextStepDialogRef.afterClosed().subscribe((response: { nextStep: boolean }) => {
      if (response.nextStep) {
        this.configurationWizardService.showHome = false;
        this.configurationWizardService.showHomeSearchActivity = false;
        this.configurationWizardService.showCreateOffice = true;
        this.router.navigate(['/organization']);
      } else {
        this.configurationWizardService.showHome = false;
        this.configurationWizardService.showHomeSearchActivity = false;
        this.router.navigate(['/home']);
      }
    });
  }

  previousStep() {
    this.configurationWizardService.showHome = false;
    this.configurationWizardService.showHomeSearchActivity = false;
    this.configurationWizardService.showBreadcrumbs = true;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/home']);
  }
}
