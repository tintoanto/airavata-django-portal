<template>
    <div>
        <div class="row">
            <div class="col">
                <h1 class="h4 mb-4">Groups</h1>
            </div>
            <div id="col-new-group" class="col-sm-2">
                <b-button href="create" :variant="'primary'">Create New Group&nbsp;&nbsp;<i class="fa fa-plus" aria-hidden="true"></i></b-button>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="card">
                    <div class="card-body">
                        <group-owner-list v-bind:groupsForOwners="groupsOwners"></group-owner-list>
                        <pager v-bind:paginator="groupOwnersPaginator"
                        v-on:next="nextOwnerGroups" v-on:previous="previousOwnerGroups"></pager>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import GroupOwnerList from './GroupOwnerList.vue';
import GroupMemberList from './GroupMemberList.vue';

import { models, services } from 'django-airavata-api'
import { components as comps } from 'django-airavata-common-ui'

export default {
    name: 'groups-manage-container',
    props: ['groupsDataOwners', 'groupsDataMembers'],
    data () {
        return {
            groupOwnersPaginator: null,
            groupMembersPaginator: null,
        }
    },
    components: {
        'group-owner-list': GroupOwnerList,
        'group-member-list': GroupMemberList,
        'pager': comps.Pager,
    },
    methods: {
        nextMemberGroups: function(event) {
            this.groupMembersPaginator.next();
        },
        previousMemberGroups: function(event) {
            this.groupMembersPaginator.previous();
        },
        nextOwnerGroups: function(event) {
            this.groupOwnersPaginator.next();
        },
        previousOwnerGroups: function(event) {
            this.groupOwnersPaginator.previous();
        },
    },
    computed: {
        groupsOwners: function() {
            return this.groupOwnersPaginator ? this.groupOwnersPaginator.results : null;
        },
        groupsMembers: function() {
            return this.groupMembersPaginator ? this.groupMembersPaginator.results : null;
        },
    },
    beforeMount: function () {
        services.GroupService.list(this.groupsDataOwners)
            .then(result => this.groupOwnersPaginator = result);
    },
}
</script>

<style>
#col-new-group {
    text-align: right;
}
#modal-new-group {
    text-align: left;
}
</style>
