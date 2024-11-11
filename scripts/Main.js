define("EmersonTest/scripts/Main", [
    "DS/WAFData/WAFData",
],
    function (WAFData) {
        var myWidget = {
            onLoad: function () {
                alert("widget Loaded");
                this.getCSRFToken();
            },
            updateWidget: function () {
                dragAndDropComp.showDroppable();
            }, getDroppedObjectInfo: function (data) {
                if (data.length > 1) {
                    alert("Please drop only one object");
                    return;
                } else {
                    myWidget.getCSRFToken(data);
                }
            }, getCSRFToken: function (data) {
                // URLs
                let csrfURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/v1/application/CSRF?tenant=OI000186152"
                let createPartUrl = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/v1/modeler/dseng/dseng:EngItem/";

                WAFData.proxifiedRequest(csrfURL, {
                    method: "Get",
                    headers: {

                    },
                    data: {

                    },
                    timeout: 150000,
                    type: "json",
                    onComplete: function (dataResp2, headerResp2) {
                        const csrfToken = dataResp2.csrf.name;
                        const csrfValue = dataResp2.csrf.value;
                        const securityContextHeader = 'SecurityContext';
                        const securityContextValue = encodeURIComponent(widget.getValue("ctx"));
                        const myHeaders = new Object();
                        myHeaders[csrfToken] = csrfValue;
                        myHeaders[securityContextHeader] = securityContextValue;
                        console.log("csrfToken", csrfToken);
                        console.log("csrfValue", csrfValue);
                    }
                });
            }
        }
        widget.myWidget = myWidget;
        return myWidget;
    });
