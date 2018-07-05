/**
 * DesignerController
 * @constructor
 */

auxo.meta.schema = {
		currUrl:"/designer/schema",
		restRootPath:"schemas",
		detailTemplate : "",
		entityDisplayName:"Schema",
		getBaseFilter: function() {
			return "";
		},
		rowHeaders : [{name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
					  {name : "id", disName : "ID", converter : auxo.same},
					  {name : "description", "disName" : "描述", converter : auxo.same},
					  {name : "version", "disName" : "版本", converter : auxo.same},
					  {name : "createTime", disName : "创建时间", converter : auxo.date2str},
					  {name : "creator", disName : "创建人", converter : auxo.same},
					  {name : "lastModifier", disName : "修改人", converter : auxo.same},
					  {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
					  ]
};
App.controller("SchemaController", function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
	$scope.go_schema_editOrCopy=function(id,action,currPage){
		$location.path("/designer/schema/"+id+'/'+action);
	}

	CrudBaseController.call(this, auxo.meta.schema, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

});


