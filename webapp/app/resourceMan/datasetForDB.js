angular.module('AuxoApp')
.controller('DatasetDBController', function ($filter, $timeout,$scope, $window, $http, $stateParams, $location, ngDialog, Restangular, modalInstance,ngTreetableParams, $state) {

    var isNew = !$scope.editingNode || !$scope.editingNode.id;

    $scope.error = "";
    //
    $scope.rootId = $scope.rootId;

    $scope.readonly = false;
    //if(!isNew && !auxo.isMine($scope.editingNode) && !auxo.hasSharedRight($scope.editingNode,'rw'))
      //  $scope.readonly = true;
    $scope.selectedRows =[];
    $scope.dataForTheTree = [];
    $scope.selectedNode = null;
    $scope.selectedTable = null;
    $scope.selectedColumns = [];
    $scope.whereString = "";
    $scope.sqlString = "";
    $scope.tablePage = [];
    $scope.columns = [];
    $scope.page = 1;
    $scope.tablePage = 1;
    $scope.disableSelectTable = false;

    $scope.schemaEntity = {
        "id": "",
        "name": "",
        "fields": []
    };

    $scope.datasetEntity ={
        "id": "",
        "name": "",
        "schema": "",
        "schemaName": "",
        "schemaVersion": 0,
        "storage": "JDBC",
        "expiredPeriod": 0,
        "storageConfigurations": {
            "password": "",
            "driver": "",
            "user": "",
            "table": "",
            "url": "",
            "sql": ""
        },
        "sliceTime": "",
        "sliceType": "H",
    }

    $scope.datasourceEntity = {
        "name": "",
        "description": "",
        "type": "DB",
        "attributes": {
            "password": "",
            "driver": "",
            "DBType": "",
            "user": "",
            "properties": [],
            "url": ""
        },
        "parentId": ""
    }

    function getColumns() {
        $scope.columns = [];
        var curSelectedTable = $scope.selectedTable;
        var curSelectedNode = $scope.selectedNode;
        Restangular.all("europa/datasource/table/columns/" + $scope.selectedTable).post($scope.selectedNode).then(function(results) {
            if(curSelectedTable == $scope.selectedTable && curSelectedNode == $scope.selectedNode) {
                for(var i=0;i<results.length;i+=2) {
                    $scope.columns.push({name: results[i], dataType: results[i + 1]})
                }
            }
            $scope.disableSelectTable = false;
        }, function(response) {
            $scope.disableSelectTable = false;
        });
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
    angular.merge($scope.datasetEntity, $scope.editingNode);

    if($scope.datasetEntity.expiredPeriod){
        $scope.expiredPeriodTmp = $scope.datasetEntity.expiredPeriod;
    }
    if($scope.datasetEntity.schema && !$scope.schemaEntity.fields) {
        Restangular.one("schemas", $scope.datasetEntity.schema).get().then(function(results) {
            // auxo.array.forEach(results.fields, function (e) {
            //     $scope.datasetEntity.attributes.schema.fields.push(e)
            // })
            datasetCopy = auxo.clone($scope.datasetEntity)
        });
    }
    var datasetCopy = auxo.clone($scope.datasetEntity)
    var sqlCopy = $scope.sqlString;

    $scope.meta = {
        fields: [
            auxo.form.buildItem({$name:"name", maxLength:100}),
            auxo.form.buildItem({$name:"description", maxLength:300, optional:true}),
            auxo.form.buildItem({$name:"expiredPeriod", type: "TimePeriod"}),
            auxo.form.buildItem({$name: "name",label:"schemaName", type: "ResourceSelector",
                "rootDir": "Schemas", keyword:"schema", modelId:"id",selectMode:"single","popTitle":"Schema选择"})]
    }
    auxo.array.forEach($scope.meta.fields, function (e) {
        if(e.$name === 'name' && e.label === "schemaName") {
            e.data = $scope.schemaEntity;
        } else if ($scope.datasetEntity[e.$name] !== undefined && e.$name != 'expiredPeriod' ){
            e.data = $scope.datasetEntity;
        }
    })



    // schema pop selector
    $scope.onSelectChanged = function (item, data) {
    }

    // $scope.dynamic_params = new ngTreetableParams({
    //     getNodes: function(parent) {
    //         var nodes = parent ? parent.children : $scope.dataForTheTree;
    //             return nodes;
    //     },
    //     getTemplate: function(node) {
    //         return 'app/resourceMan/dataSourceTreeTableTemplate.html';
    //     },
    //     options: {
    //         initialState: "expanded",
    //         onNodeExpand: function() {
    //             console.log('A node was expanded!');
    //         },
    //         onNodeSelected: function (node) {
    //             console.log(node.name + ' node was selected!');
    //         },
    //         onInitialized: function (a,b,c) {
    //             console.log(a + ";" + b + ";" + c)
    //             if($scope.selectedNode) {
    //                 auxo.treeWalk($scope.dataForTheTree, function (key, value) {
    //                     if(value && value.id === $scope.selectedNode.id) {
    //                         $scope.selectedNode = value;
    //
    //                         return "break"
    //                     }
    //                 })
    //             }
    //         }
    //     }
    // });

    function  initTreeTable() {
        if($scope.dynamic_params.refresh)
            $scope.dynamic_params.refresh()
    }


    $scope.onNodeSelected = function (node) {
        if(node && node.type == "DB") {
            delete node.isSelected
            $scope.selectedNode = node;
            angular.merge($scope.datasourceEntity, node);
        }
    }


    if (!isNew) {
        $scope.dataForTheTree.push($scope.selectedNode);
        initTreeTable();
    } else {
        $scope.loadTree = function (){
            Restangular.all("europa/resource/roots").getList({
                includes: "datasource_dir",
                excludes: "dataset_dir,schema_dir,standard_dir",
                names: "Datasources",
                strict: "true",
                allUser: 'true',
                rootName: "Datasources"
            }).then(function (roots) {
                // if(scope.interceptor)
                //     scope.interceptor(roots);
                $scope.sortTree(roots)
                $scope.dataForTheTree = roots;
                $scope.dataBackup.roots = auxo.clone(roots);
            });
        }


    }


    $scope.onTableChange = function ($select) {
        $scope.selectedTable = $select.selected;
        $scope.disableSelectTable = true;

        auxo.array.removeAll($scope.selectedColumns)
        $scope.whereString = "";
        $scope.sqlString = "";
        auxo.array.removeAll($scope.columns)

        if(!$scope.selectedTable)
            return;

        $scope.sqlString = "SELECT * FROM " + $scope.selectedTable;

        getColumns();
    }

    $scope.onSelectedColumnChange = function () {
        $scope.sqlString = "";
        if($scope.selectedColumns && $scope.selectedColumns.length && $scope.selectedTable) {
            $scope.sqlString = "SELECT " + $scope.selectedColumns.join(", ") + " FROM " + $scope.selectedTable;
            if($scope.whereString)
                $scope.sqlString += " WHERE " + $scope.whereString.replace(/^\s*where\s/i,"")
        } else if($scope.selectedTable) {
            $scope.sqlString = "SELECT * FROM " + $scope.selectedTable;
            if($scope.whereString)
                $scope.sqlString += " WHERE " + $scope.whereString.replace(/^\s*where\s/i,"")
        }
    }

    $scope.onWhereChange = function () {
       $scope.onSelectedColumnChange();
    }

    $scope.selectPage = function (page, update) {
        $scope.page = page;
        if(page === 3 && update)
            undateSchema();
    }
    $scope.fetchTable = function ($select, $event) {
        if($scope.selectedNode && !$scope.disableSelectTable) {

            $scope.disableSelectTable = true;
            // no event means first load!
            if ($event) {
                $event.stopPropagation();
                $event.preventDefault();
            }

            if($scope.lastTableKeyword != $select.search) {
                $scope.tablePage = 0;
            }

            $http({
                method: 'GET',
                url: 'api/europa/datasource/table/page',
                params: {
                    keyword:$select.search,
                    id:$scope.selectedNode.id,
                    offset:$scope.tablePage * $scope.tablePageSize,
                    limit:$scope.tablePageSize
                    // q: $select.search,
                    // page: $scope.tablePage
                }
            }).then(function(resp) {
                $scope.isLastPage = resp.data.last;
                if($scope.lastTableKeyword == $select.search) {
                    $scope.tables = $scope.tables.concat(resp.data.content);
                    $scope.tablePage++;
                } else {
                    $scope.lastTableKeyword = $select.search;
                    auxo.array.removeAll($scope.tables)
                    $scope.tables = $scope.tables.concat(resp.data.content);
                    $scope.tablePage = 1;
                }
            })['finally'](function() {
                $scope.disableSelectTable = false;
            });
        }
    }
    function nextStep(callback) {
        $scope.onNodeSelected($scope.selectedRows[0]);
            $scope.page++;
        if($scope.page === 2) {
            $scope.tables = [];
            $scope.tablePage = 0;
            $scope.tablePageSize = 50;
            $scope.lastTableKeyword="";
            $scope.isLastPage = false;
            $scope.columns = [];
            if(isNew) {
                $scope.whereString = "";
                $scope.sqlString = "";
            }
            var currentNode = $scope.selectedNode;
            // Restangular.all("resource/table/list").post($scope.selectedNode).then(function (tables) {
            //     if(currentNode == $scope.selectedNode) {
            //         $scope.tables = tables;
            //     }
            //     if(callback)
            //         callback();
            // });
        }
        if($scope.page === 3) {
            undateSchema();
        }
    }
     function undateSchema() {
         var schemaScope = function () {
             return auxo.searchScopeChild($scope, function (scope) {
                 if (scope.name === 'SchemaFieldsController2')
                     return scope;
             })
         }
         function buildFields() {
             var fs = $scope.schemaEntity.fields;
             var map = auxo.jdbc.defaultTypeMap;
             if($scope.datasourceEntity.attributes.driver.toLowerCase().indexOf("mysql") > -1)
                 map = auxo.jdbc.mysqlTypeMap;
             else if($scope.datasourceEntity.attributes.driver.toLowerCase().indexOf("oracle") > -1)
                 map = auxo.jdbc.oracleTypeMap;


             var regExp = /(.*)\(([^)]+)\)/;
             function handle(type_str) {
                 var type = type_str;
                 var params = '';
                 if(regExp.test(type_str)) {
                     var args = regExp.exec(type_str);
                     type = args[1];
                     params = args[2].split(/\s*,\s*/);
                 }

                 var value = 'string';
                 var handler = map[type];
                 if(angular.isFunction(handler)) {
                     value = handler(params);
                 } else {
                     value = handler ? handler:value;
                 }
                 return value;
             }

             if($scope.selectedColumns && $scope.selectedColumns.length) {
                 angular.forEach($scope.selectedColumns, function (c) {
                     angular.forEach($scope.columns, function (tuple) {
                         if(c === tuple.name) {
                             fs.push({name: tuple.name, type: handle(tuple.dataType)});
                         }
                     }) ;
                 });
             } else {
                 angular.forEach($scope.columns, function (tuple) {
                     fs.push({name:tuple.name, type: handle(tuple.dataType)});
                 }) ;
             }

             $scope.schemaEntity.fields = fs;
             schemaScope().synchData(true);
         }

         if($scope.sqlString !== sqlCopy && $scope.schemaEntity.fields.length>0) {
             auxo.sgDialogService.confirm("字段发生了改变，要重置Schema吗？", function (result) {
                 if (result) {
                     auxo.array.removeAll($scope.schemaEntity.fields);
                     buildFields();
                     sqlCopy = $scope.sqlString
                 }
             });
         } else if($scope.schemaEntity.fields.length === 0) {
             buildFields();
             sqlCopy = $scope.sqlString
         } else {
             schemaScope().synchData(true);
         }
     }

    function previousStep() {
        if($scope.page === 'preview')
            $scope.page = 2;
        else
            $scope.page--;
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

    function pickupSchema () {
        if(!$scope.schemaEntity.fields || $scope.schemaEntity.fields.length ===0)
            return;
        $scope.openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/schemaFromDataset.html',
                //controller : 'StepFormController', // specify controller for modal
                data:{editingNode: $scope.schemaEntity},
                callback: function(newData){
                    if(newData) {
                        $scope.schemaEntity.id = newData.id;
                        $scope.schemaEntity.name = newData.schemaName;
                        $scope.datasetEntity.schema = newData.id;
                    }
                },
                width:800
            });
        }
        $scope.openDialog();
    }
    $scope.loadingPreviewData = false;
