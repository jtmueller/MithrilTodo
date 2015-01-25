var Utils;
(function (Utils) {
    function groupSize(items, size) {
        var output = [];
        var group = [];
        items.forEach(function (item, i) {
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
    Utils.groupSize = groupSize;
    function getClosest(element, selector) {
        var firstChar = selector.charAt(0);
        for (var elem = element; elem && elem !== document; elem = elem.parentNode) {
            if (firstChar === '.') {
                if (elem.classList.contains(selector.substr(1))) {
                    return elem;
                }
            }
            if (firstChar === '#') {
                if (elem.id === selector.substr(1)) {
                    return elem;
                }
            }
            if (firstChar === '[') {
                if (elem.hasAttribute(selector.substr(1, selector.length - 2))) {
                    return elem;
                }
            }
            if (elem.tagName.toLowerCase() === selector) {
                return elem;
            }
        }
        return null;
    }
    Utils.getClosest = getClosest;
    ;
    function fadesOut(callback, parentSelector) {
        return function (e) {
            m.redraw.strategy("none");
            var target = e.target;
            if (parentSelector) {
                target = getClosest(target, parentSelector);
            }
            if (target) {
                Velocity(target, { opacity: 0 }, {
                    duration: 750,
                    complete: function () {
                        m.startComputation();
                        callback();
                        m.endComputation();
                    }
                });
            }
            else {
                m.startComputation();
                callback();
                m.endComputation();
            }
        };
    }
    Utils.fadesOut = fadesOut;
})(Utils || (Utils = {}));
