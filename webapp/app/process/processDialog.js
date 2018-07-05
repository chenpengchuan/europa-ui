angular.module('AuxoApp')
    .controller('ProcessDialogController', function ($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, modalInstance, ngTreetableParams) {
        $scope.dataForTheTree = [];
        $scope.treeOptions = {
            nodeChildren: "children",
            dirSelectable: true,
            allowDeselect: false,
            ainjectClasses: {
                ul: "a1",
                li: "a2",
                liSelected: "a7",
                iExpanded: "a3",
                iCollapsed: "a4",
                iLeaf: "a5",
                label: "a6",
                labelSelected: "a8"
            },
            injectClasses: {
                "ul": "c-ul",
                "li": "c-li",
                "liSelected": "c-liSelected",
                "iExpanded": "c-iExpanded",
                "iCollapsed": "c-iCollapsed",
                "iLeaf": "c-iLeaf",
                "label": "c-label",
                "labelSelected": "c-labelSelected"
            },
            isLeaf: function (node) {
                return !node.children || node.children.length === 0;
            }
        }

        $scope.transform = function (name) {
            var map = {"share_category": "共享"};
            if (map[name]) {
                return map[name];
            } else {
                return name
            }
        }

        function sortNode(a, b) {
            if(!a.index)
                a.index = 0;
            if(!b.index)
                b.index = 0;
            return a.index - b.index
        }

        function compare(a, b) {
            if (a.name == auxo.Auth.user.name) {
                return -1;
            } else if (b.name == auxo.Auth.user.name) {
                return 1
            }
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        }

        function sortTree(roots) {
            if (!roots)
                return;
            roots.sort(compare);
        }

        function fullPath(nodeArr) {
            return nodeArr.map(function (node) {
                return node.name;
            }).reverse().join("/");
        }

        Restangular.all("europa/process/roots").getList({
            includes: "dir;user_dir",
            excludes: "share_dir"
        }).then(function (roots) {
            sortTree(roots)
            $scope.dataForTheTree = roots;
        });


        $scope.onSelected = function (node, $parentNode, $path) {
            $scope.targetSelectedNode = node;
            $scope.targetParentNode = $parentNode;
            $scope.targetSelectedNodePath = $path ? $path() : undefined;
        }

        $scope.onNodeToggle = function (node, expanded) {
            if (expanded) {
                Restangular.one("europa/process/"+node.id + "?includes=dir;user_dir").get().then(function (e) {
                    auxo.array.removeAll(node.children);
                    auxo.array.forEach(e.children, function (i) {
                        if (i.processType === "dir"  || i.processType === "user_dir")
                            node.children.push(i);
                    })
                    sortTree(node.children);
                })
            }
        }

        $scope.validate = function() {
            if(!$scope.copy && $scope.editingNode.rows && $scope.editingNode.rows.length > 0) {
                if($scope.editingNode.id == $scope.targetSelectedNode.id) {
                    return {"error":"源目录与目标目录相同无法移动"};
                }
            } else if(!$scope.copy && $scope.editingNode.path && ($scope.editingNode.path[0].parentId ===  $scope.targetSelectedNode.id)){
                return {"error":"源目录与目标目录相同无法移动"};
            } else if(!auxo.canRW($scope.targetSelectedNode)) {
                return {"error":"没有目标目录权限"};
            }
            return null;
        }

        function yes(data) {
            auxo.delHotkey($scope)
            modalInstance.closeModal(data);
        }

        function save() {
            var msg = $scope.validate();
            if(msg) {
                auxo.showErrorMsg(msg);
                return;
            }

            var count = $scope.editingNode.rows.length;
            var editPath = ($scope.editingNode.path == undefined) ?  '/' : '/' + fullPath($scope.editingNode.path) + "/";
            var targetPath = ($scope.targetSelectedNodePath == undefined) ?  '/' : '/' + fullPath($scope.targetSelectedNodePath ) + "/";
            auxo.openConfirmDialog($scope, ngDialog, "确定要"  + ($scope.copy ? "复制'" :"移动'") + editPath +
                (count>0? "' 中" + count + "条Process" : "'") +" 到 '"
                + targetPath + "'?", function() {

                var data = ($scope.editingNode.rows.length > 0) ? $scope.editingNode.rows : [$scope.editingNode.id];

                if($scope.copy) {
                    Restangular.all("europa/process/" + $scope.targetSelectedNode.id + "/copy").post({"ids": data, "targetPath": targetPath.substr(1)}).then(function (resp) {
                        yes($scope.targetSelectedNode.id)
                    }, function (e) {
                        auxo.showErrorMsg(e);
                    });
                } else {
                    Restangular.all("europa/process/" + $scope.targetSelectedNode.id + "/move").post({"ids": data, "targetPath": targetPath.substr(1)}).then(function (resp) {
                        yes($scope.targetSelectedNode.id)
                    }, function (e) {
                        auxo.showErrorMsg(e);
                    });
                }
            });
        }

        // cancel click
        $scope.cancel = function () {
            auxo.delHotkey($scope)
            modalInstance.closeModal(false)
        }

        $scope.closeModal = function () {
            $scope.cancel();
        }

        $scope.title =  $scope.copy ? '复制目标目录':'移动目标目录';
        $scope.modalButtons = [
            {
                action: save,
                text: "确定", class: "btn-primary",
                disabled: function () {
                    if ($scope.copy || ($scope.targetSelectedNodePath &&
                            (fullPath($scope.editingNode.path) !== fullPath($scope.targetSelectedNodePath))))
                        return false;
                    return true;
                }
            },
            {
                action: $scope.cancel,
                text: "取消", class: "btn-warning"
            }
        ];

        auxo.bindEscEnterHotkey($scope)
    })