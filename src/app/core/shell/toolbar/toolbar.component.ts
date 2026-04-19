import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthenticationService } from '../../authentication/authentication.service';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { SearchToolComponent } from '../../../shared/search-tool/search-tool.component';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

import { environment } from '../../../../environments/environment';
import { AuthService } from 'app/zitadel/auth.service';

@Component({
  selector: 'mifosx-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIconButton,
    MatTooltip,
    MatMenuTrigger,
    SearchToolComponent,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatDivider
  ]
})
export class ToolbarComponent implements OnInit, AfterContentChecked {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));

  sidenavCollapsed = true;
  showHelpWidget = false;
  @Input() sidenav: MatSidenav;
  @Output() collapse = new EventEmitter<boolean>();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private authenticationService: AuthenticationService,
    private changeDetector: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Sidebar collapse is only user-triggered via the edge handle
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  toggleSidenav() { this.sidenav.toggle(); }

  toggleSidenavCollapse(sidenavCollapsed?: boolean) {
    this.sidenavCollapsed = sidenavCollapsed || !this.sidenavCollapsed;
    this.collapse.emit(this.sidenavCollapsed);
  }

  logout() {
    if (!environment.OIDC.oidcServerEnabled) {
      this.authenticationService.logout().subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
    } else {
      this.authService.logout();
    }
  }

  toggleHelp() {
    this.showHelpWidget = !this.showHelpWidget;
  }

  openDocs() {
    window.open('https://mifosforge.jira.com/wiki/spaces/docs/pages/52035622/User+Manual', '_blank');
    this.showHelpWidget = false;
  }

  help() {
    this.toggleHelp();
  }
}
