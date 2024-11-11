require.config({
    paths: {
        bootstrapCss: 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min', // Path for Tabulator CSS
    }
});

define("EmersonTest/components/dragAndDrop", ["DS/DataDragAndDrop/DataDragAndDrop", "DS/WAFData/WAFData", "EmersonTest/components/card",
    "EmersonTest/components/table", "EmersonTest/components/commonServices", "css!bootstrapCss"],
    function (DataDragAndDrop, WAFData, card, whereUsedTable, commonServices) {

        var dragAndDropComp = {
            showDroppable: function () {
                // alert("In ON load 4");

                var temp =
                    `<div class="droppableContainer" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; color: blue;">
            <img 
                src="https://thewhitechamaleon.github.io/RevisionFloat/EmersonTest/assets/images/drag-and-drop.png" 
                alt="Drag and Drop" 
                style="width: 60px; height: 60px;" 
            />
            <span style="font-size: 20px; color: black;">Drag and Drop</span>
            <div style="display: flex; align-items: center; margin-top: 20px; width: 30%;">
                <hr style="flex: 1;" />
                <span style="margin: 0 10px; color: black;">or</span>
                <hr style="flex: 1;" />
            </div>
            <div style="display: flex; align-items: center; margin-top: 20px;">
                <img 
                    src="https://thewhitechamaleon.github.io/RevisionFloat/EmersonTest/assets/images/I_WI_DataCollect108x144.png" 
                    alt="Data Collect" 
                    style="width: 60px; height: 50px; margin-right: 10px;" 
                />
                <span style="font-size: 20px; color: black;">Click here to search content</span>
            </div>
        </div>`;


                widget.body.innerHTML = temp;
                var droppableContainer = widget.body.querySelector('.droppableContainer');

                DataDragAndDrop.droppable(droppableContainer, {
                    drop: function (data) {
                        console.log("data", data)
                        droppableContainer.classList.remove("drag-over");

                        var dropedObject = JSON.parse(data);
                        dragAndDropComp.getDroppedObjectInfo(dropedObject.data.items);


                        //   var objId = dropedObject.data["items"][0].objectId;
                        //   that.objectId = objId;
                        //   PlatformAPI.publish("DropRCAID", that.objectId) //ZSIAHBH : PLMRM-9640 Refresh - Sync
                        //   that.dropCADisplayName = dropedObject.data["items"][0].displayName;
                        //   that.isBtnCAReportDisabled = false;
                        //   that.callAllMethods();
                    },
                    enter: function () {
                        console.log("Enter");
                        droppableContainer.classList.add("drag-over");
                    },
                    leave: function () {
                        console.log("leave");
                        droppableContainer.classList.remove("drag-over");
                    },
                });
            }, isCADObject: false
            , getDroppedObjectInfo: function (data) {
                if (data.length > 1) {
                    alert("Please drop only one object");
                    return;
                } else {
                    dragAndDropComp.getCSRFToken(data);
                }
            }, csrfHeaders: [

            ], dataObject: {

            }, getCSRFToken: function (data) {
                // URLs
                let csrfURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/v1/application/CSRF?tenant=OI000186152"
                let finalURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/v1/modeler/dseng/dseng:EngItem/";
                let cadSearchURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/v1/modeler/dsxcad/dsxcad:Product/search";

                WAFData.authenticatedRequest(csrfURL, {
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
                        const securityContextValue = "ctx%3A%3AVPLMProjectLeader.BU-0000001.Rosemount%20Flow";;

                        const myHeaders = new Object();
                        myHeaders[csrfToken] = csrfValue;
                        myHeaders[securityContextHeader] = securityContextValue;
                        dragAndDropComp.csrfHeaders = myHeaders;

                        finalURL += data[0].objectId;
                        finalURL += "?$mask=dsmveng:EngItemMask.Details";
                        console.log("finalURL", finalURL);
                        WAFData.authenticatedRequest(finalURL, {
                            method: "Get",
                            headers: myHeaders,
                            data: {
                            },
                            timeout: 150000,
                            type: "json",
                            onComplete: function (dataResp3, headerResp3) {
                                console.log("dataResp3", dataResp3);

                                // Check if object is CAD object

                                cadSearchURL += "?$searchStr=";
                                cadSearchURL += "\"" + data[0].displayName + "\"";
                                cadSearchURL += "&$mask=dsmvxcad:xCADProductMask.EnterpriseDetails";
                                WAFData.authenticatedRequest(cadSearchURL, {
                                    method: "Get",
                                    headers: myHeaders,
                                    data: {
                                    },
                                    timeout: 150000,
                                    type: "json",
                                    onComplete: function (dataResp4, headerResp4) {
                                        let valuesToDisplay = ["title", "description", "type", "revision", "state", "owner", "organization", "collabspace", "partNumber"];
                                        if (dataResp4.member.length > 0) {
                                            dataResp4.member[0].description = dataResp3.member[0].description;
                                            valuesToDisplay.push("cadorigin");
                                            dragAndDropComp.showDroppedObjDetails(dataResp4, valuesToDisplay);
                                            dragAndDropComp.isCADObject = true;
                                        } else {
                                            dragAndDropComp.isCADObject = false;
                                            dragAndDropComp.showDroppedObjDetails(dataResp3, valuesToDisplay);
                                        }
                                    },
                                    onFailure: function (errorResp) {

                                    }
                                });

                            }
                        });

                    }
                });
            }, showDroppedObjDetails: function (dataResp3, valuesToDisplay) {


                droppedData = dataResp3.member[0];
                var filteredData = {};
                function extractValues(obj, keys) {
                    let result = {};
                    for (let key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            if (keys.includes(key)) {
                                result[key] = obj[key];
                            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                                let nestedResult = extractValues(obj[key], keys);
                                if (Object.keys(nestedResult).length > 0) {
                                    result = { ...result, ...nestedResult };
                                }
                            }
                        }
                    }
                    return result;
                }

                filteredData = extractValues(droppedData, valuesToDisplay);
                console.log("filteredData", filteredData);

                card.showCard(filteredData);
                dragAndDropComp.dataObject = dataResp3.member[0];
                dragAndDropComp.getAllRevisions(dataResp3.member[0]);
                // dragAndDropComp.getAllWhereUsedOfRevison(dataResp3.member[0]);

                var droppableContainer = widget.body.querySelector('.card-container');

                DataDragAndDrop.droppable(droppableContainer, {
                    drop: function (data) {
                        console.log("data", data)
                        droppableContainer.classList.remove("drag-over");

                        var dropedObject = JSON.parse(data);
                        dragAndDropComp.getDroppedObjectInfo(dropedObject.data.items);

                    },
                    enter: function () {
                        console.log("Enter");
                        droppableContainer.classList.add("drag-over");
                    },
                    leave: function () {
                        console.log("leave");
                        droppableContainer.classList.remove("drag-over");
                    },
                });
            }, getAllRevisions: function (data) {

                let finalURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/v1/modeler/dslc/version/getGraph";
                let csrfURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/v1/application/CSRF?tenant=OI000186152"


                WAFData.authenticatedRequest(csrfURL, {
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
                        const securityContextValue = "ctx%3A%3AVPLMProjectLeader.BU-0000001.Rosemount%20Flow";

                        const myHeaders = new Object();
                        myHeaders[csrfToken] = csrfValue;
                        myHeaders[securityContextHeader] = securityContextValue;
                        myHeaders["Content-Type"] = "application/json";
                        dragAndDropComp.csrfHeaders = myHeaders;


                        console.log("finalURL", finalURL);

                        var bodydata = {
                            data: [
                                {
                                    id: dragAndDropComp.dataObject.id,
                                    identifier: dragAndDropComp.dataObject.id,
                                    type: dragAndDropComp.dataObject.type,
                                    source: "https://oi000186152-us1-space.3dexperience.3ds.com/enovia",
                                    relativePath: "/resources/v1/modeler/dseng/dseng:EngItem/" + dragAndDropComp.dataObject.id
                                }
                            ]
                        };

                        WAFData.authenticatedRequest(finalURL, {
                            method: "Post",
                            headers: myHeaders,
                            data: JSON.stringify(bodydata),
                            timeout: 150000,
                            type: "json",
                            onComplete: function (dataResp3, headerResp3) {
                                console.log("dataResp3", dataResp3);
                                let revisionArray = dataResp3.results[0].versions;

                                Promise.all(revisionArray.map(rev => dragAndDropComp.getAllWhereUsedOfRevison(rev)))
                                    .then(() => {
                                        // Action to be performed once all getAllWhereUsedOfRevison promises are resolved
                                        console.log("All revisions processed");
                                        // You can add any additional actions here
                                        console.log("dragAndDropComp.tableData", dragAndDropComp.tableData);
                                        whereUsedTable.showTable(dragAndDropComp.tableData);
                                        dragAndDropComp.tableData = [];
                                    })
                                    .catch(error => {
                                        console.error("Error processing revisions:", error);
                                    });



                            }
                        });

                    }
                });

            }, getAllWhereUsedOfRevison: async function (data) {

                return new Promise((resolve) => {
                    let finalURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/v1/modeler/dseng/dseng:EngItem/locate";
                    let csrfURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/v1/application/CSRF?tenant=OI000186152"


                    dragAndDropComp["Content-Type"] = "application/json";

                    if (dragAndDropComp.isCADObject) {
                        data.relativePath = data.relativePath.split("dseng").join("dsxcad").split("EngItem").join("Product");
                    }

                    var bodydata = {
                        "referencedObjects": [
                            data
                        ]
                    };

                    WAFData.authenticatedRequest(finalURL, {
                        method: "Post",
                        headers: dragAndDropComp.csrfHeaders,
                        data: JSON.stringify(bodydata),
                        timeout: 150000,
                        type: "json",
                        onComplete: function (dataResp3, headerResp3) {
                            console.log("dataResp3", dataResp3);
                            let childID = dataResp3.member[0].id;
                            let parentList = dataResp3.member[0]["dseng:EngInstance"].member;
                            if (parentList.length == 0) {
                                dragAndDropComp.tableData.push(
                                    { "childID": childID, "connectedcCildRev": data.revision })

                            }
                            Promise.all(parentList.map(parent => dragAndDropComp.getParentInfo(parent, childID, data.revision))).then(() => {
                                resolve();
                            })

                        }
                    });
                });


            }, tableData: [

            ], prepareDataForTable: function (data) {

            }, getParentInfo: function (parent, childID, connectedcCildRev) {
                dragAndDropComp.tableData.push(
                    { parentID: parent.parentObject.identifier, relativePath: parent.relativePath, "childID": childID, "connectedcCildRev": connectedcCildRev }
                )

                return new Promise((resolve) => {
                    let partInfoURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/v1/modeler/dseng/dseng:EngItem/";
                    // Get Parent infomration to be displayed in the table.
                    partInfoURL += parent.parentObject.identifier;
                    if (dragAndDropComp.isCADObject) {
                        partInfoURL += "?$mask=dsmvxcad:xCADProductMask.EnterpriseDetails";
                    } else {
                        partInfoURL += "?$mask=dsmveng:EngItemMask.Details";
                    }

                    console.log("finalURL", partInfoURL);
                    WAFData.authenticatedRequest(partInfoURL, {
                        method: "Get",
                        headers: dragAndDropComp.csrfHeaders,
                        data: {
                        },
                        timeout: 150000,
                        type: "json",
                        onComplete: function (dataRespParent, headerRespParent) {
                            let valuesToDisplay = ["id", "title", "description", "type", "revision", "state", "owner", "organization", "collabspace", "partNumber"];

                            if (dragAndDropComp.isCADObject) {
                                valuesToDisplay.push("cadorigin");
                            }

                            droppedData = dataRespParent.member[0];
                            var filteredData = {};
                            function extractValues(obj, keys) {
                                let result = {};
                                for (let key in obj) {
                                    if (obj.hasOwnProperty(key)) {
                                        if (keys.includes(key)) {
                                            result[key] = obj[key];
                                        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                                            let nestedResult = extractValues(obj[key], keys);
                                            if (Object.keys(nestedResult).length > 0) {
                                                result = { ...result, ...nestedResult };
                                            }
                                        }
                                    }
                                }
                                return result;
                            }

                            filteredData = extractValues(droppedData, valuesToDisplay);
                            console.log("filteredData", filteredData);

                            // Add filteredData to the object in dragAndDropComp.tableData where parentID matches the id in filteredData
                            dragAndDropComp.tableData.forEach(item => {
                                if (item.parentID === filteredData.id) {
                                    Object.assign(item, filteredData);
                                }
                            });
                            resolve();
                        }
                    });
                });
            }
        }
        widget.dragAndDropComp = dragAndDropComp;
        return dragAndDropComp;



    });