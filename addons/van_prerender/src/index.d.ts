import type { ChildDom } from "vanjs-core";

export interface VanPrerenderOptions {
  /** @default 0 */
  html?: 0|1;
  /**
   * Avoid reactive GC delay
   * @default 1
   */
  skipSetTimeout?: 0|1;
}

export declare function prerender(
  f: () => ChildDom,
  opts?: VanPrerenderOptions,
): string;
