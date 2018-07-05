
//列表页的controller
App.controller('SynchronizationController', function($filter,$scope,$state,  $location, $window, $http,$stateParams, Restangular, ngDialog ,sgDialogService,$rootScope) {
//    启用
    $scope.enabledList1 = function() {
        auxo.openConfirmDialog($scope, ngDialog, "确认要启用"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？", function(){
            var taskIds = $scope.getSelectRowIds();
            for(var i = 0; i < taskIds.length; i++){
                var taskId = taskIds[i];
                Restangular.one("europa/synchronizations/execute").get({taskId:taskId})
                    .then(function (facetResult) {
                        $scope.fetchPage($scope.ptableState);
                    }, function(err){
                        auxo.openErrorDialog($scope, ngDialog, err.data.err);
                    });
            }
        });
    };

    // 停止任务
    $scope.killExecution = function(selectedRows){
        var msg = "";
        auxo.openConfirmDialog($scope, ngDialog, "真的要停止"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？" + msg, function(){
            var ids = new Array();
            for(var i=0; i<selectedRows.length;i++){
                for(var j in selectedRows[i]){
                    if(j == 'id'){
                        ids.push(selectedRows[i][j]);
                    }
                }
            }
            Restangular.all("/europa/collectors").customPOST(ids, "stopList").then(function(d){
                $scope.doQuery()
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    }

//  创建
    $scope.toSynchronizationPage = function () {
        $state.go('synchronization_new', {
            args:{}
        })
    }
//  复制
    $scope.copySynchronizationTask = function(selectedRows){
        var synId = selectedRows[0].id;
        var collectorId = selectedRows[0].collecterId;
        $state.go('synchronization_copy',{id: collectorId, taskId: synId});
    }

//  预览
    $scope.previewDataSet = function (row) {
        Restangular.one("resource", row.dataStoreId).get()
            .then(function (entity) {
                auxo.sgDialogService.openModal({
                    templateUrl : 'app/collector/dataSetPreview.html',
                    data:{editingNode:entity},
                    callback: function(newData){
                    },
                    width:800
                });
            },function(errResponse) {
                auxo.openErrorDialog($scope, ngDialog, errResponse.data.err);
            })
    }
// 跳转到执行列表
    $scope.exec = function(selectedRows){
        var url = "/job/EUROPA-SERVER/" + selectedRows.id;
        sessionStorage.setItem("backUrlTmp", window.location.href);
        auxo.go(url);
    }

//  log查看日志
    var test = function(row) {
        auxo.sgDialogService.openModal({
            templateUrl : 'app/collector/collectorLog.html',
            controller : 'SynchronizationLogController', // specify controller for modal
            data:{fromparent:row},
            width:800,
            height:800
        });
    };
    $scope.test = test;

//  删除一条任务
    $scope.remove1 = function(selectedRows){
        var msg = "";
        auxo.openConfirmDialog($scope, ngDialog, "真的要删除"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？" + msg, function(){
            var ids = new Array();
            for(var i=0; i<selectedRows.length;i++){
                for(var j in selectedRows[i]){
                    if(j == 'id'){
                        ids.push(selectedRows[i][j]);
                    }
                }
            }
            Restangular.all($scope.restRootPath).customPOST(ids, "removeList").then(function(d){
                $scope.doQuery()
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    }

//  name查看详情
    var synchronizationTask = function(row) {
        auxo.sgDialogService.openModal({
            templateUrl : 'app/synchronization/synchronizationTask.html',
            controller : 'SynchronizationTaskController', // specify controller for modal
            data:{id:row.id,CollectorID:row.collecterId},
            width:800,
            height:800
        });
    };
    $scope.synchronizationTask = synchronizationTask;

//  查看source的详情
    $scope.viewDataSource = function(row){
        var tmpHtml = 'app/resourceMan/otherSourceEditing.html';
        Restangular.one("resource", row.dataSourceId).get().then(function (entity) {
            if(entity.resType == 'HTTP'){
                tmpHtml = 'app/resourceMan/webSourceEditing.html';
            }else if(entity.resType == 'DB'){
                tmpHtml = 'app/resourceMan/dataSourceEditing.html';
            }
            auxo.sgDialogService.openModal({
                templateUrl : tmpHtml,
                data:{editingNode:entity},
                callback: function(newData){
                },
                width:800
            });
        },function(errResponse) {
            auxo.openErrorDialog($scope, ngDialog, errResponse.data.err);
        });


    }

//  查看object的详情
    $scope.viewObject = function (row) {
        var url = "europa/resource/table/select?id="+row.dataSourceId+"&sql=SELECT * FROM " + row.object+"&params=limit:10;offset:0;rowCount:true";
        Restangular.one(url).get().then(function(result) {
            auxo.sgDialogService.openModal({
                templateUrl : 'app/collector/sourceTablePreview.html',
                data:{result:result},
                callback: function(newData){
                },
                width:800
            });
        },function(errResponse) {
            auxo.openErrorDialog($scope, ngDialog, errResponse.data.err);
        });
    }
    auxo.meta.synchronization = {
        currUrl:"synchronization",
        restRootPath:"europa/synchronizations",
        detailTemplate : "",
        entityDisplayName:"数据同步",
        getBaseFilter: function() {
            return "";
        },
        rowHeaders : [{name: "name", disName: "名称", converter: auxo.same},
//                 {name: "taskType", disName: "数据类型", converter: auxo.same},
            {name: "dataSource", disName: "数据源", converter: auxo.same},
            {name: "object", disName: "同步对象", converter: function (value, row) {
                $scope.object = {};
                var json = JSON.parse(row.taskJson);
                if(json.dataSource.type == "JDBC")
                    $scope.object.isTable = true
                else $scope.object.isTable = false;
                $scope.object.value = value
                return $scope.object

            }},
            {name: "dataStore", disName: "数据集", converter: auxo.same},
            {name: "trigger", disName: "周期情况", converter: function(val){
                if(val===""){
                    return "单次执行"
                }else{
                    return "周期执行";}
            }},
            {name: "createTime", disName: "创建时间", converter: auxo.date2str},
            {name: "status", disName: "状态", converter: function(val){
                if(val == 0){
                    return '已创建'
                }else if(val == 1){
                    return '已部署'
                }else if(val == 2){
                    return '已停止'
                }else if(val == -1){
                    return '错 误'
                }
                return '未知'
            }},
            {name: "lastExecuteTime", disName: "最后执行时间", converter: auxo.date2str},
            {name : "lastExecuteStatus", disName : "最后执行状态", converter :function(val){
                if(val == 0){
                    return '创建'
                }else if(val == 1){
                    return '运行中'
                }else if(val == 2){
                    return '完成'
                }else if(val == -1){
                    return '失败'
                }
                return '未知'
            }}
        ]
    };

    CrudBaseController.call(this, auxo.meta.synchronization, $scope, $location, $window, $http, Restangular, ngDialog, $filter, $stateParams ,sgDialogService,$rootScope);
});


//点击log的链接页面的contoller
App.controller('SynchronizationLogController', function SynchronizationLogController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth,modalInstance) {

    $scope.cancel = function () {
        modalInstance.dismiss();
        auxo.delHotkey($scope)
    };
    Restangular.one("europa/synchronizations/log/",$scope.fromparent.id).get({})
        .then(function(facetResult){
            $scope.log = facetResult;
        })
});


