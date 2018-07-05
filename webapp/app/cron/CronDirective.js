
App.directive('cronMaker', function(sgDialogService) {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {

            element.bind('click', function(e) {

                sgDialogService.openModal({
                    templateUrl : 'app/cron/Scheduler_form_cron.html',
                    controller : 'CronFormController', // specify controller for modal
                    data:{fromParent: ngModel.$modelValue},
                    callback: function(newValue){
                        ngModel.$setViewValue(newValue)
                    },
                    width:900
                });

                /*
                var openModal = function() {
                    var uibModalInstance = $uibModal.open({
                        templateUrl : 'app/cron/Scheduler_form_cron.html',
                        controller : 'CronFormController', // specify controller for modal
                        size : 'lg', // 'lg', 'sm' default middle
                        backdrop: 'static',
                        //backdropClass: 'modal-backdrop',
                        animation: false,
                        resolve : {
                            cronExp : function() {
                                return {value: ngModel.$modelValue};
                            }
                        }
                    });
                    // modal return result
                    uibModalInstance.result.then(function(newValue) {
                     //   $scope.updateDataflowNode($scope.editingNode.id, configuration);
                        ngModel.$setViewValue(newValue)
                    }, function() {
                        console.log('Modal dismissed at: ' + new Date())
                    });
                };
                openModal();
                */
            });
        }
    }
});