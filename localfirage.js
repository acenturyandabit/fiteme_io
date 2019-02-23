//v2.1. 2 way bindings, path

//usage:

//include firebase
//let run
/*object=localfirage.tieCollection(col,obj,handlers{
    remoteSet:(prop,val)=>{}
})*/


function _localfirage(usersettings) {
    //Add an events API
    this.events = {};
    this.fire = function (e, args) {
        if (this.events[e]) {
            this.events[e].forEach((f, i) => {
                try {
                    f(args)
                } catch (e) {
                    console.log(e);
                }
            });
        }
    };
    this.on = function (e, f) {
        _e = e.split(',');
        _e.forEach((i) => {
            if (!this.events[i]) this.events[e] = [];
            this.events[i].push(f);
        })
    };
    this.settings = {
        config: {},
    };
    Object.assign(this.settings, usersettings);
    // A simple firebase derived backend interface for a variety of applications. Localforage for firebase.
    // Assert that firebase has been included

    //Login to firebase
    firebase.initializeApp(this.settings.config);

    this.db = firebase.firestore();
    this.db.settings({
        timestampsInSnapshots: true
    });
    //retrieve data from path in settings
    this.dbroot = this.db;
    //that's it really hey

    //WARNING: CANNOT HANDLE NESTED DATA



    this.tieCollection = function (col, obj, handler) {
        let localChange = false;
        let proxy = new Proxy(obj, {
            set: function (obj, prop, val) {
                if (!localChange) {
                    let _val = JSON.parse(JSON.stringify(val));
                    if (obj[prop]) {
                        col.doc(prop).update(_val);
                    } else {
                        col.doc(prop).set(_val);
                    }
                } else localChange = false;
                obj[prop] = val;
            }
        })
        col.onSnapshot(shot => {
            console.log("hi");
            shot.docChanges().forEach(change => {
                switch (change.type) {
                    case "added":
                        if (!proxy[change.doc.id]) {
                            localChange = true;
                            proxy[change.doc.id] = {};
                        }
                    case "modified":
                        localChange = true;
                        proxy[change.doc.id] = change.doc.data();
                        handler.remoteSet(change.doc.id, change.doc.data());
                        break;
                    case "removed":
                        localChange = true;
                        delete proxy[change.doc.id];
                        break;
                }
            })
        })
        return proxy;
    }

    this.path = function (root, path) {
        let r = root;
        let spt = path.split("/");
        for (let i = 0; i < spt.length; i++) {
            if (i % 2 == 0) {
                r = r.collection(spt[i]);
            } else {
                r = r.doc(spt[i]);
            }
        }
        return r;
    }
    
}


var localfirage = new _localfirage({
    config: {
        apiKey: "AIzaSyA-sH4oDS4FNyaKX48PSpb1kboGxZsw9BQ",
        authDomain: "backbits-567dd.firebaseapp.com",
        databaseURL: "https://backbits-567dd.firebaseio.com",
        projectId: "backbits-567dd",
        storageBucket: "backbits-567dd.appspot.com",
        messagingSenderId: "894862693076"
    }
})