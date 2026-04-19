import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormControl } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-search-tool',
  templateUrl: './search-tool.component.html',
  styleUrls: ['./search-tool.component.scss'],
  imports: [...STANDALONE_SHARED_IMPORTS, FaIconComponent]
})
export class SearchToolComponent {
  query = new UntypedFormControl('');
  isFocused = false;

  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  suggestedFilters = [
    { prefix: 'client:', example: 'client:John', description: 'search clients by name', resource: 'clients,clientIdentifiers' },
    { prefix: 'loan:', example: 'loan:000001', description: 'search loan accounts', resource: 'loans' },
    { prefix: 'savings:', example: 'savings:000002', description: 'search savings accounts', resource: 'savings' },
    { prefix: 'group:', example: 'group:Main', description: 'search groups by name', resource: 'groups' },
    { prefix: 'share:', example: 'share:000003', description: 'search share accounts', resource: 'shares' },
  ];

  constructor(private router: Router) {}

  onBlur() {
    setTimeout(() => this.isFocused = false, 200);
  }

  applyFilter(filter: any) {
    this.query.setValue(filter.prefix);
    this.isFocused = false;
    this.searchInput?.nativeElement?.focus();
  }

  search() {
    let queryText = this.query.value || '';
    let resource = 'clients,clientIdentifiers,groups,savings,shares,loans';

    for (const f of this.suggestedFilters) {
      if (queryText.startsWith(f.prefix)) {
        resource = f.resource;
        queryText = queryText.substring(f.prefix.length).trim();
        break;
      }
    }

    this.isFocused = false;
    this.router.navigate(['/search'], { queryParams: { query: queryText, resource } });
  }
}
