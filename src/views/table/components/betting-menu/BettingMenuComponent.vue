<template>

    <div class="betting-menu">

        <div class="bet-actions" v-if="remainsToAnte">

            <div class="buttons">

                <bet-button-component :action="'Sit Out'"
                                      :is-activated="isFoldActivated"
                                      @button-click="toggleFold"></bet-button-component>

                <bet-button-component :action="'Ante'"
                                      :is-activated="isAnteActivated"
                                      :amount="myCall.chipsAdded"
                                      @button-click="toggleAnte"></bet-button-component>

            </div>

        </div>

        <div class="bet-actions" v-if="remainsToAct">

            <div class="buttons">

                <bet-button-component v-if="isFoldAllowed"
                                      :action="'Fold'"
                                      :is-activated="isFoldActivated"
                                      @button-click="toggleFold"></bet-button-component>

                <bet-button-component v-if="isCheckAllowed"
                                      :action="'Check'"
                                      :is-activated="isCheckActivated"
                                      @button-click="toggleCheck"></bet-button-component>

                <bet-button-component v-if="isCallAllowed"
                                      :action="'Call'"
                                      :is-activated="isCallActivated"
                                      :amount="myCall.chipsAdded"
                                      @button-click="toggleCall"></bet-button-component>

                <bet-button-component v-if="isLimitRaiseAllowed"
                                      :action="betDescription"
                                      :is-activated="isRaiseActivated"
                                      :amount="myMinRaise.totalBet"
                                      @button-click="toggleLimitRaise"></bet-button-component>

            </div><!-- buttons -->

            <div v-if="raiseDialogReady" class="raise-dialog">
                <div>
                    <span class="min-raise">{{ chipFormatter.format(minRaise) }}</span>
                    <input type="range" v-model="raiseChips" :min="minRaise" :max="maxRaise" :step="step" />
                    <span class="max-raise">{{ chipFormatter.format(maxRaise) }}</span>
                </div>
                <div class="buy-amount">{{ chipFormatter.format(raiseChips) }}</div>
                <div>
                    <button type="button" class="raise" @click.stop="raise">Raise</button>
                    <button type="button" class="cancel" @click.stop="cancelRaise">Cancel</button>
                </div>
            </div>

        </div>

    </div>

</template>


<script lang="ts">
    
import './betting-menu.scss';

    import { defineComponent, computed } from "vue";

    import { AnteCommand } from '@/app/commands/table/betting/ante-command';
    import { BetCommand } from '@/app/commands/table/betting/bet-command';
    import { CheckCommand } from '@/app/commands/table/betting/check-command';
    import { CallCommand } from '@/app/commands/table/betting/call-command';
    import { RaiseCommand } from '@/app/commands/table/betting/raise-command';
    import { FoldCommand } from '@/app/commands/table/betting/fold-command';
    import { Bet } from '@/app/casino/tables/betting/bet';


    import { TableUI } from '../../table-ui';
    import BetButtonComponent from '../bet-button/BetButtonComponent.vue';

    import { tableState } from "@/store/table-state";
    import { IChipFormatter } from '@/app/casino/tables/chips/chip-formatter';
    import { TableState } from '@/app/casino/tables/states/table-state';
    import { BetState } from '@/app/casino/tables/states/betting/bet-state';
    import { BlindsAndAntesState } from '@/app/casino/tables/states/betting/blinds-and-antes-state';

    const TableMenuComponent = defineComponent({

        props: {
            ui: {
                type: TableUI,
                required: true
            }

        },
        setup() {

            const pendingBetCommand = computed((): BetCommand | FoldCommand => tableState.getPendingBetCommand.value);

            const myCall = computed((): Bet => tableState.getMyCall.value);
            const myMinRaise = computed((): Bet => tableState.getMyMinRaise.value);
            const myMaxRaise = computed((): Bet => tableState.getMyMaxRaise.value);

            const numRaises = computed((): number => tableState.getBetStatus.value?.numRaises || 0);

            const isFoldAllowed = computed((): boolean => true);

            const isFoldActivated = computed((): boolean => pendingBetCommand.value instanceof FoldCommand);

            const isAnteActivated = computed((): boolean => pendingBetCommand.value instanceof AnteCommand);

            const isCheckAllowed = computed((): boolean => myCall.value && myCall.value.chipsAdded === 0);

            const isCheckActivated = computed((): boolean => pendingBetCommand.value instanceof CheckCommand);

            const isCallAllowed = computed((): boolean => myCall.value && myCall.value.chipsAdded > 0);

            const isCallActivated = computed((): boolean => pendingBetCommand.value instanceof CallCommand);

            const isLimitRaiseAllowed = computed((): boolean => myMinRaise.value && myMaxRaise.value && myMinRaise.value.chipsAdded === myMaxRaise.value.chipsAdded);

            const isRaiseActivated = computed((): boolean => pendingBetCommand.value instanceof RaiseCommand);

            const betDescription = computed((): string => numRaises.value > 0 ? 'Raise To' : 'Bet');

            let showRaise: boolean;

            const raiseDialogReady = computed((): boolean => showRaise);

            const minRaise = computed((): number => myMinRaise.value ? myMinRaise.value.totalBet : 0);

            const maxRaise = computed((): number => myMaxRaise.value ? myMaxRaise.value.totalBet : 0);

            const chipFormatter = computed((): IChipFormatter => tableState.getChipFormatter.value);

            const mySeatIndex = computed((): number => tableState.getMySeatIndex.value);

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

                return mySeatIndex.value != null
                    && isBettingTime.value
                    // either it's my turn right now, or it's coming up
                    && (betStatus.value.seatIndex == mySeatIndex.value || betStatus.value.doesSeatRemainToAct(mySeatIndex.value));


            });

            return {

                pendingBetCommand,

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
                isRaiseActivated,

                betDescription,
                raiseDialogReady,

                minRaise,
                maxRaise,

                chipFormatter,

                mySeatIndex,
                currentTableState,
                betStatus,
                isBettingTime,

                remainsToAnte,
                remainsToAct

            };


        },

    components: {

        'bet-button-component': BetButtonComponent

    },
    data() {

        let values =
        {
            raiseChips: 1000,
            step: 25,
            showRaise: false
        };

        return values;

    },
    methods: {

        toggleFold: function (): void {

            if (this.isFoldActivated) {

                return tableState.clearPendingBetCommands();

            }

            this.ui.setBetCommand(new FoldCommand(tableState.getTableID.value));

        },

        toggleAnte: function (): void {

            if (this.isAnteActivated) {

                return tableState.clearPendingBetCommands();

            }

            this.ui.setBetCommand(new AnteCommand(tableState.getTableID.value));

        },

        toggleCheck: function (): void {

            if (this.isCheckActivated) {

                return tableState.clearPendingBetCommands();

            }

            this.ui.setBetCommand(new CheckCommand(tableState.getTableID.value));

        },

        toggleCall: function (): void {

            if (this.isCallActivated) {

                return tableState.clearPendingBetCommands();

            }

            this.ui.setBetCommand(new CallCommand(tableState.getTableID.value, tableState.getMyCall.value.chipsAdded));

        },

        toggleLimitRaise: function (): void {

            if (this.isRaiseActivated) {

                return tableState.clearPendingBetCommands();

            }

            this.ui.setBetCommand(new RaiseCommand(tableState.getTableID.value, tableState.getMyMinRaise.value.chipsAdded));

        }

    }  // methods

});

export default TableMenuComponent;

</script>
