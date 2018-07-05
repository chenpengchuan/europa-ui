auxo.setupCommonTree = function($scope, Restangular){

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
            return !node.children || node.children.length===0;
        },
        selectNodeHead: function(node) {
            console.log("************node:" + node.name)
        }
    }

    $scope.sortNode = function(a, b) {
        if(!a.index)
            a.index = 0;
        if(!b.index)
            b.index = 0;
        return a.index - b.index
    }

    $scope.sortTree = function(roots) {
        if(!roots)
            return;
        roots.sort($scope.sortNode);
        auxo.treeWalk(roots, function (key, value, path, parent) {
            if(key === 'children' && value)
                value.sort($scope.sortNode);
            if(value && 'dir,root'.indexOf(value.resType)>=0 && !value.children)
                value.children = []
        })
    }

    $scope.findNode = function(id) {
        var node = null;
        auxo.treeWalk($scope.dataForTheTree, function (key, value, path, parent) {
            if(key === 'id' && value === id) {
                node = parent;
                return 'break';
            }
        })
        return node;
    }

    $scope.findRoot = function(node) {
        while(node.parentId) {
            node = $scope.findNode(node.parentId)
        }
        return node;
    }

    $scope.goThroughTree = function(callback) {
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

    $scope.onSelected = function (node, callback) {
        $scope.selectedNode = node;

        // if (node.name === '共享' && (node.path === "数据集/共享" || node.path === '共享')) {

        // } else {
            Restangular.one("europa/resource", node.id).get({includes: node.resType}).then(function (e) {
                auxo.array.removeAll(node.children);
                auxo.array.insertArray(node.children, e.children);
                $scope.sortTree(node.children);
                if(callback)
                    callback();
            })
        // }

        function resetQuery() {
            $scope.currPage = 1;
            $scope.reverse = true;
            $scope.sorts = "lastModifiedTime"
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
        resetQuery();
        if($scope.fetchPage)
            $scope.fetchPage($scope.ptableState);

    }
}