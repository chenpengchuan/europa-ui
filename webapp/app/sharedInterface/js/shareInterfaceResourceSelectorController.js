App.directive('shareInterfaceResourceSelector', function(sgDialogService) {
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

//            console.log(angular.toJson(attrs))
//            console.log(attrs)
            var templateUrl = 'app/sharedInterface/shareInterfaceResourceSelector.html';
            var controller = 'shareInterfaceResourceSelectorController';

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
                                Restangular.all("resource/roots").getList({
                                    includes: "dir;root",
                                    excludes: "",
                                    names:  keyword==='dataset'?"数据集":"Schemas",
                                    strict:"true",
//                                    allUser:'true',
                                    rootName: rootDir
                                }).then(function (roots) {
                                    if(scope.interceptor)
                                        scope.interceptor(roots);
                                    $scope.sortTree(roots)
                                    $scope.dataForTheTree = roots;
                                    $scope.onSelected(roots[0]);
                                    $scope.dataBackup.roots = auxo.clone(roots);
                                });
                            },
                            selectMode: selectMode,
                            title: popTitle,
                            queryFilter: popFilter,
                            keyword: keyword

                        },
                        callback: function(result){
                            if(result) {
                                if(result.selectedRow.attributes.dataset.name){
                                    ngModel.$setViewValue(result.selectedRow.attributes.dataset.name)
                                }
                                else
                                    ngModel.$setViewValue(result.selectedRow.name)

                                if(scope.modelData && scope.modelId)
                                    scope.modelData[scope.modelId] = result.selectedRow.attributes.dataset.id;

                                if(scope.onSelectChanged) {
                                    scope.onSelectChanged({ data: result})
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

App.controller('shareInterfaceResourceSelectorController', function ($scope, Restangular, modalInstance, $filter,  $location, $window, $http, $stateParams, ngDialog) {

    /*
     The input parameter is assigned to $scope.inputData with format like { route: 'flows', filter: '', title: ''}
     */

    $scope.title = "选择数据集";

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
//  预览数据集的数据
    $scope.previewDataSet = function (node) {
        Restangular.one("resource", node.id).get().then(function (entity) {
            openDialog(entity);
        })
        function openDialog (entity){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/collector/dataSetPreview.html',
                data:{editingNode:entity},
                callback: function(newData){
                },
                width:800
            });
        }
    }
    auxo.bindEscEnterHotkey($scope)
});



