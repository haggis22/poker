<template>
    <div class="dealer-box">
    </div>
</template>


<script lang="ts">


import './dealer-box.scss';

import Vue from 'vue';

import { BetTracker } from '../../../../casino/tables/betting/bet-tracker';
import { TableUI } from '../../../table-ui';

const DealerComponent = Vue.extend ({

    props: {
        betTracker: {
            type: BetTracker,
            required: false
        },
        ui: {
            type: TableUI,
            required: false
        }
    }

});

export default DealerComponent;

</script>
