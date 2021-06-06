<template>

    <div class="betting-menu">

        <div style="height: 150px; background-color: transparent;">
            <div v-if="showRaiseDialog" class="raise-dialog" style="display: grid; grid-gap: 5px; grid-template-columns: repeat(4, 50px); grid-template-rows: repeat(4, 30px);">

                <div style="grid-column: 1; grid-row: 2;">
                    <button type="button" class="raise-pot" @click.stop="setRaiseChips(raisePotAmount)">Pot</button>
                </div>

                <div style="grid-column: 1; grid-row: 3;">
                    <button type="button" class="raise-pot" @click.stop="setRaiseChips(raiseHalfPotAmount)">1/2</button>
                </div>

                <div style="grid-column: 2; grid-row: 2;">
                    <button type="button" @click.stop="stepUp" :disabled="raiseChips === maxRaise">&#x1f781;</button>
                </div>

                <div style="grid-column: 2; grid-row: 3;">
                    <button type="button" @click.stop="stepDown" :disabled="raiseChips === minRaise">&#x1f783;</button>
                </div>

                <div class="slider" style="grid-column: 3; grid-row: 1/4;">
                    <input type="range"
                           class="chips-slider"
                           v-model.number="raiseChips"
                           :min="minRaise"
                           :max="maxRaise"
                           :step="step"
                           orient="vertical" />
                </div>

                <div class="max-raise" style="grid-column: 4; grid-row: 1;">{{ chipFormatter.format(maxRaise) }}</div>

                <div class="min-raise" style="grid-column: 4; grid-row: 4;">{{ chipFormatter.format(minRaise) }}</div>


            </div>
        </div>

        <div class="bet-actions">

            <div v-if="isAnteState" class="buttons">

                <span>

                    <bet-button-component :action="'Sit Out'"
                                          :is-activated="isFoldActivated"
                                          :disabled="!remainsToAnte"
                                          @button-click="toggleFold"></bet-button-component>

                </span>

                <span>

                    <bet-button-component :action="''"
                                          :is-activated="false"
                                          :disabled="true"></bet-button-component>

                </span>

                <span>

                    <bet-button-component :action="'Ante'"
                                          :is-activated="isAnteActivated"
                                          :amount="myCall ? myCall.chipsAdded : null"
                                          :disabled="!remainsToAnte"
                                          @button-click="toggleAnte"></bet-button-component>

                </span>

            </div>

            <div v-if="isBetState" class="buttons">

                <span>

                    <bet-button-component :action="'Fold'"
                                          :is-activated="isFoldActivated"
                                          :disabled="!remainsToAct"
                                          @button-click="toggleFold"
                                          ></bet-button-component>

                </span>

                <span>

                    <bet-button-component v-if="isCheckAllowed"
                                          :action="'Check'"
                                          :is-activated="isCheckActivated"
                                          @button-click="toggleCheck"></bet-button-component>

                    <bet-button-component v-if="isCallAllowed"
                                          :action="'Call'"
                                          :is-activated="isCallActivated"
                                          :amount="myCall ? myCall.chipsAdded : null"
                                          :requires-delay="true"
                                          @button-click="toggleCall"></bet-button-component>

                </span>

                <span>

                    <bet-button-component v-if="isLimitRaiseAllowed"
                                          :action="hasBettingOpened ? 'Raise To' : 'Bet' "
                                          :is-activated="isRaiseActivated"
                                          :amount="myMinRaise.totalBet"
                                          :requires-delay="true"
                                          @button-click="toggleLimitRaise"></bet-button-component>

                    <bet-button-component v-if="isNoLimitRaiseAllowed && !isRaiseActivated && !showRaiseDialog"
                                          :action="hasBettingOpened ? 'Raise': 'Bet'"
                                          :is-activated="false"
                                          :requires-delay="true"
                                          @button-click="readyRaise"></bet-button-component>

                    <bet-button-component v-if="isNoLimitRaiseAllowed && isRaiseActivated && !showRaiseDialog"
                                          :action="hasBettingOpened ? 'Raise To' : 'Bet'"
                                          :is-activated="isRaiseActivated"
                                          :amount="myMinRaise.totalBet"
                                          :requires-delay="true"
                                          @button-click="toggleNoLimitRaise"></bet-button-component>

                    <bet-button-component v-if="isNoLimitRaiseAllowed && showRaiseDialog"
                                          :action="hasBettingOpened ? 'Raise To' : 'Bet'"
                                          :is-activated="isRaiseActivated"
                                          :amount="raiseChips"
                                          @button-click="lockInRaise"></bet-button-component>

                </span>

            </div>

        </div>

    </div>

