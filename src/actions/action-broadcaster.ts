import { TableObserver } from "../casino/tables/table-observer";
import { Action } from "./action";

export interface ActionBroadcaster {

    register(observer: TableObserver);

    unregister(observer: TableObserver);

    broadcast(action: Action);



}