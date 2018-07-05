auxo.meta.executionHistory = {
    currUrl:"/design/process/:id/history",
    restRootPath:"executions",
    detailTemplate : "",
    entityDisplayName:"执行",
    rowHeaders : [{name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
        {name : "flowName", disName : "流程", converter : auxo.same},
        {name : "flowSchedulerName", index: "fshName", sortName:"fshName", disName : "调度", converter : auxo.same},
        {name : "createTime", disName : "创建时间", converter : auxo.date2str},
//		                     {name : "period", disName : "周期情况", converter : same},
        {name : "cost", disName : "耗时(秒)", sortName : "cost", converter : auxo.ms2s},
        {name : "status", disName : "进度", converter : auxo.status2str, disableSort:true}]
};

var processExecutionHistoryController = function($filter, $scope, $location, $window, $http, $stateParams, Restangular, ngDialog) {
    $scope.id = $stateParams.id;
    $scope.scheduleId = $stateParams.fshId;

    $scope.doQuery = function(queryWord) {
        $scope.queryWord = queryWord;
        delete $scope.offset;
        delete $scope.currPage;
        $scope.other.ts = new Date().getTime();
        reloadPage();
    }

    $scope.doQuery2 = function () {
        $scope.fetchPage($scope.ptableState);
    }


    //daterangepicker时间插件apply对应方法
    $scope.onDateRangeApply2=function(ev, picker) {
        if(ev.$parent.dateRange.startDate)
            $scope.startDate = $filter('date')(ev.$parent.dateRange.startDate.toDate(), "yyyy-MM-dd")
        else
            $scope.startDate = ""
        if(ev.$parent.dateRange.endDate)
            $scope.endDate = $filter('date')(ev.$parent.dateRange.endDate.toDate(), "yyyy-MM-dd")
        else
            $scope.endDate = ""
        $scope.dateRange = ev.$parent.dateRange;
        $scope.doQuery2();
    };

    //用户Kill进程
    $scope.killExecution = function() {
        var template = "<div>";
        template += "<p><i>确认要停止"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？<i></p>";
        template += "<input type='checkbox' ng-model='input' />保存状态（仅对Streamflow有效）";
        template += "</div>"
        auxo.openConfirmFormDialog($scope, ngDialog, template, {value: false}, function(value){
            var ids = $scope.getSelectRowIds();
            Restangular.all("executions").customPOST(ids, "kill?storeState="+false).then(function(d){
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    };

    $scope.rerunExecution = function() {
        auxo.openConfirmDialog($scope, ngDialog, "确认要重启"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？", function(){
            var ids = $scope.getSelectRowIds();
            Restangular.all("executions").customPOST(ids, "rerun").then(function(d){
                $scope.fetchPage($scope.ptableState);
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    };

    angular.extend(auxo.meta.executionHistory,
        {
            currUrl:"/design/process/" + $scope.id + "/history",
            status:$stateParams.status,
            getBaseFilter: function() {
                var filter = "flowId="+$scope.id;
                if($scope.scheduleId)
                    filter += "&fshId=" + $scope.scheduleId;
                return filter;
            },
        });

    CrudBaseController.call(this, auxo.meta.executionHistory, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

    //auxo.startEventSource($scope);
};

App.controller('processExecutionHistoryController', processExecutionHistoryController)