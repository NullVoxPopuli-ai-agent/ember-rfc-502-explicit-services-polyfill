export { type Factory, type Instance, type Key, type KeyOrThunk } from "./key.ts";
export { type Context, hasBinding, isResolved, overrideService } from "./registry.ts";
export { type Decorator, inject, service } from "./service.ts";
export { Service } from "./service-base.ts";

import type Owner from "@ember/owner";

import type { Instance as KeyInstance, Key as AnyKey, KeyOrThunk as AnyKeyOrThunk } from "./key.ts";

declare module "@ember/service" {
  export function service<K extends AnyKey>(keyOrThunk: AnyKeyOrThunk<K>): PropertyDecorator;
  export function service<K extends AnyKey>(
    context: object,
    keyOrThunk: AnyKeyOrThunk<K>,
  ): KeyInstance<K>;
  export function inject<K extends AnyKey>(keyOrThunk: AnyKeyOrThunk<K>): PropertyDecorator;
  export function inject<K extends AnyKey>(
    context: object,
    keyOrThunk: AnyKeyOrThunk<K>,
  ): KeyInstance<K>;
  export function overrideService<K extends AnyKey>(
    owner: Owner,
    key: K,
    impl: AnyKey<KeyInstance<K>>,
  ): void;
}
