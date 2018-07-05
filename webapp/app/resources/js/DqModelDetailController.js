auxo.meta.zmodelDetail = {
    currUrl:"/qualityAnalysis/zmoddetail",
    restRootPath:"/europa/zmoddetail",
    path:"/qualityAnalysis/zmoddetail",
    detailTemplate : "",
    entityDisplayName:"分析规则绑定",
    getBaseFilter: function() {
        return "";
    },
    rowHeaders : [
        //{name : "id", disName : "ID", converter : auxo.same},
        {name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
        // {name : "processDataType", disName : "数据类型", converter : auxo.same},
        // {name : "processDataId", disName : "数据ID", converter : auxo.same},
        // {name : "preProcessFlowId", disName : "预处理流程", converter : auxo.same},
        {name : "creator", disName : "创建人", converter : auxo.same},
        {name : "lastModifier", disName : "修改人", converter : auxo.same},
        {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
    ],
    sort : {predicate:"lastModifiedTime", reverse:true}

};

App.controller('DqModelDetailController', function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
    CrudBaseController.call(this, auxo.meta.zmodelDetail, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
})

App.controller('EditDqModelDetailController', function EditDqModelDetailController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth) {
    $scope.role = Auth.user.role.title;
    console.log($scope.role);

    var id = $stateParams.id;
    $scope.schemaName = ""
    $scope.onSelectChanged=function(selectedRow){
        if (selectedRow) {
            // $scope.entity.schema = selectedRow["id"]
            // $scope.entity.schemaName = selectedRow["name"]
            // $scope.entity.schemaVersion = selectedRow["version"]
            // buildSchemaDisplayName();
        }
    };

    var formats = {
        "model" : [
            // {name : "preProcessFlowId", required: false},
            {name : "processDataType", options : ["Dataset", "Schema"]}
            // {name : "processDataId", required: true},
            // {name : "escapeChar", required: false}
        ]
    };


    var entities = {
        "model": {
            datatype: "Dataset",
            dataid: "",
            flowid: "",
            //storageConfigurations: {format: "csv", path: ""},
            //formatConfigurations: {datatype: "Dataset"},
            expiredPeriod : 0
        }
    }

    auxo.meta.zmodelDetail.onNew = function(entity) {
        $scope.entity = auxo.clone(entities.HDFS);
        $scope.previewLoading = false;
        //$scope.storageDesc = storages[$scope.entity.storage];
        $scope.formatDesc = formats["model"];
    }

    $scope.previewLoading = true;
    auxo.meta.zmodelDetail.onFetch = function(entity) {
        $scope.previewLoading = true;
        $scope.entity = entity;
        //buildSchemaDisplayName();
        //$scope.storageDesc = storages[$scope.entity.storage];
        //$scope.formatDesc = formats[$scope.entity.storageConfigurations.format];
        // Restangular.one("/europa/zmod", id).customGET("preview", {rows : 100}).then(
        // 		function(pdo) {
        // 			$scope.previewLoading = false;
        // 			// Restangular.one("schemas", entity.schema).get().then(function(dc) {
        // 			//     $scope.previewError = null;
        // 			// 	$scope.rowHeaders = dc.fields;
        // 			// 	$scope.rowCollection = pdo;
        // 			// });
        // 			$scope.previewError = null;
        // 			$scope.rowHeaders = auxo.meta.zmodelDetail.rowHeaders;
        // 			$scope.rowCollection = pdo;
        // 		}, function (errorResponse) {
        // 			$scope.previewError = errorResponse.data;
        // 			$scope.previewLoading = false;
        // 		});
    };
    //
    // $scope.doRefreshPreview = function() {
    //   $scope.previewLoading = true;
    //
    //   Restangular.one("zmod", id ? id : "$new").customPOST($scope.entity, "preview", {rows : 100}, {}).then(
    //   				function(pdo) {
    //   					$scope.previewLoading = false;
    //   					// Restangular.one("schemas", $scope.entity.schema).get().then(function(dc) {
    //   					//     $scope.previewError = null;
    //   					// 	$scope.rowHeaders = dc.fields;
    //   					// 	$scope.rowCollection = pdo;
    //   					// });
    //   				}, function (errorResponse) {
    //   					$scope.previewError = errorResponse.data;
    //   					$scope.previewLoading = false;
    //   				});
    // };

    EditBaseController.call(this, auxo.meta.zmodelDetail, $scope, $window, $http, $stateParams, $location, ngDialog, Restangular)

    $scope.disableEdit = !$scope.isNew; // !isNew

    $scope.switchLock= function() {
        $scope.disableEdit = !$scope.disableEdit;
    }


    function buildSchemaDisplayName() {
        //$scope.schemaName = $scope.entity.schemaName+'(ver='+$scope.entity.schemaVersion+')';
    }

    $scope.openSelectSchemaDialog = function() {
        var dlg = ngDialog.open({
            template: 'app/data/schemasDialog.html',
            className: 'ngdialog-theme-default custom-width',
        });
        dlg.closePromise.then(function (data) {
            if ( $.isArray(data.value) ) {
                $scope.entity.schema = data.value[0].id;
                $scope.entity.schemaName = data.value[0].name;
                $scope.entity.schemaVersion = data.value[0].version;
                buildSchemaDisplayName()
                if (!$scope.entity.expiredPeriod || $scope.entity.expiredPeriod == 0) {
                    $scope.entity.expiredPeriod = data.value[0].expiredPeriod;
                }
                if($scope.entity.expiredPeriod === undefined)
                    $scope.entity.expiredPeriod = 0;
            }
        });
    }

});

// auxo.meta.selectSchemas = {
// 		restRootPath:"schemas",
// 		detailTemplate : "",
// 		entityDisplayName:"Schema",
// 		getBaseFilter: function() {
// 			return "";
// 		},
// 		selectedTabStatus : "RUNNING",
// 		rowHeaders : [   {name : "id", disName : "ID", converter : auxo.same},
// 						 {name : "name", disName : "名称", converter : auxo.same},
// 						 {name : "version", disName : "版本", converter : auxo.same},
// 						 {name : "createTime", disName : "创建时间", converter : auxo.date2str},
// 						 ]
// };
// App.controller('SelectSchemaController', function SelectSchemaController($filter,$scope, $location, $window, $http, $stateParams, ngDialog, Restangular) {
// 	CrudBaseController.call(this, auxo.meta.selectSchemas, $scope, $location, $window, $http, Restangular, ngDialog, $filter)
// });
//
// App.controller('cdoHistoryController', function CdoHistoryController($scope, Restangular, modalInstance) {
//
//     $scope.title = "历史信息";
//
//     $scope.cancel = function () {
//         auxo.delHotkey($scope)
//         modalInstance.closeModal()
//     }
//
//     $scope.modalButtons =[
//         {
//             action: $scope.cancel,
//             text:"关闭",class:"btn-warning"
//         }
//     ];
//     $scope.closeModal = $scope.cancel
//
//     $scope.datasetHistory = $scope.datasetHistory || {};
// 	var datasetHistory = $scope.datasetHistory;
// 	datasetHistory.header = [
// 			{"display":"Name", "origin":"cdoName", "converter" : auxo.same},
// 			{"display":"SchedulerName", "origin":"schedulerName", "converter" : auxo.same},
// 			{"display":"FlowName", "origin":"flowName", "converter" : auxo.same},
// 			{"display":"Type", "origin":"stype", "converter" : auxo.same},
// 			{"display":"Time", "origin":"timer", "converter" : auxo.date2str},
// 			{"display":"Operator", "origin":"userName", "converter" : auxo.same}
// 		];
// 	datasetHistory.content = [];
// 	datasetHistory.originContent = [];
// //	console.info($scope.inputData.values);
// 	Restangular.one("dataHistory", $scope.inputData.values).get().then(function(ent){
// 		$scope.datasetHistory.content = ent.fields;
// 	});
// });
