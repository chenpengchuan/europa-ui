/**
 * Created by youguili on 2016/9/19.
 */
angular.module('AuxoApp')
    .controller('testPageController',function($scope, $location, $window, $http, $stateParams,Restangular, Auth,sgDialogService) {
        var meta = {
            restRootPath:"users",
            detailTemplate : "",
            entityDisplayName:"用户",
            getBaseFilter: function() {
                return "";
            }
        };
        for (var mf in meta) {
            this[mf] = meta[mf];
            $scope[mf] = meta[mf];
        }

        this.ptableState={};
        if(!$scope.sort){
            $scope.sort={predicate:"createTime",reverse:true}
        }
        $scope.doQuery=function(queryWord){
            $scope.queryWord=queryWord;
            $scope.tagfilters=[];
            $scope.changeCurrentPageNumber(1);
        }
        if($scope.view === undefined)
            $scope.view = {};
        $scope.view.currentPageNumber=1;
        $scope.changeCurrentPageNumber=function(cp){
            if(cp<1){
                cp=1;
            }else if(cp>$scope.totalPages){
                cp=$scope.totalPages;
            }
            $scope.view.currentPageNumber=cp;
            $scope.ptableState.pagination.start=cp-1;
            $scope.fetchPage($scope.ptableState,$scope.currentSelect);

        };
        
        auxo.initTagsAndTagColorMap(Restangular, $scope);


       // CrudBaseController.call(this, meta, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
        function findSortIndex(name, $scope) {
            for (var i = 0; i < $scope.rowHeaders.length; i++) {
                if ($scope.rowHeaders[i].name == name) {
                    return $scope.rowHeaders[i].sortName || name;
                }
            }
        }
        function computeQueryWord(qw) {
            return qw;
        }
        $scope.rowCollection = [];

        $scope.onTagSelected=function() {
            if($scope.queryWord){
                $scope.queryWord='';
            }
            $scope.ptableState.pagination.start=0;
            $scope.view.currentPageNumber=1;
            changeData($scope.currentSelect);
            $scope.fetchPage($scope.ptableState,$scope.currentSelect);
        }
        $scope.fetchPage = function(tableState,urls) {
            $scope.tagUrl=typeof urls==='string'?urls:"schemas";
            var queryWord = computeQueryWord($scope.queryWord);
            var tagfacets = $scope.tagfacets = []
            $scope.ptableState = tableState;
            var filter = $scope.getBaseFilter();
            var ftags = [];
            var sorts = "";

            if (!tableState.sort.predicate) {
                tableState.sort.predicate = $scope.sort.predicate;
                tableState.sort.reverse = $scope.sort.reverse;
            }

            sorts = (tableState.sort.reverse ? "-" : "+") + findSortIndex(tableState.sort.predicate, $scope)

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

            Restangular.one($scope.tagUrl).get({query : queryWord, offset: tableState.pagination.start * 10, limit : 10, filter : filter, sorts : sorts})
                .then(function(facetResult){
                    $scope.rowCollection = facetResult.content;
                    $scope.total = facetResult.total;
                    $scope.totalPages = facetResult.totalPages;
                    var fc = facetResult.facetContent;
                    for (var fci in fc) {
                        if ( fc[fci].field == "status_stype") {
                            if ($scope[fc[fci].facet.toLowerCase()+"Tab"]) {
                                $scope[fc[fci].facet.toLowerCase()+"Tab"].count = fc[fci].count;
                            }
                        }else {
                            tagfacets.push({name : fc[fci].facet, count : fc[fci].count, color : $scope.tagsColorMap[fc[fci].facet]})
                        }
                    }
                })
        }

//初始化页面时间插件
        $scope.dateRange = {
            startDate: null,
            endDate: null
        }; //页面时间:startDate: "初始值的起始时间", endDate: "结束时间"
        if (!$scope.sort) {
            $scope.sort = {predicate : "createTime" , reverse : true}
        }
        $scope.getBaseFilter = function(){
            //$('#dateRange')
            if($scope.dateRange.startDate != null){
                //时间格式: createTime=[2016-07-03T00:00:00Z TO 2016-07-04T00:00:00Z]   毫秒  format("yyyy-MM-ddThh:mm:ssZ")
                return "createTime=["+$filter('date')($scope.dateRange.startDate.toDate(), "yyyy-MM-ddTHH:mm:ss'Z'")
                    +" TO "+ $filter('date')($scope.dateRange.endDate.toDate(), "yyyy-MM-ddTHH:mm:ss'Z'") +"]";
            }else{
                return "";
            }
        };

        //获取每行选中数据的role信息
        function getselectRowRoles(){
            var roles = [];
            for (var i = 0; i < $scope.selectedRows.length; i++) {
                roles.push($scope.selectedRows[i].roles);
            }
            return roles;
        }
        function getPeriodDesc(c) {
            //alert(c);
            if(c){
                return c.cron||  "一次性";
            }
        }
        $scope.currentSelect="schemas";
        $scope.defaultHeaers=[{name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
            {name : "id", disName : "ID", converter : auxo.same},
            {name : "version", "disName" : "版本", converter : auxo.same},
            {name : "createTime", disName : "创建时间", converter : auxo.date2str},
            {name : "creator", disName : "创建人", converter : auxo.same},
            {name : "lastModifier", disName : "修改人", converter : auxo.same},
            {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
        ];
        function changeData(currentSelect){
            switch(currentSelect){
                case "schemas":
                    $scope.rowHeaders=[
                        {name : "description", "disName" : "描述", converter : auxo.same},
                    ];
                    $scope.rowHeaders=$scope.defaultHeaers.concat($scope.rowHeaders);
                    //angular.extend( $scope.rowHeaders, $scope.defaultHeaers);
                    break;
                case "datasets":
                    $scope.rowHeaders= [
                        {name : "schemaName", disName : "Schema", converter : auxo.same},
                        {name : "schemaVersion", disName : "Schema版本", converter : auxo.same},
                        {name : "storage", disName : "存储方式", converter : auxo.same},
                        {name : "creator", disName : "创建人", converter : auxo.same},
                        {name : "lastModifier", disName : "修改人", converter : auxo.same},
                    ];
                    $scope.rowHeaders=$scope.defaultHeaers.concat($scope.rowHeaders);
                    break;
                case "flows":
                    $scope.rowHeaders=[
                        {name : "flowType", "disName" : "类型", converter : auxo.same},
                    ];
                    $scope.rowHeaders=$scope.defaultHeaers.concat($scope.rowHeaders);
                    break;
                case "schedulers":
                    $scope.rowHeaders=[
                        {name : "flowName", disName : "流程", converter : auxo.same},
                        {name : "totalExecuted", disName : "执行次数", converter : auxo.same},
                        {name : "configurations", disName : "周期情况", converter : getPeriodDesc, disableSort:true}
                    ];
                    $scope.rowHeaders=$scope.defaultHeaers.concat($scope.rowHeaders);
                    break;
                case "executions":
                    $scope.rowHeaders=[
                        {name : "flowShedulerName", disName : "调度", converter : auxo.same},
                        {name : "flowName", disName : "流程名称", converter : auxo.same},
                    ];
                    $scope.rowHeaders=$scope.defaultHeaers.concat($scope.rowHeaders);
                    break;
                case "executionOutputs":
                    $scope.rowHeaders=[
                        {name : "stepPath", disName : "stepPath", converter : auxo.same},
                        {name : "schema", disName : "Schema", converter : auxo.same},
                    ];
                    $scope.rowHeaders=$scope.defaultHeaers.concat($scope.rowHeaders);
                    break;
            }
        }
        changeData($scope.currentSelect);



        $scope.openDialog=function(rowID){
            sgDialogService.openModal({
                templateUrl : 'app/test/testDetailModal.html',
                controller : 'testModalController', // specify controller for modal
                data:{rowID: rowID,tagUrl:$scope.currentSelect},
                callback: function(newData){
                    if(newData) {
                        for (var i in $scope.rowCollection) {
                            if ($scope.rowCollection[i].id === newData.id) {
                                $scope.rowCollection[i] = newData;
                            }
                        }
                    }
                },
                width:1000
            });
        }
    });