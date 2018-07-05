App.directive('hippoSelector', function(sgDialogService) {
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
                url = "flowResource";

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
                                    includes: "datasource_dir",
                                    excludes: "",
                                    names:  keyword==='dataset'?"Datasets": keyword==='datasource'?"Datasources":"Flows",
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
                            queryFilter: popFilter,
                            keyword:keyword
                        },
                        callback: function(result){
                            if(result) {
                                if(keyword == 'dataset'){
                                    ngModel.$setViewValue(result.selectedRow.attributes[keyword].name);
//                                     ngModel.$setViewValue(result.selectedRow.attributes[keyword].id)
                                }else if(keyword == 'datasource'){
                                     ngModel.$setViewValue(result.selectedRow.name);
                                }else
                                    ngModel.$setViewValue(result.selectedRow.name)
                                if(scope.modelData && scope.modelId)
                                    scope.modelData[scope.modelId] = result.selectedRow.attributes[keyword].id;
                                if(scope.onSelectChanged) {
                                    scope.onSelectChanged({ data: result.selectedRow})
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