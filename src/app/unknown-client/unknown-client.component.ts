import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mifosx-unknown-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unknown-client.component.html',
  styleUrls: ['./unknown-client.component.scss']
})
export class UnknownClientComponent {
  hostname = window.location.hostname;
}
