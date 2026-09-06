import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { ProjectService } from '../../_services/project.service';
import { Hmi, View } from '../../_models/hmi';
import { GaugesManager } from '../../gauges/gauges.component';
import { FuxaViewComponent } from '../../fuxa-view/fuxa-view.component';

@Component({
    selector: 'runtime-view-host',
    templateUrl: './runtime-view-host.component.html',
    styleUrls: ['./runtime-view-host.component.scss']
})
export class RuntimeViewHostComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('fuxaview', { static: true }) fuxaview: FuxaViewComponent;
    @ViewChild('container', { read: ElementRef, static: true }) container: ElementRef;

    startView: View = new View();
    hmi: Hmi = new Hmi();

    private viewName: string;
    private subscriptionLoad: Subscription;

    constructor(private projectService: ProjectService,
        private route: ActivatedRoute,
        private changeDetector: ChangeDetectorRef,
        public gaugesManager: GaugesManager) { }

    ngOnInit() {
        this.viewName = this.route.snapshot.data['viewName'];
    }

    ngAfterViewInit() {
        try {
            let hmi = this.projectService.getHmi();
            if (hmi) {
                this.loadHmi();
            }
            this.subscriptionLoad = this.projectService.onLoadHmi.subscribe(() => {
                this.loadHmi();
            }, error => {
                console.error('Error loadHMI');
            });
            this.changeDetector.detectChanges();
        } catch (err) {
            console.error(err);
        }
    }

    ngOnDestroy() {
        try {
            if (this.subscriptionLoad) {
                this.subscriptionLoad.unsubscribe();
            }
        } catch (e) {
        }
    }

    private loadHmi() {
        let hmi = this.projectService.getHmi();
        if (hmi) {
            this.hmi = hmi;
        }
        if (this.hmi && this.hmi.views && this.hmi.views.length > 0) {
            this.startView = this.hmi.views.find(x => x.name === this.viewName);
            if (this.startView && this.fuxaview) {
                this.fuxaview.loadHmi(this.startView);
            }
        }
    }
}
