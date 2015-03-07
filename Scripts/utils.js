var Utils;
(function (Utils) {
    function isNull(x) {
        return !x;
    }
    Utils.isNull = isNull;
    function isNotNull(x) {
        return !!x;
    }
    Utils.isNotNull = isNotNull;
    var matchFn = _(['matches', 'msMatchesSelector', 'webkitMatchesSelector', 'mozMatchesSelector']).map(function (fn) { return document.body[fn]; }).find(isNotNull);
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
    function down(element, selector) {
        return element.querySelector(selector);
    }
    Utils.down = down;
    function descendants(element, selector) {
        return element.querySelectorAll(selector);
    }
    Utils.descendants = descendants;
    function fadesOut(callback, parentSelector) {
        return function (e) {
            m.redraw.strategy("none");
            var target = e.target;
            if (parentSelector) {
                target = closest(target, parentSelector);
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
