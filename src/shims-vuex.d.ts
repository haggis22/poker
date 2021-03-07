import { Store } from '@/store';

import { TableSummary } from '@/app/casino/tables/table-summary';
import { UserSummary } from '@/app/players/user-summary';

declare module '@vue/runtime-core' {

    interface LobbyState {

        user: UserSummary,
        tables: Array<TableSummary>

    }

    interface ComponentCustomProperties {
        $store: Store<LobbyState>;
    }

}
