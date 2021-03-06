
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { AddPipelineInProject, DeletePipelineInProject, UpdatePipelineInProject } from 'app/store/project.action';
import { Map } from 'immutable';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { Application } from '../../model/application.model';
import { Job } from '../../model/job.model';
import { Parameter } from '../../model/parameter.model';
import { Pipeline } from '../../model/pipeline.model';
import { Stage } from '../../model/stage.model';
import { PipelineService } from './pipeline.service';



@Injectable()
export class PipelineStore {

    // List of all pipelines.
    private _pipeline: BehaviorSubject<Map<string, Pipeline>> = new BehaviorSubject(Map<string, Pipeline>());

    constructor(private _pipelineService: PipelineService, private store: Store) {

    }

    /**
     * Use by router to preload pipeline
     * @param key
     * @param pipName
     * @returns {any}
     */
    getPipelineResolver(key: string, pipName: string): Observable<Pipeline> {
        let store = this._pipeline.getValue();
        let pipKey = key + '-' + pipName;
        if (store.size === 0 || !store.get(pipKey)) {
            return this._pipelineService.getPipeline(key, pipName).pipe(map(res => {
                this._pipeline.next(store.set(pipKey, res));
                return res;
            }));
        } else {
            return observableOf(store.get(pipKey));
        }
    }

    getPipelines(key: string, pipName?: string): Observable<Map<string, Pipeline>> {
        let store = this._pipeline.getValue();
        let pipKey = key + '-' + pipName;
        if (pipName && !store.get(pipKey)) {
            this.resync(key, pipName);
        }
        return new Observable<Map<string, Pipeline>>(fn => this._pipeline.subscribe(fn));
    }

    resync(key: string, pipName: string) {
        let store = this._pipeline.getValue();
        let pipKey = key + '-' + pipName;
        this._pipelineService.getPipeline(key, pipName).subscribe(res => {
            this._pipeline.next(store.set(pipKey, res));
        }, err => {
            this._pipeline.error(err);
            this._pipeline = new BehaviorSubject(Map<string, Pipeline>());
            this._pipeline.next(store);
        });
    }

    externalModification(pipKey: string) {
        let cache = this._pipeline.getValue();
        let pipToUpdate = cache.get(pipKey);
        if (pipToUpdate) {
            pipToUpdate.externalChange = true;
            this._pipeline.next(cache.set(pipKey, pipToUpdate));
        }
    }

    removeFromStore(pipKey: string) {
        let cache = this._pipeline.getValue();
        this._pipeline.next(cache.delete(pipKey));
    }

    /**
     * Import a pipeline
     * @param key Project unique key
     * @param workflow pipelineCode to import
     */
    importPipeline(key: string, pipName: string, pipelineCode: string, force?: boolean): Observable<Array<string>> {
        return this._pipelineService.importPipeline(key, pipName, pipelineCode, force)
            .pipe(
                mergeMap(() => {
                    if (pipName) {
                        return this._pipelineService.getPipeline(key, pipName);
                    }
                    return observableOf(null);
                }),
                tap((pip) => {
                    this.store.dispatch(new AddPipelineInProject(pip));
                }),
                map((pip) => {
                    if (pip) {
                        pip.forceRefresh = true;
                        let pipKey = key + '-' + pip.name;
                        let store = this._pipeline.getValue();
                        this._pipeline.next(store.set(pipKey, pip));
                    }
                    return pip;
                })
            );
    }

    /**
     * Rollback a pipeline
     * @param key Project unique key
     * @param pipName pipeline name to rollback
     * @param auditId audit id to rollback
     */
    rollbackPipeline(key: string, pipName: string, auditId: number): Observable<Pipeline> {
        return this._pipelineService.rollbackPipeline(key, pipName, auditId)
            .pipe(
                map((pip) => {
                    if (pip) {
                        pip.forceRefresh = true;
                        let pipKey = key + '-' + pip.name;
                        let store = this._pipeline.getValue();
                        let oldPip = store.get(pipKey);
                        oldPip.stages = pip.stages;

                        this._pipeline.next(store.set(pipKey, oldPip));
                    }
                    return pip;
                })
            );
    }

