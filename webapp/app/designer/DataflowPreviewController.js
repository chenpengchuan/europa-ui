App.controller("DataflowPreviewController", function($scope,  $location, $timeout, $stateParams, Restangular, sgDialogService, modalInstance){

    // cancel click
    $scope.cancel = function() {
        modalInstance.closeModal();
    }

    $scope.closeModal = function () {
        $scope.cancel();
    }

    $scope.title =  'Dataflow 预览';
    $scope.modalButtons =[
        {
            action:$scope.cancel,
            text:"取消",class:"btn-warning"
        }
    ];
    
    DesignerController.call(this, $scope,  $location, $timeout, $stateParams, Restangular, sgDialogService, null, true ) ;
    
})