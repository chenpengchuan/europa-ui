auxo.meta.zmodrules = {
    currUrl:"/qualityAnalysis/zmodrules",
    restRootPath:"/europa/zmodrules",
    path:"/qualityAnalysis/zmodrules",
    detailTemplate : "",
    entityDisplayName:"分析规则绑定",
    getBaseFilter: function() {
        return "";
    },
    rowHeaders : [
        //{name : "id", disName : "ID", converter : auxo.same},
        {name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
        // {name : "dataType", disName : "数据类型", converter : auxo.same},
        {name : "modelId", disName : "Model ID", visible: false, converter : auxo.same},
        {name : "dataId", disName : "字段名", converter : auxo.same},
        {name : "ruleId", disName : "规则ID", converter : auxo.same},
        {name : "ruleName", disName : "规则名", converter : auxo.same},
        {name : "priority", disName : "优先级", converter : auxo.same},
        {name : "inputParams", disName : "参数", converter : auxo.same},
        // {name : "outputParams", disName : "输出参数", converter : auxo.same},
        // {name : "verifyParams", disName : "校验参数", converter : auxo.same},
        {name : "creator", disName : "创建人", visible: false, converter : auxo.same},
        // {name : "lastModifier", disName : "修改人", converter : auxo.same},
        {name : "lastModifiedTime", disName : "修改时间", visible: false, converter : auxo.date2str}
    ],
    sort : {predicate:"lastModifiedTime", reverse:true}

};

App.controller('DqModelRulesController', function($filter, $scope, $location, $window, $http, $stateParams, Restangular, ngDialog, sgDialogService) {
    $scope.zmodId = $stateParams.zmodId;
    auxo.meta.zmodrules.currUrl = $location.$$path;
    auxo.meta.zmodrules.restRootPath = "/europa/zmodrules/" + $scope.zmodId + "/detailslist";

    //var zmodelService = auxo.clone(auxo.meta.zmodel);
    zmodelService = auxo.meta.zmodel;
    zmodelService.$controller.$scope = $scope;
    zmodelService.$controller.$location = $location;
    zmodelService.$controller.Restangular = Restangular;
    zmodelService.$controller.ngDialog = ngDialog;
    zmodelService.$controller.sgDialogService = sgDialogService;

    CrudBaseController.call(this, auxo.meta.zmodrules, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

    $scope.runThisModel = function (scheduleType) {
        if ($scope.zmodId && zmodelService.runOneModel) {
            zmodelService.runOneModel({name: $scope.zmodId, id: $scope.zmodId}, scheduleType);
        }
    }

    $scope.cancel = function() {
        auxo.delHotkey($scope)
        auxo.goBack();
    }

});

App.controller('EditDqModelRulesController', function EditDqModelRulesController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth) {
    $scope.role = Auth.user.role.title;
    console.log($scope.role);
    //$scope.htmlTemplate_file = "zebra-ui/webapp/app/qualityAnalysis/zmod_rules_binding_detail.html";
    // route: qualityAnalysis/zmodrules/zmodId/ModelDetailId

    var id = $stateParams.id;
    $scope.zmodId = $stateParams.zmodId;
    $scope.rowHeaders = auxo.meta.zmodrules.rowHeaders;
    $scope.inputParamDesc = new Array();  // param desc for generating input item(UI)
    $scope.inputParams = {};  //  store input values from UI
    $scope.dataFieldsStr = "";

    $scope.onSelectRuleChanged = function (selectedRow) {
        if (selectedRow) {
            $scope.ruleEntity = selectedRow;
            $scope.entity.ruleId = selectedRow["id"];
            $scope.entity.ruleName = selectedRow["name"];
            if (selectedRow["dataScope"] !== "Field" && selectedRow["dataScope"]!=='FieldsCombination') {
                $scope.entity.dataId = "";
            }
            $scope.multiFields = ($scope.ruleEntity.dataScope === 'FieldsCombination' || $scope.ruleEntity.dataScope === 'Row');
            if ($scope.multiFields && !$scope.entity.dataId)
                $scope.entity.dataId = "*";
            $scope.initRuleData($scope.ruleEntity, {});

            //$scope.inputParam = buildParams(selectedRow["ruleOption"]);
        }
    };

    var entities = {
        "model": {
            name: "default-" + $scope.zmodId,
            modelId: $scope.zmodId,
            //dataType: ($scope.modelEntity && $scope.modelEntity.processDataType)? $scope.modelEntity.processDataType : "Dataset",
            dataId: ($scope.modelEntity && $scope.modelEntity.processDataId)? $scope.modelEntity.processDataId : "",
            ruleId: "",
            ruleName: "",
            priority: 1,
            inputParams: ""
            //storageConfigurations: {format: "csv", path: ""},
            //formatConfigurations: {datatype: "Dataset"},
            // expiredPeriod: 0
        }
    }

    auxo.meta.zmodrules.onNew = function (entity) {
        $scope.entity = auxo.clone(entities.model);
        $scope.entity.name = "model-rule-" + (new Date()).getTime();
        $scope.previewLoading = false;
        $scope.prepareData();
        if ($scope.ruleEntity) {
            $scope.entity.priority = $scope.ruleEntity.priority;
        }
    }

    auxo.meta.zmodrules.onSave = function (entity) {
        if (entity && !entity.modelId)
            entity.modelId = $scope.zmodId;
        $scope.applyRuleData(entity, $scope.ruleEntity, $scope.inputParams);
    };

    $scope.previewLoading = true;
    auxo.meta.zmodrules.onFetch = function (entity) {
        console.log(entity);
        $scope.previewLoading = true;
        $scope.entity = entity;
        $scope.ruleEntity = {};
        $scope.prepareData();
    };

    $scope.prepareData = function () {
        Restangular.one("/europa/rule", $scope.entity.ruleId).get().then(
            function (ruleEntity) {
                $scope.previewLoading = false;
                $scope.previewError = null;
                $scope.ruleEntity = ruleEntity;
                $scope.rowCollection = ruleEntity;
                console.log(ruleEntity);
                if (ruleEntity) {
                    // if (ruleEntity.dataScope != 'Field' && ruleEntity.dataScope != 'FieldsCombination')
                    // 	$scope.entity.dataId = null;
                    $scope.multiFields = (ruleEntity.dataScope === 'FieldsCombination');
                }
                $scope.initRuleData($scope.ruleEntity, $scope.entity.inputParams);
            }, function (errorResponse) {
                $scope.previewError = errorResponse.data;
                $scope.previewLoading = false;
                $scope.initRuleData($scope.ruleEntity, $scope.entity.inputParams)
            });

        Restangular.one("/europa/zmod", $scope.zmodId).get().then(
            function (modelEntity) {
                console.log(modelEntity);
                $scope.modelEntity = modelEntity;
                if ($scope.modelEntity.processDataId) {
                    // get schema of data
                    Restangular.one("/europa/zmod/schema", auxo.escapeUri($scope.modelEntity.processDataId)).get().then(
                        function (schema) {
                            console.log(schema);
                            if (schema) {
                                $scope.schemaEntity = schema
                                $scope.dataFieldsStr = "";
                                if ($scope.schemaEntity.fields) {
                                    $scope.schemaEntity.fields.forEach(function(e) {
                                        $scope.dataFieldsStr += ($scope.dataFieldsStr.length == 0? "" : ",") + e.name;
                                    })
                                }
                            }
                        }, function (errorResponse) {
                        });
                }
            }, function (errorResponse) {
                //$scope.previewError = errorResponse.data;
                // $scope.previewLoading = false;
            });
    };

    var findParamByKey = function(group, key) {
        if ($scope.inputParams && $scope.inputParams[group]) {
            var paramListKeys = getAllPropsKey($scope.inputParams[group]);
            for (var i = 0; i < paramListKeys.length; i++) {
                if ($scope.inputParams[group][paramListKeys[i]] && $scope.inputParams[group][paramListKeys[i]].name == key)
                    return $scope.inputParams[group][paramListKeys[i]];
            }
        }
        return null;
    };

    $scope.initRuleData = function (entity, inputParams) {
        //  entity -> Rule
        //  inputParamsStr -> ModelDetail.inputParams  (Json string storing params)
        //$scope.inputParams = {};  //  store input values
        //if (inputParamsStr)
        //	$scope.inputParams = JSON.parse(inputParamsStr);
        $scope.outputFieldsStr = "";  // -> ruleOption.outputFields
        if (inputParams)
            $scope.inputParams = inputParams
        else
            $scope.inputParams = { }

        $scope.inputParamDesc = new Array();  // param desc for generating input item(UI)
        if (!entity) return;

        if (!entity.ruleOption)
            entity.ruleOption = {paramsMap: {}};

        if (entity.ruleOption.outputFields && entity.ruleOption.outputFields.length > 0)
            $scope.outputFieldsStr = entity.ruleOption.outputFields.join(",");

        if (entity.ruleOption.paramsMap) {
            var propKeys = getAllPropsKey(entity.ruleOption.paramsMap);
            for (var i = 0; i < propKeys.length; i++) {
                var paramDescList = entity.ruleOption.paramsMap[propKeys[i]];
                if (paramDescList && paramDescList.length > 0) {
                    for (var j = 0; j < paramDescList.length; j++) {
                        var id = "pd_" + i + "_" + j;

                        var paramBinded = findParamByKey(propKeys[i], paramDescList[j].name)

                        if (paramBinded)
                            $scope.inputParams[id] = paramBinded.value;
                        else {
                            if (propKeys[i] =="inputGroup" && paramDescList[j].name == "customExpression")
                                $scope.inputParams[id] = entity.customValue || paramDescList[j].defaultValue;
                            else if (propKeys[i] =="outputGroup" && paramDescList[j].name == "outputFields")
                                $scope.inputParams[id] = $scope.outputFieldsStr || paramDescList[j].defaultValue;
                            else
                                $scope.inputParams[id] = paramDescList[j].defaultValue;
                        }

                        $scope.inputParamDesc.push(
                            {
                                keyName: propKeys[i],
                                id: "pd_" + i + "_" + j,
                                idx: j,
                                name: paramDescList[j].name,
                                vtype: paramDescList[j].vtype,
                                angularType: "text",
                                displayStr: paramDescList[j].displayStr,
                                required: paramDescList[j].required,
                                options: paramDescList[j].valueOptions
                            }
                        );
                    }
                }
            }
        }

    };

    // apply input param values to ModelDetail.inputParam String
    $scope.applyRuleData = function (mdEntity, ruleEntity, inputParams) {
        // mdEntity -> ModelDetail
        // ruleEntity -> Rule
        // inputParams -> $scope.inputParams (input values from from UI)
        if (!mdEntity || !ruleEntity)  return;
        // if (!$scope.inputParams)
        // 	$scope.inputParams = "";
        if (!ruleEntity.ruleOption) ruleEntity.ruleOption = {};
        if (!ruleEntity.ruleOption.paramsMap) ruleEntity.ruleOption.paramsMap = {};
        var buildParams = { outputGroup: { } };

        if (inputParams) {
            // get param keys
            var propKeys = getAllPropsKey(ruleEntity.ruleOption.paramsMap);

            // list param descs
            for (var i = propKeys.length - 1; i >= 0; i--) {
                buildParams[propKeys[i]] = {};
                var paramDescList = ruleEntity.ruleOption.paramsMap[propKeys[i]];
                if (paramDescList && paramDescList.length > 0) {
                    for (var j = paramDescList.length - 1; j >= 0 && $scope.inputParamDesc.length > 0; j--) {
                        var id = "pd_" + i + "_" + j;
                        buildParams[propKeys[i]]["" + j] = {
                            name: paramDescList[j].name,
                            value: inputParams[id]
                            //vtype: paramDescList[j].vtype
                        };
                    }
                }
            }
        }
        mdEntity.inputParams = buildParams; //JSON.stringify(buildParams, null, " ");

    };

    //$scope.callbackResult = "No callbacks yet";
    // $scope.openDialog = function(){
    // 	sgDialogService.openModal({
    // 		templateUrl : 'app/qualityAnalysis/dialog_fields_selection.html',
    // 		controller : 'item_selection_controller', // specify controller for modal
    // 		data:{editingNode:$scope.editingNode, dataflow: $scope.data.dataflow, readonly: $scope.action.read},
    // 		callback: function(newData){
    // 			// copy newData to $scope.editingNode
    // 			if(newData) {
    // 				angular.extend($scope.editingNode, newData);
    // 				$scope.flowState.changed = true;
    // 			}
    // 			$scope.editingNode = null;
    // 		},
    // 		width:800
    // 	});
    // }
    // $scope.openDialog();

    // $scope.getParamOptions = function (propKey, entity) {
    // 	return null;
    // };

    // $scope.onSave= function (entity) {
    // 	//entity.inputParams = JSON.stringify($scope.inputParams, "null", " ");
    // 	console.log(entity.inputParams);
    // };

    auxo.meta.zmodrules.restRootPath = "/europa/zmodrules/" + $scope.zmodId;
    EditBaseController.call(this, auxo.meta.zmodrules, $scope, $window, $http, $stateParams, $location, ngDialog, Restangular)

    $scope.disableEdit = !$scope.isNew; // !isNew

    $scope.switchLock= function() {
        $scope.disableEdit = !$scope.disableEdit;
    };

});

