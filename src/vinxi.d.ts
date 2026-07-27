declare module "vinxi/http" {
  export function getEvent(): any;
  export function getCookie(eventOrName: any, name?: string): string | undefined;
  export function setCookie(eventOrName: any, nameOrValue: string, valueOrOptions?: any, options?: any): void;
  export function deleteCookie(eventOrName: any, nameOrOptions?: any, options?: any): void;
}
