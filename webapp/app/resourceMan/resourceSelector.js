App.directive('resourceSelector', function(sgDialogService) {
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

            var templateUrl = 'app/resourceMan/resourceSelector.html';
            var controller = 'resourceSelectorController';

            var rootDir = attrs.rootDir;
            var popFilter = attrs.popFilter;
            var popTitle = attrs.popTitle;
            var selectMode = attrs.selectMode;
            var keyword = attrs.keyword;

            var url = "europa/resource";
            if(keyword === "flow")
                url = "europa/flowResource";

            element.bind('click', function(e) {
                // $scope.callbackResult = "No callbacks yet";
                //$scope.dialogTitle = "Dialog title";
                var openDialog = function(){
                    sgDialogService.openModal({
                        templateUrl:templateUrl,
                        //controller: controller,
                        data:{
                            modelValue:ngModel.$modelValue,
                            url:url,
                            loadTree:function ($scope, Restangular) {
                               // Restangular.all("resource/children/rootname").getList({
                                Restangular.all(url + "/roots").getList({
                                    includes: "dataset_dir",
                                    excludes: "",
                                    names:  keyword==='dataset'?"Datasets": keyword==='schema'?"Schemas":"Flows",
                                    strict:"true",
                                    allUser:'true',
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
                                if(result.selectedRow.name)
                                    ngModel.$setViewValue(result.selectedRow.name)
                                else
                                    ngModel.$setViewValue(result.selectedRow.name)
                                if(scope.modelData && scope.modelId){
                                    scope.modelData[scope.modelId] = result.selectedRow.id;
                                    //shiy: 创建Dataset时选择schema时，将schemaId返回到Dataset的schemaName字段,id是填的schema
                                    if(result.selectedRow.schemaName) {
                                        scope.modelData["schema"] = scope.modelData['schemaName'] = result.selectedRow.schemaName;
                                    }
                                }

                                if(scope.onSelectChanged) {
                                    scope.onSelectChanged({item: result.selectedRow})
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

App.controller('resourceSelectorController', function ($scope, Restangular, modalInstance, $filter,  $location, $window, $http, $stateParams, ngDialog) {

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