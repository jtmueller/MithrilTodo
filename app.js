var Utils,Bootstrap,TodoApp;(function(n){var t;(function(n){n.firebaseUrl="https://hrbo-todo.firebaseio.com"})(t=n.Config||(n.Config={}))})(TodoApp||(TodoApp={})),function(n){function r(n,t){var u=[],i=[],r=0;return n.forEach(function(f){r>0&&r%t==0&&(u.push(i),i=[]);i.push(f);r===n.length-1&&u.push(i);r++}),u}function u(n){return!n}function t(n){return!!n}function i(n,t){if(n.closest)return n.closest(t);for(var i=n;i&&i!==document;i=i.parentNode)if(f.call(i,t))return i;return null}function e(n,t){return n.querySelector(t)}function o(n,t){return n.querySelectorAll(t)}function s(n,t){return function(r){m.redraw.strategy("none");var u=r.target;t&&(u=i(u,t));u?Velocity(u,{opacity:0},{duration:750,complete:function(){m.startComputation();n();m.endComputation()}}):(m.startComputation(),n(),m.endComputation())}}n.groupSize=r;n.isNull=u;n.isNotNull=t;var f=_(["matches","msMatchesSelector","webkitMatchesSelector","mozMatchesSelector"]).map(function(n){return document.body[n]}).find(t);n.closest=i;n.down=e;n.descendants=o;n.fadesOut=s}(Utils||(Utils={})),function(n){var t=function(){function n(n,t){var i=this;this.query=n;this.data=[];this.convert=t||function(n){return n.val()};this.ref=n.ref();this.query.on("child_added",function(n){return i.handleChildAdded(n)});this.query.on("child_removed",function(n){return i.handleChildRemoved(n)});this.query.on("child_changed",function(n){return i.handleChildChanged(n)});this.query.on("child_moved",function(n,t){return i.handleChildMoved(n,t)})}return n.prototype.handleChildAdded=function(n){m.startComputation();var t=this.convert(n);this.data.push(t);m.endComputation()},n.prototype.handleChildRemoved=function(n){m.startComputation();var t=n.key();_.remove(this.data,function(n){return n.key()===t});m.endComputation()},n.prototype.handleChildChanged=function(n){m.startComputation();var t=this.convert(n),i=_.findIndex(this.data,function(n){return n.key()===t.key()});i!==-1&&(this.data[i]=t);m.endComputation()},n.prototype.handleChildMoved=function(n,t){var u,i,r;(m.startComputation(),u=n.key(),i=_.remove(this.data,function(n){return n.key()===u}),i.length!==0)&&(t?(r=_.findIndex(this.data,function(n){return n.key()===t}),r===-1?this.data.push(i[0]):this.data.splice(r,0,i[0])):this.data.unshift(i[0]),m.endComputation())},Object.defineProperty(n.prototype,"length",{get:function(){return this.data.length},enumerable:!0,configurable:!0}),n.prototype.asArray=function(){return this.data},n.prototype.filter=function(n){return _.filter(this.data,n)},n.prototype.forEach=function(n){return _.forEach(this.data,n)},n.prototype.map=function(n){return _.map(this.data,n)},n.prototype.reduce=function(n,t){return _.reduce(this.data,n,t)},n.prototype.push=function(n,t){var r=n.toJSON?n.toJSON():n,i=this.ref.push(),u=i.key();return t?typeof t=="number"?i.setWithPriority(r,t):i.setWithPriority(r,t):i.set(r),u},n.prototype.update=function(n,t,i){var r=t.toJSON?t.toJSON():t,u=this.ref.child(n);i?typeof i=="number"?u.setWithPriority(r,i):u.setWithPriority(r,i):u.set(r)},n.prototype.updatePriority=function(n,t){var i=this.ref.child(n);typeof t=="number"?i.setPriority(t):i.setPriority(t)},n.prototype.remove=function(n){var t=this.ref.child(n);t&&t.remove()},n.prototype.withValue=function(n,t,i){var r=this;return m.withAttr(n,function(n){var u=r.ref.child(t).child(i).ref();u.set(n)})},n.prototype.dispose=function(){this.query&&(this.query.off("child_added"),this.query.off("child_removed"),this.query.off("child_changed"),this.query.off("child_moved"),this.query=null);this.data=null;this.ref=null},n}();n.MithrilFireStore=t}(TodoApp||(TodoApp={})),function(n){var t;(function(n){function i(n){var t=n.vm;return t.render()?m(".modal"+(t.visible()?".fade.in":".fade"),m(".modal-dialog",m(".modal-content",[m(".modal-header",[m("button.close[type=button][aria-label=Close]",{onclick:n.hide},m("span[aria-hidden=true]",m.trust("&times;"))),m("h4.modal-title",t.title())]),m(".modal-body",t.contentView()),m(".modal-footer",f(n))]))):null}function f(n){return n.vm.buttons.map(function(t){var i=t.primary?"btn-primary":"btn-default";return m("button.btn."+i+"[type=button]",{onclick:n.hide.bind(n,t.value)},t.text)})}var t=function(){function n(){this.vm=new r;this.hide=this.hide.bind(this)}return n.prototype.show=function(n){return this.dlgResult?this.dlgResult.promise:(this.dlgResult=m.deferred(),this.vm.show(n),this.dlgResult.promise)},n.prototype.hide=function(n){this.dlgResult.resolve(n);this.dlgResult=null;this.vm.hide()},n}(),u,r;n.ModalController=t;n.view=i,function(n){n[n.Ok=0]="Ok";n[n.Cancel=1]="Cancel";n[n.Yes=2]="Yes";n[n.No=3]="No";n[n.Apply=4]="Apply";n[n.Save=5]="Save";n[n.Delete=6]="Delete"}(n.Button||(n.Button={}));u=n.Button;r=function(){function n(){this.render=m.prop(!1);this.visible=m.prop(!1);this.title=m.prop("");this.contentView=function(){return null};this.buttons=[]}return n.prototype.show=function(n){var t=this;m.startComputation();this.title(n.title);this.contentView=n.content;this.buttons=n.buttons||[];this.render(!0);this.visible(!1);m.endComputation();setTimeout(function(){t.visible(!0);m.redraw()},16)},n.prototype.hide=function(){var n=this;this.visible(!1);setTimeout(function(){n.render(!1);m.redraw()},250)},n}();n.Module={controller:t,view:i}})(t=n.Modal||(n.Modal={}))}(Bootstrap||(Bootstrap={})),function(n){(function(n){n[n.google=0]="google";n[n.facebook=1]="facebook";n[n.twitter=2]="twitter";n[n.github=3]="github"})(n.AuthProvider||(n.AuthProvider={}));var t=n.AuthProvider,i;(function(i){function f(){if(!r){r=new Firebase(n.Config.firebaseUrl);r.onAuth(function(n){n&&(n.token=null,u.resolve(n),r.child("/users/"+n.uid).update(n))})}return u.promise}function e(n){r&&r.getAuth()||r.authWithOAuthPopup(t[n],function(n){n&&u.reject(n)})}function o(){r&&r.unauth();u.reject(new Error("Log-out requested."));u=m.deferred()}var r=null,u=m.deferred();i.init=f;i.authenticate=e;i.logout=o})(i=n.Auth||(n.Auth={}))}(TodoApp||(TodoApp={})),function(n){function u(n){if(!n.authData)return h(n);var t=n.vm,r=Utils.groupSize(t.list,5);return m(".container.todoApp",[m(".row",m(".col-md-4.col-md-offset-4.col-xs-10.col-xs-offset-1",o(t))),m(".row",r.map(function(n){return m(".col-lg-4",n.map(s.bind(undefined,t)))})),i.view(n.dialogController)])}function e(n){return{title:"Delete Task?",buttons:[{text:"Yes",value:2,primary:!0},{text:"No",value:3}],content:function(){return m(".confirmDlg",["Are you sure you want to permanently delete this task?",m(".panel.panel-default",m(".panel-body",n))])}}}function o(n){return m("form",{onsubmit:n.add},[m(".form-group",m(".form-control-wrapper",[m("input.form-control[type=text]",{placeholder:"What needs to be done?",onkeypress:m.withAttr("value",n.description),value:n.description()}),m("span.material-input")]))])}function s(n,t){return m(".panel.panel-default",{key:t.key()},m(".panel-body",[m(".col-xs-2",m(".checkbox",m("label",[m("input[type=checkbox]",{id:"todo_"+t.key(),onclick:function(i){t.completed(i.target.checked);n.update(t)},checked:t.completed()}),m("span.ripple"),m("span.check")]))),m(".col-xs-8",m("label.todo"+(t.completed()?".completed":""),{htmlFor:"todo_"+t.key()},t.text())),m(".col-xs-2",m(".icon-close",m("i.mdi-content-clear.close",{onclick:n.remove.bind(n,t.key(),t.text())})))]))}function h(n){return m(".container.todoApp",m(".row",m(".col-md-4.col-md-offset-4.col-xs-10.col-xs-offset-1",m(".authBox.well",[m(".row",m(".col-xs-10.col-xs-offset-1",m("h3","Mithril Todo"))),m(".row",m(".col-xs-10.col-xs-offset-1","Please log in to access your private to-do list.")),m(".row",m("button.google.btn.btn-raised.btn-material-red-600[type=button]",{onclick:n.login.bind(n,0)},["Google",m(".ripple-wrapper")]))]))))}var i=Bootstrap.Modal,r=function(){function r(){this.init();this.keyDownHandler=this.keyDownHandler.bind(this);window.addEventListener("keydown",this.keyDownHandler)}return r.prototype.init=function(){var r=this;n.Auth.init().then(function(u){if(u){m.startComputation();r.authData=u;var e=new Firebase(""+n.Config.firebaseUrl+"/users/"+u.uid+"/todos");r.store=new n.MithrilFireStore(e.limitToLast(100),function(n){return t.fromJSON(n.val(),n.key())});r.dialogController=new i.ModalController;r.vm=new f(r.store,r.dialogController);m.endComputation()}},function(n){return console.error(n)})},r.prototype.login=function(t){n.Auth.authenticate(t)},r.prototype.keyDownHandler=function(t){t.shiftKey&&t.ctrlKey&&t.keyCode===76&&(m.startComputation(),this.authData=null,this.store.dispose(),n.Auth.logout(),this.init(),m.endComputation())},r.prototype.onunload=function(){this.store.dispose();window.removeEventListener("keydown",this.keyDownHandler)},r}(),f,t;n.TodoController=r;n.view=u;f=function(){function n(n,t){this.list=n;this.dialogController=t;this.description=m.prop("");this.add=this.add.bind(this)}return n.prototype.add=function(n){n.preventDefault();this.description()&&(this.list.push(new t(this.description())),this.description(""))},n.prototype.update=function(n){this.list.update(n.key(),n)},n.prototype.remove=function(n,t){var i=this,r=e(t);this.dialogController.show(r).then(function(t){t===2&&i.list.remove(n)})},n}();t=function(){function n(n,t,i){t===void 0&&(t=!1);this.text=m.prop("");this.completed=m.prop(!1);this.key=m.prop();this.text(n);this.completed(t);this.key(i)}return n.prototype.toJSON=function(){return{text:this.text(),completed:this.completed()}},n.fromJSON=function(t,i){return new n(t.text,t.completed,i)},n}();n.Module={controller:r,view:u}}(TodoApp||(TodoApp={}));m.module(document.body,TodoApp.Module)
