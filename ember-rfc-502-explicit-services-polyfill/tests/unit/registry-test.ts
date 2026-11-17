import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { destroy } from "@ember/destroyable";
import { getOwner, setOwner } from "@ember/owner";
import Service from "@ember/service";
import { settled } from "@ember/test-helpers";

import { hasBinding, isResolved, overrideService, service } from "#src/index.ts";

class Counter {
  count = 0;
}

class Doubled extends Counter {
  count = 2;
}

class Unrelated {}

class Session extends Service {
  @service(Counter) declare counter: Counter;
}

class Consumer {
  @service(() => Counter) declare counter: Counter;
}

module("Unit | registry", function (hooks) {
  setupTest(hooks);

  test("service(owner, Key) instantiates once per owner", function (assert) {
    const counter = service(this.owner, Counter);

    assert.true(counter instanceof Counter);
    assert.strictEqual(service(this.owner, Counter), counter);
    assert.strictEqual(getOwner(counter), this.owner);
    assert.true(isResolved(this.owner, Counter));
    assert.false(hasBinding(this.owner, Counter));
  });

  test("overrideService binds a subclass", function (assert) {
    overrideService(this.owner, Counter, Doubled);

    assert.true(hasBinding(this.owner, Counter));
    assert.strictEqual(service(this.owner, Counter).count, 2);
  });

  test("overrideService rejects unrelated classes and late overrides", function (assert) {
    assert.throws(() => overrideService(this.owner, Counter, Unrelated), /nor a subclass of it/);

    service(this.owner, Counter);

    assert.throws(() => overrideService(this.owner, Counter, Doubled), /already been resolved/);
  });

  test("overrideService needs an owner", function (assert) {
    assert.throws(
      () => overrideService(new Counter() as never, Counter, Doubled),
      /needs an owner/,
    );
  });

  test("EmberObject services go through create and can inject class keys", function (assert) {
    const session = service(this.owner, Session);

    assert.true(session instanceof Session);
    assert.strictEqual(session.counter, service(this.owner, Counter));
  });

  test("the decorator resolves through the owner of the instance", function (assert) {
    const orphan = new Consumer();
    const owned = new Consumer();

    setOwner(owned, this.owner);

    assert.throws(() => orphan.counter, /it has no owner/);
    assert.strictEqual(owned.counter, service(this.owner, Counter));
  });

  test("instances are destroyed with the owner", async function (assert) {
    const session = service(this.owner, Session);

    destroy(this.owner);
    await settled();

    assert.true(session.isDestroyed);
  });
});
