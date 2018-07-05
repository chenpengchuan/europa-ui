// 'use strict';

// make browser tabs share user login information
(function() {
    if(!localStorage.getItem("path")) {
        if (!sessionStorage.length) {
            localStorage.setItem("path",window.location.hash);
        }
    } else {
        // alert("window.location.href = path")
        var path = localStorage.getItem("path");
        window.location.hash = path;
        localStorage.removeItem("path");
    }
    if (!sessionStorage.length) {
        // Ask other tabs for session storage
        localStorage.setItem('getSessionStorage', Date.now());
    };

    window.addEventListener('storage', function(event) {

        //console.log('storage event', event);
        // alert(  "length2:" +  sessionStorage.length);
        if (event.key == 'getSessionStorage') {
            // Some tab asked for the sessionStorage -> send it

            localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
            localStorage.removeItem('sessionStorage');

        } else if (event.key == 'sessionStorage' && !sessionStorage.length) {
            // sessionStorage is empty -> fill it

            var data = JSON.parse(event.newValue)

            for (var key in data) {
                sessionStorage.setItem(key, data[key]);
            }

            if(localStorage.getItem("path")){
                //alert("run window.location.reload");
                //window.location.reload()
            }
        }
    });

    window.onbeforeunload = function() {
        //sessionStorage.clear();
    };
})();
