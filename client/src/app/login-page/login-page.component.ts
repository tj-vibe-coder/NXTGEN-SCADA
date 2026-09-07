import { Component } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '../_services/auth.service';
import { ProjectService } from '../_services/project.service';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

    showPassword = false;
    submitLoading = false;
    errorEnabled = false;
    messageError: string;
    username: UntypedFormControl = new UntypedFormControl();
    password: UntypedFormControl = new UntypedFormControl();

    private returnUrl: string;

    constructor(private authService: AuthService,
        private projectService: ProjectService,
        private translateService: TranslateService,
        private route: ActivatedRoute,
        private router: Router) {
        this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/runtime';
    }

    isValidate(): boolean {
        return !!(this.username.value && this.password.value);
    }

    onSignInClick(): void {
        this.errorEnabled = true;
        this.messageError = '';
        if (!this.isValidate()) {
            return;
        }
        this.submitLoading = true;
        this.authService.signIn(this.username.value, this.password.value).subscribe(() => {
            this.submitLoading = false;
            this.projectService.reload();
            this.router.navigateByUrl(this.returnUrl);
        }, () => {
            this.submitLoading = false;
            this.translateService.get('msg.signin-failed').subscribe((txt: string) => this.messageError = txt);
        });
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.onSignInClick();
        }
    }
}
