const assert = require('assert');

describe('Event target in slot elements', () => {
    const URL = 'http://localhost:4567/root-listener-event-target/';

    before(() => {
        browser.url(URL);
    });

    it('should receive event with correct target', function () {
        const element = browser.element('x-grand-child');
        element.click();

        const verifyElement = browser.element('.event-target-correct');
        assert.strictEqual(verifyElement.getText(), 'Event Target is correct element');
    });
});