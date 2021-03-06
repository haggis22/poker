﻿<template>

    <div class="table-menu">

        <div class="table-name">
            <div class="name-row"><span class="name">{{ table.name }}</span> <span class="id">(#{{ table.id }})</span></div>
            <div class="description">{{ table.description }}</div>
        </div>

        <div v-if="!showAddChipsDialog" class="table-actions">

            <div class="sit-out" :class="{ 'disabled': hasPendingStatusRequest }">

                <label>
                    <input type="checkbox"
                           value="true"
                           :checked="localSittingOut"
                           :disabled="hasPendingStatusRequest"
                           @change="setStatus" />
                    Sit out next hand
                </label>

            </div>

            <div>
                <button type="button" class="stand-up" @click.stop="standUp">Stand Up</button>
            </div>
            <div>
                <button type="button" 
                        class="add-chips" 
                        @click.stop="checkBalance"
                        :disabled="isInHand || maxBuyIn == 0"
                        :title="addChipsTitle"
                        >Add Chips</button>
            </div>

        </div>

        <div v-if="showAddChipsDialog" class="add-chips-dialog">
            <div>
                <span class="min-buy-in">{{ chipFormatter.format(minBuyIn) }}</span>
                <button type="button"
                        @click.stop="stepDown(step)"
                        :disabled="numAddChips === minBuyIn">
                    &#x2039;
                </button>
                <input type="range"
                       class="chips-slider"
                       v-model.number="numAddChips"
                       :min="minBuyIn"
                       :max="maxBuyIn"
                       :step="step" />
                <button type="button"
                        @click.stop="stepUp(step)"
                        :disabled="numAddChips === maxBuyIn">
                    &#x203a;
                </button>
                <span class="max-buy-in">{{ chipFormatter.format(maxBuyIn) }}</span>
            </div>
            <div class="buy-amount">{{ chipFormatter.format(numAddChips) }}</div>
            <div class="buttons">
                <button type="button" class="cancel" @click.stop="cancelBuyIn">Cancel</button>
                <button type="button" class="buy-in" @click.stop="buyIn">Buy In</button>
            </div>
        </div>

    </div>

</template>


<script lang="ts">

    import './table-menu.scss';

    import { defineComponent, computed, ref, watch } from 'vue';

    import { tableUI } from '../../table-ui';
    import { SetStatusCommand, StandUpCommand, AddChipsCommand, Table } from '@/app/communication/serializable';

    import { tableState } from "@/store/table-state";
    import { userState } from "@/store/user-state";

    const TableMenuComponent = defineComponent({

        setup() {

            const table = computed(() => tableState.getTable.value);

            const chipFormatter = computed(() => tableState.getChipFormatter.value);

            const mySeatIndex = computed((): number => tableState.getMySeatIndex.value);

            const myChips = computed((): number => {

                const table: Table = tableState.getTable.value;

                if (table && mySeatIndex.value != null) {

                    return table.seats[mySeatIndex.value].player.chips;

                }

                return null;

            });

            const minBuyIn = computed((): number => {

                const table: Table = tableState.getTable.value;

                if (table) {

                    if (myChips.value != null && myChips.value < table.limits.minBuyIn) {

                        return table.limits.minBuyIn - myChips.value;

                    }

                }

                return 0;

            });

            const numAddChips = ref(minBuyIn.value);

            const step = computed((): number => {

                const table: Table = tableState.getTable.value;

                if (table) {

                    if (table.stakes.blinds.length) {
                        return table.stakes.blinds[table.stakes.blinds.length - 1].amount * 10;
                    }

                }

                return minBuyIn.value;

            })

            const showAddChips = ref(false);

            const stepDown = (value: number): void => {

                numAddChips.value -= value;

            };

            const stepUp = (value: number): void => {

                numAddChips.value += value;

            };

            const isSittingOut = computed((): boolean => {

                if (mySeatIndex.value != null && tableState.getTable.value.seats[mySeatIndex.value].player) {

                    return tableState.getTable.value.seats[mySeatIndex.value].player.isSittingOut;

                }

                return false;
                
            });

            const localSittingOut = computed((): boolean => tableState.getLocalSittingOut.value);

            watch(() => isSittingOut.value, (newValue) => {
                tableState.setLocalSittingOut(newValue);
            });

            const hasPendingStatusRequest = computed((): boolean => tableState.getHasPendingStatusRequest.value);


            const userID = computed((): number => userState.getUserID.value);

            const isInHand = computed((): boolean => {

                const table: Table = tableState.getTable.value;

                if (table && mySeatIndex.value != null) {

                    return table.seats[mySeatIndex.value].isInHand;

                }

                return false;

            });

            const currentBalance = computed((): number => tableState.getCurrentBalance.value);

            const showAddChipsDialog = computed((): boolean => {

                return showAddChips.value && !isInHand.value;

            });

            const addChipsTitle = computed((): string => {

                if (currentBalance.value === 0) {

                    return 'You have no money to add';
                }

                if (isOverMaxBuyIn.value) {
                    return 'You already at the max buy-in for the table';
                }

                if (isInHand.value) {
                    return 'You cannot add chips during a hand';
                };

                return null;

            });



            const isOverMaxBuyIn = computed((): boolean => {

                const table: Table = tableState.getTable.value;

                return table && myChips.value != null && myChips.value >= table.limits.maxBuyIn;

            });

            const maxBuyIn = computed((): number => {

                const table: Table = tableState.getTable.value;

                if (table) {

                    if (isOverMaxBuyIn.value) {

                        return 0;

                    }

                    // They can't buy in for more than the table cap.  If they have less than that,
                    // then the most they can buy in for is to 1) get them to the cap or 2) how much they have in the bank
                    if (myChips.value != null) {
                       
                        return Math.min(table.limits.maxBuyIn - myChips.value, currentBalance.value);

                    }

                }

                return 0;

            });

            const setStatus = (event: Event): void => {

                // The actual local value hasn't changed yet, so use the checked flag of the input checkbox itself
                if (event.target instanceof HTMLInputElement) {
                    tableState.setHasPendingStatusRequest(true);
                    tableUI.sendCommand(new SetStatusCommand(tableState.getTableID.value, event.target.checked));
                }

            };

            const standUp = (): void => {

                tableUI.sendCommand(new StandUpCommand(tableState.getTableID.value));

            };

            const checkBalance = (): void => {

                tableUI.checkBalance();
                showAddChips.value = true;

            };

            const buyIn = (): void => {

                let numChips: number = numAddChips.value;

                if (!isNaN(numChips)) {

                    if (numChips === 0) {

                        showAddChips.value = false;
                        return;

                    }

                    if (numChips <= currentBalance.value) {

                        tableUI.sendCommand(new AddChipsCommand(tableState.getTableID.value, numChips));
                        showAddChips.value = false;

                    }

                }

            };

            const cancelBuyIn = (): void => {

                showAddChips.value = false;

            };



            return {

                table,

                chipFormatter,

                numAddChips,
                showAddChips,
                showAddChipsDialog,
                addChipsTitle,

                step,

                stepDown,
                stepUp,

                currentBalance,
                minBuyIn,
                maxBuyIn,

                setStatus,
                standUp,
                checkBalance,
                buyIn,
                cancelBuyIn,

                hasPendingStatusRequest,
                localSittingOut,

                isInHand,

            };

        },

    });

    export default TableMenuComponent;

</script>

<style scoped lang="scss">


    .sit-out
    {
        input {
            vertical-align: bottom;
        }

    
        &.disabled
        {
            color: #888;
        }

    }



</style>