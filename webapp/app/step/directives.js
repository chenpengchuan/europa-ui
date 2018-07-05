App.directive('stepPopup', function(sgDialogService) {
    return {
        require: 'ngModel',
        scope: {
            onSelectChanged : '&',
            selectionId:"=?"
        },
        link: function(scope, element, attrs, ngModel) {

            //console.log("step Popup's attrs: " + JSON.stringify(attrs))

            var templateUrl = 'app/step/stepPopupDialog.html';
            var controller = 'StepPopupController';

            var popInput = attrs.popInput;
            var popFilter = attrs.popFilter;
            var popTitle = attrs.popTitle;
            var popMulti = attrs.popMulti;
            var popKeyword = attrs.popKeyword;

            console.info("popInput:" + popInput +
            ", popFilter : " +  popFilter + 
            ", popTitle : "  + popTitle + 
            ", popMulti : " + popMulti + 
            ", popKeyword : " + popKeyword + 
            ", ngModel.$modelValue" + ngModel.$modelValue);
            
            element.bind('click', function(e) {
               // $scope.callbackResult = "No callbacks yet";
                //$scope.dialogTitle = "Dialog title";
                var openDialog = function(){
                    sgDialogService.openModal({
                        templateUrl:templateUrl,
                        controller: controller,
                        data:{modelValue:ngModel.$modelValue, inputData: {route: popInput, filter: popFilter, title: popTitle, multiple:popMulti,keyword:popKeyword, values: ngModel.$modelValue}},
                        callback: function(result){
                            if(result) {
                                if (angular.isArray(result.value)) {
                                    var v = result.value.join(',');
                                    ngModel.$setViewValue(v);
                                    if (scope.onSelectChanged) {
                                        scope.onSelectChanged({selectedRow: result.selectedRow});
                                    }
                                } else {
                                    ngModel.$setViewValue(result.value)
                                    if (result.id)
                                        scope.selectionId = result.id;
                                    if (scope.onSelectChanged)
                                        scope.onSelectChanged({selectedRow: result.selectedRow});
                                }
                            }
                        },
                        width:800
                    });
                }
                openDialog();
            });
        }
    }
});

App.directive('disableInput', function($timeout) {
    return {
        link: function(scope, element, attrs, ngModel) {
            $timeout(function () {
                var myEl = angular.element(element[0].querySelector('input'));
                console.log("myE1: " + JSON.stringify(myEl))
                myEl.attr("disabled", "true")
            }, 0)
        }
    }
});

App.directive('stringPopup', function(sgDialogService) {
    return {
        require: 'ngModel',
        scope: {
            onSelectChanged : '&'
        },
        link: function(scope, element, attrs, ngModel) {

            //console.log("step Popup's attrs: " + JSON.stringify(attrs))

            var templateUrl = 'app/step/stepPopupDialog.html';
            var controller = 'StepPopupController';

            var popInput = attrs.popInput;
            var popFilter = attrs.popFilter;
            var popTitle = attrs.popTitle;
            var popMulti = attrs.popMulti;
            var popKeyword = attrs.popKeyword;

            element.bind('click', function(e) {
                // $scope.callbackResult = "No callbacks yet";
                //$scope.dialogTitle = "Dialog title";
                var openDialog = function(){
                    sgDialogService.openModal({
                        templateUrl:templateUrl,
                        controller: controller,
                        data:{modelValue:ngModel.$modelValue, inputData: {route: popInput, filter: popFilter, title: popTitle, multiple:popMulti, keyword: popKeyword, values: ngModel.$modelValue}},
                        callback: function(result){
                            if(result) {
                                if (angular.isArray(result.value)) {
                                    var v = result.value.join(',');
                                    ngModel.$setViewValue(v)
                                    if (scope.onSelectChanged)
                                        scope.onSelectChanged({selectedRow: result.selectedRow});
                                } else {
                                    ngModel.$setViewValue(result.value)
                                    if (scope.onSelectChanged)
                                        scope.onSelectChanged({selectedRow: result.selectedRow});
                                }
                            }
                        },
                        width:800
                    });
                }
                openDialog();
            });
        }
    }
});

