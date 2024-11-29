define("EmersonTest/components/commonServices", ["DS/i3DXCompassServices/i3DXCompassServices", "DS/WAFData/WAFData"], function (i3DXCompassServices, WAFData) {
    var connector3DSpace = {
        _Url3DSpace: "",
        _SecCtxLoaded: false,
        _arrSecCtxs: [],
        _widgetPref4Ctx: "ctx",
        _tenant: "",

        load3DSpaceURL: function (callback, args) {
            i3DXCompassServices.getServiceUrl({
                serviceName: "3DSpace",
                platformId: widget.getValue("x3dPlatformId"),
                onComplete: function (URLResult) {
                    if (typeof URLResult === "string") {
                        connector3DSpace._Url3DSpace = URLResult;
                        connector3DSpace._tenant = "OnPremise";
                    } else if (typeof URLResult !== "undefined") {
                        connector3DSpace._Url3DSpace = URLResult[0].url;
                        connector3DSpace._tenant = URLResult[0].platformId;
                    } else {
                        connector3DSpace._tenant = "OnPremise";
                        connector3DSpace._Url3DSpace = widget.uwaUrl.substring(0, widget.uwaUrl.lastIndexOf("/")); //Widget Folder
                        connector3DSpace._Url3DSpace = connector3DSpace._Url3DSpace.substring(0, connector3DSpace._Url3DSpace.lastIndexOf("/")); //webappsFolder
                        connector3DSpace._Url3DSpace = connector3DSpace._Url3DSpace.substring(0, connector3DSpace._Url3DSpace.lastIndexOf("/")); //3DSpace root folder
                    }
                    if (typeof callback === "function") {
                        callback.apply(connector3DSpace, args);
                    }
                },
                onFailure: function () {
                    alert("Impossible to retrieve 3DSpace Service URL. Please refresh and try again.");
                }
            });
        },

        loadSecCtx: function (callback, args) {
            if (connector3DSpace._Url3DSpace.length <= 1) {
                connector3DSpace.load3DSpaceURL(connector3DSpace.loadSecCtx, args);
            } else {
                var urlWAF = connector3DSpace._Url3DSpace + "/resources/modeler/pno/person?current=true&select=preferredcredentials&select=collabspaces";
                var dataWAF = {};
                var headerWAF = {
                    SecurityContext: ""
                };
                var methodWAF = "GET";

                WAFData.authenticatedRequest(urlWAF, {
                    method: methodWAF,
                    headers: headerWAF,
                    data: dataWAF,
                    type: "json",
                    onComplete: function (dataResp) {
                        
                        var listSC =[];
                                   var collabSpacesArray = dataResp.collabspaces;
								   var dot=" \u25CF ";
                                   for (var i = 0; i < collabSpacesArray.length; i++) {
                                                var CurrentCSJson = collabSpacesArray[i];
                                                console.log("CurrentCSJson :",CurrentCSJson);
                                                var CurrentCS = CurrentCSJson.name;
                                                var Couples = CurrentCSJson.couples;
                                                for (var j = 0; j < Couples.length; j++) {
                                                                var CurrentCoupleJson = Couples[j];
                                                                var Organization = CurrentCoupleJson.organization;
                                                                var Role = CurrentCoupleJson.role;
                                                                var CurrentOrg = Organization.name;
                                                                var CurrentRole = Role.name;
                                                                var CurrentRoleNLS = Role.nls;
                                                                listSC.push({"value":CurrentRole+"."+CurrentOrg+"."+CurrentCS,
                                                                "name":CurrentCS+dot+CurrentRoleNLS});   
                                                }
                                }
                            connector3DSpace._arrSecCtxs = listSC;
                           
                            connector3DSpace._SecCtxLoaded = true;

                            //Load widget Pref
                            var lastCtxSelected = widget.getValue("ctx");
                            var prefCtx = {
                                name: "ctx",
                                type: "list",
                                label: args.label ? args.label : "Credentials",
                                options: [],
                                defaultValue: "",
                            };
                            prefCtx.type = "list";
                            //prefCtx.onchange = "onContextChange";
                            prefCtx.options = [];

                            for (var i = 0; i < connector3DSpace._arrSecCtxs.length; i++) {
                                var arrSec = connector3DSpace._arrSecCtxs[i];
                                prefCtx.options.push({
                                    value: arrSec.value,
                                    label: arrSec.name
                                });
                            }

                            if (typeof lastCtxSelected === "undefined" || lastCtxSelected === "") {
                                prefCtx.defaultValue = prefCtx.options[0].value;
                            } else {
                                prefCtx.defaultValue = lastCtxSelected;
                            }

                            widget.addPreference(prefCtx);
                            widget.setValue("ctx", prefCtx.defaultValue); //Set the correct selected Value

                            if (typeof callback === "function") {
                                callback.apply(connector3DSpace, args);
                            }
                        

                        widget.dispatchEvent("endEdit");
                        //connector3DSpace.onContextChange(JSON.stringify(prefCtx.defaultValue));
                    },
                    onFailure: function (error) {
                        console.error("Call Faillure : " + JSON.stringify(error));
                    }
                });
            }
        },

        call3DSpace: function (options) {
            /*
             * options :
             * url
             * method
             * data
             * type
             * callbackData
             * onComplete
             * onFailure
             */

            if (connector3DSpace._Url3DSpace.length <= 1) {
                connector3DSpace.load3DSpaceURL(connector3DSpace.call3DSpace, arguments);
            } else if (!connector3DSpace._SecCtxLoaded) {
                connector3DSpace.loadSecCtx(connector3DSpace.call3DSpace, arguments);
            } else {
                var urlWAF = connector3DSpace._Url3DSpace + options.url;
                var dataWAF = options.data || {};
                var headerWAF = {
                    SecurityContext: widget.getValue(connector3DSpace._widgetPref4Ctx)
                };
                var methodWAF = options.method || "GET";
                var typeWAF = options.type || "json";

                return WAFData.authenticatedRequest(urlWAF, {
                    method: methodWAF,
                    headers: options.headers || headerWAF,
                    data: dataWAF,
					timeout:150000,
                    type: typeWAF,
                    onComplete: function (dataResp, headerResp) {
                        if (typeof options.onComplete === "function") {
                            options.onComplete(dataResp, headerResp, options.callbackData);
                        }
                    },
                    onFailure: function (error, responseDOMString, headerResp) {
                        if (typeof options.onFailure === "function") {
                            options.onFailure(error, responseDOMString, headerResp, options.callbackData);
                        }
                    }
                });
            }
        },

    };
    return connector3DSpace;
	
});
