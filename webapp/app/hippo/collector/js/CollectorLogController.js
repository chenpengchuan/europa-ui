App.controller('CollectorLogController', function CollectorLogController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth,modalInstance) {

    $scope.cancel = function () {
        modalInstance.dismiss();
        auxo.delHotkey($scope)
    };

    var taskId;
    var count;
    $scope.taskId = $scope.fromparent.entity.id;
    $scope.detail = $scope.fromparent.entity;

    $scope.refresh = function(){
        Restangular.one("/europa/collectors/" + $scope.taskId +"/logs").get({})
        .then(function(facetResult){
             $scope.log = facetResult;
        })
    }
    $scope.refresh();
});