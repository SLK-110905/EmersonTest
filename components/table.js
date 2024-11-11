require.config({
    paths: {
        // Define the path for Tabulator (already included in HTML via CDN)
        tabulator: 'https://unpkg.com/tabulator-tables@6.3.0/dist/js/tabulator.min',
        tabulatorCss: 'https://unpkg.com/tabulator-tables@6.3.0/dist/css/tabulator.min' // Path for Tabulator CSS
    },
    shim: {
        // Make Tabulator available globally to RequireJS
        tabulator: {
            exports: 'Tabulator'
        }
    }
});

define("EmersonTest/components/table", ["DS/DataDragAndDrop/DataDragAndDrop", "DS/WAFData/WAFData", "tabulator", "EmersonTest/components/tableToolbar", "css!EmersonTest/styles/revstyles.css", "css!tabulatorCss"], function (DataDragAndDrop, WAFData, Tabulator, tableToolbar) {

    var whereUsedTable = {
        tableData: {},
        highestRevID: "",
        showTable: function (data) {

            // Get latest revision detials
            if (data.length > 0) {
                var highestRevID = "";
                var highestRev = data.reduce((max, item) => {
                    if (item.connectedcCildRev > max.connectedcCildRev) {
                        highestRevID = item.childID;
                        console.log("highestRevID----------------",highestRevID);
                        return item;
                    }
                    return max;
                }, data[0]).connectedcCildRev;
                whereUsedTable.highestRevID = highestRevID;

                // only show that data where the parents are connected
                data = data.filter(item => item.parentID);

                // Add isLatestRevision property to each data object
                data.forEach(item => {
                    item.isLatestRevision = item.connectedcCildRev === highestRev;
                    item.toBeRevision = item.connectedcCildRev === highestRev ? "-" : highestRev;
                });
            }


            // Create Tabulator table
            var tableDiv = document.createElement('div');
            tableDiv.id = "example-table";
            widget.body.appendChild(tableDiv);

            var table = new Tabulator("#example-table", {
                data: data,
                layout: "fitColumns",
                resizableColumnGuide: true,
                selectableRows: true,
                maxHeight: "400px",
                dataTree: true,
                persistence: {
                    columns: true, //persist column layout
                },
                columnDefaults: {
                    tooltip: true,
                },
                movableColumns: true,
                selectableRowsRangeMode: "click",
                placeholder: "Item is not used in any structure",
                rowHeader: {
                    formatter: "rowSelection", titleFormatter: "rowSelection", titleFormatterParams: {
                        rowRange: "active" //only toggle the values of the active filtered rows
                    }, headerSort: false
                },
                layout: "fitData",
                columns: [
                    { title: "EIN", field: "partNumber" },
                    { title: "Title", field: "title" },
                    { title: "Description", field: "description", width: 300, resizable: true },
                    { title: "Type", field: "type" },
                    { title: "Revision", field: "revision" },
                    { title: "Connected Child Revision", field: "connectedcCildRev" },
                    { title: "Latest child connected", field: "isLatestRevision", formatter: "tickCross" },
                    { title: "To-Be child connected", field: "toBeRevision", },
                    { title: "State", field: "state" },
                    { title: "Owner", field: "owner" },
                    { title: "CAD Format", field: "cadorigin" },
                    { title: "Collabspace", field: "collabspace" }

                ],
            });
            whereUsedTable.tableData = table;
            tableToolbar.showToolbar(table);


        }, updateAllRevision: function () {
            let selectedRowsArray = widget.whereUsedTable.tableData.getSelectedRows();
            if (selectedRowsArray.length==0) {
                alert("Please select atleaset one row to update revision");
            } else {
                alert("Replacement process has been initiated");
                selectedRowsArray.forEach(selectedRow => {
                    let referenceURL = selectedRow.getData().relativePath;
                    whereUsedTable.loginWithSuperUser(referenceURL);
                });
            }
        }, loginWithSuperUser: function (referenceURL) {
            let loginGetURL = "https://oi000186152-eu1.iam.3dexperience.3ds.com/login?action=get_auth_params";
            let loginPostURL = "https://oi000186152-eu1.iam.3dexperience.3ds.com/login?";
            let csrfURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/v1/application/CSRF?tenant=OI000186152"
            let finalURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia";
           
            // WAFData.proxifiedRequest(loginGetURL, {
            //     method: "Get",
            //     headers: {
            //     },
            //     data: {
            //     },
            //     timeout: 150000,
            //     type: "json",
            //     onComplete: function (dataResp, headerResp) {

            //         let loginTicket = dataResp.lt;

            //         // call post login url 
            //         loginPostURL += "lt=" + loginTicket;
            //         loginPostURL += "username=amit.sonje1&password=Emersoncloud222@";
                    
            //         WAFData.proxifiedRequest(loginPostURL, {
            //             method: "Post",
            //             headers: {
            //                  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            //             },
            //             data: {
            //             },
            //             timeout: 150000,
            //             type: "none",
            //             onComplete: function (dataResp, headerResp) {

            //                 WAFData.proxifiedRequest(csrfURL, {
            //                     method: "Get",
            //                     headers: {

            //                     },
            //                     data: {
            //                     },
            //                     timeout: 150000,
            //                     type: "json",
            //                     onComplete: function (dataRespCSRF, headerRespCSRF) {
            //                         const csrfToken = dataRespCSRF.csrf.name;
            //                         const csrfValue = dataRespCSRF.csrf.value;
            //                         const securityContextHeader = 'SecurityContext';
            //                         const securityContextValue = "ctx%3A%3AVPLMProjectAdministrator.BU-0000001.Rosemount%20Measurement";;
            //                         const contentType = 'Content-Type';

            //                         const myHeaders2 = new Object();
            //                         myHeaders2[csrfToken] = csrfValue;
            //                         myHeaders2[securityContextHeader] = securityContextValue;
            //                         myHeaders2[contentType] = "application/json";

            //                         finalURL += referenceURL;
            //                         finalURL += "/replace";

            //                         let bodyData2 = {
            //                             "referencedObject": {
            //                               "source": "https://oi000186152-us1-space.3dexperience.3ds.com/enovia",
            //                               "type": "dseng:EngItem",
            //                               "identifier": "E9ADEAB60CA82E00671F60B6000016CC",
            //                               "relativePath": "/resources/v1/modeler/dseng/dseng:EngItem/E9ADEAB60CA82E00671F60B6000016CC"
            //                             }
            //                           };

            //                         console.log("finalURL", finalURL);
            //                         WAFData.authenticatedRequest(finalURL, {
            //                             method: "Post",
            //                             headers: myHeaders2,
            //                             data: JSON.stringify(bodyData2),
            //                             timeout: 150000,
            //                             type: "json",
            //                             onComplete: function (dataResp3, headerResp3) {
            //                                 console.log("dataResp3", dataResp3);
            //                             }, onFailure(err, errhead) {
            //                                 console.log(err);
            //                             }
            //                         });
            //                     }
            //                 });
            //             }, onFailure (err, errhead) {
            //                 console.log(err);
            //             }
            //         });
            //     }
            // });
        
            WAFData.authenticatedRequest(csrfURL, {
                method: "Get",
                headers: {

                },
                data: {
                },
                timeout: 150000,
                type: "json",
                onComplete: function (dataRespCSRF, headerRespCSRF) {
                    const csrfToken = dataRespCSRF.csrf.name;
                    const csrfValue = dataRespCSRF.csrf.value;
                    const securityContextHeader = 'SecurityContext';
                    const securityContextValue = "ctx%3A%3AVPLMProjectAdministrator.BU-0000001.Rosemount%20Measurement";;
                    const contentType = 'Content-Type';

                    let myHeaders2 = widget.dragAndDropComp.csrfHeaders;
                    myHeaders2.SecurityContext = "ctx%3A%3AVPLMProjectAdministrator.BU-0000001.Rosemount%20Measurement";

                    finalURL += referenceURL;
                    finalURL += "/replace";

                    let bodyData2 = {
                        "referencedObject": {
                          "source": "https://oi000186152-us1-space.3dexperience.3ds.com/enovia",
                          "type": "dseng:EngItem",
                          "identifier": widget.whereUsedTable.highestRevID,
                          "relativePath": "/resources/v1/modeler/dseng/dseng:EngItem/"+widget.whereUsedTable.highestRevID
                        }
                      };

                    console.log("finalURL", finalURL);
                      let tempURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/v1/modeler/dseng/dseng:EngItem/E9ADEAB60CA82E00671F60B6000016CC";
                   
                    WAFData.authenticatedRequest(finalURL, {
                        method: "Post",
                        headers: myHeaders2,
                        data: JSON.stringify(bodyData2),
                        timeout: 150000,
                        type: "json",
                        onComplete: function (dataResp3, headerResp3) {
                            console.log("dataResp3", dataResp3);
                            
                        }, onFailure(err, errhead) {
                            console.log(err);
                        }
                    });
                }
            });
        }
    };
    widget.whereUsedTable = whereUsedTable;
    return whereUsedTable;

});
