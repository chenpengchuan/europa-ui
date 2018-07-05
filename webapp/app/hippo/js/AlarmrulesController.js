/**
 * DesignerController
 * @constructor
 */

auxo.meta.rules = {
		currUrl:"/hippo/alarm/rules",
		restRootPath:"/europa/alarmrules",
		detailTemplate : "",
		entityDisplayName:"AlarmRules",
		getBaseFilter: function() {
			return "";
		},
		rowHeaders : [{name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
					  {name : "id", disName : "ID", converter : auxo.same},
					  {name : "description", "disName" : "描述", converter : auxo.same},
//					   {name : "conditions", "disName" : "触发条件", converter : auxo.same},
					  {name : "creator", disName : "创建人", converter : auxo.same},
					  {name : "createTime", disName : "创建时间", converter : auxo.date2str},
					   {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str},
					  {name : "principal", disName : "负责人", converter : auxo.same},
					  {name : "email", disName : "通知邮箱", converter : auxo.same},
					  {name : "type", disName : "告警等级", converter : function(obj){
					     if(obj === 'serious'){
                           return '严 重';
                           }else if(obj === 'warning'){
                             return '警 告';
                           }else if(obj === 'deadly'){
                             return '致 命'
                           }
					  }}
					  ]
};
App.controller("AlarmrulesController", function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
	$scope.go_schema_editOrCopy=function(id,action,currPage){
		$location.path("/hippo/alarm/rules/new/"+id+'/'+action);
	}

	CrudBaseController_hippo.call(this, auxo.meta.rules, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

});

