"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fold = void 0;
class Fold {
    constructor(isValid, message) {
        this.isValid = isValid;
        this.message = message;
    }
    toString() {
        return JSON.stringify(this);
    }
}
exports.Fold = Fold;
