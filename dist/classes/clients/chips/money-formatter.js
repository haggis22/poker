"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoneyFormatter = void 0;
class MoneyFormatter {
    constructor() {
        let options = {
            style: 'currency',
            currency: 'USD'
        };
        this.formatter = new Intl.NumberFormat(undefined, options);
    }
    format(chips) {
        return this.formatter.format(chips / 100);
    }
}
exports.MoneyFormatter = MoneyFormatter;
