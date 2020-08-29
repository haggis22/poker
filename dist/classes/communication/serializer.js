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
exports.Serializer = void 0;
const serialization = __importStar(require("./serializable"));
const serializedConstructorName = "__serializedClass";
const MAP_ENTRIES = '__mapEntries:';
class Serializer {
    log(msg) {
        console.log('\x1b[37m\x1b[41m%s\x1b[0m', msg);
    }
    serialize(o) {
        if (o === null) {
            return JSON.stringify(o);
        }
        // if it's a primitive type, then just JSONify it
        if (isPrimitive(o)) {
            return JSON.stringify(o);
        }
        if (Array.isArray(o)) {
            return JSON.stringify(o.map(arrayItem => this.serialize(arrayItem)));
        }
        let so = {};
        if (isSerializable(o)) {
            so[serializedConstructorName] = o.constructor.name;
        }
        else if (o instanceof Map) {
            so[serializedConstructorName] = 'Map';
            so[MAP_ENTRIES] = Array.from(o.entries()).map(entry => [this.serialize(entry[0]), this.serialize(entry[1])]);
            // We can let it drop through since a Map has no properties
        }
        else {
            // this.log(`WARN: Cannot serialize ${o.constructor.name}`);
        }
        for (let propKey of Object.keys(o)) {
            if (o[propKey] != null && !isSerializable(o[propKey]) && typeof o[propKey] === 'object' && !Array.isArray(o[propKey]) && (o[propKey].constructor.name !== 'Object')) {
                this.log(`WARN: ${o.constructor.name}.${propKey} is being serialized as a plain object - it is actually ${o[propKey].constructor.name}`);
            }
            so[propKey] = this.serialize(o[propKey]);
        }
        let msg = JSON.stringify(so);
        // this.log(`Serialized object: ${msg}`);
        return msg;
    } // serialize
    deserialize(msg) {
        let outerObj = null;
        try {
            outerObj = JSON.parse(msg);
        }
        catch (error) {
            this.log(`Could not parse JSON from ${msg}`);
            throw error;
        }
        if (outerObj == null || isPrimitive(outerObj)) {
            return outerObj;
        }
        if (Array.isArray(outerObj)) {
            // Each item in the array was serialized independently, so we need to deserialize it from its string
            return outerObj.map(arrayItem => this.deserialize(arrayItem));
        }
        let prototype = null;
        if (outerObj.hasOwnProperty(serializedConstructorName)) {
            let serializableType = serialization[outerObj[serializedConstructorName]];
            if (serializableType != null) {
                prototype = serializableType.prototype;
            }
            else if (outerObj[serializedConstructorName] == 'Map') {
                throw new Error('Map is currently not deserializable');
            }
            else {
                throw new Error(`Type not deserializable: ${outerObj[serializedConstructorName]}`);
            }
        }
        else {
            prototype = outerObj;
        }
        let obj = Object.create(prototype);
        for (let propKey of Object.keys(outerObj)) {
            // Don't copy the property that specified the serialized class constructor, if it's there - there's just no need
            if (propKey != serializedConstructorName) {
                obj[propKey] = this.deserialize(outerObj[propKey]);
            }
            // this.log(`Setting ${objArray[0]}.${objProp} to be (${typeof objValue}) ${objValue}`);
        }
        return obj;
    }
}
exports.Serializer = Serializer;
function isSerializable(obj) {
    if (obj == null) {
        return false;
    }
    // If the object appears in the export of the Serializable object, then we will be able to recreated it later, so let's use special serialization here
    return serialization[obj.constructor.name] != null;
}
function isDeserializable(obj) {
    if (obj == null) {
        return false;
    }
    // If the object has a property that specifies its prototype, and that type is
    // listed in Serializable, then we can re-create it
    return obj.hasOwnProperty(serializedConstructorName) && serialization[obj[serializedConstructorName]];
}
function isPrimitive(obj) {
    switch (typeof obj) {
        case 'undefined':
        case 'boolean':
        case 'number':
        case 'bigint':
        case 'string':
            return true;
    }
    return false;
} // isPrimitive
