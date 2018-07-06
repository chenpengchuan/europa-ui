angular.module('AuxoApp')
    .controller('DatasetSpoolController', function ($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, modalInstance,ngTreetableParams) {
        var isNew = !$scope.editingNode || !$scope.editingNode.id;
        $scope.selectedNodeDataset = $scope.editingNode
        $scope.isDisable = false;
        $scope.error = "";
        $scope.saveType = [
            {name:"HDFS", value:"HDFS"},
            {name:"HIVE", value:"HIVE"},
            {name:"KAFKA", value:"MQ"},
            {name:"FTP", value:"FTP"},
            {name:"Hbase", value:"KV"},
            {name:"ElasticSearch", value:"ElasticSearch"},
        ]
        $scope.storageType = "HDFS";
        $scope.rootId = $scope.rootId;
        $scope.readonly = false;

        $scope.isES = true;
        //if(!isNew && !auxo.isMine($scope.editingNode) && !auxo.hasSharedRight($scope.editingNode,'rw'))
        //  $scope.readonly = true;
        // 数据分析
        if(typeof ($scope.editingNode.attributes) != "undefined" && $scope.editingNode.attributes.statistics){
            $scope.analyzeData = $scope.editingNode.attributes.statistics;
            if($scope.analyzeData.status){
                if($scope.analyzeData.status == "RUNNING"){
                    //$scope.isDisable = true;
                }
                $scope.status = $scope.analyzeData.status;
            }
            if($scope.analyzeData.finishTime){
                $scope.finishTime = auxo.date2str($scope.analyzeData.finishTime);
            }
            $scope.anaRowCount = $scope.analyzeData.rowCount;
            $scope.lastAnalyzeTime = auxo.date2str($scope.analyzeData.lastAnalyzeTime);
            $scope.sizeInBytes = $scope.analyzeData.sizeInBytes;
            $scope.anaTable = $scope.analyzeData.colStats;
            $scope.rowHeadersAna = ["fields","distinctCount","min","max","nullCount","avgLen","maxLen"];
            $scope.arr = [];
            $scope.rowCollectionAna = [];
            for(var key in $scope.anaTable){
                var fields = key;
                var value = $scope.anaTable[fields];//每一条
                var item = [];
                var len = $scope.rowHeadersAna.length;
                $scope.anarowFields = [];
                for(var inner in value){
                    $scope.anarowFields.push(inner);
                }
                for (var x=0;x<len;x++){
                    if(x == 0){
                        item.push(fields);
                    }else {
                        if ($scope.rowHeadersAna[x].indexOf($scope.anarowFields)){
                            item.push(value[$scope.rowHeadersAna[x]]);
                        }else{
                            item.push("null");
                        }
                    }
                }
                $scope.rowCollectionAna.push(item);
            }
        }
       // 执行分析方法
        $scope.getLastAnalyzeTime = function () {
            Restangular.one("europa/statistics/analyze/" +  $scope.editingNode.id).get()
                .then(function (data) {
                    if($scope.analyzeData.status == "RUNNING"){
                        $scope.isDisable = true;
                    }
                })
        }

        $scope.dataForTheTree = [];
        $scope.oldSelectedNode = null;
        var schemaCopy = null;
        var datasetCopy = null;
        $scope.page = 2
        if(!$scope.editingNode.attributes)
            $scope.editingNode.attributes = {};
        $scope.selectedNode = $scope.editingNode.attributes.dataSpool;
        $scope.storeMeta = {fields:[]}
        $scope.meta = {fields:[]}
        $scope.datasetEntity = $scope.editingNode;
        if(!$scope.datasetEntity.attributes.schema) $scope.datasetEntity.attributes.schema = {fields:[]}
        $scope.isShow = true;


        if($scope.isES){
            if($scope.editingNode.attributes && $scope.editingNode.attributes.dataset && $scope.editingNode.attributes.dataset.storage != "undefined" && $scope.editingNode.attributes.dataset.storage != "HDFS"){
                $scope.isES =false;
            }
        }
        if(!isNew) {
            if(!$scope.editingNode.attributes.dataSpool){
                $scope.isShow = false;
            }
//
            if($scope.editingNode.attributes.schema.id){
                Restangular.one("schemas", $scope.editingNode.attributes.schema.id).get({tenant:$scope.editingNode.tenant}).then(function (results) {
                    schemaCopy = results;
                    if(datasetCopy) {
                        $scope.selectPage(2);
                        $scope.selectPage(3);
                    }
                });
            }
            if($scope.editingNode.attributes.dataset.id){
                Restangular.one("datasets", $scope.datasetEntity.attributes.dataset.id).get({tenant:$scope.editingNode.tenant}).then(function (results) {
                    datasetCopy = results;

                    $scope.expiredPeriodTmp = results.expiredPeriod;
                    results.expiredPeriod = results.expiredPeriod>200000000000?0:results.expiredPeriod;
                    if(schemaCopy) {
                        $scope.selectPage(2);
                        $scope.selectPage(3);
                    }
                });
            }
        }

        var dict = {
            "HDFS": {
                storage: "HDFS",
                storageConfigurations: {format: "csv", path: "", relativePath:"", recursive:"false", header: "false", separator: ",", quoteChar: "\"", escapeChar: "\\"},
                expiredPeriod : 0
            },
            "HIVE": {
                storage: "HIVE",
                storageConfigurations: { sql: "", table: "", partitionColumns: ""},
                expiredPeriod : 0
            },
            "JDBC": {
                storage: "JDBC",
                storageConfigurations: { driver: "", url: "", sql: "", table: "", user: "", password: ""},
                expiredPeriod : 0
            },
            "KAFKA": {
                storage: "KAFKA",
                storageConfigurations: {format : "csv", zookeeper:"", brokers: "", topic: "", groupId: "",version:"", reader:"", separator: ",",header:"false",quoteChar:"\"",escapeChar:"\\"},
                expiredPeriod : 0
            },
            "HBASE": {
                storage: "HBASE",
                storageConfigurations: { table: "", namespace: "", columns: ""},
                expiredPeriod : 0
            },
            "FTP": {
                storage: "FTP",
                storageConfigurations: {user: "", password: "", format: "csv", path: "", relativePath:"", header: "false", separator: ",", quoteChar: "\"", escapeChar: "\\"},
                expiredPeriod : 0
            },
            "REDIS": {
                storage: "REDIS",
                storageConfigurations: {url: "", key: "", password: "", format:"cache", keySchema:"", valueSchema: ""},
                expiredPeriod: 0
            },
            "IGNITE": {
                storage: "IGNITE",
                storageConfigurations: { url: "", cacheName: "", format: "cache", keySchema:"", valueSchema: ""},
                expiredPeriod : 0
            },
            "MapDB": {
                storage: "MapDB",
                storageConfigurations: {path: "", relativePath:"",format:"cache", keySchema:"", valueSchema: "", separator: ",", mapName: ""},
                expiredPeriod : 0
            },
            "ElasticSearch": {
                storage: "ElasticSearch",
                storageConfigurations: {clusterName:"",ipAddresses: "", index:"",indexType:""},
                expiredPeriod : 0
            },
            storeMap: {
                "HDFS": "HDFS",
                "KV":"HBASE",
                "FTP":"FTP",
                "MQ":"KAFKA",
                "DB":"JDBC",
                "HIVE":"HIVE",
                "ElasticSearch":"ElasticSearch"
            }
        }
        $scope.storeMeta = {
            "ElasticSearch":function () {
                return [
                    // ElasticSearch
                    auxo.form.buildItem({$name:"clusterName"}),
                    auxo.form.buildItem({$name:"ipAddresses"}),
                    auxo.form.buildItem({$name:"index"}),
                    auxo.form.buildItem({$name:"indexType"})
                ].concat($scope.storeMeta.common())
            },
            "HDFS": function () {
                return [
                    // HDFS
                    auxo.form.buildItem({
                        $name: "path",
                        maxLength: 300,
                        minLength: 1,
                        noMatch: /[^\u4e00-\u9fbfa-zA-Z0-9_/]/g,
                        noMatchMsg: "汉字，字母,数字,下划线和 / 的组合!"
                    }),
                    auxo.form.buildItem({$name: "format", selectObjEnum: [{name:'CSV',value:"csv"},{ name:"parquet",value:"parquet"}]}),
                    auxo.form.buildItem({$name: "recursive", selectEnum: ["true","false"]}),
                    auxo.form.buildItem({$name: "header", selectEnum: ["true","false"],hidden:function (data) {return $scope.datasetEntity.attributes.dataset.storageConfigurations.format!=="csv" }}),
                    auxo.form.buildItem({$name: "separator", maxLength: 6, trim:false, hidden:function (data) {return $scope.datasetEntity.attributes.dataset.storageConfigurations.format!=="csv" }}),
                    auxo.form.buildItem({$name: "quoteChar", maxLength: 1, hidden:function (data) {return $scope.datasetEntity.attributes.dataset.storageConfigurations.format!=="csv" }}),
                    auxo.form.buildItem({$name: "escapeChar", maxLength: 1,hidden:function (data) {return $scope.datasetEntity.attributes.dataset.storageConfigurations.format!=="csv" }}),
                ].concat($scope.storeMeta.common())
            },
            "HIVE":function () {
                return [
                    // HIVE
                    auxo.form.buildItem({$name:"sql", optional: function (d) {return d.table;}}),
                    auxo.form.buildItem({$name:"table", optional: function (d) {return d.table;}}),
                    auxo.form.buildItem({$name:"partitionColumns", optional: function (d) {return d.table;}})
                ].concat($scope.storeMeta.common())
            },
            "KAFKA": function () {
                return [
                    //KAFKA
                    auxo.form.buildItem({$name:"zookeeper"}),
                    auxo.form.buildItem({$name:"brokers"}),
                    auxo.form.buildItem({$name:"topic"}),
                    auxo.form.buildItem({$name:"groupId"}),
                    auxo.form.buildItem({$name:"version", selectEnum:["0.8", "0.9", "0.10"]}),
                    auxo.form.buildItem({$name:"format",selectObjEnum: [{name:'csv',value:"csv"},{ name:"json",value:"json"},{name:"xml",value:"xml"}]}),
                    auxo.form.buildItem({$name: "header", selectEnum: ["true","false"],hidden:function (data) {return $scope.datasetEntity.attributes.dataset.storageConfigurations.format!="csv" }}),
                    auxo.form.buildItem({$name: "separator", maxLength: 6, trim:false, hidden:function (data) {return $scope.datasetEntity.attributes.dataset.storageConfigurations.format!="csv" }}),
                    auxo.form.buildItem({$name: "quoteChar", maxLength: 1, hidden:function (data) {return $scope.datasetEntity.attributes.dataset.storageConfigurations.format!="csv" }}),
                    auxo.form.buildItem({$name: "escapeChar", maxLength: 1,hidden:function (data) {return $scope.datasetEntity.attributes.dataset.storageConfigurations.format!="csv" }}),
                    auxo.form.buildItem({$name:"reader", hidden:function (data) {return $scope.datasetEntity.attributes.dataset.storageConfigurations.format!="xml" }}),
                ].concat($scope.storeMeta.common())
            },
            "HBASE": function () {
                return [
                    //HBASE
                    auxo.form.buildItem({$name:"table"}),
                    auxo.form.buildItem({$name:"namespace"}),
                    auxo.form.buildItem({$name:"columns",type: "TextPop", tooltip:"", placeholder:"描述hbase的列，与schema中的列要一一对应，形如，columnFamily1:qualifier1,columnFamily1:qualifier2,columnFamily1:qualifier3,columnFamily2:qualifier1... 其中，rowKey对应的那一列，应写成rowKey:key"})
                ].concat($scope.storeMeta.common())
            },
            "FTP": function () {
                return [
                    //FTP
                    auxo.form.buildItem({
                        $name: "path",
                        maxLength: 300,
                        minLength: 1,
                        noMatch: /[^\u4e00-\u9fbfa-zA-Z0-9_/]/g,
                        noMatchMsg: "汉字，字母,数字,下划线和 / 的组合!"
                    }),
                    auxo.form.buildItem({$name:"user", optional: true}),
                    auxo.form.buildItem({$name:"password", optional:true}),
                    auxo.form.buildItem({$name: "format", selectObjEnum: [{name:'CSV',value:"csv"},{ name:"parquet",value:"parquet"}]}),
                    auxo.form.buildItem({$name: "header", selectEnum: ["true","false"],hidden:function (data) {return $scope.datasetEntity.attributes.dataset.storageConfigurations.format!=="csv" }}),
                    auxo.form.buildItem({$name: "separator", maxLength: 6, trim:false, hidden:function (data) {return $scope.datasetEntity.attributes.dataset.storageConfigurations.format!=="csv" }}),
                    auxo.form.buildItem({$name: "quoteChar", maxLength: 1, hidden:function (data) {return $scope.datasetEntity.attributes.dataset.storageConfigurations.format!=="csv" }}),
                    auxo.form.buildItem({$name: "escapeChar", maxLength: 1,hidden:function (data) {return $scope.datasetEntity.attributes.dataset.storageConfigurations.format!=="csv" }})
                ].concat($scope.storeMeta.common())
            },
            "REDIS": function () {
                return [
                    auxo.form.buildItem({$name:"url"}),
                    auxo.form.buildItem({$name:"key"}),
                    auxo.form.buildItem({$name:"password", optional:true}),
                    auxo.form.buildItem({$name:"keySchema" }),
                    auxo.form.buildItem({$name:"valueSchema" })
                ].concat($scope.storeMeta.common())
            },
            "IGNITE": function () {
                return [
                    auxo.form.buildItem({$name:"url"}),
                    auxo.form.buildItem({$name:"cacheName"}),
                    auxo.form.buildItem({$name:"keySchema" }),
                    auxo.form.buildItem({$name:"valueSchema" })
                ].concat($scope.storeMeta.common())
            },
            "MapDB": function () {
                return [
                    auxo.form.buildItem({
                        $name: "path",
                        maxLength: 300,
                        minLength: 1,
                        noMatch: /[^\u4e00-\u9fbfa-zA-Z0-9_/]/g,
                        noMatchMsg: "汉字，字母,数字,下划线和 / 的组合!"
                    }),
                    auxo.form.buildItem({$name:"keySchema"}),
                    auxo.form.buildItem({$name:"valueSchema"}),
                    auxo.form.buildItem({$name:"separator", trim:false}),
                    auxo.form.buildItem({$name:"mapName"}),
                ].concat($scope.storeMeta.common())
            },
            "JDBC": function () {
                return [
                    //JDBC
                    auxo.form.buildItem({$name: "driver"}),
                    auxo.form.buildItem({$name:"url"}),
                    auxo.form.buildItem({$name:"table"}),
                    auxo.form.buildItem({$name:"user"}),
                    auxo.form.buildItem({$name:"password",type: "Password"}),
                ]
            },
            "common": function () {
                return [
                    auxo.form.buildItem({$name: "expiredPeriod", type: "TimePeriod"}),
                    auxo.form.buildItem({$name: "sliceType", selectEnum: "15QFHD".split(""), optional: true}),
                    auxo.form.buildItem({$name: "sliceTime", type: "Datetime"})
                ]
            }
        }
$scope.ontypechange = function(storageType){
    initDatasetAndSchema(storageType);
}
        function initDatasetAndSchema(storageType) {
            $scope.storage = 'HDFS';
            if($scope.selectedNode)
                var store = $scope.selectedNode.attributes.storeType;
            else {
                var store = storageType?storageType:'HDFS';
                // var store = $scope.selectedNodeDataset.attributes.dataset.storage;
                store = store == "JDBC"?"DB":store == "HBASE"?"KV":store == "KAFKA"?"MQ":store;
            }
            if (store) $scope.storage = dict.storeMap[store];

            $scope.storageConfigurations = auxo.clone(dict[$scope.storage].storageConfigurations);
            $scope.schemaFields = [];
            if (datasetCopy) {
                angular.extend($scope.storageConfigurations, datasetCopy.storageConfigurations);
                $scope.schemaFields = auxo.clone(schemaCopy.fields);
            }
            if($scope.storageConfigurations.relativePath)
                $scope.storageConfigurations.path = $scope.storageConfigurations.relativePath;

            $scope.datasetEntity = {
                "name": "",
                "description": "",
                "attributes": {
                    "dataSpool": $scope.editingNode.attributes.dataSpool,
                    "schema": {fields: $scope.schemaFields, id: schemaCopy ? schemaCopy.id : "", reference: 'false'},
                    "dataset": {
                        "id": datasetCopy ? datasetCopy.id : undefined,
                        "storage": $scope.storage,
                        "expiredPeriod": datasetCopy ? datasetCopy.expiredPeriod : 0,
                        "storageConfigurations": $scope.storageConfigurations,
                        "sliceTime": datasetCopy ? datasetCopy.sliceTime : "",
                        "sliceType": datasetCopy ? datasetCopy.sliceType : "",
                    },
                    "chineseName":"",
                }
            }
            $scope.datasetSave ={
                "name":"",
                "id": datasetCopy ? datasetCopy.id : undefined,
                "schemaName":"",
                "schema":"",
                "storage": $scope.storage,
                "expiredPeriod": datasetCopy ? datasetCopy.expiredPeriod : 0,
                "storageConfigurations": $scope.storageConfigurations,
                "sliceTime": datasetCopy ? datasetCopy.sliceTime : "",
                "sliceType": datasetCopy ? datasetCopy.sliceType : "",
            }
            $scope.schemaSave={
                fields: $scope.schemaFields,
                id: schemaCopy ? schemaCopy.id : "",
                description:"",
            }
            var attr = $scope.datasetEntity.attributes;
            angular.merge($scope.datasetEntity, $scope.editingNode);
            //$scope.datasetEntity.attributes = attr;

            $scope.storeMeta.fields = $scope.storeMeta[$scope.storage]();
            auxo.array.forEach($scope.storeMeta.fields, function (e) {
                if ($scope.datasetEntity.attributes[e.$name] !== undefined)
                    e.data = $scope.datasetEntity.attributes;
                else if ($scope.datasetEntity.attributes.dataset[e.$name] !== undefined)
                    e.data = $scope.datasetEntity.attributes.dataset;
                else if ($scope.storageConfigurations[e.$name] !== undefined)
                    e.data = $scope.datasetEntity.attributes.dataset.storageConfigurations;
            })

            $scope.meta = {
                fields: [
                    auxo.form.buildItem({$name: "name", maxLength: 100}),
                    auxo.form.buildItem({$name: "chineseName", maxLength: 300,optional:true}),
                    auxo.form.buildItem({$name: "description", maxLength: 300,optional:true}),
                    auxo.form.buildItem({$name: "reference", selectEnum:["true","false"], default: 'false',onSelectChange:function (d,item) {
                        if(d.reference === 'false' && d.id) {
                            Restangular.one("schemas", d.id).get().then(function (results) {
                                schemaCopy = results;
                                d.fields = results.fields;
                                $scope.selectPage(3);
                            });
                        } else if(d.reference === 'true') {
                            d.id = '';
                            d.fields = [];
                            d.name = ""
                            $scope.selectPage(3);
                        }
                    }}),
                    auxo.form.buildItem({$name: "name",label:"schemaName", type: "ResourceSelector",
                        "rootDir": "Schemas","aafilter$": "-mode='private'",keyword:"schema", modelId:"id",selectMode:"single",
                        "popTitle":"Schema选择",
                        hidden:function (item) {
                            return $scope.datasetEntity.attributes.schema.reference === 'false'
                        }})
                    /*,
                    auxo.form.buildItem({$name: "name",label:"datasetName", type: "ResourceSelector",
                        "rootDir": "数据集",keyword:"dataset", modelId:"id",selectMode:"single",
                        "popTitle":"数据集选择",
                        interceptor:function (nodes) {

                        }
                      })
                    */
                    /*
                    auxo.form.buildItem({$name: "name",label:"schemaName", type: "SelectPop",
                        "selectSource": "schemas","filter$": "-mode='private'",keyword:"name",
                        hidden:function (item) {
                            return $scope.datasetEntity.attributes.schema.reference === 'false'
                    }})*/
                ]
            }
            auxo.array.forEach($scope.meta.fields, function (e) {
                if(e.$name === 'name' && e.label === "schemaName")
                    e.data = $scope.datasetEntity.attributes.schema;
                else if(e.$name === 'name' && e.label === "datasetName")
                    e.data = $scope.datasetEntity.attributes.dataset;
                else if ($scope.datasetEntity[e.$name] !== undefined)
                    e.data = $scope.datasetEntity;
                else if ($scope.datasetEntity.attributes[e.$name] !== undefined)
                    e.data = $scope.datasetEntity.attributes;
                else if ($scope.datasetEntity.attributes.schema[e.$name] !== undefined)
                    e.data = $scope.datasetEntity.attributes.schema;
            })
        }

        /* data spool selection tree section */
        // if(isNew) {
        //     Restangular.one("europa/resource/all/" + $scope.rootId).get().then(function (entity) {
        //         auxo.array.forEach(entity.children, function (e) {
        //             var valid = false;
        //             if(e.resType === "data_spool") {
        //                 valid = true;
        //             } else if(e.resType === 'dir') {
        //                 auxo.treeWalk(e, function (key, value,path, parent) {
        //                     if(key === 'children' && value ) {
        //                         auxo.array.forEachReverse(value, function (e,i) {
        //                             if(e.resType !== 'data_spool' && e.resType !== 'dir'){
        //                                 auxo.array.remove(value,i);
        //                             }
        //                         })
        //                     }
        //                     if(value && value.resType === 'data_spool')
        //                         valid = true;
        //                 })
        //             }
        //             if(valid)
        //                 $scope.dataForTheTree.push(e);
        //         })
        //         initTreeTable();
        //     });
        // } else
            if($scope.selectedNode){
            Restangular.one("europa/resource", $scope.selectedNode.id).get({tenant:$scope.editingNode.tenant}).then(function (entity) {
                $scope.dataForTheTree.push(entity);
                initTreeTable();
            })
        }

        $scope.dynamic_params = new ngTreetableParams({
            getNodes: function(parent) {
                var nodes = parent ? parent.children : $scope.dataForTheTree;
                return nodes;
            },
            getTemplate: function(node) {
                return 'app/resourceMan/dataSpoolTreeTableTemplate.html';
            },
            options: {
                initialState: "expanded",
                onNodeExpand: function() {
                    console.log('A node was expanded!');
                },
                onNodeSelected: function (node) {
                    console.log(node.name + ' node was selected!');
                },
                onInitialized: function () {
                }
            }
        });

        function initTreeTable() {
            if($scope.dynamic_params.refresh)
                $scope.dynamic_params.refresh()
            if(!$scope.selectedNode)
                return;
            auxo.treeWalk($scope.dataForTheTree, function (key, value) {
                if(value && value.id === $scope.selectedNode.id) {
                    $scope.selectedNode = value;
                    return "break"
                }
            })
        }

        $scope.onNodeSelected = function (node) {
            if(node && node.resType == 'data_spool') {
                $scope.selectedNode = node;
            }
        }// End of data spool selection


        function nextStep() {
            $scope.page++;

            if($scope.page === 2) {
                if(!$scope.oldSelectedNode || $scope.oldSelectedNode.id !== $scope.selectedNode.id) {
                    $scope.oldSelectedNode = $scope.selectedNode;
                    initDatasetAndSchema();
                }
            }
            if($scope.page === 3) {
                var schemaScope = auxo.searchScopeChild($scope, function (scope) {
                    if(scope.name === 'SchemaFieldsController2' )
                        return scope;
                })
                schemaScope.updateData();
                schemaScope.synchData(true);
            }
        }

        $scope.selectPage = function (page) {
            $scope.page = page;

            if($scope.page === 2) {
                if(!$scope.oldSelectedNode || $scope.oldSelectedNode.id !== $scope.selectedNode.id) {
                    $scope.oldSelectedNode = $scope.selectedNode;
                    initDatasetAndSchema();
                }
            }
            if($scope.page === 3) {
                var schemaScope = auxo.searchScopeChild($scope, function (scope) {
                    if(scope.name === 'SchemaFieldsController2' )
                        return scope;
                })
                schemaScope.updateData();
                schemaScope.synchData(true);
            }
        }
        $scope.selectPage($scope.page)
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

        function  previewData() {
            if($scope.selectedTable) {
                Restangular.all("europa/resource/table/select").customPOST($scope.selectedNode,"",{ sql:"SELECT * FROM " + $scope.selectedTable, params:"limit:50;offset:0;rowCount:true"},{}).then(function(result) {
                    $scope.rowHeaders = result.names
                    $scope.rowCollection = result.rows? result.rows: [];
                    $scope.page = "preview"
                },function (error) {
                    auxo.showErrorMsg(error)
                });
            }
        }
        function IsInArray(arr,val){
            var testStr=','+arr.join(",")+",";
            return testStr.indexOf(","+val+",")!=-1;
        }
        function validate(dataForSave) {
            if(!dataForSave.name)
                return "名称不能为空"
            var separator = dataForSave.attributes.dataset.storageConfigurations.separator;
            var enum_separators = ['\\b','\\t','\\f','\\"','\\\'','\\0',
                '\\u0000','\\u0001','\\u0002','\\u0003','\\u0004','\\u0005','\\u0006','\\u0007','\\u0008',
                '\\u0009','\\u000a','\\u000b','\\u000c','\\u000d','\\u000e','\\u000f','\\u0010','\\u0011',
                '\\u0012','\\u0013','\\u0014','\\u0015','\\u0016','\\u0017','\\u0018','\\u0019','\\u001a',
                '\\u001b','\\u001c','\\u001d','\\u001e','\\u001f','\\u0020','\\u00a0','\\u3000'];
            var errorInfor = "分隔符(separator) \""+separator+"\" 类型错误,请输入单字符分隔符或标准的unicode转义字符分隔符("+['\\b','\\t','\\f','\\"','\\\'','\\0']+",\\u0000~\\u0020,\\u00a0,\\u3000)";
            if(dataForSave.attributes.dataset.storage ==='HDFS'){
                if(!dataForSave.attributes.dataset.storageConfigurations.path)
                    return "path不能为空"
                if((separator && separator.length >1 && !IsInArray(enum_separators,separator))||!separator){
                    return errorInfor;
                }
                if(!dataForSave.attributes.dataset.storageConfigurations.quoteChar)
                    return "quoteChar不能为空"
                if(!dataForSave.attributes.dataset.storageConfigurations.escapeChar)
                    return "escapeChar不能为空"
            }
            if(dataForSave.attributes.dataset.storage ==='KAFKA'){
                if(!dataForSave.attributes.dataset.storageConfigurations.zookeeper)
                    return "zookeeper不能为空"
                if(!dataForSave.attributes.dataset.storageConfigurations.brokers)
                    return "brokers不能为空"
                if(!dataForSave.attributes.dataset.storageConfigurations.topic)
                    return "topic不能为空"
                if(!dataForSave.attributes.dataset.storageConfigurations.groupId)
                    return "groupId不能为空"
                if(!dataForSave.attributes.dataset.storageConfigurations.version)
                    return "version不能为空"
                if((separator && separator.length >1 && !IsInArray(enum_separators,separator))||!separator)
                    return errorInfor;
                if(!dataForSave.attributes.dataset.storageConfigurations.quoteChar)
                    return "quoteChar不能为空"
                if(!dataForSave.attributes.dataset.storageConfigurations.escapeChar)
                    return "escapeChar不能为空"
            }
            if(dataForSave.attributes.dataset.storage ==='FTP'){
                 if(!dataForSave.attributes.dataset.storageConfigurations.path)
                     return "path不能为空"
                 if((separator && separator.length >1 && !IsInArray(enum_separators,separator))||!separator)
                     return errorInfor;
                 if(!dataForSave.attributes.dataset.storageConfigurations.quoteChar)
                     return "quoteChar不能为空"
                 if(!dataForSave.attributes.dataset.storageConfigurations.escapeChar)
                     return "escapeChar不能为空"
            }
            if(dataForSave.attributes.dataset.storage ==='HIVE'){
                if(!dataForSave.attributes.dataset.storageConfigurations.sql && !dataForSave.attributes.dataset.storageConfigurations.table)
                    return "sql和table 至少需要填一个"
            }
            if(dataForSave.attributes.dataset.storage ==='HBASE'){
                if(!dataForSave.attributes.dataset.storageConfigurations.table)
                    return "table不能为空"
                if(!dataForSave.attributes.dataset.storageConfigurations.namespace)
                    return "namespace不能为空"
                if(!dataForSave.attributes.dataset.storageConfigurations.columns)
                    return "columns不能为空"
            }


            if(dataForSave.attributes.schema.reference === 'true') {
                if(!dataForSave.attributes.schema.id)
                    return "Schema id不能为空"
            } else {
                if(!dataForSave.attributes.schema.fields || dataForSave.attributes.schema.fields.length === 0)
                    return "Schema字段不能为空"
                var error = ""
                var NullschemaName = true;
                auxo.array.forEach(dataForSave.attributes.schema.fields, function (e,i) {
                    var j = i+1;
                    if(!e.name || e.name == "" ){
                        // error += "Schema第"+ j +"个字段名称不能为空\n"
                        NullschemaName = false;
                    }
                    if(!e.type) {
                        error += e.name + ": 类型有误！\n";
                    }
                })
                if(!NullschemaName)
                    error += "Schema字段名称不能为空\n";
                return error
            }


        }

        $(document).ready(function() {
            String.prototype.startsWith = function(str) {
                var reg = new RegExp("^" + str);
                return reg.test(this);
            }
            String.prototype.endsWith = function(str) {
                var reg = new RegExp(str + "$");
                return reg.test(this);
            }
        });

        function save () {
            if($scope.storageConfigurations.path) {
                $scope.storageConfigurations.relativePath = $scope.storageConfigurations.path;
                if($scope.storage == "FTP") {
                    var str = $scope.selectedNode.attributes['path'];
                    if(str.startsWith("ftp://")) {
                        var path = str.substr(6);
                        var auth = ($scope.storageConfigurations.user != null &&
                            $scope.storageConfigurations.user.trim() != ''
                        ) ?
                            ($scope.storageConfigurations.user + ":" + $scope.storageConfigurations.password) + "@" : "";
                        $scope.storageConfigurations.path = "ftp://" + auth + path + (path.endsWith("/") ? "" : "/") +
                            $scope.storageConfigurations.path;
                    }
                }
            }
            var dataForSave = auxo.clone($scope.datasetEntity)
            if($scope.selectedNode)
                dataForSave.attributes.dataSpool = {id:$scope.selectedNode.id, name: $scope.selectedNode.name, attributes:$scope.selectedNode.attributes};

            if(!dataForSave.id)
                delete  dataForSave.id;
            if(!dataForSave.attributes.dataset.id)
                delete dataForSave.attributes.dataset.id;
            if(!dataForSave.attributes.schema.id)
                delete dataForSave.attributes.schema.id;

            if(isNew){
                dataForSave.expiredPeriod = dataForSave.attributes.dataset.expiredPeriod ;
            }
            else if(dataForSave.attributes.dataset.expiredPeriod === 0){
                dataForSave.expiredPeriod = 0;
            } else  dataForSave.expiredPeriod = dataForSave.attributes.dataset.expiredPeriod ;

            //adjust data begin
            //adjust data end
            var msg = validate(dataForSave);
            if(msg) {
                auxo.sgDialogService.alert(msg, "错误", "提示")
                return;
            }else{
                if (dataForSave.attributes.schema.reference === "false"){
                    $scope.schemaSave.fields = dataForSave.attributes.schema.fields;
                    $scope.schemaSave.name = dataForSave.name;
                    $scope.schemaSave.path = "/Schemas/inner";

                    $scope.datasetSave.schemaName = $scope.schemaSave.name;
                    $scope.datasetSave.name = $scope.datasetEntity.name;
                    $scope.datasetSave.path = $scope.editingNode.dir;
                } else{
                    $scope.datasetSave.schemaName = dataForSave.attributes.schema.name;
                    $scope.datasetSave.schema = dataForSave.attributes.schema.id;
                    $scope.datasetSave.name = $scope.datasetEntity.name;
                    $scope.datasetSave.path = $scope.editingNode.dir;
                }

            }
            if(dataForSave.attributes.schema.reference === 'true') {
                delete dataForSave.attributes.schema.fields;
            }
            var timeTmp = dataForSave.createTime?dataForSave.createTime:new Date().getTime();
            var expiredPeriodTime = auxo.date2str(dataForSave.expiredPeriod*1000 + timeTmp);
            if(dataForSave.expiredPeriod*1000 + timeTmp < new Date().getTime() && dataForSave.expiredPeriod != 0){
                auxo.openConfirmDialog($scope, ngDialog, "过期时间为: " + expiredPeriodTime, function(){
                    if (!dataForSave.id) {
                        Restangular.all("europa/resource/schema").post($scope.schemaSave).then(function(schemaId){
                                yes(schemaId)
                                $scope.datasetSave.schema=schemaId;
                                Restangular.all("europa/resource/dataset").post($scope.datasetSave).then(function(resp){
                                        yes(resp)
                                    },
                                    function(es) {
                                        auxo.showErrorMsg(es);
                                    });
                            },
                            function(es) {
                                auxo.showErrorMsg(es);
                            });
                    } else {
                        Restangular.one("europa/resource", dataForSave.id)
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
                    if(dataForSave.attributes.schema.reference === "false") {
                        Restangular.all("europa/resource/schema").post($scope.schemaSave).then(function (schemaId) {
                                yes(schemaId)
                                $scope.datasetSave.schema = schemaId;
                                Restangular.all("europa/resource/dataset").post($scope.datasetSave).then(function (resp) {
                                        yes(resp)
                                    },
                                    function (es) {
                                        auxo.showErrorMsg(es);
                                    });
                            },
                            function (es) {
                                auxo.showErrorMsg(es);
                            });
                    }else{
                        Restangular.all("europa/resource/dataset").post($scope.datasetSave).then(function (resp) {
                                yes(resp)
                            },
                            function (es) {
                                auxo.showErrorMsg(es);
                            });
                    }
                } else {
                    Restangular.one("europa/resource", dataForSave.id)
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

        function pickupSchema () {
            if(!$scope.datasetEntity.attributes.schema.fields || $scope.datasetEntity.attributes.schema.fields.length ===0)
                return;
            $scope.openDialog = function(){
                auxo.sgDialogService.openModal({
                    templateUrl : 'app/resourceMan/schemaFromDataset.html',
                    //controller : 'StepFormController', // specify controller for modal
                    data:{editingNode:{ resType:"schema",name: $scope.datasetEntity.name, attributes:{schema: {
                        fields: $scope.datasetEntity.attributes.schema.fields}}}},
                    callback: function(newData){
                        if(newData) {

                        }
                    },
                    width:800
                });
            }
            $scope.openDialog();
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

        $scope.title = isNew ? '数据集新建向导':"数据集编辑/查看";
        $scope.modalButtons = [
            {
                action: previousStep, text: $scope.page==='preview'?"返回" : "上一步", class: "btn-primary",
                disabled: function () { return false; },
                hide: function () { return $scope.page === 1 || $scope.page === 2 || !isNew}
            },
            {
                action: nextStep, text: "下一步", class: "btn-primary",
                hide: function () { return $scope.page === 3 || $scope.page === 'preview' || !isNew },
                disabled: function () {return false; }
            },
            /*
            {
                action: previewData, text: "查看数据", class: "btn-primary",
                hide: function () { return $scope.page !== 2; }
            },*/
            {
                action: pickupSchema, text: "提取Schema", class: "btn-primary",
                hide: function () { return $scope.page !== 3},
                disabled: function () { return !$scope.datasetEntity.attributes.schema.fields || $scope.datasetEntity.attributes.schema.fields.length===0}
            },
            {
                action: save, text: "确定", class: "btn-primary",
                disabled: function () { if($scope.readonly) return true;},
                hide: function () { return isNew && $scope.page !== 3 }
            },
            {
                action: $scope.cancel, text: "取消", class: "btn-warning",
                hide: function () { return $scope.page === 'preview' }
            },
//            auxo.buildMessageButton(function (){ return $scope.datasetEntity})
        ];

        auxo.bindEscEnterHotkey($scope)
    })
