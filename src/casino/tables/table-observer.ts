import { Action } from "../../actions/action";

export interface TableObserver {

    notify(action: Action): void;

}