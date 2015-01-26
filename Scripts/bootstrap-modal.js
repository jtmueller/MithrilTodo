var Bootstrap;
(function (Bootstrap) {
    var Modal;
    (function (Modal) {
        (function (Button) {
            Button[Button["Ok"] = 0] = "Ok";
            Button[Button["Cancel"] = 1] = "Cancel";
            Button[Button["Yes"] = 2] = "Yes";
            Button[Button["No"] = 3] = "No";
            Button[Button["Apply"] = 4] = "Apply";
            Button[Button["Save"] = 5] = "Save";
            Button[Button["Delete"] = 6] = "Delete";
        })(Modal.Button || (Modal.Button = {}));
        var Button = Modal.Button;
        var ModalViewModel = (function () {
            function ModalViewModel() {
            }
            return ModalViewModel;
        })();
        var ModalController = (function () {
            function ModalController(options) {
                this.options = options;
                this.vm = new ModalViewModel();
                this.hide = this.hide.bind(this);
            }
            ModalController.prototype.show = function (content) {
                var _this = this;
                if (this.dlgResult) {
                    return this.dlgResult.promise;
                }
                m.startComputation();
                this.vm.content = content;
                this.vm.render = true;
                this.vm.visible = false;
                this.dlgResult = m.deferred();
                m.endComputation();
                setTimeout(function () {
                    // this allows for CSS animations to fade-in the element
                    m.startComputation();
                    _this.vm.visible = true;
                    m.endComputation();
                }, 10);
                return this.dlgResult.promise;
            };
            ModalController.prototype.hide = function (result) {
                var _this = this;
                m.startComputation();
                this.vm.visible = false;
                this.dlgResult.resolve(result);
                this.dlgResult = null;
                m.endComputation();
                setTimeout(function () {
                    // this allows for CSS animations to fade-out the element before it's removed from the dom
                    m.startComputation();
                    _this.vm.render = false;
                    m.endComputation();
                }, 250); // css animation lasts 0.15 seconds, or 200ms
            };
            return ModalController;
        })();
        Modal.ModalController = ModalController;
        function renderButtons(ctrl) {
            return ctrl.options.buttons.map(function (btn) {
                var btnClass = btn.primary ? 'btn-primary' : 'btn-default';
                return m("button.btn." + btnClass + "[type=button]", { onclick: ctrl.hide.bind(ctrl, btn.id) }, btn.text);
            });
        }
        function view(ctrl) {
            if (!ctrl.vm.render)
                return null;
            return m('.modal.fade' + (ctrl.vm.visible ? '.in' : ''), m('.modal-dialog', m('.modal-content', [
                m('.modal-header', [
                    m('button.close[type=button][aria-label=Close]', { onclick: ctrl.hide }, m('span[aria-hidden=true]', m.trust('&times;'))),
                    m('h4.modal-title', ctrl.options.title)
                ]),
                m('.modal-body', ctrl.vm.content()),
                m('.modal-footer', renderButtons(ctrl))
            ])));
        }
        function create(options) {
            return {
                controllerFactory: function () { return new ModalController(options); },
                view: view
            };
        }
        Modal.create = create;
    })(Modal = Bootstrap.Modal || (Bootstrap.Modal = {}));
})(Bootstrap || (Bootstrap = {}));
//# sourceMappingURL=bootstrap-modal.js.map