    /**
     * Create a new pipeline and put it in the store
     * @param key Project unique key
     * @param pipeline Pipeline to create
     * @returns {Observable<Pipeline>}
     */
    createPipeline(key: string, pipeline: Pipeline): Observable<Pipeline> {
        return this._pipelineService.createPipeline(key, pipeline)
            .pipe(
                tap((pip) => {
                    this.store.dispatch(new AddPipelineInProject(pip));
                }),
                map(pip => {
                    let store = this._pipeline.getValue();
                    let pipKey = key + '-' + pip.name;
                    this._pipeline.next(store.set(pipKey, pip));
                    return pip;
                })
            );
    }

    /**
     * Update the given pipeline
     * @param key Project unique key
     * @param oldName Old pipeline name
     * @param pipeline Pipeline to update
     * @returns {Observable<Pipeline>}
     */
    updatePipeline(key: string, oldName: string, pipeline: Pipeline): Observable<Pipeline> {
        return this._pipelineService.updatePipeline(key, oldName, pipeline).pipe(map(pip => {
            // update project cache
            let cache = this._pipeline.getValue();
            let pipKey = key + '-' + oldName;
            if (cache.get(pipKey)) {
                let pToUpdate = cache.get(pipKey);
                pToUpdate.last_modified = pip.last_modified;
                pToUpdate.name = pip.name;
                this._pipeline.next(cache.set(key + '-' + pip.name, pToUpdate).remove(pipKey));
            }
            this.store.dispatch(new UpdatePipelineInProject({
                previousPipName: oldName,
                changes: pipeline
            }));

            return pip;
        }));
    }

    /**
     * Delete a pipleine
     * @param key Project unique key
     * @param pipName Pipeline name to delete
     * @returns {Observable<boolean>}
     */
    deletePipeline(key: string, pipName: string): Observable<boolean> {
        return this._pipelineService.deletePipeline(key, pipName).pipe(
            tap((pip) => {
                this.store.dispatch(new DeletePipelineInProject({ pipelineName: pipName }));
            }),
            map(() => {
                let pipKey = key + '-' + pipName;
                this.removeFromStore(pipKey);
                return true;
            })
        );
    }

    /**
     * Add a stage in the given pipeline
     * @param key Project unique key
     * @param pipName Pipeline name
     * @param stage Stage to add
     */
    addStage(key: string, pipName: string, stage: Stage): Observable<Pipeline> {
        return this._pipelineService.insertStage(key, pipName, stage).pipe(map(res => {
            this.refreshPipelineStageCache(key, pipName, res);
            return res;
        }));
    }

    /**
     * Update Stage
     * @param key project unique key
     * @param pipName Pipeline Name
     * @param stage Stage
     * @returns {Observable<Pipeline>}
     */
    updateStage(key: string, pipName: string, stage: Stage): Observable<Pipeline> {
        return this._pipelineService.updateStage(key, pipName, stage).pipe(map(res => {
            return this.refreshPipelineStageCache(key, pipName, res);
        }));
    }

    /**
     * Delete a stage
     * @param key Project unique key
     * @param pipName Pipeline Name
     * @param stage Stage to delete
     * @returns {Observable<Pipeline>}
     */
    removeStage(key: string, pipName: string, stage: Stage): Observable<Pipeline> {
        return this._pipelineService.deleteStage(key, pipName, stage).pipe(map(res => {
            return this.refreshPipelineStageCache(key, pipName, res);
        }));
    }

    /**
     * Refresh pipeline cache
     * @param key Project unique key
     * @param pipName Pipeline Name
     * @param pipeline updated stages pipeline
     * @returns {Pipeline}
     */
    refreshPipelineStageCache(key: string, pipName: string, pipeline: Pipeline): Pipeline {
        let cache = this._pipeline.getValue();
        let pipKey = key + '-' + pipName;
        let pipelineToUpdate = cache.get(pipKey);
        if (pipelineToUpdate) {
            pipelineToUpdate.last_modified = pipeline.last_modified;
            pipelineToUpdate.stages = pipeline.stages;
            this._pipeline.next(cache.set(pipKey, pipelineToUpdate));
            return pipelineToUpdate;
        }
        return pipeline;
    }

    /**
     * Add a job in a stage
     * @param key Project unique key
     * @param pipName Pipeline Name
     * @param stageID Stage ID
     * @param job Job to add
     * @returns {Observable<Pipeline>}
     */
    addJob(key: string, pipName: string, stageID: number, job: Job): Observable<Pipeline> {
        return this._pipelineService.addJob(key, pipName, stageID, job).pipe(map(res => {
            return this.refreshPipelineStageCache(key, pipName, res);
        }));
    }

