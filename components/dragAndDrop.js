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
                    },
                    enter: function () {
                        console.log("Enter");
                        if (!droppableContainer.classList.contains("drag-over")) {
                            droppableContainer.classList.add("drag-over");
                        }
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

                if (data[0].objectType == "Document") {
                    finalURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/v1/modeler/documents/"
                }

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
                        if (data[0].objectType == "VPMReference") {
                            finalURL += "?$mask=dsmveng:EngItemMask.Details";
                        }

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

                                let droppedObjType = "";
                                if (dataResp3.hasOwnProperty("member")) {
                                    droppedObjType = dataResp3.member[0].type;
                                } else if (dataResp3.hasOwnProperty("data")) {
                                    droppedObjType = dataResp3.data[0].type;
                                }

                                if (droppedObjType == "Document") {


                                    let valuesToDisplayDoc = ["title", "description", "type", "revision", "state", "owner", "organization", "collabspace",];
                                    dragAndDropComp.isCADObject = false;
                                    let docData = dataResp3.data[0].dataelements;
                                    docData.owner = dataResp3.data[0].relateddata.ownerInfo[0].dataelements.firstname + " " + dataResp3.data[0].relateddata.ownerInfo[0].dataelements.lastname;
                                    dragAndDropComp.showDroppedObjDetails(docData, valuesToDisplayDoc);

                                } else {
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
                                            let valuesToDisplayItem = ["title", "description", "type", "revision", "state", "owner", "organization", "collabspace", "partNumber", "cadorigin"];
                                            if (dataResp4.member.length > 0) {
                                                dataResp4.member[0].description = dataResp3.member[0].description;
                                                // valuesToDisplayItem.push("cadorigin");
                                                dragAndDropComp.showDroppedObjDetails(dataResp4, valuesToDisplayItem);
                                                dragAndDropComp.isCADObject = true;
                                            } else {
                                                dragAndDropComp.isCADObject = false;
                                                dataResp3.member[0].cadorigin = "3DExperience";
                                                dragAndDropComp.showDroppedObjDetails(dataResp3, valuesToDisplayItem);
                                            }
                                        },
                                        onFailure: function (errorResp) {
                                            console.log("errorResp--------", errorResp);
                                        }
                                    });
                                }


                            }
                        });

                    }
                });
            }, showDroppedObjDetails: function (dataResp3, valuesToDisplay) {
                let droppedData = {};
                if (dataResp3.hasOwnProperty("member")) {
                    droppedData = dataResp3.member[0];
                } else if (dataResp3.hasOwnProperty("data")) {
                    droppedData = dataResp3.data[0];
                }

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

                dragAndDropComp.setDisplayNames(filteredData).then((updatedData) => {
                    card.showCard(updatedData)
                    //alert("card.show() Bypassed");
                });
                ;
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
                                        dragAndDropComp.setDisplayNames(dragAndDropComp.tableData).then(() => {
                                            whereUsedTable.showTable(dragAndDropComp.tableData);
                                            dragAndDropComp.tableData = [];
                                        });

                                    })
                                    .catch(error => {
                                        console.error("Error processing revisions:", error);
                                    });



                            }
                        });

                    }
                });

            }, setDisplayNames: function (rawData) {

                return new Promise((resolve) => {

                    let getPersonListInfoURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/modeler/pno/person";

                    let ownerValues = "";
                    let isArrayBeingUpdated = false;
                    if (Array.isArray(rawData)) {
                        ownerValues = rawData
                            .filter(item => item.owner !== undefined)
                            .map(item => item.owner)
                            .join(', ');
                            isArrayBeingUpdated = true;
                    } else if (typeof rawData === 'object' && rawData !== null) {
                        ownerValues = rawData.owner;
                    }


                    let pattern = "pattern=" + ownerValues;
                    // getPersonListInfoURL += "?" + pattern;
                    dragAndDropComp.getDisplayNames(getPersonListInfoURL, pattern).then((dataResp) => {
                        let jsonDataResp = JSON.parse(dataResp);

                        if (isArrayBeingUpdated) {
                            jsonDataResp.persons.forEach(person => {
                                rawData.forEach(item => {
                                    if (item.owner === person.name) {
                                        item.owner = `${person.firstname} ${person.lastname}`;
                                    }
                                });
                            });
                        } else {
                            rawData.owner = `${jsonDataResp.persons[0].firstname} ${jsonDataResp.persons[0].lastname}`;
                        }
                        // jsonDataResp.persons.forEach(person => {
                        //     dragAndDropComp.tableData.forEach(item => {
                        //         if (item.owner === person.name) {
                        //             item.owner = `${person.firstname} ${person.lastname}`;
                        //         }
                        //     });
                        // });

                    });


                    let getCollabSpaceListInfoURL = "https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/modeler/pno/collabspace";
                    let collabSpaceValues = "";
                    if (isArrayBeingUpdated) {
                        collabSpaceValues = rawData
                        .filter(item => item.collabspace !== undefined)
                        .map(item => item.collabspace)
                        .join(', ');
                    } else {
                        collabSpaceValues = rawData.collabspace;
                    }
                    let patternCollab = "pattern=" + collabSpaceValues;
                    // getCollabSpaceListInfoURL += "?" + patternCollab;
                    dragAndDropComp.getDisplayNames(getCollabSpaceListInfoURL, patternCollab).then((dataRespCollab) => {
                        let jsonDataRespCollab = JSON.parse(dataRespCollab);

                        if (isArrayBeingUpdated) {
                            jsonDataRespCollab.collabspaces.forEach(collabSpace => {
                                rawData.forEach(itemCollab => {
                                    if (itemCollab.collabspace === collabSpace.name) {
                                        itemCollab.collabspace = collabSpace.title;
                                    }
                                });
                            });
                        } else {
                            rawData.collabspace = jsonDataRespCollab.collabspaces[0].title;
                        }
                        
                        resolve(rawData);
                    });
                });
            }, getDisplayNames: function (URL, pattern) {



                // Get Owner display name
                URL += "?" + pattern;
                return new Promise((resolve) => {
                    WAFData.authenticatedRequest(URL, {
                        method: "Get",
                        headers: dragAndDropComp.csrfHeaders,
                        // data: JSON.stringify(bodydata),
                        // timeout: 150000,
                        // type: "json",
                        onComplete: function (dataResp3, headerResp3) {
                            console.log("dataResp3", dataResp3);
                            resolve(dataResp3);

                        }
                    });
                });

                // Get CollabSpace display Name


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
                            let valuesToDisplay = ["id", "title", "description", "type", "revision", "state", "owner", "organization", "collabspace", "partNumber", "cadorigin"];

                            // if (dragAndDropComp.isCADObject) {
                            //     valuesToDisplay.push("cadorigin");
                            // }

                            droppedData = dataRespParent.member[0];
                            if (!dragAndDropComp.isCADObject) {
                                droppedData.cadorigin = "3DExperience";
                            }
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
