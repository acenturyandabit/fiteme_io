//broken ;-;
core.registerOperator("discussion", function (operator) {

    let me = this;
    this.settings = {
        side: 0 // or 1.
    };

    this.rootdiv = document.createElement("div");
    //Add content-independent HTML here. fromSaveData will be called if there are any items to load.
    this.rootdiv.innerHTML = `
    <style>
        .assertion>textarea{
            resize:none
        }
        .assertion.sameSide>.responder{
            display:none;
        }
        .assertion.sameSide.rejected>.rejected{
            display:block;
        }

        .resolution{
            display:none;
        }
    </style>
    <div style="display:flex; justify-content:center;" class="argbase">
    </div>`;
    this.userRootContainer = this.rootdiv.querySelector("urc");
    operator.div.appendChild(this.rootdiv);
    this.reupdate = {};
    //////////////////Handle core item updates//////////////////
    //these are optional but can be used as a reference.
    core.on("updateItem", function (d) {
        if (core.items[d.id].discussion) {
            //if i am registered as a discussion element
            let q = this.rootdiv.querySelector("[data-'" + d.id + "']");
            if (!q) {
                q = document.createElement("div");
                q.innerHTML = `
                <div class="assertion">
                    <textarea data-role="argument">I honestly think that cats aren't even that great.</textarea>
                    <br>
                    <div class="responder" style="display:none">
                        <button class="rs">Resolve(handshake)</button>
                        <button class="rp">Respond (comment bubble)</button>
                        <button class="ff">Flag assertion(flag)</button>
                    </div>
                    <div class="author" style="display:none">
                        <button class="rw">Rewrite(pen)</button>
                        <button class="ap">Add point(plus)</button>
                        <button class="rm">Remove(bin)</button>
                    </div>
                </div>
                <div class="responses">
                    // a bunch of other data-ids
                    <div class="bin">
                    </div>
                </div>
                <div class="resolution">
                    <h1>Resolution:</h1>
                    <select>
                        <option>Conceded</option>
                        <option>Clashing</option>
                    </select>
                    <textarea data-role="fw" placeholder="Final words..."></textarea>
                    <p>Win some, lose some 3:</p>
                </div>
                <div class="rejected">
                    <h1>Flagged:</h1>
                    <select>
                        <option>Fallacy</option>
                        <option>Incivility</option>
                    </select>
                    <textarea data-role="fw" placeholder="Elaborate on your complaint..."></textarea>
                    <p>Please rewrite your argument in a more <em>socially responsible</em> manner, mate.</p>
                </div>
                `
            }
            //Different types:
            /*
            open
            rewritten
            conceded
            clashing
            rejected
            removed
            */
            //same side, open: blue, remove/rewrite buttons
            //same side, rejected: blue striped, remove/rewrite buttons
            //same side, rewritten+removed: lightblue, redirectButton, stacked
            //same side, removed: lightblue, stacked
            //same side, resolved+conceded: blue, CONCEDED overlay
            //same side, resolved+clashing: blue: CLASHING overlay
            //opposite side, open: add, red, responder
            //opposite side, rejected: red, noadd
            //opposite side, rewritten+removed: lightred, stacked
            //opposite side, removed: lightred, stacked
            //opposite side, resolved+conceded: red, CONCEDED overlay
            //opposite side, resolved+clashing: red, CLASHING overlay

            //parent, if exists
            let parent;
            if (core.items[d.id].discussion.parent) {
                let p = me.rootdiv.querySelector("[data-'" + d.id + "']");
                if (p) {
                    parent = p;
                } else {
                    //if parent does not exist, then wait for it.
                    if (!me.reupdate[core.items[d.id].discussion.parent]) me.reupdate[core.items[d.id].discussion.parent] = [];
                    me.reupdate[core.items[d.id].discussion.parent].push(d.id);
                }
            } else {
                parent = me.rootdiv.querySelector(".argbase");
            }

            //set id, classes
            q.dataset.id = d.id;
            q.classList.clear();
            q.classList.add("assertion");
            q.classList.add(core.items[d.id].discussion.status);
            //set responder or author
            if (core.items[d.id].discussion.side == me.settings.side) {
                q.classList.add("sameSide");
                parent.prepend(q);
                q.querySelector("button.rm").disabled = false;
                q.querySelector("button.ap").disabled = false;
                q.querySelector("button.rw").disabled = false;
                //argument status
                switch (core.items[d.id].discussion.status) {
                    case "rewritten":
                    case "conceded":
                    case "clashing":
                        q.querySelector("button.rw").disabled = false;
                        q.querySelector("button.rm").disabled = false;
                        break;
                    case "removed":
                        q.querySelector("button.rm").disabled = false;
                        break;
                }
            } else {
                q.classList.add("diffSide");
                parent.appendChild(q);
                q.querySelector("button.rs").disabled = false;
                q.querySelector("button.rp").disabled = false;
                q.querySelector("button.ff").disabled = false;
                if (core.items[d.id].discussion.status != "open") {
                    q.querySelector("button.rs").disabled = false;
                    q.querySelector("button.rp").disabled = false;
                    q.querySelector("button.ff").disabled = false;
                }
            }
        }
        //Update actual content of the thing
        for (let i in core.items[d.id].discussion) {
            let dit = q.querySelector("[data-role='" + i + "']");
            if (dit) {
                dit.value = core.items[d.id].discussion[i];
            }
        }
    });

    core.on("deleteItem", function (d) {
        let id = d.id;
        let s = d.sender;
        if (sender == me) return;
        if (core.items[d.id].discussion) {
            //if i am registered as a discussion element
            let q = this.rootdiv.querySelector("[data-'" + d.id + "']");
            if (q) q.remove();
        }
        // An item was deleted.
    });
    //For interoperability between views you may fire() and on() your own events. You may only pass one object to the fire() function; use the properties of that object for additional detail.

    //////////////////Event handlers for the rootdiv//////////////////
    this.rootdiv.addEventListener("click", function (e) {
        if (e.target.tagName.toLowerCase() == "button") {
            let itemdiv = e.target;
            while (!itemdiv.classList.contains("assertion")) itemdiv = itemdiv.parentElement;
            itemdiv = itemdiv.parentElement;
            let item = core.items[itemdiv.datset.id];
            switch (e.target.className) {
                case "rs":
                    itemdiv.querySelector("resolution").style.display = "block";
                    item.discussion.status = "conceded";
                    break;
                case "rp":
                    let it = new _item();
                    let id = core.insertItem(it);
                    it.discussion = {
                        parent: itemdiv.datset.id,
                        side: me.settings.side,
                    }
                    core.fire("create", {
                        sender: me,
                        id: id
                    });
                    core.fire("updateItem", {
                        sender: me,
                        id: id
                    });
                    break;
                case "ff":
                    itemdiv.querySelector("rejected").style.display = "block";
                    item.discussion.status = "rejected";
                    break;
                case "rw":
                    //remove this item
                    item.discussion.status = "rewritten";
                    //create a new item
                    let it = new _item();
                    let id = core.insertItem(it);
                    it.discussion = {
                        parent: item.parent,
                        side: me.settings.side,
                    }
                    core.fire("create", {
                        sender: me,
                        id: id
                    });
                    core.fire("updateItem", {
                        sender: me,
                        id: id
                    });
                    me.focus(id);
                    break;
                case "ap":
                    //create a new item
                    let it = new _item();
                    let id = core.insertItem(it);
                    it.discussion = {
                        parent: item.parent,
                        side: me.settings.side,
                    }
                    core.fire("create", {
                        sender: me,
                        id: id
                    });
                    core.fire("updateItem", {
                        sender: me,
                        id: id
                    });
                    me.focus(id);
                    break;
                case "rm":
                    //remove this item
                    item.discussion.status = "rewritten";
                    break;
            }
            core.fire("updateItem", {
                sender: me,
                id: itemdiv.dataset.id
            });
        }
    })
    this.focus = function (id) {
        if (core.items[d.id].discussion) {
            //if i am registered as a discussion element
            let q = this.rootdiv.querySelector("[data-'" + d.id + "']");
            if (q) {
                q.classList.add("focused");
                q.scrollIntoViewIfNeeded()
            };
            if (this.prevfocused){
                this.prevfocused.classList.remove("focused");
            }
            this.prevfocused=q;
        }
    }

    //////////////////Handling local changes to push to core//////////////////

    //Handle item creation, locally

    //Saving and loading
    this.toSaveData = function () {
        return this.settings;
    }

    this.fromSaveData = function (d) {
        Object.assign(this.settings, d);
        this.processSettings();
    }



    //Handle a change in settings (either from load or from the settings dialog or somewhere else)
    this.processSettings = function () {

    }

    //Create a settings dialog
    scriptassert([
        ["dialog", "genui/dialog.js"]
    ], () => {
        me.dialog = document.createElement("div");

        me.dialog.innerHTML = `
        <div class="dialog">
        </div>`;
        dialogManager.checkDialogs(me.dialog);
        //Restyle dialog to be a bit smaller
        me.dialog = me.dialog.querySelector(".dialog");
        me.innerDialog = me.dialog.querySelector(".innerDialog");
        operator.div.appendChild(me.dialog);
        let d = document.createElement("div");
        d.innerHTML = `
        WHAT YOU WANT TO PUT IN YOUR DIALOG
        `;
        me.innerDialog.appendChild(d);

        //When the dialog is closed, update the settings.
        me.dialog.querySelector(".cb").addEventListener("click", function () {
            me.updateSettings();
        })

        me.showSettings = function () {
            me.dialog.style.display = "block";
        }
    })



});