    /**
     * Update a job in a stage
     * @param key Project unique key
     * @param pipName Pipeline Name
     * @param stageID Stage ID
     * @param job Job to update
     * @returns {Observable<Pipeline>}
     */
    updateJob(key: string, pipName: string, stageID: number, job: Job): Observable<Pipeline> {
        return this._pipelineService.updateJob(key, pipName, stageID, job).pipe(map(res => {
            return this.refreshPipelineStageCache(key, pipName, res);
        }));
    }

    /**
     * Delete a job in a stage
     * @param key Project unique key
     * @param pipName Pipeline Name
     * @param stageID Stage ID
     * @param job Job to delete
     * @returns {Observable<Pipeline>}
     */
    removeJob(key: string, pipName: string, stageID: number, job: Job): Observable<Pipeline> {
        return this._pipelineService.removeJob(key, pipName, stageID, job).pipe(map(res => {
            return this.refreshPipelineStageCache(key, pipName, res);
        }));
    }

    /**
     * Add a parameter on the given pipeline
     * @param key Project unique key
     * @param pipName Pipeline name
     * @param param Parameter to add
     * @returns {Observable<Pipeline>}
     */
    addParameter(key: string, pipName: string, param: Parameter): Observable<Pipeline> {
        return this._pipelineService.addParameter(key, pipName, param).pipe(map(pip => {
            return this.refreshPipelineParameterCache(key, pipName, pip);
        }));
    }

    /**
     * Update a parameter on the given pipeline
     * @param key Project unique key
     * @param pipName Pipeline name
     * @param param Parameter to update
     * @returns {Observable<Pipeline>}
     */
    updateParameter(key: string, pipName: string, param: Parameter): Observable<Pipeline> {
        return this._pipelineService.updateParameter(key, pipName, param).pipe(map(pip => {
            return this.refreshPipelineParameterCache(key, pipName, pip);
        }));
    }

    /**
     * Remove a parameter on the given pipeline
     * @param key Project unique key
     * @param pipName Pipeline name
     * @param param Parameter to remove
     * @returns {Observable<Pipeline>}
     */
    removeParameter(key: string, pipName: string, param: Parameter): Observable<Pipeline> {
        return this._pipelineService.removeParameter(key, pipName, param).pipe(map(pip => {
            return this.refreshPipelineParameterCache(key, pipName, pip);
        }));
    }

    /**
     * Refresh pipeline cache
     * @param key Project unique key
     * @param pipName Pipeline Name
     * @param pipeline updated permissions pipeline
     * @returns {Pipeline}
     */
    refreshPipelineParameterCache(key: string, pipName: string, pipeline: Pipeline): Pipeline {
        let cache = this._pipeline.getValue();
        let pipKey = key + '-' + pipName;
        let pipelineToUpdate = cache.get(pipKey);
        if (pipelineToUpdate) {
            pipelineToUpdate.last_modified = pipeline.last_modified;
            pipelineToUpdate.parameters = pipeline.parameters;
            this._pipeline.next(cache.set(pipKey, pipelineToUpdate));
            return pipelineToUpdate;
        }
        return pipeline;
    }

    /**
     * Move a stage
     * @param key Project unique key
     * @param name Pipeline name
     * @param stageMoved Stage to move
     */
    moveStage(key: string, pipName: string, stageMoved: Stage) {
        return this._pipelineService.moveStage(key, pipName, stageMoved).pipe(map(pip => {
            return this.refreshPipelineStageCache(key, pipName, pip);
        }));
    }


    /**
     * Refresh pipeline cache
     * @param key Project unique key
     * @param pipName Pipeline Name
     * @param pipeline updated stages pipeline
     * @returns {Pipeline}
     */
    refreshPipelineApplicationsCache(key: string, pipName: string, apps: Array<Application>): Pipeline {
        let cache = this._pipeline.getValue();
        let pipKey = key + '-' + pipName;
        let pipelineToUpdate = cache.get(pipKey);
        if (pipelineToUpdate) {
            if (pipelineToUpdate.usage) {
                pipelineToUpdate.usage.applications = apps;
            }
            this._pipeline.next(cache.set(pipKey, pipelineToUpdate));
        }
        return pipelineToUpdate;
    }
}
