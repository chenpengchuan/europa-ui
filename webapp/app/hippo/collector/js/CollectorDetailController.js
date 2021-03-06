App.controller('CollectorDetailController', function ($filter, $scope, $location, $state, $rootScope, $window, $http, $stateParams, Restangular, ngDialog,sgDialogService) {
    var collectorId = $stateParams.id;
    $scope.id = $scope.viewId = $stateParams.id;

// 请求关于某一采集器的所有内容
    Restangular.one("/europa/collectors/" + collectorId).get({})
        .then(function (facetResult) {
            $scope.entity = facetResult;
            $scope.entity.startedTime = auxo.date2str($scope.entity.startedTime);
            $scope.ResourceId = facetResult.resourceId;
            $scope.entity.viewStatus = $scope.entity.status == 0 ? 'OFFLINE' : ($scope.entity.status== 1 ? 'ONLINE' : 'NOAUTH')
        })
    $scope.selectCollectorType = false;
    if($scope.viewId == "_ALL_COLLECTER_JOBS_"){
        $scope.selectCollectorType = true;
    }
    // so queasily code !
    var isTasks = $location.url().indexOf('tasks') > -1;
    $scope.activeTabIndex = isTasks ? 1 : 0;
    $scope.activeTab = isTasks ? 'tasks' : 'detail';
    $scope.collectorIdSelects = [];

    $scope.collectorIdSelected = function(selectId){
           auxo.go("/hippo/collectorJobList/"+selectId);
    }

    $scope.initCollectorIdSelected = function(){
        Restangular.one("/europa/collectors/names").get().then(function (entity) {
            $scope.collectorIdSelects = entity;
            $scope.collectorIdSelects.unshift("_ALL_COLLECTER_JOBS_");
        }, function (errorResponse) {
            auxo.sgDialogService.alert(errorResponse.err, "错误");
        })
    }()

//  预览
    $scope.previewDataSet = function (row) {
//        Restangular.one("resource", "59d8a911-3208-4353-b503-0bf9266afbd8").get().then(function (entity) {
        Restangular.one("resource", row.dataStoreId).get().then(function (entity) {
            openDialog(entity);
        }, function (errorResponse) {
            if(errorResponse.err == null){
                auxo.sgDialogService.alert("数据集不存在", "错误");
            }else{
                auxo.sgDialogService.alert(errorResponse.err, "错误");
            }
        })
        function openDialog (entity){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/hippo/collector/dataSetPreview.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:entity},
                callback: function(newData){
                },
                width:800
            });
        }
    }
    $scope.other = {activeTab: $scope.activeTab};

    // 采集器任务列表
    CrudBaseController_hippo.call(this, {
        currUrl: "/collector" + collectorId,
        restRootPath: "/europa/collectors/" + collectorId + "/jobs",
        detailTemplate: "",
        entityDisplayName: "执行",
        getBaseFilter: function () {
            return "";
        },
        selectedTabStatus: "RUNNING",
        rowHeaders: [{name: "name", disName: "名称", converter: auxo.same},
            //  {name: "taskType", disName: "数据类型", converter: auxo.same},
            {name: "dataSource", disName: "数据源", converter: auxo.same},
            {name: "object", disName: "同步对象", converter: auxo.same},
            {name: "dataStore", disName: "数据集", converter: auxo.same},
            {name: "trigger", disName: "周期情况", converter: function(val){
                if(val===""){
                    return "单次执行"
                }else{
                    return "周期执行";}
            }},
            //  {name: "records", disName: "记录数", converter: auxo.same},
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

    }, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

    $scope.showTab = function (tab) {
        if ($scope.activeTab !== tab) {
            $scope.activeTab = tab;
            $scope.other.activeTab = $scope.activeTab;
            $location.hash(tab)
        }
    }

    // 删除
    $scope.remove = function(selectedRows){
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
            Restangular.all("/europa/collectors/jobs").customPOST(ids, "removeList").then(function(d){
                //location.href="/#/collector/collectorId" + "#tasks";
                $scope.doQuery();
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    }

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
                //location.href="/#/collector";
                $scope.doQuery()
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    }

    // 启动任务
    $scope.startTask = function(selectedRows){
        auxo.openConfirmDialog($scope, ngDialog, "确认要启用"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？", function(){
            var ids = new Array();
            for(var i=0; i<selectedRows.length;i++){
                for(var j in selectedRows[i]){
                    if(j == 'id'){
                        ids = selectedRows[i][j];
                        Restangular.one("/europa/synchronizations/execute").get({sourceId:selectedRows[i][j].collecterId,taskId:ids})
                            .then(function (facetResult) {
                                $scope.fetchPage($scope.ptableState);
                            }, function(err){
                                auxo.openErrorDialog($scope, ngDialog, err.data.err);
                            })
                    }
                }
            }
        });
    }
    $scope.cancel = function () {
        modalInstance.dismiss();
        auxo.delHotkey($scope)
    };

    var taskId;
    var count;
    $scope.taskId = $scope.id;
//    $scope.taskId = $scope.fromparent.entity.id;
    $scope.detail = $scope.entity;
//    $scope.detail = $scope.fromparent.entity;

    $scope.refresh = function(){
        Restangular.one("/europa/collectors/" + $scope.taskId +"/logs").get({})
            .then(function(facetResult){
                $scope.log = facetResult;
            })
    }
    $scope.refresh();

//  查看source的详情
    $scope.viewDataSource = function(row){
        var url = 'app/resourceMan/dataSourceEditing.html';
        Restangular.one("resource", row.dataSourceId).get().then(function (entity) {
            if(entity.resType == 'HTTP'){
                url = 'app/resourceMan/webSourceEditing.html';
            }
            auxo.sgDialogService.openModal({
                templateUrl : url,
                data:{editingNode:entity},
                callback: function(newData){
                },
                width:800
            });
        });
    }

//    预览表内容
    $scope.viewObject = function(row){
        url = "europa/collectors/table/select?collecterId="+row.collecterId+"&id="+ row.dataSourceId +"&sql=SELECT * FROM " + row.object +"&params=limit:5;offset:0;rowCount:true";
        Restangular.one(url).get().then(function(result) {
            auxo.sgDialogService.openModal({
                templateUrl : 'app/hippo/collector/sourceTablePreview.html',
                data:{result    :result},
                callback: function(newData){
                },
                width:800
            });
        });
    }
})
App.controller('sourceTablePreviewController', function ($scope, Restangular, modalInstance) {
    var result = $scope.result;
    $scope.rowHeaders = result.names;
    obj = angular.toJson(result.rows)
    $scope.rowCollection = result.rows? result.rows: [];
    $scope.page = "preview"

    $scope.cancel = function () {
        auxo.delHotkey($scope)
        modalInstance.closeModal(false)
    }

    $scope.closeModal = function () { $scope.cancel(); }

    $scope.title =  '数据源中的表预览';
    $scope.modalButtons = [
        {
            action: $scope.cancel, text: "确定", class: "btn-warning"
        }
    ];
    auxo.bindEscEnterHotkey($scope)
});
