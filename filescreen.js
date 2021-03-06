//V2.2.0 Filescreen: Loading screen for files


/*
TODO:
Better formatting for recent files using split.

*/

/*
Methods:
showSplash();
saveRecentDocument(id,offline=true);
*/



function _filescreen(userSettings) {
    this.settings = {
        headprompt: "Welcome!",
        onlineEnabled: true,
        onlineQueryParam: "",
        offlineEnabled: true,
        offlineQueryParam: "offline",
        documentQueryKeyword: "doc",
        tutorialEnabled: true,
        tutorialURL: "?tute",
        savePrefix: "",
    };
    Object.assign(this.settings, userSettings);
    let me = this;
    //NON-DOM-DEPENDENT INITALISATION

    //DOM-DEPENDENT INITIALIZATION
    this._init = function () {
        //inject new content
        let sstyle=document.createElement("style");
        sstyle.innerHTML=`.filescreen_recentDocDiv em{
            padding: 3px;
            font-style: normal;
            font-family: sans-serif;
            cursor: pointer;
            color: red;
        }`
        document.head.appendChild(sstyle);

        me.baseDiv = document.createElement("div");
        me.baseDiv.style.cssText = `display: none;
        position: absolute;
        top: 0;
        left: 0;
        width:100%;
        height:100%;
        background-color: rgba(0,0,0,0.5);
        z-index:100;`;
        let outerDiv;
        outerDiv = document.createElement("div");
        outerDiv.style.cssText = "display: table; position: absolute; top: 0; left: 0; height: 100%; width: 100%;";
        me.baseDiv.appendChild(outerDiv);
        let midDiv;
        midDiv = document.createElement("div");
        midDiv.style.cssText = "display: table-cell; vertical-align: middle;";
        outerDiv.appendChild(midDiv);
        let innerDiv;
        innerDiv = document.createElement("div");
        innerDiv.style.cssText = "position:relative; display: flex; flex-direction: column; margin: auto; min-height: 60vh; width: 40vw; background-color: white; border-radius: 30px; padding: 30px;";
        midDiv.appendChild(innerDiv);
        let heading;
        heading = document.createElement("h1");
        heading.innerText = me.settings.headprompt;
        innerDiv.appendChild(heading);
        //ddi of h2
        let newDocHeading = document.createElement("h2");
        newDocHeading.innerText = "Make a new document";
        innerDiv.appendChild(newDocHeading);
        me.newDocInput = document.createElement("input");
        me.newDocInput.placeholder = "Enter Name...";
        innerDiv.appendChild(me.newDocInput);
        if (me.settings.onlineEnabled) {
            me.newOnlineButton = document.createElement("button");
            me.newOnlineButton.innerText = "Make an online (shared) document";
            me.newOnlineButton.addEventListener("click", () => {
                if (me.newDocInput.value.length) {
                    let url=new URL(window.location);
                    url.search="?" + me.settings.documentQueryKeyword + "=" + me.newDocInput.value + "&" + me.settings.onlineQueryParam;
                    window.location.href = url.toString();
                }
            })
            innerDiv.appendChild(me.newOnlineButton);
        }
        if (me.settings.offlineEnabled) {
            me.newOfflineButton = document.createElement("button");
            me.newOfflineButton.innerText = "Make an offline (local) document";
            me.newOfflineButton.addEventListener("click", () => {
                if (me.newDocInput.value.length) {
                    let url=new URL(window.location);
                    url.search="?" + me.settings.documentQueryKeyword + "=" + me.newDocInput.value + "&" + me.settings.offlineQueryParam;
                    window.location.href = url.toString();
                }
            })
            innerDiv.appendChild(me.newOfflineButton);
        }
        let recentHeading = document.createElement("h2");
        recentHeading.innerText = "Open a recent document:";
        innerDiv.appendChild(recentHeading);
        me.recentDocDiv = document.createElement("div");
        me.recentDocDiv.classList.add("filescreen_recentDocDiv");
        me.recentDocDiv.innerHTML = "<p>Nothing to show here :3</p>";
        innerDiv.appendChild(me.recentDocDiv);
        if (me.settings.tutorialEnabled) {
            recentHeading = document.createElement("h2");
            recentHeading.innerText = "First time here? Check out our tutorial :)";
            innerDiv.appendChild(recentHeading);
            let newa = document.createElement("a");
            newa.innerText = "Click here!";
            newa.href = me.settings.tutorialURL;
            innerDiv.appendChild(newa);
        }
        document.body.appendChild(me.baseDiv);
    }
    if (document.readyState != "loading") this._init();
    else document.addEventListener("DOMContentLoaded", () => this._init());


    ///functions to call
    this.showSplash = function () {
        //populate recent documents
        let recents = JSON.parse(localStorage.getItem("__" + me.settings.savePrefix + "_recent_docs"));
        let newInnerHTML = "";
        if (recents) {
            for (i = 0; i < recents.length; i++) {
                newInnerHTML += `<p><a href=` + recents[i] + `>` + recents[i] + `</a><em>x</em></p>`;
            }
            me.recentDocDiv.innerHTML = newInnerHTML;
        }
        me.baseDiv.style.display = "block";
        //register delegated event handler for the em's.
        me.recentDocDiv.addEventListener("click", (e) => {
            if (e.target.tagName.toLowerCase()=="em"){
                let toRemove=e.target.parentElement.children[0].innerHTML;
                recents.splice(recents.indexOf(toRemove),1);
                localStorage.setItem("__" + me.settings.savePrefix + "_recent_docs",JSON.stringify(recents));
                e.target.parentElement.remove();
            }
        });
    }

    this.saveRecentDocument = function (id, offline = true) {
        let url = new URL(window.location);
        let query= "?" + me.settings.documentQueryKeyword + "=" + id + "&";
        if (offline) {
            query += me.settings.offlineQueryParam;
        } else {
            query += me.settings.onlineQueryParam;
        }
        let recents = JSON.parse(localStorage.getItem("__" + me.settings.savePrefix + "_recent_docs"));
        if (!recents) recents = [];
        let seenbefore = false;
        url.search=query;
        url=url.toString();
        recents.forEach((v) => {
            if (v == url) {
                seenbefore = true;
            }
        });
        if (!seenbefore) {
            recents.push(url);
            localStorage.setItem("__" + me.settings.savePrefix + "_recent_docs", JSON.stringify(recents));
        }
    }
}