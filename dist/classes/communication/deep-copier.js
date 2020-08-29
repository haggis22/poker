"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepCopier = void 0;
const serializer_1 = require("./serializer");
class DeepCopier {
    constructor() {
        this.serializer = new serializer_1.Serializer();
    }
    copy(obj) {
        return this.serializer.deserialize(this.serializer.serialize(obj));
    }
}
exports.DeepCopier = DeepCopier;
