App.controller('HippoMonitorMainController', function HippoMonitorMainController($scope, $location, $window, $http, $stateParams, Restangular, ngDialog, Auth){
    $scope.tabs = [ $scope.runningTab = {
        title : '运行中',
        count: 0,
        status : 'RUNNING',
        icon: "mdi mdi-run text-info"
    }, $scope.readyTab = {
        title : '就绪',
        count: 0,
        status : 'READY',
        icon: "glyphicon glyphicon-ok-circle text-primary"
    }, $scope.succeededTab = {
        title : '已成功',
        count: 0,
        status : 'SUCCEEDED',
        icon: "glyphicon glyphicon-ok-sign text-success"
    }, $scope.failedTab ={
        title : '已失败',
        count: 0,
        status : 'FAILED',
        icon: "glyphicon glyphicon-exclamation-sign text-danger"
    }, $scope.killedTab = {
        title : '已杀死',
        count: 0,
        status : 'KILLED',
        icon: "glyphicon glyphicon-remove-sign text-danger"
    }, $scope.unknownTab = {
        title : '未知',
        count: 0,
        status : 'UNKNOWN',
        icon: "glyphicon glyphicon-question-sign text-warning"
    }

    ];


    $scope.selectTab = function(tab) {
        if ($scope.selectedTabStatus != tab.status) {
            $location.path("/hippo/monitor/"+tab.status).search({currPage:1});
        }
    };

    $scope.selectedTabStatus = $stateParams.status || "RUNNING";

    for (var i = 0; i < $scope.tabs.length; i++) {
        if ($scope.selectedTabStatus == $scope.tabs[i].status) {
            $scope.active = i;
            break;
        }
    }

});

auxo.meta.monitor = {
    currUrl:"/hippo/monitor",
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

var HippoMonitorController = function($filter, $scope, $location, $window, $http, $stateParams, Restangular, ngDialog) {

    //用户Kill进程
    $scope.killExecution = function() {
        var template = "<div>";
        template += "<p><i>确认要停止"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？<i></p>";
        template += "<input type='checkbox' ng-model='input' />保存状态（仅对Streamflow有效）";
        template += "</div>"
        auxo.openConfirmFormDialog($scope, ngDialog, template, {value: false}, function(value){
            var ids = $scope.getSelectRowIds();
            Restangular.all("executions").customPOST(ids, "kill?storeState="+value).then(function(d){
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    };

    angular.extend(auxo.meta.monitor,
        {
            currUrl:"/hippo/monitor",
            status:$stateParams.status,
            getBaseFilter: function() {
                // var filter = "status_stype="+$scope.$parent.selectedTabStatus + "&source=rhinos";
                var filter = "status_stype="+$scope.$parent.selectedTabStatus ;
                return filter;
            },
            selectedTabStatus : $stateParams.status || "RUNNING",
        });

    CrudBaseController_hippo.call(this, auxo.meta.monitor, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

    auxo.startEventSource($scope);
};

App.controller('HippoMonitorController', HippoMonitorController)

