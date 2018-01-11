<template>
    <div>
        <div class="row">
            <div class="col">
                <h1 class="h4 mb-4">
                    <div v-if="appModule" class="application-name text-muted text-uppercase"><i class="fa fa-code" aria-hidden="true"></i> {{ appModule.appModuleName }}</div>
                    <slot name="title">Experiment Editor</slot>
                </h1>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="card">
                    <div class="card-body">
                        <b-form novalidate>
                            <b-form-group label="Experiment Name" label-for="experiment-name">
                                <b-form-input id="experiment-name"
                                type="text" v-model="localExperiment.experimentName" required
                                placeholder="Experiment name"></b-form-input>
                            </b-form-group>
                            <b-form-group label="Project" label-for="project">
                                <b-form-select id="project"
                                    v-model="localExperiment.projectId" :options="projectOptions" required>
                                    <template slot="first">
                                        <option :value="null" disabled>Select a Project</option>
                                    </template>
                                </b-form-select>
                            </b-form-group>
                        </b-form>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <h1 class="h4 mb-4">
                    Application Configuration
                </h1>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="card">
                    <div class="card-body">
                        <h2 class="h5 mb-3">
                            Application Inputs
                        </h2>
                        <b-form novalidate>
                            <b-form-group v-for="experimentInput in localExperiment.experimentInputs"
                                    :label="experimentInput.name" :label-for="experimentInput.name" :key="experimentInput.name"
                                    :feedback="getApplicationInputFeedback(experimentInput)"
                                    :state="getApplicationInputState(experimentInput)">
                                <b-form-input :id="experimentInput.name" type="text" v-model="experimentInput.value" required
                                    :placeholder="experimentInput.userFriendlyDescription"
                                    :state="getApplicationInputState(experimentInput)"></b-form-input>
                            </b-form-group>
                        </b-form>
                        <h2 class="h5 mb-3">
                            Resource Selection
                        </h2>
                        <computational-resource-scheduling-editor
                            v-model="localExperiment.userConfigurationData.computationalResourceScheduling"
                            :app-module-id="appModule.appModuleId"
                            :app-interface-id="appInterface.applicationInterfaceId">
                        </computational-resource-scheduling-editor>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div id="col-exp-buttons" class="col">
                <b-button variant="success" @click="saveAndLaunchExperiment">
                    Save and Launch
                </b-button>
                <b-button variant="primary" @click="saveExperiment">
                    Save
                </b-button>
            </div>
        </div>
    </div>
</template>

<script>
import ComputationalResourceSchedulingEditor from './ComputationalResourceSchedulingEditor.vue'
import QueueSettingsEditor from './QueueSettingsEditor.vue'
import {models, services} from 'django-airavata-api'

export default {
    name: 'edit-experiment',
    // TODO: clone experiment instead of editing it directly
    props: {
        experiment: {
            type: models.Experiment,
            required: true
        },
        appModule: {
            type: models.ApplicationModule,
            required: true
        },
        appInterface: {
            type: models.ApplicationInterface,
            required: true
        }
    },
    data () {
        return {
            projects: [],
            localExperiment: this.experiment.clone(),
        }
    },
    components: {
        QueueSettingsEditor,
        ComputationalResourceSchedulingEditor,
    },
    mounted: function () {
        services.ProjectService.listAll()
            .then(projects => this.projects = projects);
    },
    computed: {
        projectOptions: function() {
            return this.projects.map(project => ({
                value: project.projectID,
                text: project.name,
            }));
        },
    },
    methods: {
        saveExperiment: function() {
            console.log(JSON.stringify(this.localExperiment));
            // TODO: validate experiment
            // save experiment
            services.ExperimentService.save(this.localExperiment)
                .then(experiment => {
                    this.localExperiment = experiment;
                    console.log(experiment);
                    alert('Experiment saved!');
                    this.$emit('saved', experiment);
                });
        },
        saveAndLaunchExperiment: function() {
            console.log(JSON.stringify(this.localExperiment));
            // TODO: validate experiment
            let savedExperiment = null;
            services.ExperimentService.save(this.localExperiment)
                .then(experiment => {
                    this.localExperiment = experiment;
                    return services.ExperimentService.launch(experiment.experimentId)
                        .then(result => {
                            alert('Experiment launched!');
                            this.$emit('savedAndLaunched', experiment);
                        });
                    })
                .catch(result => {
                    console.log("Launch failed!", result);
                });
        },
        getApplicationInputState: function(applicationInput) {
            const validation = this.getApplicationInputValidation(applicationInput);
            return validation !== null ? 'invalid' : null;
        },
        getApplicationInputFeedback: function(applicationInput) {
            const validation = this.getApplicationInputValidation(applicationInput);
            return validation !== null ? validation : null;
        },
        getApplicationInputValidation: function(applicationInput) {
            const validationResults = applicationInput.validate();
            if (validationResults !== null && 'value' in validationResults) {
                return validationResults;
            }
            return null;
        }
    },
    watch: {
        experiment: function(newValue) {
            this.localExperiment = newValue.clone();
        },
    }
}
</script>

<style>
.application-name {
    font-size: 12px;
}
#col-exp-buttons {
    text-align: right;
}
</style>