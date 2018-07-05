App.controller('CollectorTaskLogController', function CollectorTaskLogController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth,modalInstance) {

    $scope.cancel = function () {
        modalInstance.dismiss();
        auxo.delHotkey($scope)
    };

    $scope.taskId = $scope.fromparent.entity.id;
    $scope.detail = $scope.fromparent.entity;


    $scope.refresh = function(type){
        $scope.logs = [];
        $scope.activeTabIndex = type;
        Restangular.one("/europa/tasks/" + $scope.taskId +"/logs/"+ type ).get()
        .then(function(facetResult){
            angular.forEach(facetResult,function (e,i) {
                $scope.logs.push({key:i,value:e})
            })
        },function(error) {
            auxo.showErrorMsg(error)
        })
    }
    $scope.refresh(0);

});