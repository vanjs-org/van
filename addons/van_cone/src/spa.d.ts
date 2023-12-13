export type RouteHandler = (args: {
  params: Record<string, string>;
  query: Record<string, string>;
}) => void;

export type Route = {
  name: string;
  path: string;
  handler: RouteHandler;
  matcher: RegExp;
  params: string[];
};

export type RouteParamsResult =
  | {
      route: Route;
      params: Record<string, string>;
    }
  | undefined;

export type ParsedUrl = {
  path: string;
  queryString: string;
};

export class Router {
  private routes: Route[];
  private prefix: string;

  add(name: string, path: string, handler: RouteHandler): this {
    this.routes.push(this.createRoute(name, path, handler));
    return this;
  }

  setPrefix(prefix: string): this;

  dispatch(url: string): Route | false;

  getRoute(url: string): Route | undefined;

  formatUrl(
    routeName: string,
    params: Record<string, any>,
    query: Record<string, any>
  ): string;

  private createRoute(name: string, path: string, handler: RouteHandler): Route;

  private findRouteParams(path: string): RouteParamsResult;

  private getMatchedParams(
    route: Route,
    path: string
  ): Record<string, string> | false;

  private getQueryParams(query: string): Record<string, string>;

  private parseUrl(url: string): ParsedUrl;

  private stripPrefix(url: string, prefix: string): string;
}

export function createCone(
  routerElement: Element,
  routes: { name: string; path: string; callable: Function; title?: string }[],
  defaultNavState?: any
): any; /* Add your specific types here */

export default createCone;
