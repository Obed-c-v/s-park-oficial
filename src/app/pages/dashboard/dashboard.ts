import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { fadeInSlide, staggerAnimation } from '../../shared/animations';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  animations: [fadeInSlide, staggerAnimation],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  settingsService = inject(SettingsService);
  isSidebarCollapsed = signal(false);

  toggleSidebar() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }
}
