App.controller('CollectorExecController', function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog,sgDialogService,$rootScope) {

	var taskId = $stateParams.id;
    var collectorId = $stateParams.collectorId;
	auxo.meta.execute = {
    	currUrl:"/job" + taskId,
        restRootPath:"/europa/collectors/" + taskId + "/tasks",
        detailTemplate : "",
        entityDisplayName:"执行",
        getBaseFilter: function() {
            return "";
        },
        selectedTabStatus : "RUNNING",
        rowHeaders : [ //{name : "flowShedulerName", index: "fshName", sortName:"fshName", disName : "调度", converter : auxo.same},
                         {name : "createTime", disName : "启动时间", converter : auxo.date2str},
                         {name : "endTime", disName : "完成时间", converter : auxo.date2str},
                         {name : "readIn", disName : "读入", converter : auxo.same},
                         {name : "writeOut", disName : "写出", converter : auxo.same},
                         {name : "errorOut", disName : "错误写出", converter : auxo.same},
                         {name : "status", disName : "状态", converter :function(val){
                                              if(val == 1){
                                                  return '运行'
                                              }else if(val == 2){
                                                  return '完成'
                                              }else if(val == -1){
                                                  return '失败'
                                              }
                                              return '未知'
                                          }}
        ]
    };

    $scope.refresh = function(){
        history.go(0)
    }

    // 查看日志
   $scope.taskLog = function(row){
        auxo.sgDialogService.openModal({
            templateUrl: 'app/collector/collectorTaskLog.html',
            controller: 'CollectorTaskLogController',
            data: {fromparent: {collId: $scope.id, taskCount: $scope.count, entity: row, detail: $scope.entity}},
            width: 800,
            height: 800
        });
   }

    $scope.back = function(){
        window.location = sessionStorage.getItem("backUrlTmp");
        sessionStorage.removeItem("backUrlTmp")
    }

    // 停止task
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
            Restangular.one("/europa/collectors/",collectorId).customPOST(ids, "stopTaskList").then(function(d){
                //location.href="/#/collector";
                $scope.doQuery()
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    }

    CrudBaseController.call(this, auxo.meta.execute, $scope, $location, $window, $http, Restangular, ngDialog, $filter,sgDialogService ,$rootScope );
})
