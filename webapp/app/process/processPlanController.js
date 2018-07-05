auxo.meta.process_schedule = {
    currUrl:"/design/process/:id/plan",
    restRootPath:"schedulers",
    detailTemplate : "",
    entityDisplayName:"计划",
    getBaseFilter: function() {
        return "";
    },
    selectedTabStatus : "RUNNING",
    rowHeaders : [{name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
        {name : "enabled", disName:"启停状态" , converter : auxo.same},
        //{name : "version", disName : "版本", converter : auxo.same},
        {name : "flowName", disName : "流程", converter : auxo.same},
        {name : "createTime", disName : "创建时间", converter : auxo.date2str},
        //{name : "period", disName : "周期情况", converter : same},
        {name : "creator", disName : "创建人", converter : auxo.same},
        {name : "lastModifier", disName : "修改人", converter : auxo.same},
        {name : "totalExecuted", disName : "执行次数", converter : auxo.same},
        {name : "configurations", disName : "周期情况", converter : function (c) { return c.cron || "一次性";}, disableSort:true}
    ]
};
var processPlanController = function($state, $filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
    $scope.id = $stateParams.id;

    angular.extend(auxo.meta.process_schedule,
        {
            currUrl:"/design/process/" + $scope.id + "/plan",
            getBaseFilter: function() {
                var filter = "flowId="+$scope.id;
                return filter;
            },
        });

    CrudBaseController.call(this, auxo.meta.process_schedule, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

    $scope.buttonStatus = {
        "enable" : true,
        "stop" : true,
        "delete" : true
    }

    $scope.$watch('selectedRows.length', function (newValue, oldValue) {
        var selectedRows = $scope.selectedRows;
        buttonStatusRecover();
        if(selectedRows.length > 0) {
            $scope.buttonStatus['delete'] = false;
            for(var i in selectedRows) {
                if(selectedRows[i].enabled === 0) {
                    $scope.buttonStatus['enable'] = false;
                    continue;
                }

                if(selectedRows[i].enabled === 1) {
                    $scope.buttonStatus['stop'] = false;
                }
            }
        }
    });


    function resetQuery() {
        $scope.currPage = 1;
        $scope.reverse = true;
        $scope.sorts = "lastModifiedTime"
        $scope.ptableState = {
            pagination: {
                start: $scope.currPage>0?$scope.currPage-1:0,
                totalItemCount: 0
            },
            sort: {
                predicate: $scope.sorts,
                reverse: $scope.reverse
            }
        }
    }

    $scope.goToExecutions = function(processId, scheduleId) {
        resetQuery();
        $state.go("design.process_detail.execution_history", {"id":processId, "fshId" : scheduleId});
    }

    $scope.createSchedule = function () {
        $state.go("schedule_detail", {'id': 'new', 'pid':$scope.id});
    }

    function buttonStatusRecover() {
        $scope.buttonStatus["enable"] = true;
        $scope.buttonStatus["stop"] = true;
        $scope.buttonStatus["delete"] = true;
    }
};

App.controller('ProcessPlanController', processPlanController)