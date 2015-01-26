module TodoApp.Auth {
    var ref: Firebase = null;
    var loginHandle = m.deferred<FirebaseAuthData>();
    
    export function login() {
        if (!ref) {
            ref = new Firebase(Config.firebaseUrl);

            ref.onAuth(authData => {
                if (authData) {
                    authData.token = null;
                    loginHandle.resolve(authData);
                    //console.log('Authenticated: ', authData);

                    ref.child(`/users/${authData.uid}`)
                        .update(authData);
                }
                else {
                    ref.authWithOAuthPopup('google',
                        (e) => { if (e) loginHandle.reject(e); }); // , { remember: 'sessionOnly' });
                }
            });
        }

        return loginHandle.promise;
    }

    export function logout() {
        if (ref) ref.unauth();
    }
} 

