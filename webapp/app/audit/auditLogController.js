//  name --> action
//  creator --> client (ip)
//  createTime --> log createTime
//  lastModifier --> object (id)
//  lastModifiedTime --> cost (ms)
//  expiredTime      -->
//  owner            --> subject (login id)
//  version          -->
//  moduleVersion    --> current moduleVersion
//  enabled          -->
//  description      --> detail
//  tags             --> level (error/info/warn) & category (user, tag, flow)
//  tenant           --> tenant



angular.module('AuxoApp')
    .controller('AuditLogController',function(userArray, $filter,$scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {

        $scope.userArray = userArray;

        $scope.isCheckEnabled = function (rowData) {
            return false;
        }

        $scope.isLinkEnabled = function (col, rowData) {
            if(col === 'detail')
                return true;
            return false;
        }

        $scope.showDetail = function (row) {
            var msg = angular.fromJson(row.description);
            auxo.showErrorMsg(msg);
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
            $scope.onDateRangeApply();
        };

        auxo.meta.auditlog = {
            currUrl:"/auditlogs",
            restRootPath:"europa/auditlogs",
            detailTemplate : "",
            entityDisplayName:"审计日志",
            getBaseFilter: function() {

                return "";

            },
            sorts: "createTime",
            dateRangeFilterField : "createTime",
            rowHeaders : [
                //{name : "id", disName : "id", converter : auxo.same},
                {name : "name", disName : "操作", sortName: "name_sort", converter : auxo.same},
                {name : "creator", disName : "客户端IP", converter : auxo.same},
                {name : "createTime", disName : "创建时间", converter : auxo.date2str},
                {name : "lastModifier", disName : "对象Id", converter : auxo.same},
                {name : "lastModifiedTime", disName : "处理时间(ms)", converter : auxo.same},
                {name : "owner", disName : "用户Id", converter : auxo.same},
                //{name : "moduleVersion", disName : "版本号", converter : auxo.same},
                //{name : "description", disName : "详细", converter : auxo.same},
                //{name : "tags", disName : "类别", converter : auxo.same},
                //{name : "tenant", disName : "租户", converter : auxo.same}
            ]
        };

        CrudBaseController.call(this, auxo.meta.auditlog, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

    });