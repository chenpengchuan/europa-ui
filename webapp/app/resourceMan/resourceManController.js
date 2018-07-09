auxo.resourceTreeController = function ($filter, $scope, $location, $window, $http, $stateParams, Restangular, ngDialog, $timeout,$state) {

    var SCHEMA_ROOT_DIR = "Schemas";
    var DATASET_ROOT_DIR = "Datasets";
    var STANDARD_ROOT_DIR = "Standards";
    var DATASOURCE_ROOT_DIR = "Datasources";

    //resType nameMapping table
    var SCHEMA_DIR_RESTYPE_NAME = "schema_dir";
    var DATASET_DIR_RESTYPE_NAME = "dataset_dir";
    var DATASOURCE_DIR_RESTYPE_NAME = "datasource_dir";
    var STANDARD_DIR_RESTYPE_NAME = "standard_dir";
    var STANDARDMAPPING_DIR_RESTYPE_NAME = "standardMapping_dir";

    var ALL_DIR = SCHEMA_DIR_RESTYPE_NAME+";"+DATASET_DIR_RESTYPE_NAME+";"+
        DATASOURCE_DIR_RESTYPE_NAME+";"+STANDARD_DIR_RESTYPE_NAME+";"+STANDARDMAPPING_DIR_RESTYPE_NAME

    $scope.error = "";

    $scope.tabTitle = "资源目录"

    $scope.dataBackup = {}

    $scope.selectedNode = null;

    $scope.rowCollection = []

    $scope.selectedRows = []

    $scope.toExpandedNodes = [$stateParams.id1, $stateParams.id2,$stateParams.id3,$stateParams.id4];

//        获取采集器的node模仿selectNodeLabel行为
    var getLastNode = (function(){
        if( $stateParams.id3 &&  $stateParams.id3.length>1){
            var lastNodeId =  $stateParams.id3;
            return ( Restangular.one("europa/resource", lastNodeId).get().then(function (e) {
                $scope.selectedNode = e;
                $scope.onSelected($scope.selectedNode, true);
            }))
        }
    })();

    $scope.selectLastNode = function () {
        if($stateParams.id3 && $stateParams.id3.length > 1 && $stateParams.id4 == ""){
            var lastNodeId =  $stateParams.id3;
            return ( Restangular.one("europa/resource", lastNodeId).get().then(function (e) {
                $scope.selectedNode = e;
                $scope.onSelected($scope.selectedNode, true);
            }))
        }
        if($stateParams.id4 && $stateParams.id4.length > 1 && $stateParams.id4 != ""){
            var lastNodeId =  $stateParams.id4;
            return ( Restangular.one("europa/resource", lastNodeId).get().then(function (e) {
                $scope.selectedNode = e;
                $scope.onSelected($scope.selectedNode, true);
            }))
        }
    };

    function matchRequstUrlFromResType(restype) {
        switch (restype){
            case SCHEMA_DIR_RESTYPE_NAME: return"schemas";
            case DATASET_DIR_RESTYPE_NAME: return "datasets";
            case DATASOURCE_DIR_RESTYPE_NAME: return "europa/datasource";
            case STANDARD_DIR_RESTYPE_NAME: return "europa/standardbd";
        }
    }

    function matchRequstUrlFromIdPrefix(tableName) {
        switch (tableName){
                // csm : merce_schema
                // cds:  merce_dataset
                // dss: merce_dss
                // sdb : merce_sdb
                // smp : merce_standard_mapping
                // std : merce_standard
            case "merce_schema": return"schemas";
            case "merce_dataset": return "datasets";
            case "merce_dss": return "europa/datasource";
            case "merce_sdb": return "europa/standardbd";
            case "merce_standard": return "europa/standards";
            case "merce_standard_mapping": return "europa/standardMappings";
        }
    }

    function findResourceType(node) {
        switch (node.tableName){
            case "merce_schema": return"schema";
            case "merce_dataset": return "dataset";
            case "merce_dss": return "datasource";
            case "merce_sdb": return "standardbd";
            case "merce_standard": return "standard";
            case "merce_standard_mapping": return "standardMapping";
        }
    }

    if(!$scope.url) {
        var currentState = auxo.$state.current.name;
        if ($scope.currentState)
            currentState = $scope.currentState;
        if(currentState === "dataflow")
            $scope.url = "flowResource";
        else
            $scope.url = "europa/resource";
    }

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


    $scope.autoExpand = function () {
        if($scope.toExpandedNodes && $scope.toExpandedNodes.length > 0) {
            $scope.toExpandedNodeId = $scope.toExpandedNodes[0];
            $scope.toExpandedNodes.splice(0,1);
        } else
            $scope.toExpandedNodeId = null;

        if($scope.toExpandedNodeId) {
            $scope.expandNode($scope.toExpandedNodeId)
            $scope.toExpandedNodeId = null;
        }

    }

    $scope.expandNode = function (nodeId) {
        if(nodeId) {
            $timeout(function () {
                var treeScope = auxo.searchScopeChild($scope, function (scope) {
                    if (scope.parentScopeOfTree === $scope) {
                        return true;
                    }
                })
                var toExpandScope = auxo.searchScopeChild($scope, function (scope) {
                    if (scope.node && scope.node.id === nodeId) {
                        return true;
                    }
                })
                if (toExpandScope)
                    treeScope.selectNodeHead.call(toExpandScope);

                return 'ok'
            }, 1);
        }
    }

    $scope.sortNode = function (a, b) {
        if(a.resType === 'user' && b.resType !== 'user')
            return 1;
        if(a.resType !== 'user' && b.resType === 'user')
            return -1;
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

    function findRoot(node) {
        var root = null;
        var rootMap = {};
        auxo.array.forEach($scope.dataForTheTree, function (e) {
            auxo.treeWalk(e, function (key, value) {
                if(value === node) {
                    root = e;
                    return "break";
                }
            })
            if(root)
                return false;
        });
        if(!root)
            root = node;
        return root;
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

    $scope.removeEmptyChildren = function (nodes) {
        if(!nodes)
            return;
        auxo.array.forEach(nodes, function (e) {
            if(e.children && e.children.length === 0)
                delete e.children;
        })
    }

    // Restangular.all("resource/roots").getList({includes:"dir;root",excludes:"Schemas"}).then(function(roots) {
    if(!$scope.loadTree) {
        var currentState = auxo.$state.current.name;
        if ($scope.currentState)
            currentState = $scope.currentState;
        function getIncludes() {
            if (currentState === 'dataflow')
                return ALL_DIR + ";$Flows";
            return ALL_DIR;
        }

        function getExcludes() {
            if (currentState === 'dataflow')
                return "";

            return "$Workflow;$Dataflow;$Streamflow";
        }

        function getNames() {
            if (currentState === 'dataflow')
                return "Flows";
            //return "Dataflow;Workflow;Streamflow";
        }

        $scope.loadTree = function () {
            Restangular.all($scope.url+"/roots").getList({
                includes: getIncludes(),
                excludes: getExcludes(),
                strict: "true",
                names: getNames(),
                allUser: "true"
            }).then(function (roots) {
                $scope.removeEmptyChildren(roots);
                $scope.sortTree(roots)
                auxo.treeWalk(roots, function (key, value) {
                    if (value && value.name === '数据元数据')
                        value.name = "标准";
                })

                $scope.dataForTheTree = roots;
                if(!$scope.toExpandedNodes[0])
                    $scope.onSelected(roots[0]);
                $scope.dataBackup.roots = auxo.clone(roots);

                $scope.autoExpand();
            });
        }
    }

    $scope.addOrEditDir = function (node) {
        var edit = node?true:false;
        auxo.openInputDialog("输入目录名称（字母，数字和下划线）",
            node? node.name: "新建目录",
            function (newValue) {
                if(newValue) {
                    if(!node) {
                        if ($scope.selectedNode != null) {
                            node = {name: newValue}
                            node.parent = {id:$scope.selectedNode.id};
                            node.tenant = {id:$scope.selectedNode.tenant.id};
                            node.resType = $scope.selectedNode.resType;
                            node.path = $scope.selectedNode.path.concat("/").concat(newValue);
                        }
                    } else {
                        node = auxo.clone(node);
                        node.name = newValue;
                        // node.parent = {id:$scope.selectedNode.id};
                        // node.tenant = {id:$scope.selectedNode.tenant.id};
                    }
                    delete node.index;
                     node.children =[];
                    if(edit) {
                        delete node.isSelected;
                        node.parent =  {id:node.parent.id};
                        Restangular.all($scope.url).customPUT(node,node.id).then (function (result) {
                            $scope.onSelected($scope.selectedNode, true)
                            $scope.selectedNode.name = node.name;
                        }, function (errmsg) {
                            auxo.showErrorMsg(errmsg)
                        })
                    } else  {
                        Restangular.all($scope.url).post(node).then (function (result) {
                            // $scope.reloadNode($scope.selectedNode);
                            if(edit)
                                $scope.selectedNode.name = node.name;
                            $scope.onSelected($scope.selectedNode, true)
                        }, function (errmsg) {
                            auxo.showErrorMsg(errmsg)
                        })
                    }
                }
            },
            null,
            300
        )
    }

    function removeTreeNode(node) {
        auxo.treeWalk($scope.dataForTheTree, function (key, value,path,parent) {
            if(value === node) {
                auxo.array.remove(parent,key)
                return "break"
            }
        })
    }
    // false 显示
    $scope.isButtonsDisabled = function (tokens) {
        var disabled = true;
        auxo.array.forEach(tokens, function (e) {
            var node = $scope.selectedNode
            if(!$scope.isButtonDisabled(e) &&
                (isSharedDir($scope.selectedNode,$scope.getRoot($scope.selectedNode)) || $scope.selectedNode.owner && $scope.selectedNode.owner === auxo.Auth.user.name)) {
                disabled = false;
                return false;
            }
        })
        return disabled;
    }

    $scope.isShowDropdownMenu = function () {
        if ($scope.selectedNode != null ){
            var root = findRoot($scope.selectedNode);
            var isShow = true;
            if (root.resType === $scope.selectedNode.resType && $scope.selectedRows.length <= 0){
                isShow = false;
            }
            return isShow;
        }
        return false;
    }
    $scope.isButtonDisabled = function (name) {
        /*
        if($scope.selectedNode) {
            if($scope.selectedNode.path === "数据集/共享" || $scope.selectedNode.path === "共享")
                return true;
        }
        */

        var root = findRoot($scope.selectedNode);
//            if(root && root.resType !== 'root')
//                return true;
//
//            if(root && root.resType === 'user')
//                return true;
        if("delete" === name) {
            return !$scope.selectedRows || $scope.selectedRows.length === 0;
        }

        if("dataset" === name) {
            return !$scope.selectedNode || $scope.getRoot($scope.selectedNode).name !== DATASET_ROOT_DIR || ALL_DIR.indexOf($scope.selectedNode.resType)<0;
        }
        if("HTTP" === name) {
            return !$scope.selectedNode || $scope.getRoot($scope.selectedNode).name !== DATASOURCE_ROOT_DIR || ALL_DIR.indexOf($scope.selectedNode.resType)<0;
        }
        if("datasource" === name) {
            return !$scope.selectedNode || $scope.getRoot($scope.selectedNode).name !== DATASOURCE_ROOT_DIR || ALL_DIR.indexOf($scope.selectedNode.resType)<0;
        }
        if("datasource2" === name) {
            return !$scope.selectedNode || $scope.getRoot($scope.selectedNode).name !== DATASOURCE_ROOT_DIR || ALL_DIR.indexOf($scope.selectedNode.resType)<0;
        }
        if("dataspool" === name) {
            return !$scope.selectedNode || $scope.getRoot($scope.selectedNode).name !== "存储池" || ALL_DIR.indexOf($scope.selectedNode.resType)<0;
        }
        if("dir" === name) {
            return !$scope.selectedNode || (ALL_DIR.indexOf( $scope.selectedNode.resType)<0)
        }
        if("standard" === name) {
            return !$scope.selectedNode || $scope.getRoot($scope.selectedNode).name !== STANDARD_ROOT_DIR || ALL_DIR.indexOf($scope.selectedNode.resType)<0;
        }
        if("standardMapping" === name) {
            return !$scope.selectedNode || $scope.getRoot($scope.selectedNode).name !== STANDARD_ROOT_DIR || ALL_DIR.indexOf($scope.selectedNode.resType)<0;
        }
        if("schema" === name) {
            return !$scope.selectedNode || $scope.getRoot($scope.selectedNode).name !== SCHEMA_ROOT_DIR || ALL_DIR.indexOf($scope.selectedNode.resType)<0;
        }
        if("moveDir" === name) {
            return !$scope.selectedNode || !($scope.selectedNode.parent && $scope.selectedNode.parent.id);
        }
        if("deleteDir" === name) {
            return !$scope.selectedNode || !($scope.selectedNode.parent && $scope.selectedNode.parent.id);
        }
        if("shareDir" === name) {
            return !$scope.selectedNode || !($scope.selectedNode.parent && $scope.selectedNode.parent.id);
        }
        if("move" === name) {
            return !$scope.selectedNode || $scope.selectedRows.length === 0;
        }
        if("reNameDir" === name) {
            return !$scope.selectedNode || !($scope.selectedNode.parent && $scope.selectedNode.parent.id);
        }
        if("Workflow" === name) {
            return !$scope.selectedNode || $scope.getRoot($scope.selectedNode).name !== "Flows" || ALL_DIR.indexOf($scope.selectedNode.resType)<0;
        }
        if("Dataflow" === name) {
            return !$scope.selectedNode || $scope.getRoot($scope.selectedNode).name !== "Flows" || ALL_DIR.indexOf($scope.selectedNode.resType)<0;
        }
        if("Streamflow" === name) {
            return !$scope.selectedNode || $scope.getRoot($scope.selectedNode).name !== "Flows" || ALL_DIR.indexOf($scope.selectedNode.resType)<0;
        }
    }

    $scope.deleteNode = function() {
        if(!$scope.selectedRows || $scope.selectedRows.length ===0)
            return;
        //获取选中的id
        function getSelectRowIds() {
            var ids = [];
            for (var i = 0; i < $scope.selectedRows.length; i++) {
                ids.push($scope.selectedRows[i].id);
            }
            return ids;
        }
        auxo.sgDialogService.confirm(auxo.buildErrorMsg("真的要删除所选的"+$scope.selectedRows.length+"个项目吗？","question"), function (result) {
            if(result) {
                var ids = getSelectRowIds();
                Restangular.all(matchRequstUrlFromResType($scope.selectedNode.resType)).customPOST(ids, "removeList").then(function(d){
                    auxo.array.removeAll($scope.selectedRows)
                    $scope.onSelected($scope.selectedNode, true);
                }, function(err){
                    auxo.openErrorDialog($scope, ngDialog, err.data.err);
                });
            }
        }, "确认");
    }

    $scope.moveNode = function (type) {
        if(type !== 'rows' && type !== 'dir')
            return;
        if(type ==='rows' && (!$scope.selectedRows || $scope.selectedRows.length ===0))
            return;
        if(type === 'dir' && (!$scope.selectedNode ))
            return;
        //获取选中的id
        function getSelectRowIds() {
            var ids = [];
            if(type === 'rows') {
                for (var i = 0; i < $scope.selectedRows.length; i++) {
                    ids.push($scope.selectedRows[i].id);
                }
            } else {
                ids.push($scope.selectedNode.id);
            }
            return ids;
        }
        var root = findRoot($scope.selectedNode);

        $scope.openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/dirSelector.html',
                data:{
                    editingNode:{
                        url: $scope.url,
                        rootId:root.id,
                        currentId:$scope.selectedNode.id,
                        resType:$scope.selectedNode.resType,
                        excludes: [type==='dir'? $scope.selectedNode.id:''],
                        callback: function (dirId, yes, cancel) {
                            if(type === "dir" && (dirId === $scope.selectedNode.parent.id || dirId === $scope.selectedNode.id)) {
                                if(yes)
                                    yes("")
                                return;
                            }
                            Restangular.all($scope.url).customPOST(getSelectRowIds(), 'move', {
                                dirId: dirId,
                                type: type
                            }).then(
                                function(resp){
                                    alert("保存成功！");
                                    if(yes)
                                        yes(dirId)
                                },
                                function(es) {
                                    auxo.showErrorMsg(es);
                                });
                        }
                    }
                },
                callback: function(newData){
                    if(newData) {
                        if(type === "rows")
                            $scope.onSelected($scope.selectedNode, true);
                        else if(type === "dir") {
                            var parent = $scope.findNode($scope.selectedNode.parent.id);
                            if(parent)
                                $scope.onSelected(parent, true);
                        }
                    }
                },
                width:800
            });
        }
        $scope.openDialog();
    }

    $scope.reNameDir = function (type) {
        if(type !== 'dir')
            return;
        if(type === 'dir' && !$scope.selectedNode )
            return;
        var root = findRoot($scope.selectedNode);

        $scope.addOrEditDir($scope.selectedNode);
    }

    function findParents(ancestor, node, ret) {
        var find = false;
        auxo.array.forEach(ancestor.children, function (e) {
            if(e === node) {
                ret.push(e);
                find = true;
                return false;
            } else {
                if(findParents(e, node, ret)){
                    ret.push(e);
                    find = true;
                    return false;
                }
            }
        })
        return find;
    }

    function isSharedDir(node, root) {
        if(auxo.isAdmin())
            return true;
        if(!node)
            node = $scope.selectedNode;
        if(!root)
            root = findRoot(node);
        var shared = false;
        var parents = []
        findParents(root, node, parents);
        auxo.array.forEach(parents, function (e) {
            if(e.shared && e.shared.length>0){
                shared = true;
                return true;
            }
        })
        return shared;
    }

    function matchResourceType(node) {

        var resTpyeObject = {name : "resType", "disName" : "类型", converter : function (value, row) {
            if(value === 'data_spool' || value === 'dataset_spool') {
                if(row.attributes.dataset && row.attributes.dataset.storage)
                    value = row.attributes.dataset.storage;
                else if(row.attributes.storeType)
                    value = row.attributes.storeType;
            }
            var r= auxo.meta.resource.displayMap[value];
            return r? r: value;
        }};

        //to dynamic loading type field
        switch (node.resType){
            case SCHEMA_DIR_RESTYPE_NAME: {
                //nothing to do
            };break;
            case DATASET_DIR_RESTYPE_NAME: {
                //nothing to do
            };break;
            case DATASOURCE_DIR_RESTYPE_NAME: {
                var addTypeFiled = true;
                for(var i=0; i<auxo.meta.resource.rowHeaders.length; i++) {
                    if(auxo.meta.resource.rowHeaders[i].name === 'type') {
                        addTypeFiled = false;
                    }
                }
                if (addTypeFiled) {
                    resTpyeObject.name = "type";
                    auxo.meta.resource.rowHeaders.splice(1, 0, resTpyeObject);
                }
            };break;
            case STANDARD_DIR_RESTYPE_NAME: {

            };break;
            case STANDARDMAPPING_DIR_RESTYPE_NAME: {

            };break;
        }
    }

    $scope.onSelected = function (node, noReset) {
        $scope.selectedNode = node;
        $scope.restRootPath = matchRequstUrlFromResType(node.resType);
        var flag = false;
        if( !$scope.toExpandedNodes[2]){
            var rootNode = $scope.getRoot($scope.selectedNode);

            for(var i=0; i<auxo.meta.resource.rowHeaders.length; i++) {
                if(auxo.meta.resource.rowHeaders[i].name === 'expiredPeriod') {
                    flag = true;
                    break;
                }
            }
            if(rootNode){
            //     matchResourceType(rootNode);

                switch (rootNode.name){
                    case 'Datasources': $scope.keyword = "DB";break;
                    case 'Standards': $scope.keyword = "standard|standardMapping";break;
                    case 'Datasets': $scope.keyword = "dataset_db|dataset_spool";break;
                    // case '存储池': $scope.keyword = "data_spool";break;
                    case 'Schemas':$scope.keyword = "schema";break;
                }
                if(!flag){
                    if(rootNode['name'] == '数据集'){
                        auxo.meta.resource.rowHeaders.push({name : "expiredPeriod", disName : "过期时间", converter : function(res,row){
                            if(res == 0 || res> 200000000000){
                                return "永不过期";
                            }else {
                                return auxo.date2str(row.createTime + res*1000);
                            }
                        }})
                    }
                }else if(rootNode['name'] != '数据集'){
                    auxo.removeObj(-1, auxo.meta.resource.rowHeaders);
                    flag = false;
                }
            }
        }


        if(node.resType === 'user') {
        // } else if (node.name === '共享' && (node.path === "数据集/共享" || node.path === '共享')) {

        } else {
            Restangular.one($scope.url, node.id).get().then(function (e) {
                angular.merge(node, e);
                if(e.sharedUsers &&e.sharedUsers.length<1)
                    delete e.sharedUsers
                else
                     node.sharedUsers = e.sharedUsers;
                auxo.array.removeAll(node.children);
                auxo.array.forEach(e.children, function (i) {
                    if (ALL_DIR.indexOf(i.resType) >= 0)
                        node.children.push(i);
                })

                $scope.sortTree(node.children);
            })
        }

        function resetQuery() {
            $scope.limit = 10;
            $scope.currPage = 1;
            $scope.reverse = true;
            $scope.queryWord="";
            $scope.other = {};
            $scope.view.currentPageNumber = 1;
            //初始化页面时间插件
            $scope.dateRange = {
                startDate: "",
                endDate: "",
            }; //页面时间:startDate: "初始值的起始时间", endDate: "结束时间"
            $scope.startDate = "";
            $scope.endDate = "";
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
            $scope.rowCollection = [];
            $scope.selectedRows = [];
        }
        if(node.resType !== 'user') {
            if(!noReset)
                resetQuery();
            var root = findRoot(node);
            if(root.resType === 'user' ){
                if(!isSharedDir($scope.selectedNode, root))
                    return;
            }
            delete $scope.searchType;
            $scope.doQuery($scope.queryWord);
        }
    }

    $scope.shareDir = function () {
        var openDialog = function(entity){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/share.html',
                data:{editingNode:entity, url: $scope.url},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        openDialog($scope.selectedNode);
    }

    $scope.shareWith = function (node) {
        var openDialog = function(entity){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/share.html',
                data:{editingNode:entity, url: $scope.url},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        Restangular.one($scope.url, node.id).get({tenant:node.tenant}).then(function (entity) {
            openDialog(entity);
        })
    }

    $scope.removeShare = function (node) {
        auxo.sgDialogService.confirm(auxo.buildErrorMsg("真的要取消共享吗？","question"), function (result) {
            if(result) {
                delete node.sharedUsers
                Restangular.all($scope.url).customPUT(node,node.id).then (function (result) {
                    $scope.onSelected($scope.selectedNode, true)
                }, function (errmsg) {
                    auxo.showErrorMsg(errmsg)
                })
            }
        }, "确认");
    }

    $scope.onNodeToggle = function (node, expanded) {
        console.log("########" + node.name + ";" + expanded)
        if(expanded && node.resType !== 'user') {
            auxo.array.removeAll(node.children);

            Restangular.one($scope.url, node.id).get({includes: ALL_DIR, tenant:node.tenant.id}).then(function (e) {
                angular.merge(node, e);
                auxo.array.removeAll(node.children);
                auxo.array.forEach(e.children, function (i) {
                    if (ALL_DIR.indexOf(i.resType) >= 0)
                        node.children.push(i);
                })


                $scope.sortTree(node.children);

                $scope.autoExpand();
            })
        }
    }

    $scope.fetchPage2 = function(tableState) {

        if(!$scope.selectedNode)
            return;

        $scope.restRootPath = matchRequstUrlFromResType($scope.selectedNode.resType);

        $scope.fetchPage(tableState)

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

    $scope.editResource = function (node) {
        node.shared = $scope.selectedNode.shared;
        var resourceType = findResourceType(node);

        if(resourceType === 'datasource')
            editDataSource(node)
        else if(resourceType === 'data_source')
            $scope.editDataSource2(node);
        else if(resourceType === 'dir')
            $scope.addOrEditDir(node);
        else if(resourceType === 'dataset')
            editDataset(node);
        else if(resourceType === 'data_spool')
            editDataSpool(node);
        else if(resourceType === 'standardbd')
            $scope.editStandard(node);
        else if(resourceType === 'schema')
            $scope.editSchema(node);
        else if(resourceType === 'dataflow')
            $scope.editDataflow(node);
        else if(resourceType === 'workflow')
            $scope.editWorkflow(node);
        else if(resourceType == 'HDFS' || resourceType == 'HIVE' || resourceType == 'HBASE' || resourceType == 'SOCKET' || resourceType == 'FTP' || resourceType == 'MQ')
            $scope.editOther(node);

    }

    $scope.entity=angular.toJson($scope.entity,true);

    $scope.superEdit = function () {
        var json = angular.toJson($scope.selectedNode,true);
        if($scope.selectedRows && $scope.selectedRows.length>0)
            json = angular.toJson($scope.selectedRows[0],true)

        $scope.openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/superEdit.html',
                data:{json: json},
                callback: function(jsonString){
                    if(jsonString) {
                        var node =angular.fromJson(jsonString);
                        delete node.isSelected;
                        Restangular.all($scope.url).customPUT(node,node.id).then (function (result) {
                            $scope.onSelected($scope.selectedNode, true)
                        }, function (errmsg) {
                            auxo.showErrorMsg(errmsg)
                        })
                    }
                },
                width:800
            });
        }
        $scope.openDialog();
    }

    function editDataset(node) {
        function openDialog (entity){
            entity.shared = node.shared;
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/datasetEdit.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode: entity},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        $scope.url = matchRequstUrlFromIdPrefix(node.tableName);
        Restangular.one($scope.url, node.id).get({tenant:node.tenant}).then(function (entity) {
            openDialog(entity);
        })
    }

    $scope.editDBSource = function (node) {
        var openDialog = function(entity){
            entity.shared = node.shared;
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/dataSourceEditing.html',
                data:{editingNode:entity},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        var requstUrl = matchRequstUrlFromIdPrefix(node.tableName);
        Restangular.one(requstUrl, node.id).get({tenant:node.tenant}).then(function (entity) {
            openDialog(entity);
        })
    }

    $scope.editHttp = function (node) {
        var openDialog = function(entity){
            entity.shared = node.shared;
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/webSourceEditing.html',
                data:{editingNode:entity},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        openDialog(node);
    }

    $scope.editOther = function (node) {
        var openDialog = function(entity){
            entity.shared = node.shared;
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/otherSourceEditing.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:entity},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        openDialog(node);
    }

    function editDatasetSpool2(node) {
        function openDialog (entity){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/datasetForSpool.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode: entity,
                    rootId: $scope.goThroughTree(function (value) {
                        if(value && !value.parent.id && value.name === '存储池') return value;
                    }).id
                },
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        Restangular.one($scope.url, node.id).get({tenant:node.tenant}).then(function (entity) {
            openDialog(entity);
        })
    }

    $scope.getRoot = function(node) {
        while(true) {
            var parentId = node.parent?node.parent.id:"";
            if(!parentId)
                return node;
            node = $scope.findNode(parentId);
        }
    }

    $scope.addDataSpool = function () {
        if(!verifySelectedNode('spool'))
            return;

        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/dataSpool.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:{resource: {id:$scope.selectedNode.id}, resType:"data_spool"}},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        openDialog();
    }

    $scope.addStandard = function () {
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/standardDetail.html',
                data:{editingNode:{resource:{id: $scope.selectedNode.id}, type:"standard"}},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        openDialog();
    }

    $scope.addSchema = function () {
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/SchemaDetail.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:{resource:{id: $scope.selectedNode.id}, resType:"schema"}},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        openDialog();
    }

    $scope.editSchema = function (node) {
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/SchemaDetail.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:node,editingNode:{resource:{id:node.id}}},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:1000
            });
        }
        openDialog();
    }

    $scope.addDataflow = function () {
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/designer/designer.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{flowParams:{parentId: $scope.selectedNode.id, resType:"dataflow"},
                    $stateParams: {id:'', action:'new',flowType:'dataflow'}},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:$scope.$root.windowWidth*96/100
            });
        }
        openDialog();
    }

    $scope.addStreamflow = function () {
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/designer/designer.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{flowParams:{parentId: $scope.selectedNode.id, resType:"streamflow"},
                    $stateParams: {id:'', action:'new',flowType:'streamflow'}},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:"96%"
            });
        }
        openDialog();
    }

    $scope.editDataflow = function (node) {
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/designer/designer.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{flowParams:{parentId: $scope.selectedNode.id, resType:"dataflow"},
                    $stateParams: {id:node.id, action:'edit',flowType:'dataflow'}},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:$scope.$root.windowWidth*96/100
            });
        }
        openDialog();
    }

    $scope.addWorkflow = function () {
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/designer/designer.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{flowParams:{parentId: $scope.selectedNode.id, resType:"workflow"},
                    $stateParams: {id:'', action:'new',flowType:'workflow'}},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width: $scope.$root.windowWidth*96/100
            });
        }
        openDialog();
    }

    $scope.editWorkflow = function (node) {
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/designer/designer.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{flowParams:{parentId: $scope.selectedNode.id, resType:"workflow"},
                    $stateParams: {id:node.id, action:'edit',flowType:'workflow'}},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:$scope.$root.windowWidth*96/100
            });
        }
        openDialog();
    }

    $scope.editStandardMapping = function (node) {
        node.resource = {id:$scope.selectedNode.id};
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/standardMapping.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:node},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:1000
            });
        }
        openDialog();
    }

    $scope.addStandardMapping = function () {
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/standardMapping.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:{resource: {id:$scope.selectedNode.id}, type:"standardMapping"}},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:1000
            });
        }
        openDialog();
    }

    function editDataSpool (node) {
        if(!verifySelectedNode('spool'))
            return;

        function openDialog (entity){
            entity.shared = node.shared;
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/dataSpool.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:entity},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        Restangular.one($scope.url, node.id).get({tenant:node.tenant}).then(function (entity) {
            openDialog(entity);
        })
    }

    function editStandard (node) {
        if(!verifySelectedNode('standard'))
            return;

        function openDialog (entity){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/standardDetail.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:entity},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        Restangular.one($scope.url, node.id).get({tenant:node.tenant}).then(function (entity) {
            openDialog(entity);
        })
    }

    function verifySelectedNode(type) {
        //$scope.callbackResult = "No callbacks yet";
        if(type === 'dataset') {
            if (!$scope.selectedNode || ALL_DIR.indexOf($scope.selectedNode.resType) <= 0) {
                auxo.alert(null, "请选择数据集或者子目录", "提示")
                return;
            }

            var root = $scope.getRoot($scope.selectedNode);
            if (root.name !== "Datasets") {
                auxo.alert(null, "请选择数据集或者子目录", "提示")
                return;
            }
        }
        if(type === 'spool') {
            if(!$scope.selectedNode || ALL_DIR.indexOf($scope.selectedNode.resType)<=0) {
                auxo.alert(null, "请选择存储池或者子目录", "提示")
                return;
            }

            var root = $scope.getRoot($scope.selectedNode);
            if(root.name !== "存储池") {
                auxo.alert(null, "请选择存储池或者子目录", "提示")
                return;
            }
        }
        if(type === 'standard') {
            if(!$scope.selectedNode || ALL_DIR.indexOf($scope.selectedNode.resType)<=0) {
                auxo.alert(null, "请选择标准或者子目录", "提示")
                return;
            }

            var root = $scope.getRoot($scope.selectedNode);
            if(root.name !== "Standards") {
                auxo.alert(null, "请选择标准或者子目录", "提示")
                return;
            }
        }
        if(type === 'Schemas') {
            if(!$scope.selectedNode || ALL_DIR.indexOf($scope.selectedNode.resType)<=0) {
                auxo.alert(null, "请选择Schemas或者子目录", "提示")
                return;
            }

            var root = $scope.getRoot($scope.selectedNode);
            if(root.name !== "Schemas") {
                auxo.alert(null, "请选择Schemas或者子目录", "提示")
                return;
            }
        }
        return true;
    }

    $scope.addDatasetFromSpool = function () {
        if(!verifySelectedNode('dataset'))
            return;

        $scope.openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/dataset.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:{resource:{id: $scope.selectedNode.id}},
                    rootId: $scope.goThroughTree(function (value) {
                        if(value && !value.parent.id ) return value;
                    }).id},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        $scope.openDialog();
    }

    $scope.addDatasetFromDB = function () {
        if(!verifySelectedNode('dataset'))
            return;

        $scope.openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/datasetForDB.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:{resource:{id: $scope.selectedNode.id}, resType:"dataset_db"},
                    rootId: $scope.goThroughTree(function (value) {
                        if(value && !value.parent.id && value.name === 'Datasources')
                            return value;
                    }).id},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        $scope.openDialog();
    }

    $scope.addDataSource = function () {
        //$scope.callbackResult = "No callbacks yet";
        if(!$scope.selectedNode || ALL_DIR.indexOf($scope.selectedNode.resType)<=0) {
            alert( ALL_DIR.indexOf($scope.selectedNode.resType))
            auxo.alert(null, "请选择数据源或者子目录", "提示")
            return;
        }

        var root = $scope.getRoot($scope.selectedNode);
        if(root.name !== DATASOURCE_ROOT_DIR) {
            auxo.alert(null, "请选择数据源或者子目录", "提示")
            return;
        }

        $scope.openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/dataSourceEditing.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:{resource: {id:$scope.selectedNode.id}, type:"DB"}},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        $scope.openDialog();
    }

    $scope.addWEBDataSource = function () {
        //$scope.callbackResult = "No callbacks yet";
        if(!$scope.selectedNode || ALL_DIR.indexOf($scope.selectedNode.resType)<=0) {
            alert( ALL_DIR.indexOf($scope.selectedNode.resType))
            auxo.alert(null, "请选择数据源或者子目录", "提示")
            return;
        }

        var root = $scope.getRoot($scope.selectedNode);
        if(root.name !== DATASOURCE_ROOT_DIR) {
            auxo.alert(null, "请选择数据源或者子目录", "提示")
            return;
        }

        $scope.openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/webSourceEditing.html',
                data:{editingNode:{resource:{id: $scope.selectedNode.id}, type:"DB"}},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        $scope.openDialog();
    }

    $scope.addOtherDataSource = function (resType) {
        //$scope.callbackResult = "No callbacks yet";
        var resType = resType;
        if(!$scope.selectedNode || ALL_DIR.indexOf($scope.selectedNode.resType)<=0) {
            alert( ALL_DIR.indexOf($scope.selectedNode.resType))
            auxo.alert(null, "请选择数据源或者子目录", "提示")
            return;
        }

        var root = $scope.getRoot($scope.selectedNode);
        if(root.name !== DATASOURCE_ROOT_DIR) {
            auxo.alert(null, "请选择数据源或者子目录", "提示")
            return;
        }

        $scope.openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/otherSourceEditing.html',
                data:{editingNode:{resource:{id: $scope.selectedNode.id}, type:resType}},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        $scope.openDialog();
    }

    var editDataSource = function (node) {
        if (!node || !node.type){
            alert("Datasource Type is Null.");
            return;
        }
        var type = node.type;

        if (type === 'DB')
            $scope.editDBSource(node);
        else if (type === 'HTTP')
            $scope.editHttp(node);
        else if (type == 'HDFS' || type == 'HIVE' || type == 'HBASE' || type == 'SOCKET' || type == 'FTP' || type == 'MQ')
            $scope.editOther(node);

    }

    $scope.addDataSource2 = function () {
        if(!verifySelectedNode('datasource'))
            return;

        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/dataSpool.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:{parentId: $scope.selectedNode.id, resType:"data_source"}},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        openDialog();
    }

    var editDataSource2 = function (node) {
        if(!verifySelectedNode('datasource'))
            return;

        function openDialog (entity){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/dataSpool.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:entity},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }
        Restangular.one($scope.url, node.id).get({tenant:node.tenant}).then(function (entity) {
            openDialog(entity);
        })
    }

    function editDatasetDB(node) {
        var openDialog = function(entity){
            entity.shared = node.shared;
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/datasetForDBEdit.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:entity,
                    rootId: $scope.goThroughTree(function (value) {
                        if(value && !value.parent.id && value.name === 'Datasources') return value;
                    }).id
                },
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:800
            });
        }

        Restangular.one($scope.url, node.id).get({tenant:node.tenant}).then(function (entity) {
            if(!entity.attributes.schema.fields) {
                Restangular.one("schemas", node.attributes.schema.id).get({tenant:node.tenant}).then(function (entity1) {
                    entity.attributes.schema.fields = entity1.fields;
                    openDialog(entity);
                })
            } else
                openDialog(entity);
        })
    }

    $scope.deleteDir = function () {
        if(!$scope.selectedNode || $scope.selectedNode.resType === 'root')
            return;

        auxo.sgDialogService.confirm(auxo.buildErrorMsg("真的要删除所选的目录吗？","question"), function (result) {
            if(result) {
                var id = $scope.selectedNode.id;
                Restangular.one($scope.url, id).remove().then(function () {
                    removeTreeNode($scope.selectedNode);
                    var parent = $scope.findNode($scope.selectedNode.parent.id);
                    //$scope.selectedNode = null;
                    $scope.onSelected(parent);
                })
            }
        }, "确认");

    }

    /**
     * 为了区别 选择node 和 选择node并搜索 两个操作
     * 选择node：不显示数据的路径
     * 搜索： 需要显示数据的路径
     */
    $scope.doSearch = function (queryWord) {
        $scope.rowCollection = [];
        $scope.searchType = "search";
        $scope.doQuery(queryWord);
    }
    $scope.test = function () {
        Restangular.all("europa/resource/debug").post({a:'true'}).then(function () {

        });

        /*
        var id = $scope.selectedNode.id;
        Restangular.one($scope.url, id).remove().then(function () {

        })
        */

    }

    $scope.previewData = function (node) {
        function openDialog (entity){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/dataPreview.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:entity, tenant: node.tenant},
                callback: function(newData){
                },
                width:800
            });
        }
        $scope.url = matchRequstUrlFromIdPrefix(node.tableName);
        Restangular.one($scope.url, node.id).get({tenant:node.tenant}).then(function (entity) {
            openDialog(entity);
        })
    }

    $scope.editStandard = function (node) {
        if (node.type === 'standard')
            $scope.showStandardTable(node);
        else if (node.type === 'standardMapping')
            $scope.editStandardMapping(node);
    }

    $scope.showStandardTable = function (node) {
        if(!verifySelectedNode('standard'))
            return;

        //匹配标准的请求路径
        if (node)
            $scope.url = matchRequstUrlFromIdPrefix(node.tableName);

        function openDialog (entity){
            entity.shared = node.shared;
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/standardDetail.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode:entity, sharedDir: isSharedDir()},
                callback: function(newData){
                    if(newData) {
                        $scope.onSelected($scope.selectedNode, true);
                    }
                },
                width:1024
            });
        }
        Restangular.one($scope.url, node.id).get({tenant:node.tenant}).then(function (entity) {
            openDialog(entity);
        })
    }
    var lastModifiedTimeTmp = "";
    auxo.meta.resource = {
        currUrl:"/"+$scope.url,
        restRootPath:$scope.url,
        detailTemplate : "",
        entityDisplayName:"Resource",
        getBaseFilter: function() {
            var root = findRoot($scope.selectedNode);
            function isKeywordExist() {
                if ($scope.keyword) {
                    if ($scope.keyword === "dataset") {
                        $scope.keyword = "dataset_db|dataset_spool";
                    }
                    if ($scope.keyword === "Schemas") {
                        $scope.keyword = "schema";
                    }
                } else {
                    $scope.keyword = "dataset_db|dataset_spool|DB|data_spool|standard|standardMapping|schema|dataflow|workflow|HTTP";
                }
            }
            if(root.resType === 'user'){
                //if($scope.selectedNode.path === '数据集/共享' || $scope.selectedNode.path === '共享') {
                //var shareString = $scope.selectedNode.tenant + ":" + $scope.selectedNode.owner;
                //return "sharedUsers=" + shareString+":r|" + shareString + ":rw|" + "&resType=dataset_db|dataset_spool|DB|data_spool|standard|standardMapping|schema|dataflow|workflow";
                if(isSharedDir($scope.selectedNode,root))
                    return "owner=" + $scope.selectedNode.owner + "&path=" + $scope.selectedNode.path;
            } else if(!$scope.selectedNode){
                isKeywordExist();
                return "resType=" + $scope.keyword;
            } else if ($scope.searchType === "search"){
                isKeywordExist();
                if ($scope.selectedNode.resType === "root"){
                    return "resType=" + $scope.keyword + "&owner=" + $scope.selectedNode.owner;
                }
                return "path_match=" + $scope.selectedNode.path  + "&owner=" + $scope.selectedNode.owner;
            } else {
                return "parentId=" + $scope.selectedNode.id;
            }
        },
        displayMap: {"dir":"目录","dataset":"数据源","DB":"JDBC",
            "data_spool":"HDFS","MQ":"消息队列","KV":"Key-Value数据库","HDFS":"分布文件系统","standard":"标准","standardMapping":"标准映射","schema":"Schema"},
        rowHeaders : [
            {name : "name", disName : "名称", sortName: "name_sort", converter : function (value, row) {
                if ($scope.searchType === "search"){
                    return row.path +"/"+row.name;
                }
                return row.name;
            }},
            {name : "type", "disName" : "类型", converter : function (value, row) {
                    if (row.tableName === 'cds' && row.storage) {
                        value = row.storage;
                    } else if (row.tableName === 'csm'){
                        value = "schema"
                    }
                    var r= auxo.meta.resource.displayMap[value];
                    return r? r: value;
            }},
            {name : "description", "disName" : "简介", converter : function (value, row) {
                var intro = row.description
                return intro;
            }},
            {name : "tenant", "disName" : "租户", converter : function (res) {
                return res.name;
            }},
            {name : "version", "disName" : "版本", converter : auxo.same},
            {name : "createTime", disName : "创建时间", converter : auxo.date2str},
            {name : "creator", disName : "创建人", converter : auxo.same},
            {name : "lastModifier", disName : "修改人", converter : auxo.same},
            {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
        ],
        sort : {predicate:"lastModifiedTime", reverse:true}
    };

    function typeField() {

    }

    CrudBaseController.call(this, auxo.meta.resource, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

    $scope.reloadPage = function (limit) {
        if(limit)
            $scope.limit = limit;
        $scope.fetchPage($scope.ptableState);
    }
    $scope.loadTree($scope, Restangular);
};

angular.module('AuxoApp')
    .controller('ResourceManController', function ($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog, $timeout,$state) {
        auxo.resourceTreeController ($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog, $timeout,$state);
    });
