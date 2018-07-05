'use strict';

/* Directives */

var AppDirectives = angular.module('AuxoApp.directives', []);

AppDirectives.directive('appVersion', ['version', function (version) {
    return function (scope, elm, attrs) {
        elm.text(version);
    };
}]);

App.directive('normalWordValidation', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                var transformedInput = inputValue.replace(/[^\u4e00-\u9fbfa-zA-Z0-9_]/g, '');
                transformedInput = transformedInput.replace(/^[0-9]*/, '')
                if (transformedInput != inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }

                return transformedInput;
            });
        }
    };
});

App.directive('cdoHistoryPopupDialog', function(sgDialogService) {
    return {
        require: 'ngModel',
        scope: {
            onSelectChanged : '&',
            selectionId:"=?"
        },
        link: function(scope, element, attrs, ngModel) {

        	var templateUrl = 'app/data/cdoHistoryPopupDialog.html';
            var controller = 'cdoHistoryController';
            element.bind('click', function(e) {
               // $scope.callbackResult = "No callbacks yet";
                //$scope.dialogTitle = "Dialog title";
                var openDialog = function(){
                    sgDialogService.openModal({
                        templateUrl:templateUrl,
                        controller: controller,
                        data:{modelValue:ngModel.$modelValue, inputData: {values: ngModel.$modelValue}},
                        callback: function(result){
//                            if(result) {
//                                if (angular.isArray(result.value)) {
//                                    var v = result.value.join(',');
//                                    ngModel.$setViewValue(v);
//                                    if (scope.onSelectChanged) {
//                                        scope.onSelectChanged({selectedRow: result.selectedRow});
//                                    }
//                                } else {
//                                    ngModel.$setViewValue(result.value)
//                                    if (result.id)
//                                        scope.selectionId = result.id;
//                                    if (scope.onSelectChanged)
//                                        scope.onSelectChanged({selectedRow: result.selectedRow});
//                                }
//                            }
                        },
                        width:1000
                    });
                }
                openDialog();
            });
        }
    }
});