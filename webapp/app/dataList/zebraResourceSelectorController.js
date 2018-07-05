App.directive('zebraSelector', function(sgDialogService) {
    return {
        require: 'ngModel',
        scope: {
            onSelectChanged : '&',
            selectionId:"=?",
            rootId: "&",
            modelData:"=?",
            modelId:"=?",
            interceptor: "=?",
            item: "=?"
        },
        link: function(scope, element, attrs, ngModel) {

//            console.log(angular.toJson(attrs))
//            console.log(attrs)
            var templateUrl = 'app/dataList/zebraResourceSelector.html';
            var controller = 'zebraResourceSelectorController';

            var rootDir = attrs.rootDir;
            var popFilter = attrs.popFilter;
            var popTitle = attrs.popTitle;
            var selectMode = attrs.selectMode;
            var keyword = attrs.keyword;
            //var keyword = isAdmin();
            function clear_fun(parent, curr_level, clear_level) {
                curr_level++
                if(parent['children']){
                    if(curr_level == clear_level){
                        delete parent['children']
                    }else{
                        var arr = parent['children']
                        for(var i = 0; i < arr.length; i++){
                            var item = arr[i]
                            clear_fun(item, curr_level, clear_level)
                        }
                    }
                }
            }
            // 判断当前登陆人，admin则显示数据集，user显示拥有的目录
            function isAdmin() {
                if(auxo.isAdmin()){
                    return "数据集"
                }else{
                    return "@admin"
                }
            }
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
                                    //names:  keyword==='dataset'?"数据集":"存储池",
                                    names: "Datasets",
                                    strict:"true",
                                    allUser: auxo.isAdmin()? null: 'true'
                                    //rootName: rootDir
                                }).then(function (roots) {
                                    if(scope.interceptor)
                                        scope.interceptor(roots);
                                    if(!auxo.isAdmin()){
                                        var found
                                        for(var i = 0; i < roots.length; i+=1){
                                            if(roots[i].name == '@admin'){
                                                found = roots[i]
                                            }
                                        }
                                        if(found){
                                            roots.splice(0, roots.length)
                                            for(var i = 0; i < found.children.length; i+=1){
                                                roots.push(found.children[i])
                                            }
                                        }
                                    }
                                    if(roots.length > 0){
                                        scope.rootId = roots[0]['id']
                                    }
                                    $scope.sortTree(roots)
                                    $scope.dataForTheTree = roots;
                                    clear_fun($scope.dataForTheTree,0,2);
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
                                /*if(result.selectedRow.attributes.dataset.name){
                                    ngModel.$setViewValue(result.selectedRow.attributes.dataset.name)
                                }
                                else
                                    ngModel.$setViewValue(result.selectedRow.name)

                                if(scope.modelData && scope.modelId)
                                    scope.modelData[scope.modelId] = result.selectedRow.attributes.dataset.id;

                                if(scope.onSelectChanged) {
                                    scope.onSelectChanged({ data: result})
                                }*/
                                if(result.selectedRow.id){
                                    if(scope.onSelectChanged) {
                                        scope.onSelectChanged({
                                            data: result.selectedRow,
                                            rootId: scope.rootId
                                        })
                                    }
                                }
                            }
                        },
                        width:500
                    });
                }
                openDialog();
            });
        }
    }
});


App.controller('zebraResourceSelectorController', function ($scope, Restangular, modalInstance, $filter,  $location, $window, $http, $stateParams, ngDialog) {

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
        if($scope.selectedNode){
            modalInstance.closeModal({
                selectedRow:$scope.selectedNode,
            });
        }
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