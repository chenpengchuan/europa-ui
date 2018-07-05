auxo.meta.collector = {
	currUrl:"/collector",
	restRootPath:"/europa/collectors",
	path:"/collector",
	detailTemplate : "",
	entityDisplayName:"采集器",
	getBaseFilter: function() {
		return "";
	},
	rowHeaders : [
		        {name : "id", disName : "ID", disableSort:false, converter : auxo.same},
		        {name : "name", disName : "名称", disableSort:false, converter : auxo.same},
		        {name : "ip", disName : "IP", disableSort:true, converter : auxo.same},
		        {name : "hostname", disName : "Hostname", disableSort:true, converter : auxo.same},
                {name : "startedTime", disName : "启动时间", disableSort:true, converter : auxo.date2str},
                {name : "owner", disName : "所有者", disableSort:true, converter : auxo.same},
                {name : "status", disName : "状态", disableSort:false, converter : auxo.same},
	],
	sorts: 'status', reverse: true,

};


App.controller('CollectorController', function($filter, $scope,$state, $location, $window, $http,$stateParams, Restangular, ngDialog,sgDialogService) {
	CrudBaseController.call(this, auxo.meta.collector, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

	/* $scope.javaPath = "/usr/jdk64/jdk1.8.0_77";
        $scope.installPath = "/app/linkoop/collecter";*/

	// 注册
	$scope.registered = function(){
        auxo.sgDialogService.openModal({
            templateUrl: 'app/collector/collectorRegistered.html',
            controller: 'CollectorRegisteredController',
            data: {
                reloadPage: $scope.doQuery
            },
            callback: function(facetResult){
                  $scope = fecetResult;
            },
            // data: {fromparent: {collId: $scope.id, taskCount: $scope.count,detail: $scope.entity}},
            // data: {fromparent: {collId: $scope.id, collName: $scope.name,collSecretKey: $scope.secretKey}},
            width: 600,
            height:800,
        });
    };

    $scope.go = function(){
        $state.go('collectorJobList',{ id: '_ALL_COLLECTER_JOBS_'})
    }

    // 编辑
    $scope.edit = function(){
         auxo.sgDialogService.openModal({
             templateUrl: 'app/collector/collectorRegistered.html',
             controller: 'CollectorRegisteredController',
             data: {fromparent: {selected: $scope.selectedRows}, reloadPage: $scope.doQuery},
             width: 700
         });
    };

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
            Restangular.all($scope.restRootPath).customPOST(ids, "removeList").then(function(d){
                //location.href="/#/collector";
                $scope.doQuery()
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
     };

    // 升级
    $scope.upgrade = function(){
         auxo.sgDialogService.openModal({
             templateUrl: 'app/collector/collectorUpgrade.html',
             controller: 'CollectorUpgradeController',
             data: {fromparent: {selected: $scope.selectedRows}, reloadPage: $scope.doQuery},
             width: 600
         });
    };

    // 获取资源目录的id
    var getIds = (function(){
        Restangular.all("resource/roots").getList({excludes:"dataSource"}).then(function(roots) {
        var e,ele;
            for(var i = 0; i< roots.length; i++){
                e = roots[i];
                if(e.name === "数据源"){
                    $scope.id1 = e.id;
                    var children = e.children;
                    for(var j = 0; j< children.length; j++){
                        ele = children[j];
                        if(ele.name === "采集器"){
                            $scope.id2 = ele.id;
                            break;
                        }
                    }
                    break;
                }
            }
        });
    })();

    // 添加资源目    `
    $scope.addDir = function(row){
        var id3 = row.resourceId;
//        $state.go('resourceMan_toExpandedNodes',{toExpandedNodes: [$scope.id1, $scope.id2, id3]})
        var url = $state.href('resourceMan_toExpandedNodes',{id1 : $scope.id1, id2 : $scope.id2, id3 : id3})
        window.open(url)
    };

    // 查看日志
    var openLog = function (row) {
       auxo.sgDialogService.openModal({
           templateUrl: 'app/collector/collectorLog.html',
           controller: 'CollectorLogController',
           data: {fromparent: {collId: $scope.id, taskCount: $scope.count, entity: row, detail: $scope.entity}},
           width: 800,
           height: 800
       });
   };

    $scope.taskLog = openLog;
})

