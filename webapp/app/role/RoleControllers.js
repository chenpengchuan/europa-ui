auxo.meta.role = {
    currUrl:"/role",
    restRootPath:"roles",
    detailTemplate : "",
    entityDisplayName:"角色",
    getBaseFilter: function() {
        return "";
    },
    rowHeaders : [
        //{name : "id", disName : "ID", converter : auxo.same},
        {name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
        {name : "createTime", disName : "创建时间", converter : auxo.date2str},
        {name : "creator", disName : "创建人", converter : auxo.same},
        {name : "lastModifier", disName : "修改人", converter : auxo.same},
        {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
    ]
};
angular.module('AuxoApp')
.controller('RoleController',function($filter,$scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
    CrudBaseController.call(this, auxo.meta.role, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
});

angular.module('AuxoApp')
.controller('EditRoleController', function EditTagController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular) {
	var isNew = $scope.isNew = $stateParams.id == "new";
	
	$scope.entityDisplayName = "用户";
	
	$scope.roles = [{label:"管理员", value: "ROLE_admin"}, {label:"用户", value: "ROLE_user"}];
	
	var id = $stateParams.id;

	$scope.error=false;

    $scope.entity={ roles : ["ROLE_user"], resourceQueues: [], maxRunningJobs:1, hdfsSpaceQuota: 0};

    if (!isNew) {
		Restangular.one("roles", id).get().then(function(entity) {
			angular.extend($scope.entity, entity);
			$scope.verifyPassword = entity.password;
           // if($scope.entity.resourceQueues && $scope.entity.resourceQueues.length)
             //   $scope.entity.resourceQueues = $scope.entity.resourceQueues.split(',')

            $scope.userCopy = entity;
        });
	}
	
	$scope.cancel = function() {
        //auxo.loadPage(auxo.meta.user.currUrl);
        auxo.goBack();
	}
});