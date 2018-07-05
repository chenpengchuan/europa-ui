App.directive('stepresourceSelector', function(sgDialogService) {
    return {
        require: 'ngModel',
        scope: {
            onSelectChanged : '&',
            selectionId:"=?",
            modelData:"=?",
            modelId:"=?",
            interceptor: "=?",
            item: "=?"
        },
        link: function(scope, element, attrs, ngModel) {

            //console.log("step Popup's attrs: " + JSON.stringify(attrs))

            var templateUrl = 'app/step/resourceSelector.html';
            var controller = 'stepresourceSelectorController';

            var rootDir = attrs.rootDir;
            var popFilter = attrs.popFilter;
            var popTitle = attrs.popTitle;
            var selectMode = attrs.selectMode;
            var keyword = attrs.keyword;

            element.bind('click', function(e) {
                // $scope.callbackResult = "No callbacks yet";
                //$scope.dialogTitle = "Dialog title";
                var openDialog = function(){
                    sgDialogService.openModal({
                        templateUrl:templateUrl,
                        //controller: controller,
                        data:{
                            modelValue:ngModel.$modelValue,
                            loadTree:function ($scope, Restangular) {
                               // Restangular.all("resource/children/rootname").getList({
                                Restangular.all("europa/resource/roots").getList({
                                    includes: "dataset_dir",
                                    excludes: "",
                                    names:  keyword==='dataset'?"Datasets":"Schemas",
                                    strict:"true",
                                    allUser:'true',
                                    rootName: rootDir
                                }).then(function (roots) {
                                    if(scope.interceptor)
                                        scope.interceptor(roots);
                                    $scope.sortTree(roots)
                                    $scope.dataForTheTree = roots;
                                    $scope.dataBackup.roots = auxo.clone(roots);
                                });
                            },
                            selectMode: selectMode,
                            title: popTitle,
                            queryFilter: popFilter
                        },
                        callback: function(result){
                            if(result) {
                                if(keyword === "schema") {
                                    if(result.selectedRow.attributes.schema.name)
                                        ngModel.$setViewValue(result.selectedRow.attributes.schema.name);
                                    else
                                        ngModel.$setViewValue(result.selectedRow.name);
                                    if(scope.modelData && scope.modelId)
                                        scope.modelData[scope.modelId] = result.selectedRow.attributes.schema.id;
                                }
                                else if (keyword === "dataset") {
                                    if(result.selectedRow.attributes.dataset.name)
                                        ngModel.$setViewValue(result.selectedRow.attributes.dataset.name)
                                    else
                                        ngModel.$setViewValue(result.selectedRow.name)
                                    if(scope.modelData && scope.modelId) {
                                        scope.modelData[scope.modelId] = result.selectedRow.attributes.dataset.id;
                                        scope.modelData['schema'] = result.selectedRow.attributes.schema.name;
                                    }
                                }
                                if(scope.onSelectChanged) {
                                    scope.onSelectChanged({item: scope.item, data: result})
                                }
                            }
                        },
                        width:1000
                    });
                }
                openDialog();
            });
        }
    }
});

App.controller('stepresourceSelectorController', function ($scope, Restangular, modalInstance, $filter,  $location, $window, $http, $stateParams, ngDialog) {

    /*
     The input parameter is assigned to $scope.inputData with format like { route: 'flows', filter: '', title: ''}
     */

    $scope.title = "查询";

    $scope.mode = $scope.multiple;

    auxo.resourceTreeController ($filter, $scope, $location, $window, $http, $stateParams, Restangular, ngDialog);

    if($scope.queryFilter) {
        $scope.getOtherFilter = function () {
            return $scope.queryFilter;
        }
    }

    $scope.ok = function () {
        if(isOkDisabled())
            return;

        auxo.delHotkey($scope);
        modalInstance.closeModal({
            selectedRow:$scope.selectedRows[0],
            selectedRows: $scope.selectedRows
        });
    }

    $scope.cancel = function () {
        auxo.delHotkey($scope)
        modalInstance.closeModal()
    }

    function isOkDisabled() {
        if($scope.multiple){
            if($scope.selections && $scope.selections.length > 0)
                return false;
        }
        if($scope.selectedRows && $scope.selectedRows.length > 0)
            return false;
        return true;
    }

    $scope.modalButtons =[
        {
            action:$scope.ok,
            text:"确定",class:"btn-primary",
            disabled: isOkDisabled
        },
        {
            action: $scope.cancel,
            text:"取消",class:"btn-warning"
        }
    ];
    $scope.closeModal = $scope.cancel

    $scope.openAlert = function(text){
        sgDialogService.alert(text);
    }

    auxo.bindEscEnterHotkey($scope)
});