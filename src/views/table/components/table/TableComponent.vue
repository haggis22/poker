<template>

    <div v-if="ui != null && table != null">

        <div class="table seats-6">

            <div class="betting-line">
                <div>isSittingOut = {{ ui.isSittingOut }}</div>

                <seat-component v-for="seat in table.seats"
                                :key="'seat-' + seat.index"
                                :seat-index="seat.index"
                                :ui="ui"
                                :bet-status="table.betStatus">
                </seat-component>
                <dealer-box-component></dealer-box-component>
                <bet-component v-for="bet in table.betStatus.bets"
                               :key="'bet-' + bet.seatIndex"
                               :bet="bet">
                </bet-component>
                <bet-component v-for="ante in table.betStatus.antes"
                               :key="'ante-' + ante.seatIndex"
                               :bet="ante">
                </bet-component>
                <pot-component v-for="pot in table.betStatus.pots"
                               :key="'pot-' + pot.index"
                               :pot="pot"
                               :ui="ui">
                </pot-component>
                <won-pot-component v-for="pot in wonPots"
                                   :key="`won-pot-${pot.index}-${pot.seatIndex}`"
                                   :pot="pot"
                                   :ui="ui">
                </won-pot-component>
                <div v-if="table.buttonIndex != null" class="button" :class="'seat-'+table.buttonIndex">
                    <div class="text">button</div>
                </div>
                <board-component :board="table.board"
                                 :ui="ui">
                </board-component>
                <winning-hand-component v-if="winningHand"></winning-hand-component>
            </div>
        </div><!-- table seats-6 -->
    </div>
</template>

<script lang="ts">

    import './table.scss';
    import './table-seats-6.scss';
    import { defineComponent, computed } from 'vue';

    import { Table } from "@/app/casino/tables/table";
    import { TableUI } from '../../table-ui';

    import SeatComponent from '../seat/SeatComponent.vue';
    import DealerBoxComponent from '../dealer/DealerBoxComponent.vue';
    import BetComponent from '../bet/BetComponent.vue';
    import PotComponent from '../pot/PotComponent.vue';
    import WonPotComponent from '../pot/WonPotComponent.vue';
    import BoardComponent from '../board/BoardComponent.vue';
    import WinningHandComponent from '../winning-hand/WinningHandComponent.vue';

    import { tableState } from "@/store/table-state";


    const TableComponent = defineComponent({

        props: {

            ui: {
                type: TableUI,
                required: true
            }

        },
        setup(props) {

            const table = computed(() => tableState.getTable.value);

            const wonPots = computed(() => tableState.getWonPots.value);
            const winningHand = computed(() => tableState.getWinningHand.value);

            return {

                table,
                wonPots,
                winningHand

            };

        },
        components: {

            SeatComponent,
            DealerBoxComponent,
            BetComponent,
            PotComponent,
            WonPotComponent,
            BoardComponent,
            WinningHandComponent

        }
    });

    export default TableComponent;

</script>

