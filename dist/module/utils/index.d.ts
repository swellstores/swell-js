import { Options } from './types';
declare global {
    interface Window {
        __swell_vault_request_id: any;
    }
}
export declare function merge(x: any, y: any, opt?: {}): any;
export declare function setOptions(optns: any): void;
export declare function getOptions(): Options;
export declare function isObject(val: any): boolean;
export declare function toCamel(obj: any): any;
export declare function toCamelPath(str: any): any;
export declare function toSnake(obj: any): any;
export declare function keyToSnake(key: any): string;
export declare function keyToCamel(key: any): string;
export declare function trimBoth(str: any): string;
export declare function trimStart(str: any): string;
export declare function trimEnd(str: any): string;
export declare function stringifyQuery(str: any): any;
export declare function map(arr: any, cb: any): unknown[];
export declare function reduce(arr: any, cb: any, init: any): any;
export declare function isServer(): boolean;
export declare function isFunction(func: any): boolean;
export declare function defaultMethods(request: any, uri: any, methods: any): {
    list: (query: any) => any;
    get: (id: any, query: any) => any;
};
export declare function vaultRequest(method: any, url: any, data: any, opt?: any): Promise<unknown>;
export declare function vaultRequestId(): any;
export declare function serializeData(data: any): string;
export declare function buildParams(key: any, obj: any, add: any): void;
export declare function base64Encode(string: any): string;
