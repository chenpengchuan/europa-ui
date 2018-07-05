

auxo.meta.processconfig = {
	currUrl:"/processconfig",
	restRootPath:"processconfigs",
	path:"/processconfig",
	detailTemplate : "",
	entityDisplayName:"流程管理配置",
	getBaseFilter: function() {
		return "";
	},
	rowHeaders : 	[{name : "name", disName : "name", sortName: "name_sort", converter : auxo.same},
		{name : "className", disName : "完整类名", converter : auxo.same},
//	                     {name : "jarpath", disName : "包路径", converter : auxo.same},
		{name : "parameterlist", disName : "参数个数", converter : auxo.same},
		{name : "returnType", disName : "返回类型", converter : auxo.same},
		{name : "processConfigType", disName : "类型", converter : auxo.same},
		{name : "createTime", disName : "创建时间", converter : auxo.date2str},
		{name : "creator", disName : "创建人", converter : auxo.same},
		{name : "lastModifier", disName : "修改人", converter : auxo.same},
		{name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}]

};
App.controller('ProcessConfigController', function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
	CrudBaseController.call(this, auxo.meta.processconfig, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
								          //meta, $scope, $location, $window, $http, Restangular, ngDialog, $filter
})

App.controller('EditProcessConfigController', function EditTagController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular) {

	if($scope.$stateParams)
		$stateParams = $scope.$stateParams;
	$scope.processConfigType = $stateParams.processConfigType;
	//目前最多可以选择5个参数
	$scope.parameterlists = [{label:"1", value: "1"}, 
	                         {label:"2", value: "2"}, 
	                         {label:"3", value: "3"}, 
	                         {label:"4", value: "4"},
	                         {label:"5", value: "5"}];
	//目前支持string,float,int,integer,tinyint,smallint,bigint,double,decimal,binary,boolean,date,timestamp*/
	$scope.returnTypes = [{label:"string", value: "string"}, 
	                         {label:"float", value: "float"}, 
	                         {label:"int", value: "int"}, 
	                         {label:"integer", value: "integer"}, 
	                         {label:"tinyint", value: "tinyint"},
	                         {label:"smallint", value: "smallint"},
	                         {label:"bigint", value: "bigint"},
	                         {label:"double", value: "double"},
	                         {label:"decimal", value: "decimal"},
	                         {label:"binary", value: "binary"},
	                         {label:"boolean", value: "boolean"},
	                         {label:"date", value: "date"},
	                         {label:"timestamp", value: "timestamp"},
	                         ];
	EditBaseController.call(this, auxo.meta.processconfig, $scope, $window, $http, $stateParams, $location, ngDialog, Restangular)
});