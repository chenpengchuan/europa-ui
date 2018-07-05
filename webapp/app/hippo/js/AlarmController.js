/**
 * DesignerController
 * @constructor
 */

auxo.meta.alarm = {
		currUrl:"/europa/alarm",
		restRootPath:"/europa/alarm",
		detailTemplate : "",
		entityDisplayName:"Alarm",
		getBaseFilter: function() {
			return "";
		},
		rowHeaders : [{name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
					  {name : "id", disName : "ID", converter : auxo.same},
					  {name : "alarmRule", "disName" : "触发规则", converter : function(obj){return obj.name}},
					  {name : "conditions", "disName" : "告警触发条件", converter : auxo.same},
					  {name : "createTime", disName : "创建时间", converter : auxo.date2str},
					  {name : "alarmRule", disName : "负责人", converter : function(obj){return obj.principal}},
					  {name : "type", disName : "告警等级", converter : function(obj){
                      					     if(obj === 'serious'){
                                                 return '严 重';
                                                 }else if(obj === 'warning'){
                                                   return '警 告';
                                                 }else if(obj === 'deadly'){
                                                   return '致 命'
                                                 }
                       }},
                       {name : "status", disName : "处理状态", converter : auxo.same},
                      ]
};
App.controller("AlarmController", function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
//	$scope.go_schema_editOrCopy=function(id,action,currPage){
//		$location.path("/hippo/alarm/?"+id+'/'+action);
//	}

	CrudBaseController_hippo.call(this, auxo.meta.alarm, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

if($scope.statusTypeFilter && $scope.statusTypeFilter != undefined ){
   $scope.alarmStatusFilter = $scope.alarmstatusTypeFilter;
}
$scope.alarmStatusArray = [
    {name:"未处理", value:"unsolved"},
    {name:"已处理", value:"solved"},
    {name:"已忽略", value:"ignore"},
    {name:"所有", value:"all"}
];
});


