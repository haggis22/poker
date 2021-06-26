<template>

    <tr>
        <td>{{ table.id }}</td>
        <td class="name"><router-link :to="{ name: 'Table' , params: {tableID: table.id}}" target="_blank">{{ table.name }}</router-link></td>
        <td class="description">{{ table.description }}</td>
        <td class="seats">{{ table.players.length }}/{{ table.numSeats }}</td>
        <td class="players">{{ playerNames }}</td>
    </tr>

</template>

<script lang="ts">

    import { defineComponent, computed } from 'vue';

    import { TableSummary } from '@/app/casino/tables/table-summary';


    const TableComponent = defineComponent({

        props: {

            table: {
                type: TableSummary,
                required: true
            },



        },
        setup(props) {

            const playerNames = computed(() => props.table.players.join(", "));

            return {

                playerNames

            };

        },
        components: {
        }

    });

    export default TableComponent;

</script>

<style scoped lang="scss">


</style>
