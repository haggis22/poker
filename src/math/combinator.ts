﻿export class Combinator {

    static combine(arr: any[], numElements: number) : Array<Array<any>> {

        if (arr.length <= numElements) {
            return [[...arr]];
        }

        if (numElements === 1) {

            // Return a series of arrays, each containing exactly one item
            return arr.map(elem => [elem]);

        }

        // This will be an array of arrays
        let perms: Array<Array<any>> = [];

        for (let x = 0; x <= (arr.length - numElements); x++) {

            let subPerms = Combinator.combine(arr.slice(x + 1), numElements - 1);

            for (let perm of subPerms) {

                perms.push([arr[x], ...perm]);

            }

        }

        return perms;

    }

}