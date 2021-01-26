import { CashierAction } from "./cashier-action";

export class CurrentBalanceAction extends CashierAction {

    public balance: number;

    constructor(userID: number, balance: number) {

        super(userID);

        this.balance = balance;

    }

}