//列表页的controller
App.controller('SharedInterfaceController', function($filter,$scope,$state,  $location, $window, $http,$stateParams, Restangular, ngDialog ,sgDialogService,$rootScope) {

//  创建
    $scope.createSharedInterface = function (row) {
        var id = row?row.id:"";
        auxo.sgDialogService.openModal({
            templateUrl : 'app/sharedInterface/sharedInterfaceDetail.html',
            data:{id:id,row:row,reloadPage:$scope.doQuery,owner:$scope.owner},
            width:800,
            // height:800
        });
    }

//  删除一条任务
    $scope.remove1 = function(selectedRows){
        var msg = "";
        auxo.openConfirmDialog($scope, ngDialog, "真的要删除"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？" + msg, function(){
            var ids = new Array();
            for(var i=0; i<selectedRows.length;i++){
                for(var j in selectedRows[i]){
                    if(j == 'id'){
                        ids.push(selectedRows[i][j]);
                    }
                }
            }
            Restangular.all("europa/open/endpoint").customPOST(ids, "remove").then(function(d){
                $scope.doQuery()
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    }

//  name查看详情
    var sharedInterface = function(row) {
        auxo.sgDialogService.openModal({
            templateUrl : 'app/sharedInterface/sharedInterfaceDetail.html',
            data:{id:row.id,reloadPage:$scope.doQuery},
            width:800,
            // height:800
        });
    };
    $scope.sharedInterface = sharedInterface;

    auxo.meta.sharedInterface = {
        currUrl:"sharedInterface",
        restRootPath:"europa/open/endpoints",
        detailTemplate : "",
        entityDisplayName:"共享接口",
        getBaseFilter: function() {
            return "";
        },
        rowHeaders : [
            {name: "resourceId", disName: "资源ID", converter: auxo.same},
            {name: "name", disName: "接口名称", converter: auxo.same},
            {name: "description", disName: "接口描述", converter: auxo.same},
            {name : "creator", disName : "创建人", converter : auxo.same},
            {name : "lastModifier", disName : "修改人", converter : auxo.same},
            {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str, visible: true},
            {name : "createTime", disName : "创建时间", converter : auxo.date2str}
        ]
    };

    CrudBaseController.call(this, auxo.meta.sharedInterface, $scope, $location, $window, $http, Restangular, ngDialog, $filter, $stateParams ,sgDialogService,$rootScope);
});



