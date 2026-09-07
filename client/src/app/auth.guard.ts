import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './_services/auth.service';
import { ProjectService } from './_services/project.service';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthGuard  {
    constructor(private authService: AuthService,
        private projectService: ProjectService,
        private router: Router) {
        }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        if (!this.projectService.isSecurityEnabled()) {
            return of(true);
        }
        if (this.authService.isAdmin()) {
            return of(true);
        }

        const serverSecureEnabled$ = this.projectService.checkServer().pipe(
            map(response => {
                if (!response?.secureEnabled) {
                    return false;
                }
                return true;
            })
        );
        return serverSecureEnabled$.pipe(
            switchMap(secureEnabled => {
                if (!secureEnabled) {
                    return of(true);
                } else {
                    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                    return of(false);
                }
            })
        );
    }
}
