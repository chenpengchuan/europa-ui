
App.directive('schedulerForm', function(sgDialogService) {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {

            element.bind('click', function(e) {
                sgDialogService.openModal({
                    templateUrl : 'app/scheduler/Scheduler_form.html',
                    controller : 'SchedulerFormController', // specify controller for modal
                    data:{fromParent: ngModel.$modelValue},
                    callback: function(newValue){
                        ngModel.$setViewValue(newValue)
                    },
                    width:1000
                });

            });
        }
    }
});