var TodoApp;
(function (TodoApp) {
    var Auth;
    (function (Auth) {
        var ref = null;
        var loginHandle = m.deferred();
        function login() {
            if (!ref) {
                ref = new Firebase(TodoApp.Config.firebaseUrl);
                ref.onAuth(function (authData) {
                    if (authData) {
                        authData.token = null;
                        loginHandle.resolve(authData);
                        //console.log('Authenticated: ', authData);
                        ref.child("/users/" + authData.uid).update(authData);
                    }
                    else {
                        ref.authWithOAuthPopup('google', function (e) {
                            if (e)
                                loginHandle.reject(e);
                        }); // , { remember: 'sessionOnly' });
                    }
                });
            }
            return loginHandle.promise;
        }
        Auth.login = login;
        function logout() {
            if (ref)
                ref.unauth();
        }
        Auth.logout = logout;
    })(Auth = TodoApp.Auth || (TodoApp.Auth = {}));
})(TodoApp || (TodoApp = {}));
//# sourceMappingURL=auth.js.map