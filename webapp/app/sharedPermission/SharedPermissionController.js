auxo.meta.sharedPermission = {
    currUrl:"sharedPermission",
    restRootPath:"europa/open/users",
    detailTemplate : "",
    getBaseFilter: function() {
        return "";
    },
    rowHeaders : [
        {name : "account", disName : "用户名", converter : auxo.same},
        {name : "name", disName : "接口验证账号",converter : auxo.same},
        {name : "creator", disName : "创建人", converter : auxo.same},
        {name : "lastModifier", disName : "修改人", converter : auxo.same},
        {name : "createTime", disName : "创建时间", converter : auxo.date2str},
        {name : "lastModifiedTime", disName : "更新时间",  converter : auxo.date2str}

    ]
};
// 显示用户信息 account(用户名) name(账号) password（密码）
App.controller('SharedPermissionController', function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {

    // 新增用户
    $scope.addUser = function() {
        auxo.sgDialogService.openModal({
            templateUrl : 'app/sharedPermission/addUser.html',
            //controller : 'AddUserController', // specify controller for modal
            data:{reloadPage: $scope.doQuery},
            width:600,
            height:850
        });
    };

    $scope.showUser =function (item) {
        auxo.sgDialogService.openModal({
            templateUrl : 'app/sharedPermission/addUser.html',
            //controller : 'AddUserController', // specify controller for modal
            //data:{id:row.id,CollectorID:row.collecterId},
            data:{item:item, reloadPage: $scope.doQuery},
            width:600,
            height:850
        });
    }

    // 删除
    $scope.removeList = function(selectedRows) {
        var msg = "";
        auxo.openConfirmDialog($scope, ngDialog, "真的要删除"+$scope.selectedRows.length+"个"+"共享权限用户"+"？" + msg, function(){
            var ids = new Array();
            for(var i=0; i<selectedRows.length;i++){
                for(var j in selectedRows[i]){
                    if(j == 'id'){
                        ids.push(selectedRows[i][j]);
                    }
                }
            }
            $scope.restRootPath = "europa/open/user";
            Restangular.all($scope.restRootPath).customPOST(ids, "remove").then(function(d){
                $scope.doQuery()
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    };

    CrudBaseController.call(this, auxo.meta.sharedPermission, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
})
