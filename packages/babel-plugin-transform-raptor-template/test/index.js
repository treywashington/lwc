import * as babel from 'babel-core';
import * as fs from 'fs';
import * as path from 'path';

import assert from 'power-assert';
import plugin from '../src/index';

function trim(str) {
    return str.toString().replace(/^\s+|\s+$/, '');
}

const skipTests = [
    'all',
    'multiRootError',
    '.babelrc',
    '.DS_Store',
];

const fixturesDir = path.join(__dirname, 'fixtures');

describe('emit asserts for: ', () => {
    fs.readdirSync(fixturesDir).map((caseName) => {
        if (skipTests.indexOf(caseName) >= 0) return;

        it(`output match: ${caseName}`, () => {
            const fixtureDir = path.join(fixturesDir, caseName);

            const actual = transform(path.join(fixtureDir, 'actual.html'));

            // Check code output
            const expected = fs.readFileSync(path.join(fixtureDir, 'expected.js'));
            assert.equal(trim(actual), trim(expected));
        });
    });
});

describe('emit errors', () => {
    it ('throw on multiple roots', () => {
        const fixturePath = path.join(fixturesDir, 'multiRootError');
        try {
            transform(fixturePath, 'actual.html');
        } catch (e) {
            assert(e);
        }
    });

});

const BASE_OPTIONS = {};

function transform(filePath, options = {}) {
    function getPluginConfig() {
        return [plugin, {
            ...BASE_OPTIONS,
            ...options,
        }];
    }
    const src = fs.readFileSync(filePath);

    return babel.transform(src, {
        plugins:  [getPluginConfig()],
    }).code;
}

