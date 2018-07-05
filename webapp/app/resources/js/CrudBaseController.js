function CrudBaseController(meta, $scope, $location, $window, $http, Restangular, ngDialog, $filter, $stateParams) {

    $scope.other = $scope.$parent.other;
    $scope.flowTypeFilter = "all";
    $scope.userFilter="";

    var ARGS = auxo.listSearchParamString.split("&");

    $scope.searchParams = auxo.$rootScope.searchParams = auxo.$location.search();
    auxo.array.forEach(ARGS, function (e) {
        $scope[e] = $scope.searchParams[e];
    })

    if(!$scope.limit)
        $scope.limit = 10;
    if(!$scope.currPage)
        $scope.currPage = 1;
    if(!$scope.reverse)
        $scope.reverse = true;
    if(!$scope.queryWord)
        $scope.queryWord="";
    if(!$scope.path)
        $scope.path = auxo.$location.path();
    if(!$scope.other) {
        $scope.other = {};
    } else {
        var args = auxo.parseOtherParameter($scope.other);
        $scope.other = {};
        if(args) {
            $scope.other = args;
            for (k in args) {
                if(k === 'owner') {
                    $scope.userFilter = args[k];
                } else {
                    $scope[k] = args[k];
                }
            }
        }
    }

    $scope.tagfilters = {}
    if($scope.tagSelection) {
        auxo.array.forEach($scope.tagSelection.split(";"), function (e) {
            $scope.tagfilters[e] = true;
        })
    }else
        $scope.tagSelection = ""


    /**
     * meta MUST contains fields:
     *
     * (1) restRootPath = "flows"
     * (2) detailTemplate = "schedule/scheduleDetail.html"
     * (3) entityDisplayName = "流程"
     * (4) getBaseFilter
     * (4) rowHeaders = [{name : "name", disName : "名称", converter : auxo.same}, ..]
     */

    for (var mf in meta) {
        this[mf] = meta[mf];
        $scope[mf] = meta[mf];
    }

    $scope.dateRangeFilterField = $scope.dateRangeFilterField || "lastModifiedTime";

    if (!$scope.sorts) {
        var predicate = 'createTime';
        angular.forEach($scope.rowHeaders, function (e) {
            if(e.name === 'lastModifiedTime')
                predicate = e.name;
        })
        $scope.sorts = predicate;
    }

    $scope.go = function(hash) {
        auxo.$location.url(hash);
    }

    $scope.ptableState = {
        pagination: {
            start: $scope.currPage>0?$scope.currPage-1:0,
            totalItemCount: 0
        },
        sort: {
            predicate: $scope.sorts,
            reverse: $scope.reverse
        },
        search: {

        }
    }

    auxo.initTagsAndTagColorMap(Restangular, $scope);

    $scope.rowCollection = [];

    if($scope.view === undefined)
        $scope.view = {};

    $scope.view.currentPageNumber = $scope.currPage ? $scope.currPage : 1;

    $scope.changeCurrentPageNumber = function(cp) {
        if (cp < 1) {
            cp = 1;
        }
        $scope.view.currentPageNumber = cp;

        if(!$scope.ptableState) {
            return;
        }
        $scope.ptableState.pagination.start = cp - 1;
        $scope.currPage = cp;

        $scope.reloadPage();
    }

    $scope.doTagFilter = function() {
        var ss = [];
        for(var k in $scope.tagfilters) {
            if($scope.tagfilters[k])
                ss.push(k)
        }
        $scope.tagSelection = ss.join(";")
        $scope.changeCurrentPageNumber(1);
    }

    $scope.selectedRows = [];

    $scope.doQuery = function(queryWord) {
        $scope.queryWord = queryWord;
        delete $scope.offset;
        delete $scope.currPage;
        $scope.other.ts = new Date().getTime();
        $scope.reloadPage();
    }

    $scope.onTagSelected=function() {
//		alert($scope.tagSelected);
    }

    function findSortIndex(name, $scope) {
        for (var i = 0; i < $scope.rowHeaders.length; i++) {
            if ($scope.rowHeaders[i].name == name) {
                return $scope.rowHeaders[i].sortName || name;
            }
        }
    }

    $scope.reloadPage = function(limit) {
        if(limit)
            $scope.limit = limit;
        function buildPathParams() {
            var ss = {}
            auxo.array.forEach(ARGS, function (e) {
                ss[e] = $scope[e]
                if(e === "other") {
                    ss[e] = auxo.buildOtherString($scope[e])
                }
            })
            return ss;
        }

        auxo.$location.search(buildPathParams())
    }
    //$scope.reloadPage = reloadPage;

    $scope.fetchPage = function(tableState) {
        if(parseInt($scope.currPage)){
            $scope.view.currentPageNumber=parseInt($scope.currPage);
            tableState.pagination.start=$scope.currPage-1;
        }
        if (!tableState.sort.predicate) {
            tableState.sort.predicate = $scope.sorts;
            tableState.sort.reverse = $scope.reverse;
        }

        $scope.reverse = tableState.sort.reverse;
        $scope.sorts = tableState.sort.predicate;


        var queryWord = $scope.queryWord;
        var tagfacets = $scope.tagfacets = []
        $scope.ptableState = tableState;
        var filter = $scope.getBaseFilter();
        var ftags = [];
        var sorts = "";

        var timePeriod = $scope.getDateRangeFilter();
        if(timePeriod) {
            if (filter.length > 0) {
                filter += "&";
            }
            filter += timePeriod;
        }
        var flowTypeFilter = getFlowTypeFilter();
        if(flowTypeFilter) {
            if(filter)
                filter += "&";
            filter += flowTypeFilter;
        }
        if($scope.getOtherFilter) {
            var otherFilter = $scope.getOtherFilter();
            if(otherFilter) {
                if(filter)
                    filter += "&";
                filter += otherFilter;
            }
        }

        var userFilter = getUserFilter();
        if(userFilter) {
            if(filter)
                filter += "&";
            filter += userFilter;
        }

        var sortItem = findSortIndex(tableState.sort.predicate, $scope)
        sorts = sortItem ?(tableState.sort.reverse ? "-" : "+") + sortItem :findSortIndex(tableState.sort.predicate, $scope)

        for (var tag in $scope.tagfilters) {
            if ($scope.tagfilters[tag]) {
                ftags.push(tag);
            }
        }

        if (ftags.length > 0) {
            if (filter.length > 0) {
                filter += "&";
            }
            filter += "tags="+ftags.join("|")
        }

        Restangular.one($scope.restRootPath).get({query : queryWord, offset: tableState.pagination.start * $scope.limit, limit : $scope.limit, filter : filter, sorts : sorts})
            .then(function(facetResult){
                for(var i in facetResult.content){
                    if(facetResult.content[i].enabled == false){
                        facetResult.content[i].enabled=0;
                    } else if(facetResult.content[i].enabled == true) {
                        facetResult.content[i].enabled=1;
                    }
                }

                /*for(var i in facetResult.content){
                    if(facetResult.content[i].enabled===0){
                        facetResult.content[i].enabled='未启用';
                    }else{
                        facetResult.content[i].enabled='正常';
                    }
                }*/

                var statusArray = {
                    'RUNNING':0,
                    'SUCCEEDED':0,
                    'FAILED':0,
                    'KILLED':0,
                    'UNKNOWN':0
                };

                console.info(facetResult);

                $scope.rowCollection = facetResult.content;
                $scope.total = facetResult.total;
                $scope.totalPages = facetResult.totalPages;

                if($scope.currPage>facetResult.totalPages && $scope.currPage!=1) {
                    $scope.currPage = 1;
                    $scope.reloadPage();
                }

                if ($scope.selectedRows && $scope.selectedRows.length > 0) {
                    var rows = [].concat($scope.selectedRows);
                    auxo.array.removeAll($scope.selectedRows);
                    auxo.array.forEach($scope.rowCollection, function (e) {
                        auxo.array.forEach(rows, function (e1) {
                            if (e.id === e1.id) {
                                e.isSelected = true;
                                return false;
                            }
                        })
                    })
                }

                var fc = facetResult.facetContent;
                for (var fci in fc) {
                    if ( fc[fci].field == "status_stype") {
                        if ($scope[fc[fci].facet.toLowerCase()+"Tab"]) {
                            statusArray[fc[fci].facet] = 1;
                            $scope[fc[fci].facet.toLowerCase()+"Tab"].count = fc[fci].count;
                        }
                    }else {
                        tagfacets.push({name : fc[fci].facet, count : fc[fci].count, color : $scope.tagsColorMap[fc[fci].facet]})
                    }
                }

                //$scope.currPage=null;
                for(var status in statusArray) {
                    if(statusArray[status] === 0 && $scope[status.toLowerCase() + "Tab"]) {
                        $scope[status.toLowerCase() + "Tab"].count = 0;
                    }
                }

                if($scope.afterFetch) {
                    $scope.afterFetch(facetResult);
                }
            })
    }

    $scope.tagfacets = [];

    var statusColorMap = {
        "RUNNING" : "primary",
        "FAILED" : "danger",
        "SUCCEEDED" : "success",
        "KILLED" : "warning"
    };

    $scope.statusColor = function(s) {
        return statusColorMap[s['type']];
    }

    //获取选中的id
    function getSelectRowIds() {
        var ids = [];
        for (var i = 0; i < $scope.selectedRows.length; i++) {
            ids.push($scope.selectedRows[i].id);
        }
        return ids;
    }

    $scope.getSelectRowIds = getSelectRowIds;

    $scope.remove = function() {
        auxo.openConfirmDialog($scope, ngDialog, "真的要删除"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？", function(){
            var ids = getSelectRowIds();
            Restangular.all($scope.restRootPath).customPOST(ids, "removeList").then(function(d){
                $scope.fetchPage($scope.ptableState);
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    }

    //启用
    $scope.enabledList = function() {
        auxo.openConfirmDialog($scope, ngDialog, "确认要启用"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？", function(){
            var ids = getSelectRowIds();
            Restangular.all($scope.restRootPath).customPOST(ids, "enable").then(function(d){
                $scope.fetchPage($scope.ptableState);
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    };

    //停用
    $scope.disabledList = function() {
        auxo.openConfirmDialog($scope, ngDialog, "确认要停用"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？", function(){
            var ids = getSelectRowIds();
            Restangular.all($scope.restRootPath).customPOST(ids, "disable").then(function(d){
                $scope.fetchPage($scope.ptableState);
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });

    };

    $scope.addTags = function() {
        var ids = getSelectRowIds();
        Restangular.all($scope.restRootPath)
            .customPOST([$scope.tags[$scope.tagSelected].name], auxo.escapeUri(ids.join(","))+"/tags/add").then(function(){
            $scope.fetchPage($scope.ptableState);
        });
    }

    $scope.removeTags = function() {
        var ids = getSelectRowIds();
        Restangular.all($scope.restRootPath)
            .customPOST([$scope.tags[$scope.tagSelected].name], auxo.escapeUri(ids.join(","))+"/tags/remove").then(function(){
            $scope.fetchPage($scope.ptableState);
        });
    }

    $scope.showDetailDialog = function(id) {
        var create = id == null;
        $scope.main = {};
        var dialog = ngDialog.open({
            template: 'app/'+this.detailTemplate,
            className: 'ngdialog-theme-default',
            scope: $scope,
//			width : "50%",
            closeByDocument : false,
            showClose: true
        });
        dialog.closePromise.then(function (data) {
            alert(data.value);
        });
    }

    $scope.openCreateDialog = function() {
        $scope.showDetailDialog(null);
    };

    //初始化页面时间插件
    $scope.dateRange = {
        startDate: $scope.startDate? moment($scope.startDate):"",
        endDate: $scope.endDate? moment($scope.endDate):"",
    }; //页面时间:startDate: "初始值的起始时间", endDate: "结束时间"

    //自定义getDateRangeFilter
    $scope.getDateRangeFilter = function(){
        //$('#dateRange')
        if($scope.dateRange.startDate && $scope.dateRange.endDate){
            //时间格式: createTime=[2016-07-03T00:00:00Z TO 2016-07-04T00:00:00Z]   毫秒  format("yyyy-MM-ddThh:mm:ssZ")
            return $scope.dateRangeFilterField+"=["+$filter('date')($scope.dateRange.startDate.toDate()-8*60*60*1000, "yyyy-MM-ddTHH:mm:ss'Z'")
                +" TO "+ $filter('date')($scope.dateRange.endDate.toDate()-8*60*60*1000, "yyyy-MM-ddTHH:mm:ss'Z'") +"]";
        }else{
            return "";
        }
    };

    //daterangepicker时间插件apply对应方法
    $scope.onDateRangeApply=function(ev, picker) {
        if($scope.dateRange.startDate)
            $scope.startDate = $filter('date')($scope.dateRange.startDate.toDate(), "yyyy-MM-dd")
        else
            $scope.startDate = ""
        if($scope.dateRange.endDate)
            $scope.endDate = $filter('date')($scope.dateRange.endDate.toDate(), "yyyy-MM-dd")
        else
            $scope.endDate = ""
        $scope.doTagFilter();
    };

    function getFlowTypeFilter() {
        var filter = "";
        if($scope.flowTypeFilter && $scope.flowTypeFilter !== 'all' ) {
            filter += "flowType="+$scope.flowTypeFilter;
        }
        return filter;
    }
    function getUserFilter() {
        var filter = "";
        if($scope.userFilter && $scope.userFilter !== '' ) {
            filter += "owner="+$scope.userFilter;
        }
        return filter;
    }

    //为时间input添加keydown事件，指定backspace
    $scope.keydown = function ($event) {
        if($event.keyCode==46){
            $scope.dateRange = {
                startDate: null,
                endDate: null
            };
        }
    };

    $scope.export = function () {
        auxo.sgDialogService.openModal({
            templateUrl : 'app/designer/flow/export.html',
            //controller : 'StepFormController', // specify controller for modal
            data:{selectedRows: $scope.selectedRows, totalRows: $scope.total, dataType: "flow"},
            width:600
        });
    }

    $scope.import = function () {
        auxo.sgDialogService.openModal({
            templateUrl : 'app/designer/flow/import.html',
            //controller : 'StepFormController', // specify controller for modal
            data:{selectedRows: $scope.selectedRows, totalRows: $scope.total, dataType: "flow"},
            width:800
        });
    }

    $scope.onFlowTypeChange = function (flowType) {
        $scope.other.flowTypeFilter = $scope.flowTypeFilter = flowType;
        $scope.reloadPage();
    }

    $scope.onUserChange  = function (user) {
        $scope.other.userFilter = $scope.userFilter = user;
        $scope.reloadPage();
    }
    $scope.$on("$destroy", function() {
        if($scope.onDestroy) {
            $scope.onDestroy();
        }
    });

    $scope.onDestroy = function() {
        console.log("Destroy is being called.CrubBaseController")
    }
}

function EditBaseController(meta, $scope, $window, $http, $stateParams, $location, ngDialog, Restangular) {
    var isNew = $scope.isNew = $stateParams.id == "new";

    $scope.entityDisplayName = meta.entityDisplayName;

    $scope.error = false;

    if (isNew) {
        $scope.entity={ };
        meta.onNew && meta.onNew($scope.entity);
    }else {
        Restangular.one(meta.restRootPath, $stateParams.id).get().then(function(entity) {
            $scope.entity = entity;
            meta.onFetch && meta.onFetch($scope.entity);
        });
    }

    $scope.save = function() {
        $scope.saving = true;
        meta.onSave && meta.onSave($scope.entity);
        if ($scope.isNew) {
            Restangular.all(meta.restRootPath).post($scope.entity).then(
                function(){
                    $scope.saving = false;
                    auxo.delHotkey($scope)
                    auxo.loadPage(meta.currUrl, {});
                },
                function(es) {
                    $scope.saving = false;
                    $scope.error = es.data;
                });
        }else {
            $scope.entity.put().then(
                function(){
                    $scope.saving = false;
                    auxo.delHotkey($scope)
                    auxo.loadPage(meta.currUrl);
                },
                function(es) {
                    $scope.saving = false;
                    $scope.error = es.data;
                });
        }
    }

    $scope.cancel = function() {
        //auxo.loadPage(meta.currUrl);

        auxo.delHotkey($scope)
        auxo.goBack();
    }

    auxo.bindEscEnterHotkey($scope)
    $scope.onTaskTypeChange = function (taskType) {
        $scope.other.taskTypeFilter = $scope.taskTypeFilter = taskType;
        reloadPage();
    }

    function getTaskTypeFilter() {
        var filter = "";
        if($scope.taskTypeFilter && $scope.taskTypeFilter !== 'all' ) {
            filter += "taskType="+$scope.taskTypeFilter;
        }
        return filter;
    }

    //获取选中的status
    function getSelectRowStatus() {
        var status = [];
        for (var i = 0; i < $scope.selectedRows.length; i++) {
            status.push($scope.selectedRows[i].status);
        }
        return status;
    }
    $scope.getSelectRowStatus = getSelectRowStatus;
}
