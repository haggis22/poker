<template>

    <div class="table-menu">

        <div class="sit-out">

            <label>
                <input type="checkbox" value="true" :checked="isSittingOut" @change="setStatus" />
                Sit out next hand
            </label>

        </div>
        <div>
            <button type="button" class="stand-up" @click.stop="standUp">Stand Up</button>
        </div>
        <div v-if="addChipsButtonReady">
            <button type="button" class="add-chips" @click.stop="checkBalance">Add Chips</button>
        </div>
        <div v-if="addChipsDialogReady" class="add-chips-dialog">
            <div>
                <span class="min-buy-in">{{ ui.chipFormatter.format(minBuyIn) }}</span>
                <input type="range" v-model="numAddChips" :min="minBuyIn" :max="maxBuyIn" :step="step" />
                <span class="max-buy-in">{{ ui.chipFormatter.format(maxBuyIn) }}</span>
            </div>
            <div class="buy-amount">{{ ui.chipFormatter.format(numAddChips) }}</div>
            <div>
                <button type="button" class="buy-in" @click.stop="buyIn">Buy In</button>
                <button type="button" class="cancel" @click.stop="cancelBuyIn">Cancel</button>
            </div>
        </div>

    </div>

</template>


<script lang="ts">
    
import './table-menu.scss';

import Vue from 'vue';

import { TableUI } from '../../table-ui';
import { SetStatusCommand, StandUpCommand, AddChipsCommand } from '../../../../communication/serializable';


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

    },
    data() {

        let values =
        {
            numAddChips: 1000,
            step: 100,
            showAddChips: false
        };

        return values;

    },
    computed: {

        addChipsButtonReady: function () {

            return !this.showAddChips;

        },

        minBuyIn: function () {

            return this.showAddChips ? 0 : null;

        },

        maxBuyIn: function () {

            return (this.showAddChips && this.ui) ? this.ui.currentBalance : null;

        },

        addChipsDialogReady: function () {

            return this.showAddChips && this.maxBuyIn > 0;

        }


    },
    methods: {

        setStatus: function (event) {

            // The actual local value hasn't changed yet, so use the checked flag of the input checkbox itself
            this.ui.sendCommand(new SetStatusCommand(this.ui.table.id, event.target.checked));
            this.$emit('update:isSittingOut', event.target.checked);

        },

        standUp: function (event) {

            this.ui.sendCommand(new StandUpCommand(this.ui.table.id));

        },

        checkBalance: function (event) {

            this.ui.checkBalance();
            this.showAddChips = true;

        },

        buyIn: function (event) {

            let numChips = parseInt(this.numAddChips, 10);

            if (!isNaN(numChips)) {

                if (numChips === 0) {

                    this.showAddChips = false;
                    return;

                }

                if (numChips <= this.ui.currentBalance) {

                    this.ui.sendCommand(new AddChipsCommand(this.ui.table.id, numChips));
                    this.showAddChips = false;

                }

            }

        },
        cancelBuyIn: function (event) {

            this.showAddChips = false;

        }



    }

});

export default TableMenuComponent;

</script>
