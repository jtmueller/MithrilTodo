var Utils;
(function (Utils) {
    /** Breaks an array into groups of at most the given size. */
    function groupSize(items, groupSize) {
        var output = [];
        var group = [];
        var i = 0;
        items.forEach(function (item) {
            if (i > 0 && i % groupSize === 0) {
                output.push(group);
                group = [];
            }
            group.push(item);
            if (i === items.length - 1) {
                output.push(group);
            }
            i++;
        });
        return output;
    }
    Utils.groupSize = groupSize;
    function isNull(x) {
        return !x;
    }
    Utils.isNull = isNull;
    function isNotNull(x) {
        return !!x;
    }
    Utils.isNotNull = isNotNull;
    var matchFn = _(['matches', 'msMatchesSelector', 'webkitMatchesSelector', 'mozMatchesSelector']).map(function (fn) { return document.body[fn]; }).find(isNotNull);
    /**
     * Navigates up the DOM element tree returning the first element that matches the given selector, including the given element.
     * @param elem The base element
     * @param selector The CSS selector to match on.
     * @return Null if no match
     */
    function closest(element, selector) {
        if (element['closest'])
            return element['closest'](selector);
        for (var elem = element; elem && elem !== document; elem = elem.parentNode) {
            if (matchFn.call(elem, selector)) {
                return elem;
            }
        }
        return null;
    }
    Utils.closest = closest;
    /** Returns the first child element that matches the given selector. */
    function down(element, selector) {
        return element.querySelector(selector);
    }
    Utils.down = down;
    /** Returns all the descendants of the given element that match the given selector. */
    function descendants(element, selector) {
        return element.querySelectorAll(selector);
    }
    Utils.descendants = descendants;
    function fadesOut(callback, parentSelector) {
        return function (e) {
            //don't redraw yet
            m.redraw.strategy("none");
            var target = e.target;
            if (parentSelector) {
                target = closest(target, parentSelector);
            }
            if (target) {
                Velocity(target, { opacity: 0 }, {
                    duration: 750,
                    complete: function () {
                        //now that the animation finished, redraw
                        m.startComputation();
                        callback();
                        m.endComputation();
                    }
                });
            }
            else {
                // we couldn't find the target, so skip the animation
                m.startComputation();
                callback();
                m.endComputation();
            }
        };
    }
    Utils.fadesOut = fadesOut;
})(Utils || (Utils = {}));
//# sourceMappingURL=utils.js.map