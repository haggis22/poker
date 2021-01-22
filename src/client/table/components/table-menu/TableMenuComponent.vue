<template>

    <div class="table-menu">

        <div class="sit-out">

            <label>
                <input type="checkbox" value="true" :checked="isSittingOut" @change="setStatus" />
                Sit out next hand
            </label>

            <button type="button" @click.stop="standUp">Stand Up</button>

        </div>

    </div>

</template>


<script lang="ts">
    
import './table-menu.scss';

import Vue from 'vue';

import { TableUI } from '../../table-ui';
import { SetStatusCommand, StandUpCommand } from '../../../../communication/serializable';


const TableMenuComponent = Vue.extend ({

    props: {
        ui: {
            type: TableUI,
            required: true
        },
        isSittingOut: {
            type: Boolean, 
            required: false
        },
        pendingFold: {
            type: Boolean,
            required: false
        },
        pendingCheck: {
            type: Boolean,
            required: false
        }

    },
    data() {

        let values =
        {
        }

        return values;

    },
    computed: {

    },
    methods: {

        setStatus: function (event) {

            // The actual local value hasn't changed yet, so use the checked flag of the input checkbox itself
            this.ui.sendCommand(new SetStatusCommand(this.ui.table.id, event.target.checked));
            this.$emit('update:isSittingOut', event.target.checked);

        },

        standUp: function (event) {

            this.ui.sendCommand(new StandUpCommand(this.ui.table.id));

        }

    }

});

export default TableMenuComponent;

</script>
