//TODO: 考虑下面函数的作用域进行调整，目前在stepFormController.js也用到了
//      或者重构将之删去，目前时间来不及


function DesignerController($scope, $location, $timeout, $stateParams, Restangular, sgDialogService, hotkeys, readOnly) {
    if ($scope.$stateParams)
        $stateParams = $scope.$stateParams;

    // workaround for fixing execution details wrong default query date range
    if($scope.$parent && $scope.$parent.$parent && $scope.$parent.$parent.queryWord) {
        $scope.$parent.$parent.queryWord = "";
    }

    $scope.id = $stateParams.id;

    $scope.designer_panel_id = "disigner-panel-" + new Date().getTime()
    var searchParams = $location.search();


    $scope.flowState = {
        changed: false
    }

    var WORKFLOW = "workflow", DATAFLOW = "dataflow", STREAMFLOW = "streamflow";
    var cache = {};

    $scope.flowType = $stateParams.flowType;
    var isDataflow = function () {
        return $scope.flowType === DATAFLOW;
    }
    var isWorkflow = function () {
        return $scope.flowType === WORKFLOW;
    }
    var isStreamflow = function () {
        return $scope.flowType === STREAMFLOW;
    }

    // define a module with library id, node id, etc.
    // type is corresponding to step type which is unique in steps
    // display_id use format sourceIdNo_targetIdNo, for example 2_3
    function NodeModule(step, id, x, y, display_id) {
        this.id = id;
        this.type = step.type;
        this.$stepId = step.id; // getStepId(step.type);
        this.x = x;
        this.y = y;
        this.name = step.name + "_" + display_id;

        this.display_id = display_id;
        this.shown = false;
        this.step = step;

        var defaultData = auxo.clone(stepData.getData(this.$stepId))
        this.inputConfigurations = defaultData.inputConfigurations;
        this.outputConfigurations = defaultData.outputConfigurations;
        this.otherConfigurations = defaultData.otherConfigurations;

        if (defaultData.otherConfigurations.dataflowId$)
            auxo.fetchFlowParameters(Restangular, defaultData.otherConfigurations.dataflowId$, function (paras) {
                angular.extend(defaultData.otherConfigurations, paras);
            })
    }


    $scope.config = {
        row_step_count: 3,
    };

    $scope.stepImages = {
        "deduplication": "wfRandom_.png",
        "defake":"wfScoring_.png",
        "count":"wfBayes_.png",
        "clustering_kmeans_predict": "wfRandom_.png",
        "clustering_kmeans_train": "wfRandom_2.png",
        "classification_naivebayes_predict": "wfBayes_.png",
        "classification_naivebayes_train": "wfBayes_2.png",
        "classification_gradientboostedtrees_predict": "wfEvaluating_.png",
        "classification_gradientboostedtrees_train": "wfEvaluating_2.png",
        "regression_linearleastsquares_predict": "wfLogistic_.png",
        "regression_linearleastsquares_train": "wfLogistic_2.png",
        "classification_randomforest_predict": "wfRandom_.png",
        "classification_randomforest_train": "wfRandom_2.png",
        "classification_logisticregression_predict": "wfLogistic_.png",
        "classification_logisticregression_train": "wfLogistic_2.png",
        "frequentpattern_fpgrowth": "wfScoring_.png",
        "sample": "wfSample_.png"
    }

    var extImage = function (obj) {
        var a = {}
        for (var key in obj) {
            a["spark_" + key] = obj[key]
            a["sf_" + key] = obj[key]
        }
        angular.extend(obj, a)
    }
    extImage($scope.stepImages);

    var tempStepImages = [
        ["Naive Bayes", "wfBayes_.png"]
        , ["Evaluating", "wfEvaluating_.png"]
        , ["Logistic", "wfLogistic_.png"]
        , ["Decision Tree", "wfModel_.png"]
        , ["Random Sampling", "wfRandom_.png"]
        , ["Sample", "wfSample_.png"]
        , ["Scoring", "wfScoring_.png"]
        , ["Table", "wfTable_.png"]
    ];

    $scope.selectedNode;
    $scope.selectedConnection;

    $scope.action = {
        read: $scope.id != undefined && (readOnly || $stateParams.action == "read"),
        edit: $scope.id != undefined && $stateParams.action == "edit",
        copy: $scope.id != undefined && $stateParams.action == "copy",
        create: $scope.id != undefined && $stateParams.action == 'new'
    }
//	console.log("###########Action:" + JSON.stringify($scope.action));

    // when you bind it to the controller's scope, it will automatically unbind
    // the hotkey when the scope is destroyed (due to ng-if or something that changes the DOM)
    if (!$scope.action.read) {
        hotkeys.bindTo($scope)
            .add({
                combo: 'del',
                description: 'deleteNode',
                callback: function () {
                    $scope.deleteNode()
                }
            })
            .add({
                combo: 'alt+t',
                description: 'modify node title',
                callback: function () {
                    $scope.renameNode()
                }
            })
        setStateChangeAlert(true);
    }
    // you can chain these methods for ease of use:
    //	.add ({...});


    $scope.fetchDataflow = function (id) {
        var initDataflowData = function (dataflow) {
            $scope.data.dataflow = dataflow;
            if ($scope.flowType || $scope.flowType !== dataflow.flowType) {
                $scope.flowType = dataflow.flowType;
                initStepsData(auxo.clone(cache.steps));
            }

            //	if($location.path().indexOf('copy')>0)
            if ($scope.action.copy) {
                dataflow.name = dataflow.name + "-copy-" + auxo.getCurrentTime()

                var props = [
                    "id",
                    "creator",
                    "createTime",
                    "lastModifier",
                    "lastModifiedTime",
                    "owner",
                    "version",
                    "enabled",
                    "idPrefix",
                    "expiredPeriod"
                ];
                auxo.forEachArray(props, function (e, index) {
                    delete dataflow[e];
                })
            }

            $scope.data.dataflowBackup = auxo.clone(dataflow);
            var id = 0;
            var maxId = 0;
            var displayId = {};
            for (var i = 0; i < dataflow.steps.length; i++) {
                var node = dataflow.steps[i];
                var id = removeChars(node.id);
                node.display_id = parseInt(id);
                if (!node.name)
                    node.name = node.id;
                node.shown = false;
                node.step = searchStep(node.type);
                node.$stepId = node.step.id; // getStepId(node.type)
            }
        };

        var initStepsInputOutput = function (data) {
            for (var k = 0; k < data.content.length; k++) {
                var group = data.content[k];
                for (var j = 0; j < group.content.length; j++) {
                    var step = group.content[j];

                    step.inputIds = [];
                    step.outputIds = [];

                    if (step.inputConfigurations && step.inputConfigurations.length > 0) {
                        step.inputIds = step.inputConfigurations[0].id.replace(/.*=/, '').split(',')
                    }
                    if (step.outputConfigurations && step.outputConfigurations.length > 0) {
                        step.outputIds = step.outputConfigurations[0].id.replace(/.*=/, '').split(',')
                    }

                    if ($.isNumeric(step.inputCount))
                        step.inputCount = parseInt(step.inputCount)
                    if ($.isNumeric(step.outputCount))
                        step.outputCount = parseInt(step.outputCount)
                    if (!step.inputs) {
                        step.inputs = [];
                        if (step.inputCount == 1 || step.inputCount == "+") {
                            step.inputs.push('Left');
                        } else if (step.inputCount > 1) {
                            for (var i = 0; i < step.inputCount; i++) {
                                step.inputs.push("Left-" + (i + 1));
                            }
                        }
                    }
                    if (!step.outputs) {
                        step.outputs = [];
                        if (step.outputCount == 1 || step.outputCount == "+") {
                            step.outputs.push('Right');
                        } else if (step.outputCount > 1) {
                            for (var i = 0; i < step.outputCount; i++) {
                                step.outputs.push("Right-" + (i + 1));
                            }
                        }
                    }
                    step.inputMap = {};
                    step.outputMap = {};
                    if (step.inputIds.length > 1) {
                        auxo.array.forEach(step.inputIds, function (e, i) {
                            step.inputMap[e] = step.inputs[i];
                            step.inputMap[step.inputs[i]] = e;
                        })
                    }
                    if (step.outputIds.length > 1) {
                        auxo.array.forEach(step.outputIds, function (e, i) {
                            step.outputMap[e] = step.outputs[i];
                            step.outputMap[step.outputs[i]] = e;
                        })
                    }


                    delete step.icon;
                    if ($scope.stepImages[step.type])
                        step.icon = $scope.stepImages[step.type];
                }
            }
        }

        var initStepsData = function (data) {
            function removeNotMatched() {
                var array = [];
                auxo.treeWalk(data, function (key, value, path, parent) {
                    if (value && value.tags) {
                        var wf = value.tags.indexOf(WORKFLOW) >= 0;
                        var df = value.tags.indexOf(DATAFLOW) >= 0;
                        var st = value.tags.indexOf(STREAMFLOW) >= 0;
                        if (wf && df && st)
                            return;
                        if (value.id == "supplement" || (isWorkflow() && !wf) || (isDataflow() && !df) || (isStreamflow() && !st)) {
                            array.push([value, parent]);
                            return "continue";
                        }
                    }
                });

                for (var i = 0; i < array.length; i++) {
                    var index = array[i][1].indexOf(array[i][0]);
                    array[i][1].splice(index, 1);
                }

                for (var i = data.content.length - 1; i >= 0; i--) {
                    var group = data.content[i];
                    if (group.content.length == 0)
                        data.content.splice(i, 1);
                }
            }

            removeNotMatched();

            //console.log("steps: " + JSON.stringify(data, null, " "))

            $scope.data.stepsInfo = data;
            //var id = 0;

            /*
            var tempGroup = {group:'algorithms', count:tempStepImages.length, content:[]};
            auxo.forEachArray(tempStepImages, function (e, index) {
                var type = e[0].replace(/ /,'_')
                var step = {
                    "id" : type,
                    "name" : e[0],
                    "type" : type,
                    "tags" : [ "algorithms" ],
                    "description" : null,
                    "implementation" : null,
                    "libs" : null,
                    "group" : "algorithms",
                    "icon" : e[1],
                    "inputCount" : 1,
                    "outputCount" : 1,
                    "draggable": false,
                    "inputConfigurations" : [ {
                        "id" : "string?options=input",
                        "fields" : "fields"
                    } ],
                    "outputConfigurations" : [ {
                        "id" : "string?options=output",
                        "fields" : "fields"
                    } ],
                    "otherConfigurations" : {
                        "condition" : "conditionExpression"
                    },
                }
                tempGroup.content.push(step);
            })

            data.content.push (tempGroup);
            */
        };

        var loadDataflow = function (id) {
            if (!$scope.action.create && id) {
                var args = "";
                if (searchParams.version) {
                    Restangular.one("flows", "history").customGET(id + "/" + searchParams.version, {latestName: true})
                        .then(function (facetResult) {
                            if(facetResult) {
                                initDataflowData(facetResult);
                            }
                        })
                } else {
                    Restangular.one("flows").customGET(id, args)
                        .then(function (facetResult) {
                            if(facetResult) {
                                initDataflowData(facetResult);
                            }
                        })
                }
            }
        }

        if (!cache.steps && !$scope.data.stepsInfo) {
            Restangular.one("steps/gquery").get()
                .then(function (facetResult) {
                    // filter zebra data quality specific step group 'Analysis'
                    if(facetResult.content) {
                        facetResult.content = facetResult.content.filter(function(el, idx, array) {
                            return el.group && el.group != 'Analysis';
                        });
                    }

                    cache.steps = facetResult;
                    initStepsInputOutput(cache.steps);
                    initStepsData(auxo.clone(facetResult));
                    loadDataflow(id);
                })
        } else
            loadDataflow(id);
    }

    // to save data
    $scope.data = {
        dataflow: {
            steps: [],
            flowType: $scope.flowType,
            parameters: [],
            links: []
        },
        stepsInfo: null
    };

    // this is intended to check if links need be added.
    var dataflowLinksLoaded = false;

    var searchStep = function (stepType) {
        //var stepId  = getStepId(stepType)
        for (var i = 0; i < cache.steps.content.length; i++) {
            var group = cache.steps.content[i];
            for (var j = 0; j < group.content.length; j++) {
                var step = group.content[j];
                if (step.id === stepType || step.id === (isDataflow() ? "spark_" : "sf_") + stepType)
                    return step;
            }
        }
    };

    $scope.redraw = function (refresh) {
        if (refresh == "refresh" && $scope.flowState.changed) {
            sgDialogService.confirm(auxo.buildErrorMsg("当前的修改会被重置，确定要继续吗?", "question"), function (result) {
                if (result) {
                    fresh();
                }
            }, "确认")
        } else {
            fresh()
        }

        function fresh() {
            $scope.flowState.changed = false;
            if ($scope.jplumbInstance) {
                $scope.jplumbInstance.detachEveryConnection();
                $scope.jplumbInstance.deleteEveryEndpoint();
            }
            $scope.data.dataflow.steps = [];
            //$scope.data.dataflow.nodesInfo = [];
            dataflowLinksLoaded = false;

            $scope.fetchDataflow($scope.id);

            if ($scope.data.dataflow.id == undefined) {
                Restangular.one("europa/process/" + $scope.id).get().then(function (process) {
                    if (process) {
                        var processCopy = auxo.clone(process);
                        $scope.data.dataflow.name = processCopy.attributes.flowName;
                        $scope.data.dataflow.flowType = processCopy.attributes.flowType;
                        $scope.data.dataflow.sharedUsers = processCopy.sharedUsers;
                    }
                }, function (errmsg) {
                    auxo.showErrorMsg(errmsg);
                });

            }
        }
    };

    $scope.repaint = function () {
        // todo
    };

    $scope.loadDataflowNodes = function () {
        if ($scope.data.dataflow && $scope.data.dataflow.steps) {
            for (var i = 0; i < $scope.data.dataflow.steps.length; i++) {
                var node = $scope.data.dataflow.steps[i];
                var step = searchStep(node.type);
                $scope.addModuleToNode(step.type, node.x, node.y);
            }
        }
    };

    var buildNodeId = function (step, display_id) {
        var node_id = ""
        node_id = step.type + "_" + display_id;
        return node_id
    }

    // add a module to the node
    $scope.addModuleToNode = function (stepType, posX, posY) {
        //console.log("Add module " + type + " to node, at position " + posX + "," + posY);
        //var type = "Unknown";
        //var imgPath = "Likewise unknown";
        var step = searchStep(stepType);

        var node_id = 0;

        var display_id = 0;
        for (var i = 0; i < $scope.data.dataflow.steps.length; i++) {
            var node = $scope.data.dataflow.steps[i];
            if (node.step.type == stepType && node.display_id >= display_id)
                display_id = node.display_id + 1;
        }

        node_id = buildNodeId(step, display_id)

        var m = new NodeModule(step, node_id, posX, posY, display_id);
        $scope.data.dataflow.steps.push(m);
        $scope.flowState.changed = true;
        return m;
    };

    $scope.getNodeEndpointIds = function (node_id, isSource) {
        var node = searchNode(node_id);
        var step = searchStep(node.type);

        var anchors = step.inputs;
        if (isSource)
            anchors = step.outputs;

        var ids = [];
        for (var i = 0; i < anchors.length; i++) {
            var uuid = node_id + anchors[i];
            ids.push(uuid);
        }
        return ids;
    };

    $scope.getNodeEndpointAll = function (node_id) {
        var ids1 = $scope.getNodeEndpointIds(node_id, true);
        var ids2 = $scope.getNodeEndpointIds(node_id, false);

        for (var i = 0; i < ids2.length; i++) {
            ids1.push(ids2[i]);
        }
        return ids1;
    };

    $scope.removeNodeEndpoints = function (node_id) {
        var ids = $scope.getNodeEndpointAll(node_id);
        for (var i = 0; i < ids.length; i++) {
            $scope.jplumbInstance.deleteEndpoint(ids[i]);
        }
    };

    $scope.removeState = function (node_id) {
        console.log("Remove state " + node_id + " in array of length " + $scope.data.dataflow.steps.length);
        for (var i = 0; i < $scope.data.dataflow.steps.length; i++) {
            // compare in non-strict manner
            if ($scope.data.dataflow.steps[i].id == node_id) {
                //console.log("Remove state at position " + i);
                //	$scope.removeNodeEndpoints(node_id);

                $scope.jplumbInstance.remove("plumb-item-" + node_id);
                $scope.data.dataflow.steps.splice(i, 1);
                stepData.removeInput($scope.data.dataflow, node_id);
                //$scope.data.dataflow.nodesInfo.splice(i, 1);
            }
        }
    };

    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        //you also get the actual event object
        //do stuff, execute functions -- whatever...
        console.log("ngRepeatFinished rhinosrhinosrhinosrhinosx");

        if ($scope.data.dataflow.steps.length < 1)
            return;

        if ($scope.data.dataflow.steps.length > 0) {
            for (var i = 0; i < $scope.data.dataflow.steps.length; i++) {
                if (!$scope.data.dataflow.steps[i].shown) {
                    addEndpointsByNode($scope.data.dataflow.steps[i].id);
                    $scope.data.dataflow.steps[i].shown = true;
                }
            }
        }

        $scope.loadDataflowLinks();
    });

    var buildEndpointUUID = function (nodeType, nodeId, outputOrInput, anchor) {
        var uuid = nodeType + "-" + nodeId + "-" + outputOrInput + "-" + anchor
        return uuid
    }

    $scope.loadDataflowLinks = function () {
        if (dataflowLinksLoaded)
            return;
        // only load once
        if ($scope.data.dataflow && $scope.data.dataflow.links) {
            var loadedPoints = ";";
            for (var i = 0; i < $scope.data.dataflow.links.length; i++) {
                var link = $scope.data.dataflow.links[i];
                var fromNode = searchNode(link.source);
                var stepFrom = searchStep(fromNode.type);
                var sourceUUID = "Unknown";
                var anchor = "";
                anchor = stepFrom.outputMap[link.sourceOutput];
                for (var j = 0; j < stepFrom.outputs.length; j++) {
                    if (!anchor)
                        anchor = stepFrom.outputs[j];
                    sourceUUID = buildEndpointUUID(fromNode.type, fromNode.id, "output", anchor)
                    if (loadedPoints.indexOf(sourceUUID) < 0) {
                        loadedPoints += sourceUUID + ";";
                        break;
                    }
                }

                var targetNode = searchNode(link.target);
                var stepTarget = searchStep(targetNode.type);
                var targetUUID = "Unknown";
                var targetInput = "";
                var inputs = ["left", "right", "input1", "input2"];
                if (link.targetInput && inputs.indexOf(link.targetInput) >= 0)
                    targetInput = link.targetInput;
                for (var j = 0; j < stepTarget.inputs.length; j++) {
                    var anchor = stepTarget.inputs[j];
                    if (targetInput) {
                        if (stepTarget.inputMap[targetInput] !== anchor)
                            continue;
                    }

                    targetUUID = buildEndpointUUID(targetNode.type, targetNode.id, "input", anchor)
                    if (loadedPoints.indexOf(targetUUID) < 0) {
                        loadedPoints += targetUUID + ";";
                        break;
                    }
                }
                console.log("sourceUUID:  " + sourceUUID + " targetUUID: " + targetUUID);
                $scope.jplumbInstance.connect({uuids: [sourceUUID, targetUUID], editable: true});
            }
        }
        dataflowLinksLoaded = true;

        if ($scope.action.read) {
            // it seems that this code doesn't work always, maybe need to setTimeout to ensure that all view has been updated
            $scope.jplumbInstance.setDraggable($(".jsplumb-endpoint"), false)
        }
    }

    $scope.onMenuBarClick = function () {
        if ($(".designer-side").is(":visible")) {
            $(".designer-side").hide();
            $(".designer-container").css("right", 0);
            $(".btn-fold").removeClass("icon-arrow-right").addClass("icon-arrow-left");
        } else {
            $(".designer-side").show();
            $(".designer-container").css("right", 182);
            $(".btn-fold").removeClass("icon-arrow-left").addClass("icon-arrow-right");
        }
        ;
    };

    $scope.addEndpoints = function (node, outputAnchors, inputAnchors) {

        var toId = node.id, nodeType = node.type;

        var convert = function (anchors) {
            var offset = [0];
            if (anchors.length == 2)
                offset = [-15, 15];
            else if (anchors.length == 3)
                offset = [-20, 0, 20];
            else if (anchors.length == 4)
                offset = [-20, -8, 8, 20];

            auxo.forEachArray(offset, function (e, i) {
                offset[i] = offset[i] - 17
            })
            var results = [];
            for (var i = 0; i < anchors.length; i++) {
                if (anchors[i].indexOf("Left") >= 0) {
                    results.push([0, 0.5, -1, 0, -8, offset[i]]);
                } else if (anchors[i].indexOf("Right") >= 0) {
                    results.push([1, 0.5, 1, 0, 8, offset[i]]);
                } else {
                    //TODO
                }
            }
            return results;
        }

        var outputs = convert(outputAnchors);
        for (var i = 0; i < outputAnchors.length; i++) {
            var sourceUUID = buildEndpointUUID(nodeType, toId, "output", outputAnchors[i])
            console.log("sourceUUID " + sourceUUID);

            var endpoint = auxo.clone($scope.sourceEndpoint);
            endpoint.maxConnections = -1;

            if (node.step.outputMap[outputAnchors[i]]) {
                var overlays = buildEndpointLabel2(node.step, node.step.outputMap[outputAnchors[i]], false)
                if (overlays)
                    endpoint.overlays.push(overlays)
            }
            // var anchor = outputAnchors[i].replace(/-.*/g, "");
            $scope.jplumbInstance.addEndpoint("plumb-item-" + toId, endpoint, {
                "anchor": outputs[i],
                uuid: sourceUUID
            });
        }
        var inputs = convert(inputAnchors);
        for (var j = 0; j < inputAnchors.length; j++) {
            //var targetUUID =  nodeType + "-" + toId + "-input-" + inputAnchors[j];
            var targetUUID = buildEndpointUUID(nodeType, toId, "input", inputAnchors[j])
            console.log("targetUUID " + targetUUID);
            // var anchor = inputAnchors[j].replace(/-.*/g, "");

            var endpoint = auxo.clone($scope.targetEndpoint);
            if (!auxo.isStepType(node.type, "union") && !auxo.isStepType(node.type, 'starjoin') && !auxo.isStepType(node.type, 'intersect'))
                endpoint.maxConnections = 1;
            if (isWorkflow())
                endpoint.maxConnections = -1;

            if (node.step.inputMap[inputAnchors[j]]) {
                var overlays = buildEndpointLabel2(node.step, node.step.inputMap[inputAnchors[j]], true)
                if (overlays)
                    endpoint.overlays.push(overlays)
            }

            $scope.jplumbInstance.addEndpoint("plumb-item-" + toId, endpoint, {
                "anchor": inputs[j],
                uuid: targetUUID
            });
        }
    };


    var searchNode = function (node_id) {
        for (var j = 0; j < $scope.data.dataflow.steps.length; j++) {
            if ($scope.data.dataflow.steps[j].id == node_id)
                return $scope.data.dataflow.steps[j];
        }
    };

    var addEndpointsByNode = function (node_id) {
        var node = searchNode(node_id);
        var step = searchStep(node.type);
        $scope.addEndpoints(node, step.outputs, step.inputs);
    };

    var removeChars = function (text) {
        return text.replace(/[^\d]/g, "")
    }

    function setInput(connection, source, target) {
        var inputOption;
        var outputOption;
        var ep = connection.endpoints[1];
        auxo.array.forEach(target.step.inputs, function (e, i) {
            if (ep._jsPlumb.uuid.indexOf(e) > 0) {
                inputOption = target.step.inputMap[e];
            }
        })
        ep = connection.endpoints[0];
        auxo.array.forEach(source.step.outputs, function (e, i) {
            if (ep._jsPlumb.uuid.indexOf(e) > 0) {
                outputOption = source.step.outputMap[e];
            }
        })


        var fields;
        if (outputOption) {
            auxo.forEachArray(source.outputConfigurations, function (e, i) {
                if (e.id === outputOption) {
                    fields = auxo.clone(e.fields);
                    return false;
                }
            })
        }
        if (!fields)
            fields = source.outputConfigurations[0].fields; // this is a default

        if (angular.isArray(fields))
            fields = auxo.clone(fields);
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (field.alias && field.alias.length > 0) {
                field.column = field.alias;
                delete field.alias;
            }
        }

        var node_id = buildNodeId(source, source.display_id)
        stepData.setInput(target, source.id, fields,
            inputOption, outputOption, source);
    }

    function setInputForWorkflow(connection, source, target) {
        stepData.setInputForWorkflow(target, source)
    }

    var initConnection = function (connection) {
        console.log("connection sourceId: " + connection.sourceId + "  targetId: " + connection.targetId);
        var source = searchNode(connection.sourceId.substring(11));
        var target = searchNode(connection.targetId.substring(11));
        console.log("source.id: " + source.id + "  target.id: " + target.id);

        if (!isWorkflow())
            setInput(connection, source, target);
        //else
        //setInputForWorkflow(connection, source, target)

        var label = "";
        if (source.id.indexOf(source.type))
            label += removeChars(source.id)
        else
            label += source.display_id;
        label += "-";
        if (target.id.indexOf(target.type))
            label += removeChars(target.id)
        else
            label += target.display_id;

        // uncomment this if showing label
        //connection.getOverlay("label").setLabel(label);

        //connection.getOverlay("label").setLabel(source.display_id + "-" + target.display_id);
    };


    $scope.synchronizeLinks = function () {
        var connections = $scope.jplumbInstance.getAllConnections();

        var getInput = function (target, sourceId) {
            var input;
            if (target.inputConfigurations) {
                if (target.inputConfigurations.length == 1)
                    input = target.inputConfigurations[0];
                else
                    for (var k = 0; k < target.inputConfigurations.length; k++) {
                        if (target.inputConfigurations[k].$source == sourceId) {
                            input = target.inputConfigurations[k];
                            break;
                        }
                    }
            }
            return input;
        }

        var links = [];
        for (var i = 0; i < connections.length; i++) {
            var connection = connections[i];
            var sourceId = connection.sourceId.substring(11);
            var targetId = connection.targetId.substring(11);
            var source = searchNode(connection.sourceId.substring(11));
            var target = searchNode(connection.targetId.substring(11));


            var link = {source: sourceId, target: targetId}

            var input = getInput(target, sourceId);

            if (input && input.id)
                link.targetInput = input.id;

            if (input && input.$outputOption)
                link.sourceOutput = input.$outputOption;

            links.push(link);
        }
        $scope.data.dataflow.links = links;
    }

    $scope.getConnectionNodes = function (nodeId, output) {
        var connections = $scope.jplumbInstance.getAllConnections();

        var nodes = [];
        for (var i = 0; i < connections.length; i++) {
            var connection = connections[i];

            var shortId = $scope.getShortNodeId(output ? connection.sourceId : connection.targetId)
            if (shortId == nodeId)
                nodes.push(shortId)
        }
        return nodes;
    }

    $scope.getShortNodeId = function (nodeId) {
        return nodeId.replace(/plumb-item-/, '');
    }

    $scope.getUINodeId = function (nodeId) {
        if (nodeId.indexOf('plumb-item-') < 0)
            return 'plumb-item-' + nodeId;
        return nodeId;
    }

    $scope.selectNode = function (node_id) {

        if ($scope.selectedConnection) {
            $scope.selectedConnection.toggleType("basic");
            $scope.selectedConnection = undefined;
        }

        $scope.selectedNode = node_id;
    };

    var selectConnection = function (connection) {

        if ($scope.selectedNode) {
            $scope.$apply(function () {
                $scope.selectedNode = undefined;
            })
        }

        if ($scope.selectedConnection == connection)
            return;

        if ($scope.selectedConnection) {
            $scope.selectedConnection.toggleType("basic");
            $scope.$apply(function () {
                $scope.selectedConnection = undefined;
            })
        }

        if (connection) {
            $scope.$apply(function () {
                $scope.selectedConnection = connection;
            })
            $scope.selectedConnection.toggleType("basic");
        }
    }

    $scope.deleteNode = function () {
        if ($scope.editingNode)
            return;

        if ($scope.selectedNode) {
            sgDialogService.confirm(auxo.buildErrorMsg("确定要删除节点 " + $scope.selectedNode + " 吗？", "question"), function (result) {
                if (result) {
                    $scope.removeState($scope.selectedNode);
                    $scope.selectedNode = undefined;
                    $scope.flowState.changed = true;
                }
            }, "确认")
        } else if ($scope.selectedConnection) {
            sgDialogService.confirm(auxo.buildErrorMsg("确定要删除选中的连接吗？", "question"), function (result) {
                if (result) {
                    var sourceId = $scope.selectedConnection.sourceId;
                    var targetId = $scope.selectedConnection.targetId;
                    $scope.jplumbInstance.detach($scope.selectedConnection, {fireEvent: true});
                    //onLinkChanged(sourceId, targetId);
                    $scope.selectedConnection = undefined;
                    $scope.flowState.changed = true;
                }
            }, "确认")
        }
    };

    $scope.renameNode = function () {
        if ($scope.editingNode)
            return;

        if ($scope.selectedNode) {
            var node = searchNode($scope.selectedNode)
            auxo.openInputDialog("输入Node的名称",
                node.name ? node.name : node.id,
                function (newValue) {
                    if (newValue) {
                        node.name = newValue;
                        $scope.flowState.changed = true;
                    }
                },
                sgDialogService,
                300
            )
        }
    }

    function isDataflowChanged() {
        return $scope.flowState.changed;

        /*
        var dataflow = $scope.data.dataflow;

        if(dataflow.id) {
            var dataflowCopy = auxo.clone(dataflow);
            cleanupDataflow (dataflowCopy)
            var rawDataflow = $scope.data.dataflowBackup;
            //console.log("flow1: " + JSON.stringify(rawDataflow,null, 4))
            //console.log("flow2: " + JSON.stringify(dataflowCopy,null, 4))
            var equal = angular.equals(rawDataflow, dataflowCopy)
            return !equal;
        } else {
            if(dataflow.steps && dataflow.steps.length>0)
                return true;
        }

        return false;
        */
    }

    function cleanupDataflow(dataflow) {
        auxo.treeWalk(dataflow, function (key, value, path, parent, parentKey) {
            if (value && parentKey === 'steps') {
                delete value.step;
                delete value.display_id;
                delete value.shown;
            }

            if (key && parent && key[0] == '$')
                delete parent[key]
        })

        if (!Array.isArray(dataflow.parameters)) {
            dataflow.parameters = null;
        }
    }

    $scope.refreshNodesXY = function () {
        var dataflow = $scope.data.dataflow;

        var minX = 0;
        var minY = 0;
        for (var i = 0; i < dataflow.steps.length; i++) {
            var node = dataflow.steps[i];
            node.x = parseInt($("#plumb-item-" + node.id).css("left").replace(/px/, ""), 10);
            node.y = parseInt($("#plumb-item-" + node.id).css("top").replace(/px/, ""), 10);
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
        }
    }

    $scope.isSaveDisabled = function () {
        return !$scope.data.dataflow || !$scope.data.dataflow.steps || $scope.data.dataflow.steps.length < 1;
    }

    $scope.loadFlow = function (id, version) {
        if (id) {
            if (readOnly) {
                auxo.loadPage('/design/process/' + id + '/design/read/' + $scope.flowType, {version: version}, $scope);
            } else {
                auxo.loadPage('/design/process/' + id + '/design/edit/' + $scope.flowType, {version: version}, $scope);
            }
        }

    }

    $scope.goBack = function () {
        var curScope = $scope;
        if (isDataflowChanged()) {
            sgDialogService.confirm(auxo.buildErrorMsg("当前的修改会丢失，确定要返回吗?", "question"), function (result) {
                if (result) {
                    setStateChangeAlert();
                    if(curScope.$parent && curScope.$parent.$parent && curScope.$parent.$parent.selectedNode) {
                        curScope.$parent.$parent.onSelected(curScope.$parent.$parent.selectedNode);
                    } else {
                        auxo.loadPage("/design/process");
                    }
                }
            }, "确认")
        } else {
            setStateChangeAlert();
            if(curScope.$parent && curScope.$parent.$parent && curScope.$parent.$parent.selectedNode) {
                curScope.$parent.$parent.onSelected(curScope.$parent.$parent.selectedNode);
            } else {
                auxo.loadPage("/design/process");
            }
        }
    }

    $scope.saveDataflow = function (callback, reDataFlow) {
        if($scope.isSaveDisabled()) {
            return;
        }

        //$scope.synchronizeLinks();
        var dataflow = $scope.data.dataflow;
        if (!dataflow.name)
            dataflow.name = "Dataflow-" + auxo.getCurrentTime();

        console.log("Saving dataflow!");

        var dataflowCopy = auxo.clone(dataflow);
        cleanupDataflow(dataflowCopy)

        dataflowCopy.source = "rhinos";
        //auxo.alert(sgDialogService, dataflowCopy, 'dataflow')
        //alert("dataflow: " + JSON.stringify(dataflowCopy, null, " "))
        console.log("Saving dataflow: " + JSON.stringify(dataflowCopy, null, " "))
        if (dataflow.id) {
            var remoteItem = Restangular.copy(dataflowCopy);
            remoteItem.route = "flows";
            if (remoteItem.oid && remoteItem.oid !== "$null")
                remoteItem.id = remoteItem.oid;

            // now you can put on remoteItem
            remoteItem.put().then(function (facetResult) {
                $scope.flowState.changed = false;
                if (callback) {
                    callback();
                }
                else {
                    sgDialogService.alert("保存成功！", "提示");
                }
                auxo.loadPage("", {version: facetResult.version})
                //auxo.loadPage('/designer/dataflow/' + facetResult.id + '/edit/' + $scope.flowType);
            }, function (error) {
                sgDialogService.alert(auxo.getResponseErrorMsg(error), "错误");
            });
        }
        else {
            Restangular.one("europa/process/" + $scope.id).get().then(function (process) {
                var processCopy = auxo.clone(process);
                var remoteItem = Restangular.copy(processCopy);
                dataflowCopy.id = $scope.id;
                Restangular.all("flows").post(dataflowCopy)
                    .then(function (facetResult) {
                        $scope.flowState.changed = false;

                        if ($scope.action.create) {
                            $scope.action.create = false;
                            $scope.action.edit = true;
                        }
                        $scope.data.dataflow.id = $scope.id;

                        $scope.data.dataflowBackup = auxo.clone(dataflowCopy);

                        remoteItem.route = "europa/process";
                        remoteItem.flowType = dataflowCopy.flowType;
                        remoteItem.attributes = {
                            'flowId': dataflowCopy.id, 'flowType': dataflowCopy.flowType,
                            'flowName': dataflowCopy.name, 'shareUsers': dataflowCopy.sharedUsers
                        };
                        remoteItem.put().then(function (result) {
                            // it is supposed that when a new flow is saved, it should return to the default flow, so clear up the search
                            //delete auxo.$rootScope.searchParams;
                            if (callback) {
                                callback();
                            }
                            else {
                                sgDialogService.alert("保存成功！", "提示");
                                //setStateChangeAlert();
                                //auxo.loadPage("", {version:facetResult.version });
                            }
                            auxo.loadPage('/design/process/' + facetResult.id + '/design/edit/' + $scope.flowType, {version: facetResult.version});
                        }, function (errmsg) {
                            auxo.showErrorMsg(errmsg)
                        });
                    }, function (error) {
                        sgDialogService.alert(auxo.getResponseErrorMsg(error), "错误");
                    })
            }, function (errmsg) {
                auxo.showErrorMsg(errmsg);
            });
        }
    }

    function setStateChangeAlert(add) {
        if (add)
            $stateParams.stateChangeAlert = function () {
                return isDataflowChanged();
            }
        else
            delete $stateParams.stateChangeAlert
    }

    $scope.submitDataflow = function () {
        if($scope.isSaveDisabled()) {
            return;
        }
        var saveScheduleData = function (scheduleData) {
            var data = {
                "configurations": {"startTime": 1464405562406},
                "schedulerId": "once",
                "name": "test AAA",
                "flowId": "fsh-001"
            };
            data.configurations.arguments = scheduleData.arguments || [];
            data.configurations.properties = scheduleData.properties || [];
            if (auxo.isIE()){
                var date = scheduleData.startDate.toString().replace(/-/g, "/");//兼容IE
                data.configurations.startTime = new Date(date).getTime();
            } else {
                data.configurations.startTime = new Date(scheduleData.startDate).getTime();
            }
            if (scheduleData.endDate)
                data.configurations.endTime = new Date(scheduleData.endDate).getTime();
            data.schedulerId = scheduleData.type;
            if (scheduleData.cronExpression) {
                data.configurations.cronType = "simple";
                data.configurations.cron = scheduleData.cronExpression;
            }
            data.flowId = $scope.data.dataflow.id;
            data.flowName = $scope.data.dataflow.name;
            data.flowType = $scope.data.dataflow.flowType;
            data.name = scheduleData.name;
            data.source = "rhinos";

            console.log("提交scheduler " + JSON.stringify(data));

            Restangular.all("schedulers").post(data)
                .then(function (facetResult) {
                    console.log("return: " + JSON.stringify(facetResult))
                    //$location.path('/dataflow')
                    sgDialogService.alert("提交成功！", "提示");
                    $location.path('/design/process/' + data.flowId + '/design/edit/' + $scope.flowType);
                }, function (error) {
                    sgDialogService.alert("错误信息：" + error.err, "错误");
                    $location.path('/design/process/' + data.flowId + '/design/edit/' + $scope.flowType);
                })
        }

        var openModal = function () {
            sgDialogService.openModal({
                templateUrl: 'app/scheduler/Scheduler_form.html',
                controller: 'SchedulerFormController', // specify controller for modal
                data: {
                    fromParent: {
                        scheduleData: {name: $scope.data.dataflow.name + "-" + auxo.getCurrentTime()},
                        dataflow: $scope.data.dataflow
                    }
                },
                callback: function (scheduleData) {
                    saveScheduleData(scheduleData);
                },
                width: 800
            });
        };

        if ($scope.flowState.changed) {
            auxo.sgDialogService.confirm(auxo.buildErrorMsg("当前流程还没有保存,系统会自动保存, 要继续吗?", "question"), function (result) {
                if (result) {
                    $scope.saveDataflow(openModal);
                }
            }, "确认");

            //auxo.showWarnigAlert("当前流程已发生改变,请先保存或者刷新,再提交!","提示");
        }
        else {
            function checkHistory() {
                var version = $scope.data.dataflow.version;

                var maxV = getMaxFlowVersion();
                if (maxV && maxV > version) {
                    auxo.sgDialogService.confirm(auxo.buildErrorMsg("该流程为一历史版本,暂不支持提交! 要对最新版本提交请按确定!", "question"), function (result) {
                        if (result) {
                            openModal();
                        }
                    }, "确认");
                } else
                    openModal();
            }

            $scope.refreshVersionList(checkHistory);
        }
    };

    function getMaxFlowVersion() {
        if ($scope.flowVersions) {
            var max = -1;
            auxo.array.forEach($scope.flowVersions, function (e) {
                max = Math.max(max, e.version);
            })
            return max;
        }
    }

    function getTypeForAnchorLabelMap(type) {
        var t = type;
        if (!anchorLabelMap[t]) {
            t = t.replace("spark_", '');
            if (!anchorLabelMap[t])
                t = t.replace("sf_", '');
            if (!anchorLabelMap[t]) {
                if (anchorLabelMap["spark_" + t])
                    t = "spark_" + t;
                else if (anchorLabelMap["sf_" + t])
                    t = "sf_" + t;
            }
        }
        return t;
    }

    function buildEndpointLabel2(step, label, isInput) {
        if (isInput && step.inputMap[label]) {
            var i = step.inputIds.indexOf(label);
            var pos = i === 0 ? [-1.2, -0.5] : [-1.2, 1.5];
            return ["Label", {location: pos, label: label, cssClass: "endpointTargetLabel"}]
        } else if (!isInput && step.outputMap[label]) {
            var i = step.outputIds.indexOf(label);
            var pos = i === 0 ? [1.2, -0.5] : [1.2, 1.5];
            return ["Label", {location: pos, label: label, cssClass: "endpointTargetLabel"}]
        }
    }


    $scope.init = function () {
        jsPlumb.bind("ready", function () {
            var instance = jsPlumb.getInstance({
                // default drag options
                DragOptions: {cursor: 'pointer', zIndex: 2000},
                // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
                // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
                ConnectionOverlays: [
                    ["Arrow", {location: 1}],
                    /*
                    ["Label", {
                        location: 0.4,
                        id: "label",
                        cssClass: "aLabel"
                    }]*/
                ],
                Container: "node-container"
                //Container: $scope.designer_panel_id
            });

            var basicType = {
                connector: "StateMachine",
                paintStyle: {strokeStyle: "red", lineWidth: 4},
                hoverPaintStyle: {strokeStyle: "blue"},
                overlays: [
                    "Arrow"
                ]
            };
            instance.registerConnectionType("basic", basicType);

            // this is the paint style for the connecting lines..
            var connectorPaintStyle = {
                    lineWidth: 4,
                    strokeStyle: "#61B7CF",
                    joinstyle: "round",
                    outlineColor: "white",
                    outlineWidth: 2
                },
                // .. and this is the hover style.
                connectorHoverStyle = {
                    lineWidth: 4,
                    strokeStyle: "#216477",
                    outlineWidth: 2,
                    outlineColor: "white"
                },
                endpointHoverStyle = {
                    fillStyle: "#216477",
                    strokeStyle: "#216477"
                },
                // the definition of source endpoints (the small blue ones)
                sourceEndpoint = {
                    endpoint: "Dot",
                    paintStyle: {
                        strokeStyle: "#7AB02C",
                        fillStyle: "transparent",
                        radius: 7,
                        lineWidth: 3
                    },
                    isSource: true,
                    maxConnections: 1,
                    connector: ["Flowchart", {stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true}],
                    connectorStyle: connectorPaintStyle,
                    hoverPaintStyle: endpointHoverStyle,
                    connectorHoverStyle: connectorHoverStyle,
                    dragOptions: {},
                    overlays: [
                        //["Label", { location: [0.5, 1.5], label: "Drag", cssClass: "endpointSourceLabel"}]
                    ]
                },
                // the definition of target endpoints (will appear when the user drags a connection)
                targetEndpoint = {
                    endpoint: "Dot",
                    paintStyle: {fillStyle: "#7AB02C", radius: 7},
                    hoverPaintStyle: endpointHoverStyle,
                    maxConnections: -1,
                    dropOptions: {hoverClass: "hover", activeClass: "active"},
                    isTarget: true,
                    overlays: [
                        //["Label", {location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel"}]
                    ]
                }

            $scope.sourceEndpoint = sourceEndpoint;
            $scope.targetEndpoint = targetEndpoint;

            $scope.jplumbInstance = instance;

            console.log("Set up jsPlumb listeners (should be only done once)");
            instance.bind("connection", function (connInfo, originalEvent) {
                initConnection(connInfo.connection);
                //connInfo.connection._jsPlumb.detachable = false;
            });

            instance.bind("click", function (conn, originalEvent) {
                // if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
                //   instance.detach(conn);

                selectConnection(conn)

                //conn.toggleType("basic");
                //console.log("connetion " + connection.id + " is being clicked" );
            });

            instance.bind("connectionDrag", function (connection) {
                console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
            });

            instance.bind("connectionDragStop", function (connection) {
                console.log("connection " + connection.id + " was dragged. sourceId: " + connection.sourceId + "; targetId: " + connection.targetId);
                onLinkChanged(connection)
            });

            instance.bind("connectionMoved", function (params) {
                console.log("connection " + params.connection.id + " was moved");
                onLinkChanged(params.connection)
            });

            instance.bind("connectionDetached", function (params) {
                console.log("connection " + params.connection.id + " was detached");
                if ($scope.selectedConnection) {
                    $scope.selectedConnection = undefined;
                }
                onLinkChanged(params.connection)
            });

            instance.bind("beforeDrag", function (params) {
            });
        });
    };

    function updateInputOutput() {
        auxo.forEachArray($scope.data.dataflow.steps, function (node) {
            var inputs = node.inputConfigurations;
            auxo.forEachArrayReverse(inputs, function (input, i) {
                var valid = false;
                auxo.forEachArray($scope.data.dataflow.links, function (e2) {
                    if (input.$id && input.$id === e2.source && e2.target === node.id) {
                        valid = true;
                        return false;
                    }
                })
                if (!valid && ["left", "right", "input1", "input2"].indexOf(input.id) < 0)
                    auxo.array.remove(inputs, i)
            })
        })
    }

    function onLinkChanged(sourceId, targetId) {
        $scope.synchronizeLinks()
        if (!isWorkflow())
            updateInputOutput();

        /*
        var sourceId = connection.sourceId.substring(11);
        var targetId = connection.targetId.substring(11);
        var valid = false;
        auxo.forEachArray($scope.data.dataflow.links, function (link,i) {
            var sourceId = link.source;
            var targetId = link.target;
            var target = searchNode(connection.targetId.substring(11));
            stepData.cleanUpWorkflowInput(target, sourceId)

            if(link.source === sourceId && link.target === targetId) {
                valid = true;
                return false;
            }
        })
        //var source = searchNode(connection.sourceId.substring(11));
        if(!valid) {
            var target = searchNode(connection.targetId.substring(11));
            stepData.cleanUpWorkflowInput(target, sourceId)
        }
        */

        // $scope.flowState.changed = true;
    }

    $scope.isDataflowNode = function (nodeId) {
        if (nodeId) {
            var node = searchNode(nodeId);
            if (!node) // node is null only when reloading
                return false;
            return ["dataflow", "streamflow"].indexOf(node.type) >= 0 && node.otherConfigurations.dataflowId$ && node.otherConfigurations.dataflowId$.length > 0;
        }
    }

    $scope.previewDataflow = function (nodeId) {
        if ($scope.isDataflowNode(nodeId)) {
            var node = searchNode(nodeId);
            var dfId = node.otherConfigurations.dataflowId$;
            sgDialogService.openModal({
                templateUrl: 'app/designer/flowPreview.html',
                controller: 'DataflowPreviewController', // specify controller for modal
                data: {$stateParams: {id: dfId, action: 'read', flowType: 'dataflow'}},
                callback: function (newData) {
                },
                width: $(window).width() * 0.8
            });
        }
    }

    $scope.configNode = function (nodeId) {

        if ($scope.selectedNode != nodeId)
            $scope.selectNode(nodeId);

        var node = searchNode(nodeId);

        if (node) {
            $scope.synchronizeLinks();
            $scope.editingNode = node;

            if (!isWorkflow()) {
                var run = true;
                if (node.step.inputCount > 0 || node.step.inputCount == '+') {
                    var inputNodes = $scope.getConnectionNodes(nodeId)
                    if (node.step.inputCount == '+') {
                        if (!inputNodes && inputNodes.length == 0)
                            run = false;
                    }
                    if (!inputNodes || inputNodes.length < node.step.inputCount) {
                        run = false;
                    }
                }
                if (!run) {
                    sgDialogService.alert("请建立正确的输入连接！", "提示");
                    $scope.editingNode = null;
                    return;
                }
            }

            //$scope.callbackResult = "No callbacks yet";
            $scope.openDialog = function () {
                sgDialogService.openModal({
                    templateUrl: 'app/step/node_configuration_form_tab.html',
                    controller: 'StepFormController', // specify controller for modal
                    data: {
                        editingNode: $scope.editingNode,
                        dataflow: $scope.data.dataflow,
                        readonly: $scope.action.read
                    },
                    callback: function (newData) {
                        // copy newData to $scope.editingNode
                        if (newData) {
                            angular.extend($scope.editingNode, newData);
                            $scope.flowState.changed = true;
                        }
                        $scope.editingNode = null;
                    },
                    width: 800
                });
            }
            $scope.openDialog();
        }
    };

    $scope.onDataflowNameChange = function () {
        $scope.flowState.changed = true;
    }

    $scope.renew = function (flowType) {
        if (($scope.flowType == flowType || !flowType) && $scope.action.create) {
            $scope.redraw('refresh');
        } else {
            if (flowType)
                $scope.flowType = flowType;
            var path = '/design/process/' + $scope.id + '/design/new/';
            if (isWorkflow())
                path += WORKFLOW;
            else if (isDataflow())
                path += DATAFLOW;
            else if (isStreamflow())
                path += STREAM;
            if ($scope.flowState.changed) {
                sgDialogService.confirm(auxo.buildErrorMsg("当前的修改会被重置，确定要继续吗?", "question"), function (result) {
                    if (result) {
                        setStateChangeAlert()
                        $location.path(path);
                    }
                }, "确认")
            } else {
                setStateChangeAlert()
                $location.path(path);
            }

        }
    }

    $scope.updateDataflowNode = function (nodeId, configuration) {
        var steps = $scope.data.dataflowBackup.steps;
        for (var i = 0; i < steps.length; i++) {
            if (steps[i].id == nodeId) {
                //steps[i].configuration = configuration;

                $.each(configuration, function (name, value) {
                    steps[i][name] = value;
                });

                if ($scope.data.dataflowBackup.put) {
                    return $scope.data.dataflowBackup.put();
                } else {
                    // you need to convert you object into restangular object
                    var remoteItem = Restangular.copy($scope.data.dataflowBackup);

                    // now you can put on remoteItem
                    return remoteItem.put();
                }
            }
        }
    };

    $scope.publishDataflow = function () {
        var id = $scope.data.dataflow.id;
        if (id) {

            if ($scope.flowState.changed) {
                sgDialogService.alert("发布前请先保存流程! ", "提示");
                return;
            }

            Restangular.one("flows", $scope.data.dataflow.id).post()
                .then(function (data) {
                    $scope.redraw('refresh');
                })
        }
    }

    $scope.refreshVersionList = function (callback) {

        if ($scope.flowVersions) {
            if (callback)
                callback();
            return;
        }

        var oid = $scope.data.dataflow.oid;
        if (!oid || oid === '$null')
            oid = $scope.data.dataflow.id;
        if (oid && oid !== '$null') {
            $scope.flowVersions = [];
            Restangular.one("flows/history/list", oid).get()
                .then(function (list) {
                    auxo.array.forEach(list, function (e, i) {
                        $scope.flowVersions.push(e)
                    })
                    if (callback)
                        callback();
                })
        }
    }

    $scope.configDataflow = function () {
        $scope.openDialog = function () {
            sgDialogService.openModal({
                templateUrl: 'app/designer/flow/DFConfig.html',
                controller: 'DFConfigController', // specify controller for modal
                data: {dataflow: $scope.data.dataflow, readonly: $scope.action.read},
                callback: function (newData) {
                    // copy newData to $scope.editingNode
                    if (newData) {
                        angular.extend($scope.data.dataflow, newData);
                        $scope.flowState.changed = true;
                    }
                },
                width: 1000
            });
        }
        $scope.openDialog();

    }

	$scope.cleanSavepoints = function () {
        sgDialogService.confirm(auxo.buildErrorMsg("确认要清理所有已保存任务状态吗？", "question"), function (result) {
            if (result) {
                var flowId = $scope.data.dataflow.id;
                Restangular.one("flows", flowId).customGET("clean-saved-state")
                .then(function (result) {
                    console.log("return: " + JSON.stringify(result))
                    sgDialogService.alert("清理成功！", "提示");
                }, function (error) {
                    sgDialogService.alert(auxo.getResponseErrorMsg(error), "错误");
                });
            }
        }, "确认");
	};

    $scope.init();

};

/**
 * DesignerController
 * @constructor
 */
App.controller("DesignerController", DesignerController);

