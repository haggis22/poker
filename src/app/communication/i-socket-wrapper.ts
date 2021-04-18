export interface ISocketWrapper {

    addEventListener(method: 'message' | 'close', callback: (obj: any) => void): void;

    send(o: any): void;

}