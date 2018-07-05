auxo.meta.permission = {
    currUrl:"/permission",
    restRootPath:"europa/permissions",
    detailTemplate : "",
    entityDisplayName:"权限",
    getBaseFilter: function() {
        return "";
    },
    rowHeaders : [
        //{name : "id", disName : "ID", converter : auxo.same},
        {name : "name", disName : "用户", sortName: "name_sort", converter : auxo.same},
        {name : "permissions", disName : "大数据平台", converter : function (data) {
            var name = data.filter(function(value) {
                return value.indexOf("europa") >=0
            }).join("/");
            return name;
        }}
        /*,

        {name : "permissions", disName : "运维监控(hippo)", converter : function(data) {
            return data.filter(function(value) {
                return value.indexOf("hippo") >=0
            }).join("/");
        }},
        {name : "permissions", disName : "数据分析(rhinos)", converter : function(data) {
            return data.filter(function(value) {
                return value.indexOf("rhinos") >=0
            }).join("/");
        }},
        {name : "permissions", disName : "数据治理(zebra)", converter : function(data) {
            return data.filter(function(value) {
                return value.indexOf("zebra") >=0
            }).join("/");
        }},
        {name : "permissions", disName : "数据接入(europa)", converter : function(data) {
            return data.filter(function(value) {
                return value.indexOf("europa") >=0
            }).join("/");
        }}*/
    ]
};
angular.module('AuxoApp')
    .controller('PermissionController',function($filter,$scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
        CrudBaseController.call(this, auxo.meta.permission, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

    });

angular.module('AuxoApp')
    .controller('EditPermissionController', function EditTagController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular) {
        var isNew = $scope.isNew = $stateParams.id == "new";

        $scope.entityDisplayName = "用户";

        $scope.roles = [{label:"管理员", value: "ROLE_admin"}, {label:"用户", value: "ROLE_user"}];

        var id = $stateParams.id;

        $scope.error=false;

        $scope.entity={ roles : ["ROLE_user"], resourceQueues: [], maxRunningJobs:1, hdfsSpaceQuota: 0};

        if (!isNew) {
            Restangular.one("permissions", id).get().then(function(entity) {
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