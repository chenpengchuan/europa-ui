auxo.meta.zdaf = {
    currUrl:"/qualityAnalysis/zdaf",
    restRootPath:"/europa/zdaf",
    path:"/qualityAnalysis/zdaf",
    detailTemplate : "",
    entityDisplayName:"分析任务",
    getBaseFilter: function() {
        return "";
    },
    rowHeaders : [
        //{name : "id", disName : "ID", converter : auxo.same},
        {name : "modelName", disName : "模板", converter : auxo.same},
        {name : "modelId", disName : "分析模板 ID", visible:false, converter : auxo.same},
        {name : "flowId", disName : "Flow", converter : auxo.same, visible: (false || auxo.DEV_ENABLED)},
        {name : "name", disName : "执行任务名", sortName: "name_sort", converter : auxo.same},
        {name : "flowStatus", disName : "任务状态", converter : auxo.same},
        {name : "result", disName : "执行结果", visible:true, converter: auxo.same},
        {name : "processDataType", disName : "输入数据类型", visible: false, converter : auxo.same},
        {name : "processDataId", disName : "输入数据", converter : auxo.same},
        {name : "sliceType", disName : "sliceType", visible: false, converter : auxo.same},
        {name : "sliceTime", disName : "数据时间片", converter : auxo.same},
        {name : "executionId", disName : "执行任务ID", converter : auxo.same},
        {name : "outputDataId", disName : "输出数据", visible: (false || auxo.DEV_ENABLED), converter : auxo.same},
        // {name : "sourceRowCount", disName : "源数据行数", converter : auxo.same},
        // {name : "outputRowCount", disName : "数据行数", converter : auxo.same},
        // {name : "outputDataSize", disName : "数据量", converter : auxo.same},
        {name : "qualityRank", disName : "数据质量等级", converter : auxo.same},
        {name : "badRatio", disName : "坏数据占比", converter : auxo.same},
        {name : "creator", disName : "创建人", visible: false, converter : auxo.same},
        // {name : "lastModifier", disName : "修改人", converter : auxo.same},
        {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
    ],
    sort : {predicate:"lastModifiedTime", reverse:true}

};

App.controller('DqFlowController', function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog, sgDialogService) {
    $scope.zmodId = $stateParams.zmodId;
    auxo.meta.zdaf.currUrl = $location.$$path;
    auxo.meta.zdaf.restRootPath = "/europa/zdaf/" + $scope.zmodId;
    CrudBaseController.call(this, auxo.meta.zdaf, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
    $scope.runFlow = function(selectedRows) {
        if (selectedRows == null || selectedRows.length != 1)
            return;
        if (selectedRows[0].flowStatus && selectedRows[0].flowStatus == "PREPARING") {
            // auxo.meta.zmodel.$controller.$scope = $scope;
            // auxo.meta.zmodel.$controller.Restangular = Restangular;
            // auxo.meta.zmodel.$controller.ngDialog = ngDialog;
            // auxo.meta.zmodel.$controller.sgDialogService = sgDialogService;
            // auxo.meta.zmodel.$controller.$location = $location;
            // auxo.meta.zmodel.runOneModel({id: selectedRows[0].modelId, name: selectedRows[0].modelName});
        }
    }
});

App.controller('EditDqFlowController', function EditDqFlowController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth) {
    $scope.role = Auth.user.role.title;
    console.log($scope.role);

    $scope.zmodId = $stateParams.zmodId;
    //$scope.executionId = $stateParams.id;  // executionId
    var id = $stateParams.id;  // executionId
    auxo.meta.zdaf.restRootPath = "/europa/zdaf/" + $scope.zmodId;

    auxo.meta.zdaf.onFetch = function(entity) {
        $scope.entity = entity;
        $scope.baseRowHeaders = auxo.meta.zdaf.rowHeaders;
    }

    EditBaseController.call(this, auxo.meta.zdaf, $scope, $window, $http, $stateParams, $location, ngDialog, Restangular)

    $scope.disableEdit = !$scope.isNew; // !isNew

    $scope.switchLock= function() {
        $scope.disableEdit = true;  //!$scope.disableEdit;
    }

});


