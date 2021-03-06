﻿module Utils {

    export interface IEachable<T> {
        forEach: (fn: (item: T) => void) => void;
        length: number;
    }

    export function isNull<T>(x: T) { return !x; }

    export function isNotNull<T>(x: T) { return !!x; }

    var matchFn: (selector: string) => boolean =
        _(['matches', 'msMatchesSelector', 'webkitMatchesSelector', 'mozMatchesSelector'])
            .map(fn => document.body[fn])
            .find(isNotNull);

    /**
     * Navigates up the DOM element tree returning the first element that matches the given selector, including the given element.
     * @param elem The base element
     * @param selector The CSS selector to match on.
     * @return Null if no match
     */
    export function closest(element: HTMLElement, selector: string): HTMLElement {
        if (element['closest'])
            return element['closest'](selector);

        for (var elem: any = element; elem && elem !== document; elem = elem.parentNode) {
            if (matchFn.call(elem, selector)) {
                return elem;
            }
        }

        return null;
    }

    /** Returns the first child element that matches the given selector. */
    export function down(element: HTMLElement, selector: string): HTMLElement {
        return <HTMLElement>element.querySelector(selector);
    }

    /** Returns all the descendants of the given element that match the given selector. */
    export function descendants(element: HTMLElement, selector: string): NodeListOf<HTMLElement> {
        return <NodeListOf<HTMLElement>>element.querySelectorAll(selector);
    }

    export function fadesOut(callback: Function, parentSelector?: string) {
        return (e:Event) => {
            //don't redraw yet
            m.redraw.strategy("none");

            var target = <HTMLElement>e.target;
            if (parentSelector) {
                target = closest(target, parentSelector);
            }

            if (target) {
                Velocity(target, { opacity: 0 }, {
                    duration: 750,
                    complete: () => {
                        //now that the animation finished, redraw
                        m.startComputation();
                        callback();
                        m.endComputation();
                    }
                });
            } else {
                // we couldn't find the target, so skip the animation
                m.startComputation();
                callback();
                m.endComputation();
            }
        }
    }
}