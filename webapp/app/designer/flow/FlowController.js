
auxo.meta.flow = {
	currUrl:"/dataflow",
		restRootPath:"flows",
		detailTemplate : "",
		entityDisplayName:"流程",
		getBaseFilter: function() {
			return "flowType=dataflow|workflow|streamflow";
		},
		rowHeaders : [{name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
//			              {name : "id", disName : "ID", converter : auxo.same},
//			              {name : "description", "disName" : "描述", converter : auxo.same},
					  {name : "flowType", "disName" : "类型", converter : auxo.same},
					  {name : "version", "disName" : "版本", converter : auxo.same},
					  {name : "createTime", disName : "创建时间", converter : auxo.date2str},
					{name : "creator", disName : "创建人", converter : auxo.same},
					{name : "lastModifier", disName : "修改人", converter : auxo.same},
					{name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
						 ]
};
App.controller('FlowController', function($state, $filter,$scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {

	$scope.selectedDataflowWorkflows = []

	CrudBaseController.call(this, auxo.meta.flow, $scope, $location, $window, $http, Restangular, ngDialog, $filter, $stateParams);

	function getRows(types) {
		var array = []
		auxo.forEachArray($scope.selectedRows, function (e, i) {
			if (types) {
				if (types.indexOf(e.flowType) >= 0)
					array.push(e)
			} else
				array.push(e)
		})
		return array;
	}

	function getDataflowWorkflowRows() {
		return $scope.selectedDataflowWorkflows = getRows(["dataflow", "workflow", "streamflow"]);
	}

	$scope.isDeleteDisabled = function () {
		return getDataflowWorkflowRows().length == 0
	}

	$scope.isCopyDisabled = function () {
		if(getDataflowWorkflowRows().length == 0){
			return true;
		}else{
			$scope.copyToUlr=function(){
				$location.path("/design/process/"+$scope.selectedDataflowWorkflows[0].id+'/'+'copy'+'/'+$scope.selectedRows[0].flowType);
			}
			 return false;
		}
	}

	/*$scope.isPreviewDisabled = function () {
		return getDataflowWorkflowRows().length == 0
	}*/
	$scope.isPreviewDisabled=function(){
		if(getDataflowWorkflowRows().length == 0){
			return true;
		}else{
			$scope.previewToUrl=function(){
				$location.path("/design/process/"+$scope.selectedDataflowWorkflows[0].id+'/'+'edit'+'/'+$scope.selectedRows[0].flowType);
			}
			return false;
		}
	}
	$scope.delete = function() {
		var msg = "";
		if($scope.selectedDataflowWorkflows.length != $scope.selectedRows.length)
			msg = "<br>（只有dataflow和workflow可以删除）"

		auxo.openConfirmDialog($scope, ngDialog, "要删除"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？" + msg, function(){
			//var ids = getSelectRowIds();
			var ids = []
			auxo.forEachArray($scope.selectedDataflowWorkflows, function (row) {
				ids.push(row.id)
			})
			
			Restangular.all($scope.restRootPath).customPOST(ids, "removeList").then(function(d){
				$scope.fetchPage($scope.ptableState);
			}, function(err){
				auxo.openErrorDialog($scope, ngDialog, err.data.err);
			});
		});
	}
	
	$scope.hasCheckbox = function (row) {
		var has = true;
		if(row.flowType==='shell' || row.flowType==='spark')
			has = false;
		return has;
	}
	
});