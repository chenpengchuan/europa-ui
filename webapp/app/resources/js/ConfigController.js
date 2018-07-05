


auxo.meta.tag = {
	currUrl:"/tag",

	restRootPath:"tags",
	path:"/tag",
	detailTemplate : "",
	entityDisplayName:"标签",
	getBaseFilter: function() {
		return "";
	},
	rowHeaders : [{name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
		{name : "color", disName : "颜色", converter : auxo.same},
		{name : "createTime", disName : "创建时间", converter : auxo.date2str},
		{name : "creator", disName : "创建人", converter : auxo.same},
		{name : "lastModifier", disName : "修改人", converter : auxo.same},
		{name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}],
	onNew : function(entity) {
		entity.color = "#ff00ff";
	}
};
App.controller('TagController', function($filter, $scope, $location, $window, $http, $stateParams,Restangular, ngDialog) {
	CrudBaseController.call(this, auxo.meta.tag, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
})


App.controller('EditTagController', function EditTagController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular) {
	EditBaseController.call(this, auxo.meta.tag, $scope, $window, $http, $stateParams, $location, ngDialog, Restangular)
});

