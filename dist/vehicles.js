"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JunkHauler = exports.CopAttractor = exports.GroceryGetter = exports.Vehicle = exports.VehicleType = exports.VehicleColor = void 0;
const crypto = __importStar(require("crypto"));
var VehicleColor;
(function (VehicleColor) {
    VehicleColor[VehicleColor["Red"] = 0] = "Red";
    VehicleColor[VehicleColor["Blue"] = 1] = "Blue";
    VehicleColor[VehicleColor["Green"] = 2] = "Green";
    VehicleColor[VehicleColor["Black"] = 3] = "Black";
})(VehicleColor = exports.VehicleColor || (exports.VehicleColor = {}));
var VehicleType;
(function (VehicleType) {
    VehicleType[VehicleType["Passenger"] = 0] = "Passenger";
    VehicleType[VehicleType["Commercial"] = 1] = "Commercial";
})(VehicleType = exports.VehicleType || (exports.VehicleType = {}));
class Vehicle {
    constructor(color) {
        this.vehicle_id = Vehicle.generate_id();
        this.color = color;
    }
    static generate_id() { return crypto.randomBytes(12).toString('hex'); }
}
exports.Vehicle = Vehicle;
class GroceryGetter extends Vehicle {
    constructor() {
        super(...arguments);
        this.miles_per_hour = 90;
        this.miles_per_gallon = 40;
        this.type = VehicleType.Passenger;
        this.name = GroceryGetter.name;
    }
    drive() { return 'Slowly cruising to the store 🚙'; }
}
exports.GroceryGetter = GroceryGetter;
class CopAttractor extends Vehicle {
    constructor() {
        super(...arguments);
        this.miles_per_hour = 180;
        this.miles_per_gallon = 20;
        this.type = VehicleType.Passenger;
        this.name = CopAttractor.name;
    }
    drive() { return 'Burning rubber down the highway 🏎'; }
}
exports.CopAttractor = CopAttractor;
class JunkHauler extends Vehicle {
    constructor() {
        super(...arguments);
        this.miles_per_hour = 60;
        this.miles_per_gallon = 10;
        this.type = VehicleType.Commercial;
        this.name = JunkHauler.name;
    }
    drive() { return 'Off to pull CopAttractor from the ditch again 🚛'; }
}
exports.JunkHauler = JunkHauler;
