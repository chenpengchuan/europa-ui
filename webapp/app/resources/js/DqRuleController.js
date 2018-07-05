auxo.meta.zrule = {
    currUrl:"/qualityAnalysis/zrule",
    restRootPath:"/europa/rule",
    path:"/qualityAnalysis/rule",
    detailTemplate : "",
    entityDisplayName:"分析规则",
    getBaseFilter: function() {
        return "";
    },
    rowHeaders : [
        {name : "id", disName : "ID", converter : auxo.same},
        {name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
        {name : "buildType", disName : "类型", converter : auxo.same},
        {name : "customType", disName : "自定义类型", converter : auxo.same},
        {name : "ruleClass", disName : "基类", visible: false, converter : auxo.same},
        {name : "customValue", disName : "自定义数据/表达式", visible: true, converter : auxo.same},
        {name : "aggType", disName : "聚合类型", visible: false, converter : auxo.same},
        {name : "priority", disName : "优先级", visible: false, converter : auxo.same},
        {name : "owner", disName : "所有人", converter : auxo.same},
        // {name : "creator", disName : "创建人", converter : auxo.same},
        {name : "lastModifier", disName : "修改人", visible: false, converter : auxo.same},
        {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
    ],
    sort : {predicate:"lastModifiedTime", reverse:true}

};

App.controller('DqRuleController', function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
    CrudBaseController.call(this, auxo.meta.zrule, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
    $scope.doRuleFilter = function(node, ruleFilterCheckAll) {
        if (!node) {
            if (ruleFilterCheckAll == true) {
                // display all
                $scope.ruleTypeFilterValue = "";
                $scope.queryWord = "";
            }
        } else if (node && node.value) {
            // filt by type of node.value
            //
            $scope.ruleTypeFilterValue = node.value;
            if (node.value === "Builtin") {
                $scope.queryWord = "buildType=Builtin";
            } if (node.value === "Custom") {
                $scope.queryWord = "buildType=Custom";
            } else if (node.value.indexOf("Custom-") == 0) {
                $scope.queryWord = "customType=" + node.value.substring(7);
            } else
            if (node.value.indexOf("Data-") == 0) {
                if (node.value === "Data-Field")
                    $scope.queryWord = "dataScope=Field|dataScope=FieldsCombination";
                else
                    $scope.queryWord = "dataScope=Row|dataScope=Other";
            } else
            if (node.value.indexOf("Field-") == 0) {
                $scope.queryWord = "fieldValueType=" + node.value.substring(6);
            }
        }
        $scope.reloadPage();
    }
})

App.controller('EditDqRuleController', function EditDqRuleController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth, uuid2) {
    $scope.role = Auth.user.role.title;
    console.log($scope.role);

    var id = $stateParams.id;
    $scope.inputParamDesc = new Array();

    $scope.initRuleData = function(entity) {
        // entity -> Rule
        $scope.inputParamDesc = new Array();
        $scope.inputParams = {};
        if (!entity.ruleOption)
            entity.ruleOption = {paramsMap: {}};
        else {
            var propKeys = getAllPropsKey(entity.ruleOption.paramsMap)
            for (var i = 0; i < propKeys.length; i++) {
                var paramDescList = entity.ruleOption.paramsMap[propKeys[i]];
                if (paramDescList && paramDescList.length > 0) {
                    for (var j= 0; j < paramDescList.length; j++) {
                        var id = "pd_" + i + "_" + j;
                        $scope.inputParams[id] = paramDescList[j].defaultValue;
                        $scope.inputParamDesc.push(
                            {
                                keyName: propKeys[i],
                                id: "pd_" + i + "_" + j,
                                idx: j,
                                name: paramDescList[j].name,
                                displayStr: paramDescList[j].displayStr,
                                vtype: paramDescList[j].vtype,
                                angularType: "text",
                                defaultValue: paramDescList[j].defaultValue,
                                options: paramDescList[j].valueOptions
                            }
                        );
                    };
                };
            };
        };

    };

    // apply input param values to ModelDetail.inputParam String
    $scope.applyRuleData = function (ruleEntity, inputParams) {
        // ruleEntity -> Rule
        // inputParams -> $scope.inputParams ( variable storing value input from UI)
        if (!ruleEntity)  return;
        if (!ruleEntity.ruleOption) ruleEntity.ruleOption = {};
        if (!ruleEntity.ruleOption.paramsMap) ruleEntity.ruleOption.paramsMap = {};

        if (inputParams) {
            // get param keys
            var propKeys = getAllPropsKey(ruleEntity.ruleOption.paramsMap);

            // list param descs
            for (var i = propKeys.length - 1; i >= 0; i--) {
                var paramDescList = ruleEntity.ruleOption.paramsMap[propKeys[i]];
                if (paramDescList && paramDescList.length > 0) {
                    for (var j = paramDescList.length - 1; j >= 0 && $scope.inputParamDesc.length > 0; j--) {
                        var id = "pd_" + i + "_" + j;
                        paramDescList[j].defaultValue = inputParams[id];
                    }
                }
            }

        }
    };

    // get ruleClass
    $scope.onSelectChanged=function(selectedRow){
        $scope.entity.ruleClass=selectedRow["ruleClass"]
        if ('Custom' == $scope.entity.buildType ) {
            $scope.entity.ruleOption = selectedRow["ruleOption"];
            $scope.initRuleData($scope.entity);
        }

    };

    $scope.supportedBuildTypes = ["Builtin","Custom"];
    $scope.supportedCustomTypes = ["Extend","EL", "SQL"];
    $scope.supportedInputDataScope = ["Field","FieldsCombination", "Row","Other"];
    $scope.supportedInputValueType = ["Any","String","Number","Date"];

    $scope.supportedAggTypes = [
        "None","Aggregation","GroupAggregation","Count","Sum","Average",
    ];

    var defaultEntity = {
        aggType : "None",
        buildType : "Custom",
        customType : "EL",
        dataScope: "Field",
        fieldValueType: "Any",
        ruleOption: {
            paramsMap: {}
        }
    };


    auxo.meta.zrule.onNew = function(entity) {
        $scope.entity = auxo.clone(defaultEntity);
        $scope.entity.id = uuid2.newguid();
        $scope.previewLoading = false;
        $scope.initRuleData($scope.entity);
    }

    auxo.meta.zrule.onSave = function (entity) {
        if (entity && !entity.modelId)
            entity.modelId = $scope.zmodId;
        $scope.applyRuleData(entity, $scope.inputParams);
    }

    $scope.previewLoading = true;
    auxo.meta.zrule.onFetch = function(entity) {
        $scope.previewLoading = true;
        $scope.entity = entity;
        if (entity && entity.tenant && entity.tenant=='share')
            $scope.disableEdit = true;
        $scope.initRuleData($scope.entity)
    }

    EditBaseController.call(this, auxo.meta.zrule, $scope, $window, $http, $stateParams, $location, ngDialog, Restangular)

    $scope.disableEdit = !$scope.isNew; // !isNew

    $scope.switchLock= function() {
        if ($scope.entity && $scope.entity.tenant && $scope.entity.tenant=='share')
            $scope.disableEdit = true;
        else
            $scope.disableEdit = !$scope.disableEdit;
    }

});


