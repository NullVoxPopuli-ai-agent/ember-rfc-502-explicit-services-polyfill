import { assert } from "@ember/debug";

import type Owner from "@ember/owner";

/**
 * Anything with a `create(props)` method, as on the string path:
 * `owner.register('service:x', { create })` already works in Ember.
 */
export interface Factory<T extends object = object> {
  create(props: object): T;
}

export type Key<T extends object = object> = (abstract new (owner: Owner) => T) | Factory<T>;

/**
 * The class branch comes first.
 * A subclass of `Service` is also a `Factory`,
 * but its generic static `create` would infer the base class, not the subclass.
 */
export type Instance<K extends Key> = K extends abstract new (owner: Owner) => infer T
  ? T
  : K extends Factory<infer T>
    ? T
    : never;

export type KeyOrThunk<K extends Key> = K | (() => KeyOrThunk<K>);

function hasOwnPrototype(value: unknown): boolean {
  return typeof value === "function" && Object.prototype.hasOwnProperty.call(value, "prototype");
}

/**
 * Checked before `prototype`, so an arrow function with a `create` method
 * is a factory and not a thunk.
 */
export function isFactory(value: unknown): value is Factory {
  if (typeof value !== "function" && (typeof value !== "object" || value === null)) return false;

  return typeof (value as Partial<Factory>).create === "function";
}

export function isThunk(value: unknown): value is () => Key {
  return typeof value === "function" && !isFactory(value) && !hasOwnPrototype(value);
}

export function isKey(value: unknown): value is Key {
  return isFactory(value) || hasOwnPrototype(value);
}

/**
 * A key that is a function with its own `prototype`.
 * An instance made for it by an override must inherit from that `prototype`.
 */
export function isClassKey(value: unknown): value is abstract new (owner: Owner) => object {
  return hasOwnPrototype(value);
}

/**
 * A thunk can return another thunk.
 * The limit stops a thunk that returns itself.
 */
const MAX_THUNK_DEPTH = 10;

export function resolveKey<K extends Key>(keyOrThunk: KeyOrThunk<K>): K {
  let value: unknown = keyOrThunk;

  for (let depth = 0; isThunk(value); depth++) {
    assert(
      `A thunk returned another thunk more than ${MAX_THUNK_DEPTH} times. ` +
        `A thunk must eventually return a class, or an object with a create() method.`,
      depth < MAX_THUNK_DEPTH,
    );

    value = value();
  }

  return value as K;
}

/**
 * Never calls `String(key)`.
 * A factory object can inherit from a class, and then it inherits
 * `Function.prototype.toString`, which throws for an object.
 */
export function nameOf(key: unknown): string {
  if (typeof key === "function") return key.name || "an anonymous class";
  if (typeof key !== "object" || key === null) return String(key);

  const name = (key as { name?: unknown }).name;

  if (typeof name === "string" && name) return name;

  return isFactory(key) ? "an anonymous factory" : "an object";
}
