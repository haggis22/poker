export interface IBrowserWebSocket {

    onmessage(evt: MessageEvent): any;

    send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView): void;

}