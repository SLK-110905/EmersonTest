define("EmersonTest/scripts/Main", [
    "DS/WAFData/WAFData",
],
    function (WAFData) {
        let myWidget = {
            onLoad: function () {
                alert("widget has been Loaded");
                this.getCSRFToken();
                //alert("csrf token received"+csrfToken);
                document.getElementById("importbtn").addEventListener("click", this.uploadPart);
            },
            updateWidget: function () {t

            },
            getCSRFToken: function (data) {
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
                    onComplete: function (res, headerRes) {
                        const csrfToken = res.csrf.name;
                        const csrfValue = res.csrf.value;
                        const securityContextHeader = 'SecurityContext';
                        const securityContextValue = encodeURIComponent(widget.getValue("ctx"));
                        const myHeaders = new Object();
                        myHeaders[csrfToken] = csrfValue;
                        myHeaders[securityContextHeader] = securityContextValue;
                        console.log("csrfToken", csrfToken);
                        console.log("csrfValue", csrfValue);
                        myWidget.csrfToken = csrfValue;
                        console.log("myWidget.csrfToken", myWidget.csrfToken);
                    }
                });
            },
            uploadPart: function ()
            {
                const importType = document.getElementById("importType").value;
                const file = document.getElementById("importFile").files[0];
                if (importType === "part") {
                    console.log("Importing Part");
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            const text = e.target.result;
                            const rows = text.split("\n");
                            rows.shift();
                            let parts = [];
                            for (let line of rows) {
                                let part = line.split(',');
                                parts.push({
                                    partType: part[0],
                                    partName: part[1],
                                    PartRevision: part[2],
                                    partDescription: part[3],
                                    partUnitOFMeasure: part[4],
                                    uomType: part[5],
                                    drawingRequired: part[6],
                                    articleRequired: part[7],
                                    ongoingSpectionRequired: part[8]
                                });
                            }
                            console.log(parts);
                            document.getElementById("status").innerHTML = JSON.stringify(parts);
                        };
                        reader.readAsText(file);
                    }
                }
                if(importType === "bom"){
                    console.log("import bom");
                }
                
            }
        }
        widget.myWidget = myWidget;
        return myWidget;
    });
