module Utils {
    /**
     * Get closest DOM element up the tree that contains a class, ID, or data attribute
     * @param  {Node} elem The base element
     * @param  {String} selector The class, id, data attribute, or tag to look for
     * @return {Node} Null if no match
     */
    export function getClosest(element: HTMLElement, selector: string): HTMLElement {

        var firstChar = selector.charAt(0);

        // Get closest match
        for (var elem: any = element; elem && elem !== document; elem = elem.parentNode) {

            // If selector is a class
            if (firstChar === '.') {
                if (elem.classList.contains(selector.substr(1))) {
                    return elem;
                }
            }

            // If selector is an ID
            if (firstChar === '#') {
                if (elem.id === selector.substr(1)) {
                    return elem;
                }
            }

            // If selector is an attribute
            if (firstChar === '[') {
                if (elem.hasAttribute(selector.substr(1, selector.length - 2))) {
                    return elem;
                }
            }

            // If selector is a tag
            if (elem.tagName.toLowerCase() === selector) {
                return elem;
            }

        }

        return null;
    };

    export function groupSize<T>(items: T[], size: number) {
        var output: T[][] = [];
        var group: T[] = [];

        items.forEach((item, i) => {
            if (i > 0 && i % size === 0) {
                output.push(group);
                group = [];
            }
            group.push(item);
            if (i === items.length - 1) {
                output.push(group);
            }
        });

        return output;
    }

    export function fadesOut(callback: Function, parentSelector?: string) {
        return (e:Event) => {
            //don't redraw yet
            m.redraw.strategy("none");

            var target = <HTMLElement>e.target;
            if (parentSelector) {
                target = getClosest(target, parentSelector);
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