import { TableObserver } from "../casino/tables/table-observer";

export interface ActionBroadcaster {

    register(observer: TableObserver);

    unregister(observer: TableObserver);



}