/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isFunction, isNull, isObject, isUndefined, toString } from '@lwc/shared';

import {
    createVM,
    disconnectRootVM,
    connectRootVM,
    getAssociatedVM,
    getAssociatedVMIfPresent,
} from '../../framework/vm';
import { ComponentConstructor } from '../../framework/component';
import { isCircularModuleDependency, resolveCircularModuleDependency } from '../../framework/utils';
import { getComponentDef, setElementProto } from '../../framework/def';

import { nodeConnected, nodeDisconnected } from '../node-reactions';

/**
 * EXPERIMENTAL: This function is almost identical to document.createElement
 * (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
 * with the slightly difference that in the options, you can pass the `is`
 * property set to a Constructor instead of just a string value. The intent
 * is to allow the creation of an element controlled by LWC without having
 * to register the element as a custom element. E.g.:
 *
 * const el = createElement('x-foo', { is: FooCtor });
 *
 * If the value of `is` attribute is not a constructor,
 * then it throws a TypeError.
 */
export function createElement(
    sel: string,
    options: {
        is: ComponentConstructor;
        mode?: 'open' | 'closed';
    }
): HTMLElement {
    if (!isObject(options) || isNull(options)) {
        throw new TypeError(
            `"createElement" function expects an object as second parameter but received "${toString(
                options
            )}".`
        );
    }

    let Ctor = options.is;
    if (!isFunction(Ctor)) {
        throw new TypeError(
            `"createElement" function expects a "is" option with a valid component constructor.`
        );
    }

    const mode = options.mode !== 'closed' ? 'open' : 'closed';

    // Create element with correct tagName
    const element = document.createElement(sel);
    if (!isUndefined(getAssociatedVMIfPresent(element))) {
        // There is a possibility that a custom element is registered under tagName,
        // in which case, the initialization is already carry on, and there is nothing else
        // to do here.
        return element;
    }

    if (isCircularModuleDependency(Ctor)) {
        Ctor = resolveCircularModuleDependency(Ctor);
    }

    const def = getComponentDef(Ctor);
    setElementProto(element, def);

    createVM(element, Ctor, { mode, isRoot: true, owner: null });

    nodeConnected(element, () => {
        const vm = getAssociatedVM(element);
        connectRootVM(vm);
    });

    nodeDisconnected(element, () => {
        const vm = getAssociatedVM(element);
        disconnectRootVM(vm);
    });

    return element;
}
