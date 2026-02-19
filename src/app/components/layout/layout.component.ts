import { Component, ViewChild, inject } from '@angular/core';
import { RouterOutlet, Router, ChildrenOutletContexts } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, query, animate, group } from '@angular/animations';
import { Sidebar } from '../sidebar/sidebar';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb';
import { SettingsService, Language } from '../../shared/services/settings.service';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterOutlet, Sidebar, BreadcrumbComponent, FormsModule],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css'],
    animations: [
        trigger('routeAnimations', [
            transition('* <=> *', [
                style({ position: 'relative' }),
                query(':enter, :leave', [
                    style({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        opacity: 0,
                        transform: 'translateY(10px)'
                    })
                ], { optional: true }),
                group([
                    query(':leave', [
                        animate('250ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
                    ], { optional: true }),
                    query(':enter', [
                        animate('250ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
                    ], { optional: true })
                ])
            ])
        ])
    ]
})
export class LayoutComponent {
    settingsService = inject(SettingsService);
    @ViewChild(Sidebar) sidebar!: Sidebar;

    constructor(private router: Router, private contexts: ChildrenOutletContexts) { }

    toggleSidebar() {
        if (window.innerWidth <= 768) {
            this.sidebar.toggleMobile();
        } else {
            this.sidebar.toggle();
        }
    }

    getRouteAnimationData() {
        return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
    }

    goToProfile() {
        this.router.navigate(['/profile']);
    }

    logout() {
        this.router.navigate(['/login']);
    }

    onLanguageChange(event: any) {
        this.settingsService.setLanguage(event.target.value as Language);
    }
}