App.controller('DqFlowResultController', function ($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth) {
    $scope.role = Auth.user.role.title;
    console.log($scope.role);

    $scope.datasetName = $stateParams.dataId;
    $scope.modelName = $stateParams.modelName || "";

    $scope.rowStyles = {
        qualityRank: {'color': 'red', 'background-color': '#CCEEFC', 'text-align': 'right'},
        badRatio: {'color': 'blue', 'background-color': '#CCFFCC', 'text-align': 'right'},
        aaa: {'text-align': 'right'},
        bbb: {'text-align': 'right'},
        ccc: {'text-align': 'right'}
    };

    var excludeFields = {"modelId": "hide", "flowId": true, "executionId": true, "detailId": "hide", "processDataType": true, "outputType": true, "outputFormat": true, "outputData": true};

    var removeFields = function(fields) {
        if (excludeFields) {
            if (fields instanceof Array) {
                for (var i = fields.length - 1; i >= 0; i--) {
                    if (true === excludeFields[fields[i].name])
                        fields.splice(i, 1);
                }
            } else if (typeof fields === "object") {
                var keys = getAllPropsKey(excludeFields)
                for (var key in keys) {
                    if (true === excludeFields[keys[key]])
                        delete fields[keys[key]]
                }
            }
        }
    };

    $scope.cancel = function() {
        auxo.delHotkey($scope)
        auxo.goBack();
    };

    $scope.previewLoading = true;
    $scope.fetchData = function() {
        $scope.previewLoading = true;

        if ($scope.datasetName) {
            var encodeName = encodeURIComponent($scope.datasetName);//encode for gateway
            Restangular.one("datasets/name", encodeName).get().then(
                function(ds) {
                    if (ds) {
                        $scope.datasetEntity = ds;
                        $scope.datasetType = ds.storageConfigurations? ds.storageConfigurations.datasetType : "";
                        $scope.dataSchema = ds.schema; // schemaId
                        $scope.datasetId = ds.id;
                        if (ds.description)
                            $scope.datasetDescription = ds.description;
                        else
                            $scope.datasetDescription = ds.name;
                        $scope.doRefreshPreview();
                    } else
                        $scope.previewLoading = false;

                }, function (errorResponse) {
                    $scope.previewLoading = false;
                });
        }
    };

    $scope.doRefreshPreview = function() {
        $scope.previewLoading = true;
        Restangular.one("datasets", $scope.datasetId).customGET("preview", {rows : 100}, {}).then(
            function(pdo) {
                if (pdo) {
                    Restangular.one("schemas", $scope.dataSchema).get().then(function (dc) {
                        $scope.previewError = null;
                        if (dc) {
                            $scope.rowHeaders = dc.fields;
                            if ($scope.datasetName.indexOf("qa_sink_dataset") >= 0) {
                                for (var i = $scope.rowHeaders.length - 1; i >= 0; i--) {
                                    $scope.rowHeaders[i].hidden = (true == excludeFields[$scope.rowHeaders[i].name] || "hide" == excludeFields[$scope.rowHeaders[i].name]) ? true : false;
                                }
                                for (var i = pdo.length - 1; i >= 0; i--) {
                                    removeFields(pdo[i]);
                                }
                            }
                        }
                        for (var ii=0; ii < pdo.length; ii++) {
                            pdo[ii].downloadUrl = encodeURIComponent(encodeURIComponent(pdo[ii].outputId));
                        }
                        $scope.rowCollection = pdo;
                        $scope.previewLoading = false;
                    });
                } else {
                    $scope.previewLoading = false;
                }
            }, function (errorResponse) {
                $scope.previewError = errorResponse.data;
                $scope.previewLoading = false;
            });
    };

    $scope.fetchData();

});