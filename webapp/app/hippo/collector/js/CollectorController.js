/**
 * DesignerController
 * @constructor
 */

auxo.meta.nodes = {
		currUrl:"/europa/collectors",
		restRootPath:"/europa/collectors",
		detailTemplate : "",
		entityDisplayName:"采集器",
		getBaseFilter: function() {
			return "";
		},
		rowHeaders : [{name : "id", disName : "ID", converter : auxo.same},
		              {name : "name", disName : "节点名称", sortName: "name_sort", converter : auxo.same},
					  {name : "hostname", disName : "Hostname", converter : auxo.same},
					  {name : "ip", disName : "IP地址", converter : auxo.same},
			          {name : "startedTime", "disName" : "启动时间", converter : auxo.date2str},
			          {name : "owner", disName : "所有者", converter : auxo.same},
					  {name : "createTime", disName : "创建时间", converter : auxo.date2str},
					  {name : "status", disName : "节点状态", converter : function(obj){
                       if(obj === 0){
                          return 'OFFLINE';
                        }else if(obj === 1){
                          return 'ONLINE';
                        }
                       }}
					  ],
					  sorts: 'status', reverse: true,
};
App.controller("CollectorController", function($filter, $scope,$state, $location, $window, $http,$stateParams, Restangular, ngDialog) {
	$scope.go_schema_editOrCopy=function(id,action,currPage){
	//	$location.path("/hippo/nodes/"+id+'/'+action);
	}
	CrudBaseController_hippo.call(this, auxo.meta.nodes, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

    // 查看日志
    var openLog = function (row) {
       auxo.sgDialogService.openModal({
           templateUrl: 'app/hippo/collector/collectorLog.html',
           controller: 'CollectorLogController',
           data: {fromparent: {collId: $scope.id, taskCount: $scope.count, entity: row, detail: $scope.entity}},
           width: 800,
           height: 800
       });
   };

    $scope.taskLog = openLog;

});

