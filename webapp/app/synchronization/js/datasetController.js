angular.module('AuxoApp')
.controller('DatasetGuideControllerEuropa', function ($scope, $window, $http, $stateParams, $location,ngTreetableParams, ngDialog, Restangular, modalInstance, sgDialogService, Auth) {
    var isNew = !$scope.editingNode || !$scope.editingNode.id;
    var ResourceId = $scope.editingNode.ResourceId;
    $scope.ResourceId = ResourceId;
    $scope.error = "";
    $scope.rootId = $scope.rootId;
    $scope.dataForTheTree = [];
    $scope.selectedNode = null;
    $scope.selectedTable = null;
    $scope.selectedColumns = [];
    $scope.whereString = "";
    $scope.sqlString = "";
    $scope.columns = []
    $scope.page = 1

    function getColumns() {
        Restangular.all("europa/resource/table/columns/" + $scope.selectedTable).post($scope.selectedNode).then(function(results) {
            for(var i=0;i<results.length;i+=2) {
                $scope.columns.push({name: results[i],dataType:results[i+1]})
            }
        });
    }

    $scope.datasetEntity = {
        "id":"",
        "name": "",
        "description":"",
        "resType":"dataset_db",
        "attributes": {
            "expiredPeriod":0,
            "schema":{fields:[]},
            "dataSource": "",
            "table":"",
            "columns": "",
            "sql":"",
            "where": ""
        }
    }

    if($scope.editingNode && $scope.editingNode.id) {
        var attr = $scope.editingNode.attributes;
        $scope.selectedNode = attr.dataSource;
        $scope.selectedTable = attr.table;
        $scope.selectedColumns = attr.columns;
        $scope.whereString = attr.where;
        $scope.sqlString = attr.sql;

        getColumns();
    }
    angular.extend($scope.datasetEntity, $scope.editingNode);
    if($scope.datasetEntity.attributes.schema.id && !$scope.datasetEntity.attributes.schema.fields) {
        $scope.datasetEntity.attributes.schema.fields = [];
        Restangular.one("europa/resource/all", $scope.datasetEntity.attributes.schema.id).get().then(function(results) {
            auxo.array.forEach(results.attributes.fields, function (e) {
                $scope.datasetEntity.attributes.schema.fields.push(e)
            })
            datasetCopy = auxo.clone($scope.datasetEntity)
        });
    }
    var datasetCopy = auxo.clone($scope.datasetEntity)
    var sqlCopy = $scope.sqlString;

    $scope.meta = {
        fields: [
            auxo.form.buildItem({$name:"name", maxLength:100}),
            auxo.form.buildItem({$name:"description", maxLength:300}),
            auxo.form.buildItem({$name:"expiredPeriod", type: "TimePeriod"}),
        ]
    }

    auxo.array.forEach($scope.meta.fields, function (e) {
        if($scope.datasetEntity[e.$name] !== undefined)
            e.data = $scope.datasetEntity;
        else if($scope.datasetEntity.attributes[e.$name] !== undefined)
            e.data = $scope.datasetEntity.attributes;
    })

    var dirId = $scope.ResourceId ? $scope.ResourceId : $scope.rootId;

    Restangular.one("europa/resource/all/" + dirId ).get().then(function(dir) {
        Restangular.one("europa/datasource/allsource").get().then(function(sources) {
            var entity= buildDatasourceTree(dir,sources);
            for (i = 0; i < entity.children.length; i++) {
//  二级目录下的排序
                if (entity.children[i].children.length > 0) {
                    entity.children[i].children.sort(auxo.by(name));
                } else {
// 一级目录下的排序
                    entity.children.sort(auxo.by(name));
                }
            }
            auxo.array.forEach(entity.children, function (e) {
//      将同步任务中的datasource由采集器生成的部分隐藏
                if (!$scope.collectorDataId) {
                    if (e.name != "采集器") {
                        $scope.dataForTheTree.push(e);
                    }
                } else {
                    $scope.dataForTheTree.push(e);
                }
            })
            initTreeTable();
        });
    });
    /**
     * add all Datasource into dirTree
     * @param dir
     * @param source
     * @returns {*}
     */
    var buildDatasourceTree = function(dir,source){
        var child = dir.children;
        for(var i = 0;i<child.length;i++){
            buildDatasourceTree(child[i],source);
        }
        var listSource = findDatasourceByPath(dir,source);
        for(var j =0;j<listSource.length;j++) {
            dir.children.push(listSource[j]);
        }
        return dir;
    }

    /**
     * 查找属于当前目录下的所有DataSource
     * @param dir
     * @param sources
     * @returns {Array}
     */
    var findDatasourceByPath = function (dir,sources) {
        var inpath = [];
        for(var i=0;i< sources.length;i++){
            if(sources[i].path === dir.path){
                inpath.push(sources[i]);
            }
        }
        return inpath;
    }
    $scope.dynamic_params = new ngTreetableParams({
        getNodes: function(parent) {
            if(parent){
                nodes = parent.children;
            }else{
                nodes = $scope.dataForTheTree
            }
            return nodes;
        },
        getTemplate: function(node) {
            return 'app/synchronization/dataSourceTreeTableTemplate.html';
        },
        options: {
            initialState: "collapsed",
//            initialState: "expanded",
            onNodeExpand: function() {
                console.log('A node was expanded!');
            },
            onNodeSelected: function (node) {
                console.log(node.name + ' node was selected!');
            },
            onInitialized: function (a,b,c) {
                console.log(a + ";" + b + ";" + c)
                if($scope.selectedNode) {
                    auxo.treeWalk($scope.dataForTheTree, function (key, value) {
                        if(value && value.id === $scope.selectedNode.id) {
                            $scope.selectedNode = value;
                            return "break"
                        }
                    })
                }
            }
        }
    });

    function  initTreeTable() {
        if($scope.dynamic_params.refresh)
            $scope.dynamic_params.refresh()
    }

    $scope.onNodeSelected = function (node) {
        if(node && (node.resType == "HTTP"||node.resType == "DB" || node.resType == "SOCKET" || node.resType == "FTP")) {
            $scope.selectedNode = node;
        }
//        else{
//            auxo.sgDialogService.alert("请选择type为HTTP类型或者DB类型的数据！","提示");
//        }
    }

    $scope.onTableChange = function () {
        auxo.array.removeAll($scope.selectedColumns)
        $scope.whereString = "";
        $scope.sqlString = "";
        auxo.array.removeAll($scope.columns)

        if(!$scope.selectedTable)
            return;

        $scope.sqlString = "SELECT * FROM " + $scope.selectedTable + ";";

        getColumns();
    }

    $scope.onSelectedColumnChange = function () {
        $scope.sqlString = "";
        if($scope.selectedColumns && $scope.selectedColumns.length && $scope.selectedTable) {
            $scope.sqlString = "SELECT " + $scope.selectedColumns.join(", ") + " FROM " + $scope.selectedTable;
            if($scope.whereString)
                $scope.sqlString += " WHERE " + $scope.whereString.replace(/^\s*where\s/i,"") + ";"
        }
    }

    $scope.onWhereChange = function () {
       $scope.onSelectedColumnChange();
    }




    $scope.rowCollection = [];
    $scope.rowHeaders=[]

    $scope.fetchPage = function(tableState) {
        if (!tableState.sort.predicate) {
            tableState.sort.predicate = $scope.sorts;
            tableState.sort.reverse = $scope.reverse;
        }
        // todo
    }

    function  previewData() {
        if($scope.selectedTable) {
            Restangular.all("europa/resource/table/select").customPOST($scope.selectedNode,"",{ sql:"SELECT * FROM " + $scope.selectedTable, params:"limit:10;offset:0;rowCount:true"},{}).then(function(result) {
                $scope.rowHeaders = result.names
                $scope.rowCollection = result.rows? result.rows: [];
                $scope.page = "preview"
            },function (error) {
                auxo.showErrorMsg(error)
            });
        }
    }

    function validate(dataForSave) {
        if(!dataForSave.name )
            return "名称不能为空"
        if(!dataForSave.attributes.schema.fields)
            return "Schema字段不能为空"
    }

    // cancel click
    $scope.cancel = function () {
        auxo.delHotkey($scope)
        modalInstance.closeModal(false)
    }

    $scope.closeModal = function () { $scope.cancel(); }
    function ok () {
        $scope.forCallback = $scope.selectedNode;
        auxo.delHotkey($scope)
        modalInstance.closeModal($scope.forCallback);
    }

    $scope.title =  '选择数据源';

    $scope.modalButtons = [
        {
            action: ok, text: "确定", class: "btn-primary",
            disabled: function () { return false; },
        },
        {
            action: $scope.cancel, text: "取消", class: "btn-warning",
            hide: function () { return $scope.page === 'preview' }
        }
    ];

    auxo.bindEscEnterHotkey($scope)

})