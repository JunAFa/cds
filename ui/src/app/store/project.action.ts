
import { Application } from 'app/model/application.model';
import { Environment } from 'app/model/environment.model';
import { GroupPermission } from 'app/model/group.model';
import { ProjectIntegration } from 'app/model/integration.model';
import { Key } from 'app/model/keys.model';
import { Pipeline } from 'app/model/pipeline.model';
import { Label, LoadOpts, Project } from 'app/model/project.model';
import { Variable } from 'app/model/variable.model';
import { Workflow } from 'app/model/workflow.model';

// Use to load fetched Project in our app
export class LoadProject {
    static readonly type = '[Project] Load Project';
    constructor(public payload: Project) { }
}

// Use to fetch Project from backend
export class FetchProject {
    static readonly type = '[Project] Fetch Project';
    constructor(public payload: { projectKey: string, opts: LoadOpts[] }) { }
}

// Use to resync Project from backend
export class ResyncProject {
    static readonly type = '[Project] Resync Project';
    constructor(public payload: { projectKey: string, opts: LoadOpts[] }) { }
}

export class AddProject {
    static readonly type = '[Project] Add Project';
    constructor(public payload: Project) { }
}

export class UpdateProject {
    static readonly type = '[Project] Update Project';
    constructor(public payload: Project) { }
}

export class DeleteProject {
    static readonly type = '[Project] Delete Project';
    constructor(public payload: { projectKey: string }) { }
}

export class ExternalChangeProject {
    static readonly type = '[Project] External Change Project';
    constructor(public payload: { projectKey: string }) { }
}

export class DeleteProjectFromCache {
    static readonly type = '[Project] Delete Project From cache';
    constructor(public payload: { projectKey: string }) { }
}

//  ------- Misc --------- //
export class UpdateFavoriteProject {
    static readonly type = '[Project] Update Project Favorite';
    constructor(public payload: { projectKey: string }) { }
}

//  ------- Variable --------- //
export class ResyncVariablesInProject {
    static readonly type = '[Project] Resync Variables in Project';
    constructor(public payload: { projectKey: string }) { }
}
export class FetchVariablesInProject {
    static readonly type = '[Project] Fetch Variables in Project';
    constructor(public payload: { projectKey: string }) { }
}
export class LoadVariablesInProject {
    static readonly type = '[Project] Load Variables in Project';
    constructor(public payload: Variable[]) { }
}
export class AddVariableInProject {
    static readonly type = '[Project] Add Variable in Project';
    constructor(public payload: Variable) { }
}
export class UpdateVariableInProject {
    static readonly type = '[Project] Update Variable in Project';
    constructor(public payload: { variableName: string, changes: Variable }) { }
}
export class DeleteVariableInProject {
    static readonly type = '[Project] Delete Variable in Project';
    constructor(public payload: Variable) { }
}

//  ------- Application --------- //
export class AddApplicationInProject {
    static readonly type = '[Project] Add application in Project';
    constructor(public payload: Application) { }
}
export class RenameApplicationInProject {
    static readonly type = '[Project] Rename application in Project';
    constructor(public payload: { previousAppName: string, newAppName: string }) { }
}
export class DeleteApplicationInProject {
    static readonly type = '[Project] Delete application in Project';
    constructor(public payload: { applicationName: string }) { }
}

//  ------- Workflow --------- //
export class AddWorkflowInProject {
    static readonly type = '[Project] Add Workflow in Project';
    constructor(public payload: Workflow) { }
}
export class RenameWorkflowInProject {
    static readonly type = '[Project] Rename workflow in Project';
    constructor(public payload: { previousWorkflowName: string, newWorkflowName: string }) { }
}
export class DeleteWorkflowInProject {
    static readonly type = '[Project] Delete Workflow in Project';
    constructor(public payload: { workflowName: string }) { }
}

//  ------- Pipeline --------- //
export class AddPipelineInProject {
    static readonly type = '[Project] Add Pipeline in Project';
    constructor(public payload: Pipeline) { }
}
export class RenamePipelineInProject {
    static readonly type = '[Project] Rename pipeline in Project';
    constructor(public payload: { previousPipName: string, newPipName: string }) { }
}
export class DeletePipelineInProject {
    static readonly type = '[Project] Delete Pipeline in Project';
    constructor(public payload: { pipelineName: string }) { }
}

//  ------- Group Permission --------- //
export class AddGroupInProject {
    static readonly type = '[Project] Add Group in Project';
    constructor(public payload: { projectKey: string, group: GroupPermission }) { }
}
export class UpdateGroupInProject {
    static readonly type = '[Project] Update Group in Project';
    constructor(public payload: { projectKey: string, group: GroupPermission }) { }
}
export class DeleteGroupInProject {
    static readonly type = '[Project] Delete Group in Project';
    constructor(public payload: { projectKey: string, group: GroupPermission }) { }
}