</template>


<script lang="ts">
    
import './betting-menu.scss';

    import { defineComponent, computed, ref, watch } from "vue";

    import { AnteCommand } from '@/app/commands/table/betting/ante-command';
    import { BettingCommand } from '@/app/commands/table/betting/betting-command';
    import { BetCommand } from '@/app/commands/table/betting/bet-command';
    import { CheckCommand } from '@/app/commands/table/betting/check-command';
    import { CallCommand } from '@/app/commands/table/betting/call-command';
    import { RaiseCommand } from '@/app/commands/table/betting/raise-command';
    import { FoldCommand } from '@/app/commands/table/betting/fold-command';
    import { Bet } from '@/app/casino/tables/betting/bet';


    import { tableUI } from '../../table-ui';
    import BetButtonComponent from '../bet-button/BetButtonComponent.vue';

    import { tableState } from "@/store/table-state";
    import { IChipFormatter } from '@/app/casino/tables/chips/chip-formatter';
    import { TableState } from '@/app/casino/tables/states/table-state';
    import { BetState } from '@/app/casino/tables/states/betting/bet-state';
    import { BlindsAndAntesState } from '@/app/casino/tables/states/betting/blinds-and-antes-state';
    import { userState } from '@/store/user-state';
import { Table } from '@/app/casino/tables/table';

    const TableMenuComponent = defineComponent({

        setup() {

            const pendingBetCommand = computed((): BettingCommand => tableState.getPendingBetCommand.value);

            const isAnteState = computed((): boolean => tableState.getTable.value.state instanceof BlindsAndAntesState);

            const isBetState = computed((): boolean => tableState.getTable.value.state instanceof BetState);

            const myCall = computed((): Bet => tableState.getMyCall.value);
            const myMinRaise = computed((): Bet => tableState.getMyMinRaise.value);
            const myMaxRaise = computed((): Bet => tableState.getMyMaxRaise.value);

            const numRaises = computed((): number => tableState.getBetStatus.value?.numRaises || 0);

            const isFoldAllowed = computed((): boolean => remainsToAct.value);

            const isFoldActivated = computed((): boolean => pendingBetCommand.value instanceof FoldCommand);

            const isAnteActivated = computed((): boolean => pendingBetCommand.value instanceof AnteCommand);

            const isCheckAllowed = computed((): boolean => remainsToAct.value && myCall.value && myCall.value.chipsAdded === 0);

            const isCheckActivated = computed((): boolean => pendingBetCommand.value instanceof CheckCommand);

            const isCallAllowed = computed((): boolean => remainsToAct.value && myCall.value && myCall.value.chipsAdded > 0);

            const isCallActivated = computed((): boolean => pendingBetCommand.value instanceof CallCommand);

            const isLimitRaiseAllowed = computed((): boolean => remainsToAct.value && myMinRaise.value && myMaxRaise.value && myMinRaise.value.chipsAdded === myMaxRaise.value.chipsAdded);

            const isNoLimitRaiseAllowed = computed((): boolean => remainsToAct.value && myMinRaise.value && myMaxRaise.value && myMaxRaise.value.chipsAdded > myMinRaise.value.chipsAdded);

            const isRaiseActivated = computed((): boolean => pendingBetCommand.value instanceof RaiseCommand);

            const hasBettingOpened = computed((): boolean => numRaises.value > 0);

            const showRaiseDialog = ref(false);

            const raiseChips = ref(null as number);

            const step = ref(25);

            const minRaise = computed((): number => myMinRaise.value ? myMinRaise.value.totalBet : 0);

            const maxRaise = computed((): number => myMaxRaise.value ? myMaxRaise.value.totalBet : 0);

            const chipFormatter = computed((): IChipFormatter => tableState.getChipFormatter.value);

            const mySeatIndex = computed((): number => tableState.getMySeatIndex.value);

            const myUserID = computed((): number => userState.getUserID.value);

            const currentTableState = computed((): TableState => tableState.getTable.value.state);

            const betStatus = computed(() => tableState.getBetStatus.value);

            const isAnteTime = computed(() => currentTableState.value instanceof BlindsAndAntesState);

            const isBettingTime = computed(() => currentTableState.value instanceof BetState);

            const remainsToAnte = computed((): boolean => {

                return mySeatIndex.value != null
                    && isAnteTime.value
                    && myCall.value != null;
                    // && (this.table.seats[tableState.getMySeatIndex.value].player.isSittingOut === null);

            });


            const remainsToAct = computed((): boolean => {

                return isBettingTime.value
                    // either it's my turn right now, or it's coming up
                    && (betStatus.value.isActionOn(mySeatIndex.value, myUserID.value) || betStatus.value.doesSeatRemainToAct(mySeatIndex.value, myUserID.value));


            });


            const toggleFold = (): void => {

                if (isFoldActivated.value) {

                    return tableState.clearPendingBetCommands();

                }

                tableUI.setBetCommand(new FoldCommand(tableState.getTableID.value));

            };

            const toggleAnte = (): void => {

                if (isAnteActivated.value) {

                    return tableState.clearPendingBetCommands();

                }

                tableUI.setBetCommand(new AnteCommand(tableState.getTableID.value));

            };

            const toggleCheck = (): void => {

                if (isCheckActivated.value) {

                    return tableState.clearPendingBetCommands();

                }

                tableUI.setBetCommand(new CheckCommand(tableState.getTableID.value));

            };

            const toggleCall = (): void => {

                if (isCallActivated.value) {

                    return tableState.clearPendingBetCommands();

                }

                tableUI.setBetCommand(new CallCommand(tableState.getTableID.value, tableState.getMyCall.value.chipsAdded));

            };

            const toggleLimitRaise = (): void => {

                if (isRaiseActivated.value) {

                    return tableState.clearPendingBetCommands();

                }

                tableUI.setBetCommand(new RaiseCommand(tableState.getTableID.value, tableState.getMyMinRaise.value.chipsAdded));

            };

            const toggleNoLimitRaise = (): void => {

                if (isRaiseActivated.value) {

                    return tableState.clearPendingBetCommands();

                }

                // tableUI.setBetCommand(new RaiseCommand(tableState.getTableID.value, tableState.getMyMinRaise.value.chipsAdded));

            };

            const readyRaise = (): void => {

                setRaiseChips(myMinRaise.value.totalBet);
                showRaiseDialog.value = true;

            };

            const stepDown = (): void => {

                raiseChips.value -= step.value;

            };

            const stepUp = (): void => {

                raiseChips.value += step.value;

            };

            const lockInRaise = (): void => {

                showRaiseDialog.value = false;
                const chipsAdded = tableState.getMyMinRaise.value.chipsAdded + (raiseChips.value - tableState.getMyMinRaise.value.totalBet);
                tableUI.setBetCommand(new RaiseCommand(tableState.getTableID.value, chipsAdded));

            }


            const currentTotalPot = computed((): number => tableState.getTable.value.betStatus.getCurrentTotalPot());


            // Calculates the TotalBet for a given raise
            const raisePotAmount = computed((): number => {

                // This is how much is already in the pot...
                let potRaiseAmount = tableState.getTable.value.betStatus.getCurrentTotalPot();

                if (myCall.value != null) {

                    // This will be how much is in there once I call...
                    potRaiseAmount += myCall.value.chipsAdded;

                }

                // Add this raise amount on TOP of what the existing bet already is
                potRaiseAmount += tableState.getTable.value.betStatus.currentBet;

                return Math.round(potRaiseAmount);

            });

            const raiseHalfPotAmount = computed((): number => {

                // This is how much is already in the pot...
                let potRaiseAmount = tableState.getTable.value.betStatus.getCurrentTotalPot();

                if (myCall.value != null) {

                    // This will be how much is in there once I call...
                    potRaiseAmount += myCall.value.chipsAdded;

                }

                // Add this raise amount on TOP of what the existing bet already is
                return Math.round((potRaiseAmount / 2) + tableState.getTable.value.betStatus.currentBet);

            });

            const raiseThirdPotAmount = computed((): number => {

                // This is how much is already in the pot...
                let potRaiseAmount = tableState.getTable.value.betStatus.getCurrentTotalPot();

                if (myCall.value != null) {

                    // This will be how much is in there once I call...
                    potRaiseAmount += myCall.value.chipsAdded;

                }

                // Add this raise amount on TOP of what the existing bet already is
                return Math.round((potRaiseAmount / 3) + tableState.getTable.value.betStatus.currentBet);

            });


            const myChips = computed((): number => {

                const table: Table = tableState.getTable.value;

                if (table && mySeatIndex.value != null) {

                    return table.seats[mySeatIndex.value].player.chips;

                }

                return null;

            });


            const allInAmount = computed((): number => {

                let potRaiseAmount: number = tableState.getTable.value.betStatus.currentBet;

                if (myCall.value != null) {

                    // Reduce my bet by what I would have to put in to call it flat
                    potRaiseAmount -= myCall.value.chipsAdded;

                }

                if (myChips.value != null) {
                    potRaiseAmount += myChips.value;
                }

                return potRaiseAmount;

            });

            const setRaiseChips = (amount: number) => {

                raiseChips.value = amount;

            }

            watch(isBetState, (newValue, oldValue) => {

                raiseChips.value = null;
                showRaiseDialog.value = false;

            });


            return {

                pendingBetCommand,

                isAnteState,
                isBetState,
                
                myCall,
                myMinRaise,
                myMaxRaise,

                numRaises,

                isFoldAllowed,
                isFoldActivated,

                isAnteActivated,

                isCheckAllowed,
                isCheckActivated,

                isCallAllowed,
                isCallActivated,

                isLimitRaiseAllowed,
                isNoLimitRaiseAllowed,
                isRaiseActivated,

                hasBettingOpened,

                minRaise,
                maxRaise,

                chipFormatter,

                mySeatIndex,
                currentTableState,
                betStatus,
                isBettingTime,

                remainsToAnte,
                remainsToAct,

                step,

                toggleFold,
                toggleAnte,
                toggleCheck,
                toggleCall,
                toggleLimitRaise,
                toggleNoLimitRaise,


                showRaiseDialog,
                readyRaise,
                stepDown,
                stepUp,
                raiseChips,
                setRaiseChips,
                raisePotAmount,
                raiseHalfPotAmount,
                raiseThirdPotAmount,
                allInAmount,
                lockInRaise,

                currentTotalPot,


            };


        },

    components: {

        BetButtonComponent

    },

});

export default TableMenuComponent;

</script>


<style scoped lang="scss">

    .raise-dialog
    {
        text-align: center;

        .buttons
        {
            button
            {
                font-weight: bold;

                &.raise
                {
                    color: white;
                    background-color: green;
                }

                &.cancel {
                    color: white;
                    background-color: red;
                }

            }

        }

    }


</style>
