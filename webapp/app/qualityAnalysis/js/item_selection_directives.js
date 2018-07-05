
App.directive('itemSelection', function(sgDialogService) {
    return {
        require: 'ngModel',
        scope: {
            onSelectChanged : '&',
            selectionId:"=?"
        },
        link: function(scope, element, attrs, ngModel) {

            var templateUrl = 'app/qualityAnalysis/item_selection.html';
            var controller = 'ItemSelectionController';

            var selectTitle = attrs.selectTitle || "选择字段";
            var selectMulti = attrs.selectMulti;
            if (selectMulti && selectMulti=="true")
                selectMulti = true;
            if (selectMulti && selectMulti=="false")
                selectMulti = false;
            var leftLabel = attrs.leftLabel;
            var rightLabel = attrs.rightLabel;
            var leftOptions = attrs.leftOptions;

            element.bind('click', function(e) {
               // $scope.callbackResult = "No callbacks yet";
                //$scope.dialogTitle = "Dialog title";
                var openDialog = function(){
                    if (!leftOptions || !scope.$parent || !scope.$parent[leftOptions] )
                        return;
                    sgDialogService.openModal({
                        templateUrl:templateUrl,
                        controller: controller,
                        title: "selectTitle",
                        data:{
                            modelValue:ngModel.$modelValue,
                            selectTitle: selectTitle,
                            inputData: {
                                leftOptions: scope.$parent[leftOptions],
                                title: selectTitle, leftLabel: leftLabel, rightLabel: rightLabel,
                                multiple: angular.isString(selectMulti)? scope.$parent[selectMulti] : (selectMulti? true : false),
                                values: ngModel.$modelValue}
                        },
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