//  ------- Label --------- //
export class AddLabelInProject {
    static readonly type = '[Project] Add Label in Project';
    constructor(public payload: { projectKey: string, label: Label }) { }
}
export class DeleteLabelProject {
    static readonly type = '[Project] Delete Label in Project';
    constructor(public payload: { projectKey: string, label: Label }) { }
}
export class AddLabelWorkflowInProject {
    static readonly type = '[Project] Add Label on Workflow in Project';
    constructor(public payload: { workflowName: string, label: Label }) { }
}
export class DeleteLabelWorkflowInProject {
    static readonly type = '[Project] Delete Label on Workflow in Project';
    constructor(public payload: { workflowName: string, labelId: number }) { }
}

//  ------- Integration --------- //
export class ResyncIntegrationsInProject {
    static readonly type = '[Project] Resync Integrations in Project';
    constructor(public payload: { projectKey: string }) { }
}
export class FetchIntegrationsInProject {
    static readonly type = '[Project] Fetch Integrations in Project';
    constructor(public payload: { projectKey: string }) { }
}
export class LoadIntegrationsInProject {
    static readonly type = '[Project] Load Integrations in Project';
    constructor(public payload: ProjectIntegration[]) { }
}
export class AddIntegrationInProject {
    static readonly type = '[Project] Add Integration in Project';
    constructor(public payload: { projectKey: string, integration: ProjectIntegration }) { }
}
export class UpdateIntegrationInProject {
    static readonly type = '[Project] Update integration in Project';
    constructor(public payload: { projectKey: string, integrationName: string, changes: ProjectIntegration }) { }
}
export class DeleteIntegrationInProject {
    static readonly type = '[Project] Delete Integration in Project';
    constructor(public payload: { projectKey: string, integration: ProjectIntegration }) { }
}

//  ------- Key --------- //
export class ResyncKeysInProject {
    static readonly type = '[Project] Resync Keys in Project';
    constructor(public payload: { projectKey: string }) { }
}
export class FetchKeysInProject {
    static readonly type = '[Project] Fetch Keys in Project';
    constructor(public payload: { projectKey: string }) { }
}
export class LoadKeysInProject {
    static readonly type = '[Project] Load Keys in Project';
    constructor(public payload: Key[]) { }
}
export class AddKeyInProject {
    static readonly type = '[Project] Add Key in Project';
    constructor(public payload: { projectKey: string, key: Key }) { }
}
export class DeleteKeyInProject {
    static readonly type = '[Project] Delete Key in Project';
    constructor(public payload: { projectKey: string, key: Key }) { }
}

//  ------- Environment --------- //
export class ResyncEnvironmentsInProject {
    static readonly type = '[Project] Resync Environments in Project';
    constructor(public payload: { projectKey: string }) { }
}
export class FetchEnvironmentsInProject {
    static readonly type = '[Project] Fetch Environments in Project';
    constructor(public payload: { projectKey: string }) { }
}
export class LoadEnvironmentsInProject {
    static readonly type = '[Project] Load Environments in Project';
    constructor(public payload: Environment[]) { }
}
export class AddEnvironmentInProject {
    static readonly type = '[Project] Add Environment in Project';
    constructor(public payload: { projectKey: string, environment: Environment }) { }
}
export class CloneEnvironmentInProject {
    static readonly type = '[Project] Clone Environment in Project';
    constructor(public payload: { projectKey: string, cloneName: string, environment: Environment }) { }
}
export class UpdateEnvironmentInProject {
    static readonly type = '[Project] Update environment in Project';
    constructor(public payload: { projectKey: string, environmentName: string, changes: Environment }) { }
}
export class DeleteEnvironmentInProject {
    static readonly type = '[Project] Delete Environment in Project';
    constructor(public payload: { projectKey: string, environment: Environment }) { }
}
export class AddEnvironmentVariableInProject {
    static readonly type = '[Project] Add Environment Variable in Project';
    constructor(public payload: { projectKey: string, environmentName: string, variable: Variable }) { }
}
export class UpdateEnvironmentVariableInProject {
    static readonly type = '[Project] Update environment variable in Project';
    constructor(public payload: { projectKey: string, environmentName: string, variableName: string, changes: Variable }) { }
}
export class DeleteEnvironmentVariableInProject {
    static readonly type = '[Project] Delete Environment Variable in Project';
    constructor(public payload: { projectKey: string, environmentName: string, variable: Variable }) { }
}
