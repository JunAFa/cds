import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/internal/operators/finalize';
import { Action } from '../../../../model/action.model';
import { Group } from '../../../../model/group.model';
import { ActionService } from '../../../../service/action/action.service';
import { AuthentificationStore } from '../../../../service/auth/authentification.store';
import { GroupService } from '../../../../service/group/group.service';
import { ActionEvent } from '../../../../shared/action/action.event.model';
import { PathItem } from '../../../../shared/breadcrumb/breadcrumb.component';
import { ToastService } from '../../../../shared/toast/ToastService';

@Component({
    selector: 'app-action-add',
    templateUrl: './action.add.html',
    styleUrls: ['./action.add.scss']
})
export class ActionAddComponent {
    action: Action;
    isAdmin: boolean;
    groups: Array<Group>;
    loading: boolean;
    path: Array<PathItem>;

    constructor(
        private _actionService: ActionService,
        private _toast: ToastService, private _translate: TranslateService,
        private _router: Router,
        private _authentificationStore: AuthentificationStore,
        private _groupService: GroupService
    ) {
        this.action = <Action>{ editable: true };
        if (this._authentificationStore.isConnected()) {
            this.isAdmin = this._authentificationStore.isAdmin();
        }
        this.getGroups();

        this.path = [<PathItem>{
            translate: 'common_settings'
        }, <PathItem>{
            translate: 'action_list_title',
            routerLink: ['/', 'settings', 'action']
        }, <PathItem>{
            translate: 'common_create'
        }];
    }

    getGroups() {
        this.loading = true;
        this._groupService.getGroups()
            .pipe(finalize(() => this.loading = false))
            .subscribe(gs => {
                this.groups = gs;
            });
    }

    actionEvent(event: ActionEvent): void {
        this.action.loading = true;
        this._actionService.add(event.action).subscribe(action => {
            this._toast.success('', this._translate.instant('action_saved'));
            // navigate to have action name in url
            this._router.navigate(['settings', 'action', event.action.name]);
        }, () => {
            this.action.loading = false;
        });
    }

    // TODO check name pattern before submit
}
