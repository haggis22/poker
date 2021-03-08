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

    import { defineComponent, vModelCheckbox } from 'vue';

    import { TableUI } from '../../table-ui';
    import { SetStatusCommand, StandUpCommand, AddChipsCommand } from '@/app/communication/serializable';

    import { tableState } from "@/store/table-state";

    const TableMenuComponent = defineComponent({

        setup() {

            return {

                table: tableState.getTable.value

            }

        },

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

        return {
            numAddChips: '1000',
            step: 100,
            showAddChips: false
        };

    },
    computed: {

        addChipsButtonReady: function (): boolean {

            return !this.showAddChips;

        },

        minBuyIn: function (): number {

            return this.showAddChips ? 0 : null;

        },

        maxBuyIn: function (): number {

            return (this.showAddChips && this.ui) ? this.ui.currentBalance : null;

        },

        addChipsDialogReady: function (): boolean {

            return this.showAddChips && this.maxBuyIn > 0;

        }


    },
    methods: {

        setStatus: function (event: Event): void {

            // The actual local value hasn't changed yet, so use the checked flag of the input checkbox itself
            if (event.target instanceof HTMLInputElement) {
                this.ui.sendCommand(new SetStatusCommand(this.table.id, event.target.checked));
                this.$emit('update:isSittingOut', event.target.checked);
            }

        },

        standUp: function (): void {

            this.ui.sendCommand(new StandUpCommand(this.table.id));

        },

        checkBalance: function (): void {

            this.ui.checkBalance();
            this.showAddChips = true;

        },

        buyIn: function (): void {

            let numChips = parseInt(this.numAddChips, 10);

            if (!isNaN(numChips)) {

                if (numChips === 0) {

                    this.showAddChips = false;
                    return;

                }

                if (numChips <= this.ui.currentBalance) {

                    this.ui.sendCommand(new AddChipsCommand(this.table.id, numChips));
                    this.showAddChips = false;

                }

            }

        },
        cancelBuyIn: function () {

            this.showAddChips = false;

        }



    }

});

export default TableMenuComponent;

</script>
