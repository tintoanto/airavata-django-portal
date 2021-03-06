import BaseModel from './BaseModel';
import ExperimentState from './ExperimentState';

const FIELDS = [
     {
         name: 'state',
         type: ExperimentState,
     },
     {
         name: 'timeOfStateChange',
         type: 'date',
     },
     'reason',
];

export default class ExperimentStatus extends BaseModel {
    constructor(data = {}) {
        super(FIELDS, data);
    }
}
