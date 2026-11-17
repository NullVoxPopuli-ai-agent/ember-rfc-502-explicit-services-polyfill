import { module, test } from 'qunit';
import { setupTest } from 'broccoli-app/tests/helpers';
import { service } from 'ember-rfc-502-explicit-services-polyfill';

import Editor from 'broccoli-app/domain/cycle/editor';
import History from 'broccoli-app/domain/cycle/history';

module('Unit | module cycles', function (hooks) {
  setupTest(hooks);

  test('two services that import each other inject each other with thunks', function (assert) {
    const editor = service(this.owner, Editor);
    const history = service(this.owner, History);

    assert.strictEqual(editor.history, history);
    assert.strictEqual(history.editor, editor);

    editor.type('one');
    editor.type('two');
    history.undo();

    assert.strictEqual(editor.text, 'one');
  });
});
