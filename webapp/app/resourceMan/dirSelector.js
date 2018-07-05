angular.module('AuxoApp')
    .controller('DirSelectorController', function ($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, modalInstance,ngTreetableParams) {
        var isNew = !$scope.editingNode || !$scope.editingNode.id;

        $scope.error = "";
        //
        $scope.selectedNode = null;
        $scope.dataForTheTree = [];

        Restangular.one("europa/resource", $scope.editingNode.rootId).get({includes:$scope.editingNode.resType}).then(function(entity) {
            $scope.dataForTheTree.push(entity);
            // if(entity.children) {
            //     auxo.array.forEach(entity.children, function (e,i) {
            //         if(e.name === '共享'){
            //             auxo.array.remove(entity.children, i);
            //             return false;
            //         }
            //     })
            // }

            removeUseless();
        });

        function removeUseless() {
            if($scope.editingNode.excludes) {
                auxo.array.forEach($scope.editingNode.excludes, function (id) {
                    auxo.treeWalk($scope.dataForTheTree, function (key, value, path, parent) {
                        if(value && value.id === id) {
                            if(parent && auxo.isArray(parent)) {
                                auxo.array.remove(parent, key);
                            } else if(parent)
                                delete parent[key];
                            return false;
                        }
                    })
                })
            }
        }

        auxo.setupCommonTree($scope, Restangular);

        $scope.onSelectedOld = $scope.onSelected;
        $scope.onSelected = function (node) {
            if(node.id === $scope.editingNode.currentId)
                return;
            $scope.onSelectedOld(node,function () {
                removeUseless();
            });
        }

        function validate() {
            if(!$scope.selectedNode)
                return "请选择目录"
        }

        function save () {
            $scope.saving = true;

            //adjust data begin
            //adjust data end
            var msg = validate();
            if(msg) {
                auxo.sgDialogService.alert(msg, "错误", "提示")
                return;
            }

            if($scope.editingNode.callback) {
                $scope.editingNode.callback($scope.selectedNode.id, yes);
            }

        }

        function yes(data) {
            auxo.delHotkey($scope)
            modalInstance.closeModal(data);
        }
        // cancel click
        $scope.cancel = function () {
            auxo.delHotkey($scope)
            modalInstance.closeModal(false)
        }

        $scope.closeModal = function () { $scope.cancel(); }

        $scope.title =  "选择目录";
        $scope.modalButtons = [
            {
                action: save, text: "确定", class: "btn-primary",
                disabled: function () {if($scope.readonly) return true;},
                hide: function () { }
            },
            {
                action: $scope.cancel, text: "取消", class: "btn-warning",
                hide: function () { return $scope.page === 'preview' }
            },
//            auxo.buildMessageButton($scope.dataForTheTree)
        ];

        auxo.bindEscEnterHotkey($scope)

    })