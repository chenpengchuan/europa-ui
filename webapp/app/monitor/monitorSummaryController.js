
angular.module('AuxoApp')
    .controller('MonitorSummaryController', function ($state, $filter, $scope, $location, $window, $http,$stateParams, Restangular,
                                                      ngDialog, sgDialogService) {
        $scope.error = "";

        $scope.tabTitle = "监控目标"

        $scope.dataBackup = {}
        $scope.selectedNode = null;

        $scope.rowCollection = []
        $scope.selectedRows = []

        $scope.dataForTheTree = [
            //{id: 'data_monitor', name: '数据', type: 'dir', children : []},
            {id: 'task_monitor', name: '任务', type: 'dir', children : []},
            {id: 'execution_monitor', name: '运行总览', type: 'dir', children : []}
        ];

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
            isLeaf: function(node) {
                return node.type == 'dir';
            }
        }


        function findNode(id) {
            var node = null;
            auxo.treeWalk($scope.dataForTheTree, function (key, value, path, parent) {
                if(key === 'id' && value === id) {
                    node = parent;
                    return 'break';
                }
            })
            return node;
        }

        function findRoot(node) {
            while(node.parentId) {
                node = findNode(node.parentId)
            }
            return node;
        }

        function fullPath(nodeArr) {
            return nodeArr.map(function(node) {
                return node.name;
            }).reverse().join("/");
        }

        function goThroughTree(callback) {
            var node = null;
            auxo.treeWalk($scope.dataForTheTree, function (key, value, path, parent) {
                var v = callback(value);
                if(v) {
                    node = v;
                    return 'break';
                }
            })
            return node;
        }

        function removeTreeNode(node) {
            auxo.treeWalk($scope.dataForTheTree, function (key, value,path,parent) {
                if(value === node) {
                    auxo.array.remove(parent,key)
                    return "break"
                }
            })
        }



        $scope.onSelected = function (node) {
            $scope.selectedNode = node;



            if(node.id === 'data_monitor') {
                $state.go('monitor_main.data');
            } else if(node.id === 'task_monitor') {
                $state.go('monitor_main.task');
            } else if(node.id == 'execution_monitor') {
                $state.go('monitor_main.summary');
            }


            function resetQuery() {
                $scope.currPage = 1;
                $scope.reverse = true;
                $scope.sorts = "latestStartup"
                $scope.ptableState = {
                    pagination: {
                        start: $scope.currPage>0?$scope.currPage-1:0,
                        totalItemCount: 0
                    },
                    sort: {
                        predicate: $scope.sorts,
                        reverse: $scope.reverse
                    }
                }
            }
        }

        $scope.onNodeToggle = function (node, expanded) {

        }

        $scope.initSplitter = function () {
            $scope.splitter = $('#foo').height(500).split({
                orientation: 'vertical',
                limit: 280,
                position: '30%', // if there is no percentage it interpret it as pixels
                onDrag: function(event) {
                    console.log($scope.splitter.position());
                }
            });
        }

        $scope.entity=angular.toJson($scope.entity,true);


        function getRoot(node) {
            while(true) {
                var parentId = node.parentId;
                if(!parentId)
                    return node;
                node = findNode(parentId);
            }
        }
    });

