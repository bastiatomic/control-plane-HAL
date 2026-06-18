import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { DashboardHeadingComponent } from './components/dashboard-heading/dashboard-heading.component';
import { DashboardMenuComponent } from './components/dashboard-menu/dashboard-menu.component';
import { DashboardStateService } from '../services/dashboard-state/dashboard-state.service';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardHeadingComponent, DashboardMenuComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {
  readonly state = inject(DashboardStateService);

  ngOnInit() {
    this.state.initialize();
  }
}