//    预览表内容
    var previewData = function(row){
        $scope.loadingPreviewData = true;
        Restangular.all("europa/datasource/table/select").customPOST($scope.selectedNode,"",{ sql:"SELECT * FROM " + $scope.selectedTable, params:"limit:50;offset:0;rowCount:true"},{}).then(function(result) {

            auxo.sgDialogService.openModal({
                templateUrl : 'app/collector/sourceTablePreview.html',
                data:{result    :result},
                callback: function(newData){
                    $scope.loadingPreviewData = false;
                },
                width:800
            });
        },function(error){
            auxo.sgDialogService.alert(error, "错误", "提示")
        });
    }

    function validate(dataForSave) {
        if(!dataForSave.name )
            return "名称不能为空";
        if(!dataForSave.schema || !dataForSave.schemaName)
            return "Schema未保存";
        return "";
    }

    //update dataset for schema and datasource
    function updateDatasetEntity() {
        //copy schema information
        $scope.datasetEntity.schema = $scope.schemaEntity.id;
        $scope.datasetEntity.schemaName = $scope.schemaEntity.name;
        $scope.datasetEntity.schemaVersion = $scope.schemaEntity.version;

        //copy datasource information
        $scope.datasetEntity.storageConfigurations.driver = $scope.datasourceEntity.attributes.driver;
        $scope.datasetEntity.storageConfigurations.url = $scope.datasourceEntity.attributes.url;
        $scope.datasetEntity.storageConfigurations.table = $scope.selectedTable;
        $scope.datasetEntity.storageConfigurations.user = $scope.datasourceEntity.attributes.user;
        $scope.datasetEntity.storageConfigurations.password = $scope.datasourceEntity.attributes.password;

    }

    function save () {
        $scope.saving = true;

        updateDatasetEntity();

        if ($scope.datasetEntity.resType)
            delete $scope.datasetEntity.resType;//remove resType

        var dataForSave = auxo.clone($scope.datasetEntity)
        // angular.extend(dataForSave,
        //     {dataSource: $scope.selectedNode,
        //     table:$scope.selectedTable,
        //     columns: $scope.selectedColumns,
        //     sql:$scope.sqlString,
        //     where: $scope.whereString}
        // )

        //adjust data begin
        //adjust data end
        var msg = validate(dataForSave);
        if(msg) {
            auxo.sgDialogService.alert(msg, "错误", "提示")
            return;
        }else{

        }

        var timeTmp = dataForSave.createTime?dataForSave.createTime:new Date().getTime();

        var expiredPeriodTime = auxo.date2str(dataForSave.expiredPeriod*1000 + timeTmp);

        if(dataForSave.expiredPeriod*1000 + timeTmp < new Date().getTime() && dataForSave.expiredPeriod != 0){
            auxo.openConfirmDialog($scope, ngDialog, "过期时间为: " + expiredPeriodTime, function(){
            if (!dataForSave.id) {
                Restangular.all("datasets").post(dataForSave).then(
                    function(resp){
                        yes(resp)
                    },
                    function(es) {
                        auxo.showErrorMsg(es);
                    });
            } else {
                Restangular.one("datasets", dataForSave.id)
                    .customPUT(dataForSave)
                    .then(
                        function(){
                            yes(dataForSave.id)
                        },
                        function(es) {
                            auxo.showErrorMsg(es);
                        });
            }
        })
        }else {
        if (!dataForSave.id) {
            Restangular.all("datasets").post(dataForSave).then(
                function(resp){
                    yes(resp)
                },
                function(es) {
                    auxo.showErrorMsg(es);
                });
        } else {
            Restangular.one("datasets", dataForSave.id)
                .customPUT(dataForSave)
                .then(
                    function(){
                        yes(dataForSave.id)
                    },
                    function(es) {
                        auxo.showErrorMsg(es);
                    });
        }
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

    $scope.title =  isNew ? '数据集新建向导':"数据集编辑/查看";
    $scope.modalButtons = [
        {
            action: previousStep, text: "上一步", class: "btn-primary",
            disabled: function () { return false; },
            hide: function () { return $scope.page === 1 || !isNew || $scope.page === 'preview' }
        },
        {
            action: previousStep, text: "返回", class: "btn-primary",
            disabled: function () { return false; },
            hide: function () { return $scope.page != 'preview' }
        },
        {
            action: nextStep, text: "下一步", class: "btn-primary",
            disabled: function () {
                if($scope.page===1 && $scope.selectedRows.length !=1)
                    return true;
                if($scope.page===2&&!$scope.sqlString)
                    return true;},
            hide: function () { return $scope.page === 3 || $scope.page === 'preview' || !isNew }
        },
        {
            action: previewData, text: "查看数据", class: "btn-primary",
            disabled :function(){return $scope.loadingPreviewData},
            hide: function () { return $scope.page !== 2 || !isNew; }
        },
        {
            action: pickupSchema, text: "提取Schema", class: "btn-primary",
            hide: function () { return $scope.page !== 3}
        },
        {
            action: save, text: "确定", class: "btn-primary",
            disabled: function () {if($scope.readonly) return true;},
            hide: function () { return $scope.page !== 3 }
        },
        {
            action: $scope.cancel, text: "取消", class: "btn-warning",
            hide: function () { return $scope.page === 'preview' }
        },
//        auxo.buildMessageButton($scope.datasetEntity)
    ];

    auxo.bindEscEnterHotkey($scope)

    if(!isNew) {
        nextStep(function (){
            nextStep();
            $scope.selectPage(3);
        });
    }
    auxo.resourceTreeController ($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog, $timeout,$state);
})
