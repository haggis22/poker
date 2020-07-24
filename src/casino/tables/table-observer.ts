import { Action } from "../../actions/action";

export interface TableObserver {

    playerID: number;

    notify(action: Action): void;


}