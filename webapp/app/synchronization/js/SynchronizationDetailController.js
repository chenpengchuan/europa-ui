App.controller('SynchronizationDetailController', function SynchronizationDetailController($scope, $window, $http, $location, ngDialog, Restangular,$stateParams, sgDialogService, Auth ) {
    $scope.role = Auth.user.role.title;
    console.log($scope.role);
    var CollectorID = $scope.CollectorID = $stateParams.id||$stateParams.args.id;
    var taskId = $scope.taskId = $stateParams.taskId||$stateParams.args.taskId;
    if(CollectorID && CollectorID != "EUROPA-SERVER"){
        Restangular.one("/europa/collectors/" + CollectorID).get({})
            .then(function (facetResult) {
                $scope.dataSourceId = facetResult.resourceId;
            })
    }
    $scope.isCopy = false;
    $scope.sourceTables = [""];
    $scope.triggerTypeAs = "立即执行";
    $scope.statusType = "DB";
    $scope.isDate = false;
    $scope.st = [];
    $scope.sf = [];
    $scope.operateType = [{name:0, value:'原样'}, {name:1, value: '抽取'}, {name:2, value: '分割'}, {name:3, value: '过滤'}];
    var dataSourceTypes = {
        "HTTP":{
            storage: "HTTP",
            storageConfigurations: {parameters:"",properties:[{name:"",value:""}],rootPath :"", method :"GET",schemaId:"",schemaName:""},
            expiredPeriod : 0
        },
        "HDFS": {
            storage: "HDFS",
            storageConfigurations: {format: "csv", path: "", recursive:"false", header: "false", separator: ",", quoteChar: "\"", escapeChar: "\\"},
            expiredPeriod : 0
        },
        "HIVE": {
            storage: "HIVE",
            storageConfigurations: { sql: "", table: "", partitionColumns: ""},
            expiredPeriod : 0
        },
        "JDBC": {
            storage: "JDBC",
            storageConfigurations: { driver: "", url: "", sql: "", table: "", username: "", password: ""},
            expiredPeriod : 0
        },
        "KAFKA": {
            storage: "KAFKA",
            storageConfigurations: {format : "csv", zookeeper:"", brokers: "", topic: "", groupId: "",version:"", header:"false",quoteChar :"\"", escapeChar :"\\", reader:"", separator: ","},
            expiredPeriod : 0
        },
        "HBASE": {
            storage: "HBASE",
            storageConfigurations: { table: "", namespace: "", columns: ""},
            expiredPeriod : 0
        },
        "FTP": {
            storage: "FTP",
            storageConfigurations: { host: "", port: "",fieldsSeparator: "", dir: "", username: "", password: ""},
            expiredPeriod : 0
        },
        "SOCKET" :{
            storage: "SOCKET",
            storageConfigurations: {bind: "", port: "", protocol: "TCP", schemaName:"", schemaId:"", regex:"" ,operateType:"0"},
            expiredPeriod : 0
        },
        storeMap: {
            "HTTP":"HTTP",
            "HDFS": "HDFS",
            "KV":"HBASE",
            "FTP":"FTP",
            "MQ":"KAFKA",
            "DB":"JDBC",
            "HIVE":"HIVE",
            "SOCKET":"SOCKET"
        }
    }

    var dataStoreTypes = {
        "HDFS": {
            storage: "HDFS",
            storageConfigurations: {format: "csv", path: "", recursive:"false", header: "false", separator: ",", quoteChar: "\"", escapeChar: "\\",mode:"true"},
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
            storageConfigurations: { host: "", port: "",fieldsSeparator: "", dir: "", username: "", password: ""},
            expiredPeriod : 0
        },
        storeMap: {
            "HDFS": "HDFS",
            "KV":"HBASE",
            "FTP":"FTP",
            "MQ":"KAFKA",
            "DB":"JDBC",
            "HIVE":"HIVE"
        }
    }

    $scope.cronConfig = {
        allowMultiple: true,
        options: {
            allowWeek : true,
            allowMonth : true,
            allowYear : true
        },
        quartz: true
    };
//  data
    $scope.data ={
        id:"",
        name:"",
        dataSource:{
            id:"",
            name:"",
            url : "",
            dbType:"",
            tableExt:""
        },
        dataStore:{
            id:"",
            type:"",
            name:""
        },
        fieldMapping:[{sourceField:"",sourceType:"",targetField:"",targetType:"",encrypt:""}],
        parallelism:"1",
        trigger:"",
        cursorCol:"",
        errorNumber:"0",
        partitionKey:"",
        stopOnSchemaChanged:false,
        partitionPattern:"",
    }
    $scope.tmpSource = [{sourceField:"",sourceType:""}];


//  显示错误内容
    $scope.errormsg = [];

//  设置弹出错误框的样式
    $(function(){
        toastr.options=
            {
                "closeButton":true,//显示关闭按钮
                "debug":false,//启用debug
                "positionClass":"toast-top-center",//弹出的位置
                "showDuration":"300",//显示的时间
                "hideDuration":"1000",//消失的时间
                "timeOut":"5000",//停留的时间
                "extendedTimeOut":"1000",//控制时间
                "showEasing":"swing",//显示时的动画缓冲方式
                "hideEasing":"linear",//消失时的动画缓冲方式
                "showMethod":"fadeIn",//显示时的动画方式
                "hideMethod":"fadeOut"//消失时的动画方式
            };
    });

//  复制
    var m2vCopy = function(entity){
        console.log(angular.toJson(entity));
        // 复制一个任务需要的选项
        $scope.data.name = entity.name+"_copy"+new Date().toISOString();
        $scope.data.parallelism = entity.parallelism;
        $scope.data.cursorCol = entity.cursorCol;
        $scope.data.errorNumber = entity.errorNumber;
        $scope.data.partitionKey = entity.partitionKey;
        $scope.data.stopOnSchemaChanged = entity.stopOnSchemaChanged;
        $scope.data.partitionPattern = entity.partitionPattern;
        schemaId = entity.dataSource.schemaId;
        schemaName = entity.dataSource.schemaName;
        filename = entity.dataSource.filename;
        table = entity.dataSource.table;
        selectSQL = entity.dataSource.selectSQL;
        tableExt = entity.dataSource.tableExt;
        operateType = entity.dataSource.operateType;
        $scope.data.trigger = entity.trigger;
        $scope.cycle1();
        $scope.statusType = (entity.dataSource.type == 'JDBC') ? 'DB' : $scope.data.dataSource.type;
        $scope.fieldMapping=[];
        $scope.sf = [""];
        $scope.isCsv = (entity.dataStore.format === "csv");
        // 获取源
        $scope.selectSourceCopy(entity.dataSource.id);

        // 获取目标的数据
        $scope.selectTargetCopy(entity.dataStore.id);

        // 获取映射字段
        angular.copy(entity.fieldMapping, $scope.fieldMapping)
        valeu2name($scope.fieldMapping);
        // 修改以前保存的mode
        $scope.data.modeTmp = entity.dataStore.mode?entity.dataStore.mode:entity.mode?entity.mode:"append"

        if(entity.dataSource.type == "JDBC"){
            var entitySourceId = entity.dataSource.id
            //      获取columns
            var url = "europa/datasource/table/columns?id=" + entitySourceId + '&table=' + entity.dataSource.table;
            if(CollectorID && CollectorID != "EUROPA-SERVER"){
                url = "europa/collectors/"+CollectorID+"/resource/"+ entitySourceId + "/" + entity.dataSource.table +"/columns";
            }
            Restangular.one(url).getList().then(function(results) {
                for(var i=0,j=0;i<results.length/2,j<results.length;i+=1,j+=2) {
                    $scope.sf.push(results[j]);
                    $scope.tmpSource.push({sourceField:results[j],sourceType:results[j+1]});
                }
            });
        }else if(entity.dataSource.type == "HTTP" || entity.dataSource.type == "SOCKET" || entity.dataSource.type == "FTP"){
            $scope.regex = entity.dataSource.regex;
            Restangular.one("schemas", entity.dataSource.schemaId).get().then(function (schemas) {
                if(schemas){
                    var fields = schemas.fields;
                    angular.forEach(fields,function(e){
                        $scope.sf.push(e.name);
                        $scope.tmpSource.push({sourceField:e.name,sourceType:e.type});
                    })
                }else auxo.sgDialogService.alert("获取数据源字段失败，重新选择数据源", "错误");

            },function(errResponse) {
                auxo.openErrorDialog($scope, ngDialog, errResponse);
            })
        }
        if( $scope.data.partitionPattern)
            $scope.isDate = true;

    }

//是否可以复制
    if(taskId){
        $scope.isCopy = true;
        Restangular.one("europa/collectors/"+ taskId +"/taskJson").get().then(function(entity) {
            m2vCopy(entity);
        });
        $scope.checkOk = true;
    }

//  复制target时data数据
    $scope.selectTargetCopy = function (id) {
        Restangular.one("datasets", id).get().then(function (node) {
            if(node.id) $scope.data.dataStore.id = node.id;
            else $scope.data.dataStore.id= "";
            Restangular.one("datasets", node.id).get().then(function (results) {
                $scope.datasetCopy = results;
                $scope.storage = 'HDFS';
                var store = node.storage;
                store = store == "JDBC"?"DB":store == "HBASE"?"KV":store == "KAFKA"?"MQ":store;
                if (store) $scope.storage = dataStoreTypes.storeMap[store];
                $scope.storageConfigurations = auxo.clone(dataStoreTypes[$scope.storage].storageConfigurations);
                for(var key in $scope.data.dataStore){
                    if(key == "type" || key == "name" || key == "id"){
                        $scope.data.dataStore.type = results.storage
                        $scope.data.dataStore.name = node.name
                        $scope.data.dataStore.id = node.id
                    }else delete $scope.data.dataStore[key]
                }
                if ($scope.datasetCopy) {
                    angular.extend($scope.storageConfigurations, $scope.datasetCopy.storageConfigurations);
                }
                if(node.resType !== "dataset_db")
                    angular.merge($scope.data.dataStore, $scope.storageConfigurations);
                else angular.extend($scope.data.dataStore, $scope.datasetCopy.storageConfigurations);
                var obj = $scope.data.dataStore;
                $scope.dataStoreView = [];
                $scope.dataStoreView.length = 0;
                for(var key in obj){
                    if(key != "mode" && key != "relativePath" ) {
                        if ($scope.data.dataStore.format == "parquet" &&(key == "separator" || key == "quoteChar"||key == "escapeChar"||key == "header") ){}
                        else $scope.dataStoreView.push({name: key, value: obj[key]})
                    }
                }

            })
            // $scope.modeTmp = $scope.data.dataStore.mode=="append"? true:false
            $scope.data.modeTmp = $scope.data.modeTmp=="append"? true:false
            $scope.partitionKeyType($scope.data.partitionKey)
        },function (err) {
            auxo.sgDialogService.alert("目标数据获取失败", "错误");
        })

    }

//  复制source时data数据
    $scope.selectSourceCopy = function (id) {
        Restangular.one("europa/datasource", id).get().then(function (newData) {
            if(newData) {
                $scope.tables = [];
                $scope.tablePage = 0;
                $scope.tablePageSize = 50;
                $scope.lastTableKeyword="";
                $scope.isLastPage = false;
                $scope.columns = [];
                $scope.data.dataSource = {};
                $scope.selectedNode = newData
                var selectedSource = $scope.selectedSource = newData;
                var resType = $scope.statusType = selectedSource.type;
                $scope.data.dataSource.type = selectedSource.type == "DB"?"JDBC":selectedSource.type;

                if(resType === 'SOCKET' || resType === 'HTTP' || resType === 'FTP' || resType == 'DB'){
                    if (resType === 'DB') {

                        var url = "europa/datasource/table/list?id=" + selectedSource.id;
                        if (CollectorID && CollectorID != "EUROPA-SERVER") {
                            url = "europa/collectors/" + CollectorID + "/resource/" + newData['id'] + "/tables";
                        }
                    }
                    $scope.storage = resType;
                    var store = selectedSource.attributes.storage?selectedSource.attributes.storage:selectedSource.type;
                    store = store == "JDBC"?"DB":store == "HBASE"?"KV":store == "KAFKA"?"MQ":store;
                    if (store) $scope.storage = dataSourceTypes.storeMap[store];

                    $scope.storageConfigurations = auxo.clone(dataSourceTypes[$scope.storage].storageConfigurations);
                    if (selectedSource) {
                        if( selectedSource.attributes.storageConfigurations)
                            angular.extend($scope.storageConfigurations,selectedSource.attributes.storageConfigurations);
                        else angular.extend($scope.storageConfigurations, selectedSource.attributes);
                    }
                    angular.extend($scope.data.dataSource,$scope.storageConfigurations);
                    $scope.data.dataSource.type = resType
                    $scope.data.dataSource.name = selectedSource.name
                    $scope.data.dataSource.id = selectedSource.id

                    if(resType === 'SOCKET'){
                        $scope.data.dataSource.regex = $scope.regex;
                        $scope.data.dataSource.schemaId= schemaId;
                        $scope.data.dataSource.schemaName= schemaName;
                        $scope.data.dataSource.operateType= operateType;
                        $scope.data.dataSource.bind = $scope.data.dataSource.ipAddress;
                        delete $scope.data.dataSource.ipAddress;
                    }
                    if(resType === 'DB'){
                        $scope.data.dataSource.selectSQL = selectSQL
                        $scope.data.dataSource.table = table;
                        $scope.data.dataSource.tableExt = tableExt;
                        if($scope.data.dataSource.properties)
                            delete $scope.data.dataSource.properties;
                    }
                    if(resType === 'HTTP'){
                        $scope.data.dataSource.schemaId= schemaId;
                        $scope.data.dataSource.schemaName= schemaName;
                        var m = {} ;
                        angular.forEach(selectedSource.attributes.properties,function(e){
                            var key = e.name;
                            var value = e.value;
                            m[key] = value;
                        })
                        $scope.data.dataSource.properties = m;
                    }
                    if(resType === 'FTP'){
                        $scope.data.dataSource.schemaId= schemaId;
                        $scope.data.dataSource.schemaName= schemaName;
                        $scope.data.dataSource.filename = filename;
                    }
                }
            }
        },function () {
            auxo.sgDialogService.alert("数据源获取失败", "错误");

        })
    }
//将脱敏字段的value和name对应
    var valeu2name = function(arr){
        angular.forEach(arr,function(e,i){
            if(e.encrypt === "MIX"){
                e.encrypt = "用*隐藏"
            }else if(e.encrypt === "BLANK"){
                e.encrypt = "去除数据"
            }
        })
        return arr;
    }
//将脱敏字段的value和name对应
    var name2value = function(arr){
        angular.forEach(arr,function(e,i){
            if(e.encrypt === "用*隐藏"){
                e.encrypt = "MIX"
            }else if(e.encrypt === "去除数据"){
                e.encrypt = "BLANK"
            }
        })
        return arr;
    }

//周期情况
    $scope.cycle1 = function(){
        if($scope.data.trigger===""){
            $scope.triggerTypeAs = "立即执行";
            $scope.data.cursorCol = "";
            $scope.triggerType = "once";
            $scope.data.trigger = "";

        }else{
            $scope.triggerType = "cron";
            $scope.triggerTypeAs = "周期执行"
            $scope.data.trigger = $scope.data.trigger ;
        }
    }

//  脱敏规则列表
    $scope.rulers = ["","去除数据","用*隐藏"]

//   判断是同步任务还是采集器任务所传的参数
    var parmas = CollectorID ? '?sourceId=' + CollectorID: ''
    var returnUrl = CollectorID ? CollectorID == "EUROPA-SERVER" ? "#/synchronization":'#/collector/' + CollectorID + '#tasks': "#/synchronization"
    $scope.error = "";
    $scope.dataBackup = {}
    $scope.selectedNode = null;

//   返回按钮
    $scope.backTitle = CollectorID ? "采集任务":"同步任务";
    $scope.back = function(){
        auxo.goBack();
    }

    $scope.removeEmptyChildren = function (nodes) {
        if(!nodes)
            return;
        auxo.array.forEach(nodes, function (e) {
            if(e.children && e.children.length === 0)
                delete e.children;
        })
    }

    var currentState = auxo.$state.current.name;

    if ($scope.currentState)
        currentState = $scope.currentState;

    function getIncludes() {
        if (currentState === 'dataflow')
            return "dir;root;$Flows";
        return "datasource_dir;dataset_dir;schema_dir;standard_dir";
    }

    function getExcludes() {
        if (currentState === 'dataflow')
            return "";
        return "$Workflow;$Dataflow;$Streamflow";
    }

    function getNames() {
        if (currentState === 'dataflow')
            return "Flows";
    }

    //获得初步的目录结构
    Restangular.all("/europa/resource/roots").getList({
        includes: getIncludes(),
        excludes: getExcludes(),
        strict: "true",
        names: getNames(),
        allUser: "true"
    }).then(function(roots) {
        auxo.treeWalk(roots, function (key, value) {
            if(value && value.name === '数据元数据')
                value.name = "标准";
        })
        $scope.dataForTheTree = roots;
        $scope.dataBackup.roots = auxo.clone(roots);
    });

//  给字符串数组排序
    var sortTables = function(arr){
        return arr.sort(function(a,b){
            a = a.toUpperCase();
            b = b.toUpperCase();
            if(a>b)
                return 1;
            else if(a<b)
                return -1;
            else if(a == b)
                return 0;
        })
    }

//  给object排序
    auxo.by = function(name){
        return function(o, p){
            var a, b;
            if (typeof o === "object" && typeof p === "object" && o && p) {
                a = o.name;
                b = p.name;
                if (a === b) {
                    return 0;
                }
                if (typeof a === typeof b) {
                    return a < b ? -1 : 1;
                }
                return typeof a < typeof b ? -1 : 1;
            }
            else {
                throw ("error");
            }
        }
    }

//    姓名唯一性
    $scope.setFocus = function(){
        $scope.focus = true;
    }
    $scope.errormsg = [];
    $scope.setBlur = function(){
        if($scope.focus){
            CollectorID1 = CollectorID ? CollectorID:"EUROPA-SERVER";
            var url = "europa/tasks/name_check/";
            if($scope.data.name){
                Restangular.one(url).get({collecterId : CollectorID1,taskName : $scope.data.name}).then(function (ret) {
                    if(!ret.success){
                        if($scope.errormsg.indexOf("此名字已存在!") === -1){
                            $scope.errormsg.push("此名字已存在!");
                        }
                        toastr.error($scope.errormsg);
                    }else $scope.errormsg = [];
                },function(errResponse){
                    auxo.sgDialogService.alert(errResponse, "错误");
                });
            }else $scope.errormsg = [];
        }
    }


 // 选择数据源为类型时的弹出框按钮
    $scope.initTitle='选择数据源(必填)';
    $scope.rootDir='Datasources';
    $scope.keyWord= 'datasource';
    //  选择target时更新的data数据
    $scope.onSelectChanged = function (newData) {
        if(newData) {
            $scope.tables = [];
            $scope.tablePage = 0;
            $scope.tablePageSize = 50;
            $scope.lastTableKeyword="";
            $scope.isLastPage = false;
            $scope.columns = [];
            $scope.selectedNode = newData;
            $scope.data.dataSource = {}
            var selectedSource = $scope.selectedSource = newData
            selectedSource = newData;
            var resType = $scope.statusType = selectedSource.type;
            $scope.data.dataSource.type = selectedSource.type == "DB"?"JDBC":selectedSource.type;
            if(resType === 'SOCKET' || resType === 'HTTP' || resType === 'DB' || resType === 'FTP'){
                if (resType === 'DB') {
                    var url = "europa/datasource/table/list?id=" + selectedSource.id;
                    if (CollectorID && CollectorID != "EUROPA-SERVER") {
                        url = "europa/collectors/" + CollectorID + "/resource/" + newData['id'] + "/tables";
                    }
                }
                $scope.storage = resType;
                var store = selectedSource.attributes.storage?selectedSource.attributes.storage:selectedSource.type;
                store = store == "JDBC"?"DB":store == "HBASE"?"KV":store == "KAFKA"?"MQ":store;
                if (store) $scope.storage = dataSourceTypes.storeMap[store];

                $scope.storageConfigurations = auxo.clone(dataSourceTypes[$scope.storage].storageConfigurations);
                if (selectedSource) {
                    if( selectedSource.attributes.storageConfigurations)
                        angular.extend($scope.storageConfigurations,selectedSource.attributes.storageConfigurations);
                    else angular.extend($scope.storageConfigurations, selectedSource.attributes);

                }
                angular.extend($scope.data.dataSource,$scope.storageConfigurations);
                $scope.data.dataSource.type = resType
                $scope.data.dataSource.name = selectedSource.name
                $scope.data.dataSource.id = selectedSource.id
                if(resType === 'SOCKET'){
                    $scope.data.dataSource.bind = $scope.data.dataSource.ipAddress;
                    delete $scope.data.dataSource.ipAddress;
                }
                if(resType === 'DB'){
                    $scope.data.dataSource.selectSQL = $scope.data.dataSource.sql;
                    $scope.data.dataSource.username = $scope.data.dataSource.user;
                    delete $scope.data.dataSource.sql;
                    delete $scope.data.dataSource.user;
                    delete $scope.data.dataSource.properties;
                }
                if(resType === 'HTTP'){
                    var m = {} ;
                    angular.forEach(selectedSource.attributes.properties,function(e){
                        var key = e.name;
                        var value = e.value;
                        m[key] = value;
                    })
                    $scope.data.dataSource.properties = m;
                }
                if(resType === 'FTP'){

                }
            }
        }
    }
//  选择source的table时获取字段信息
    $scope.getColumns = function(table) {
        $scope.sf = [""];
        var curSelectedTable = table;
        var curSelectedNode = $scope.selectedNode;
        var dataSourceId = $scope.selectedSource?$scope.selectedSource.id:$scope.data.dataSource.id;
        var url = "europa/datasource/table/columns?id=" + dataSourceId + '&table=' + table;
        if(CollectorID && CollectorID != "EUROPA-SERVER"){Restangular.one("schemas", node.schema.id).
            url = "europa/collectors/"+CollectorID+"/resource/"+ dataSourceId + "/" + table+"/columns";
        }
        if($scope.selectedSource){
            $scope.entitySyn = $scope.selectedSource;
            $scope.sourceJson = {
                id: $scope.entitySyn.id,
                name: $scope.entitySyn.name,
                type:"JDBC",
                driver:$scope.entitySyn.attributes.driver,
                url : $scope.entitySyn.attributes.url,
                username:$scope.entitySyn.attributes.user,
                password:$scope.entitySyn.attributes.password,
                table:table,
                selectSQL:"",
                dbType:$scope.entitySyn.attributes.DBType
            }

        }
        var jsonName = angular.toJson($scope.sourceJson);
        $scope.checkOk = true;
        if(CollectorID && CollectorID != "EUROPA-SERVER"){
            //添加loading
            $.ajax({
                type:"POST",
                url:"api/europa/collectors/"+CollectorID+"/datasource/columns/check",
                data:jsonName,
                dataType: "json",//"xml", "html", "script", "json", "jsonp", "text".
                contentType: "application/json;charset=UTF-8",
                //在请求之前调用的函数
                beforeSend:function(request){
                    request.setRequestHeader("X-AUTH-TOKEN",auxo.$rootScope.token);
                    loading = $(document.body).modalLoading(100);
                },
                //成功返回之后调用的函数
                success:function(facetResult){
                    $scope.upDataSourceRest = facetResult.success;
                    if(!facetResult.success){
                        if(facetResult.errorMsg == "get database connection failed.")
                            auxo.sgDialogService.alert("数据库链接失败", "错误");
                        else
                            auxo.sgDialogService.alert("选择表的结构在数据源中已被修改，您可以继续执行，或者重新同步源数据", "错误");
                    }

                    Restangular.one(url).getList().then(function(results) {
                        for(var i=0,j=0;i<results.length/2,j<results.length;i+=1,j+=2) {
                            $scope.sf.push(results[j])
                            $scope.tmpSource.push({sourceField:results[j],sourceType:results[j+1]});
                            $scope.columns.push({name: results[i], dataType: results[i + 1]})
                        }
                        $scope.disableSelectTable = false;
                    }, function(response) {
                        $scope.disableSelectTable = false;
                    });
                }   ,
                //调用执行后调用的函数
                complete: function(XMLHttpRequest, textStatus){
                    loading.remove();
                },
                //调用出错执行的函数
                error: function(err){
                    //请求出错处理
                    var error = angular.fromJson(err.responseText)
                    $scope.checkOk = false;
                    auxo.sgDialogService.alert(error.error,"错误")
                }
            });
        }else{

            Restangular.one(url).getList().then(function(results) {
                for(var i=0,j=0;i<results.length/2,j<results.length;i+=1,j+=2) {
                    $scope.sf.push(results[j])
                    $scope.tmpSource.push({sourceField:results[j],sourceType:results[j+1]});
                    $scope.columns.push({name: results[i], dataType: results[i + 1]})
                }
                $scope.disableSelectTable = false;
            }, function(response) {
                $scope.disableSelectTable = false;
            });
            if($scope.sourceTables.length === 0){
                var s = "列表为空，请确认数据库连接成功！";
                if(CollectorID && CollectorID != "EUROPA-SERVER")s = "列表为空，请同步源数据";
                auxo.sgDialogService.alert(s, "提示");
            }
        }
    }
    $scope.onTableChange = function ($select) {
        $scope.selectedTable = $select.selected;
        $scope.disableSelectTable = true;
        // auxo.array.removeAll($scope.selectedColumns)
        $scope.whereString = "";
        $scope.sqlString = "";
        // auxo.array.removeAll($scope.columns)
        $scope.columns = []
        if(!$scope.selectedTable)
            return;
        $scope.sqlString = "SELECT * FROM " + $scope.selectedTable;
        $scope.getColumns($scope.selectedTable);
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
            var getTablesUrl = 'api/europa/datasource/table/page';
            var getTableParams = {
                keyword:$select.search,
                id:$scope.selectedNode.id,
                offset:$scope.tablePage * $scope.tablePageSize,
                limit:$scope.tablePageSize
                // q: $select.search,
                // page: $scope.tablePage
            }
            if(CollectorID && CollectorID != "EUROPA-SERVER") {
                getTablesUrl = 'api/europa/collectors/'+ CollectorID + '/resource/' + $scope.selectedNode.id + '/tables';
            }

            $http({
                method: 'GET',
                url: getTablesUrl,
                params: getTableParams
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

//  自动同步
    $scope.autoMatch = function() {
        for(var i = 0;i<$scope.fieldMapping.length;i++){
            for(var j = 0;j < $scope.sf.length;j++){
                if($scope.fieldMapping[i].targetField === $scope.sf[j] ||  $scope.fieldMapping[i].targetField.toLowerCase() === $scope.sf[j].toLowerCase()){
                    $scope.fieldMapping[i].sourceField = $scope.sf[j];
                }
            }
        }
    }

//  预览
    $scope.rowCollection = [];
    $scope.rowHeaders=[]
    $scope.previewData = function() {
        if($scope.selectedTable) {
            var id = $scope.selectedSource.id;
            var table = $scope.selectedTable;
        }else{
            var id = $scope.data.dataSource.id;
            var table = $scope.data.dataSource.table;
        }
        var selectedWhere = $scope.data.dataSource.selectSQL?" where "+$scope.data.dataSource.selectSQL:"";
        selectedWhere = encodeURIComponent(selectedWhere);
        var url = "europa/datasource/table/select?id="+id+"&sql=SELECT * FROM " + table+selectedWhere+"&params=limit:5;offset:0;rowCount:true";
        if(CollectorID && CollectorID != "EUROPA-SERVER"){

            url = "europa/collectors/table/select?collecterId="+CollectorID+"&id="+id+"&sql=SELECT * FROM " + table+selectedWhere+"&params=limit:5;offset:0;rowCount:true";
        }
        Restangular.one(url).get().then(function(result) {
            $scope.rowHeaders = result.names;
            obj = angular.toJson(result.rows)
            $scope.rowCollection = result.rows? result.rows: [];
            $scope.page = "preview"
        },function (error) {
            auxo.showErrorMsg(error)
        });
    }

//  选择target时更新的data数据
    $scope.onSelectChanged1 = function (node) {
        node = node.selectedRow
        console.log('dataSetNode: ' + angular.toJson(node))
        if(node.id) $scope.data.dataStore.id = node.id;
        else $scope.data.dataStore.id= "";

        $scope.fieldMapping = [];

        Restangular.one("schemas", node.schema).get().then(function (e) {
            if(e){
                angular.forEach(e.fields,function(field){
                    $scope.fieldMapping.push({sourceField:"",sourceType:"",targetField:field.name,targetType:field.type})
                },function(errResponse) {
                    auxo.openErrorDialog($scope, ngDialog, errResponse);
                })
            }else auxo.sgDialogService.alert("获取目标数据字段失败，重新选择目标数据", "错误");


        },function(errResponse) {
            auxo.openErrorDialog($scope, ngDialog, errResponse);
        })

        Restangular.one("datasets", node.id).get().then(function (results) {
            $scope.datasetCopy = results;
            $scope.storage = 'HDFS';
            var store = node.storage;
            store = store == "JDBC"?"DB":store == "HBASE"?"KV":store == "KAFKA"?"MQ":store;
            if (store) $scope.storage = dataStoreTypes.storeMap[store];
            $scope.storageConfigurations = auxo.clone(dataStoreTypes[$scope.storage].storageConfigurations);
            for(var key in $scope.data.dataStore){
                if(key == "type")
                    $scope.data.dataStore.type = results.storage
                else if(key != "name" && key != "id")
                    delete $scope.data.dataStore[key]
            }
            if ($scope.datasetCopy) {
                angular.extend($scope.storageConfigurations, $scope.datasetCopy.storageConfigurations);
            }
            if(node.resType !== "dataset_db")
                angular.merge($scope.data.dataStore, $scope.storageConfigurations);
            else angular.extend($scope.data.dataStore, $scope.datasetCopy.storageConfigurations);
            var obj = $scope.data.dataStore;
            $scope.dataStoreView = [];
            $scope.dataStoreView.length = 0;
            for(var key in obj){
                if(key != "mode" && key != "relativePath" ) {
                    if ($scope.data.dataStore.format == "parquet" &&(key == "separator" || key == "quoteChar"||key == "escapeChar") ){}
                    else $scope.dataStoreView.push({name:key,value:obj[key]})
                }

            }
        })
        $scope.data.modeTmp = true
    }

//  选择Schema时更新的data数据
    $scope.onSelectChangedSchema = function (node,row) {
        if(node.id) {
            $scope.data.dataSource.schemaId = node.attributes.schema.id;
            $scope.data.dataSource.schemaName = node.attributes.schema.name;
        }
        else $scope.data.dataSource.schemaName = "";
        $scope.sf.length = 0;
        $scope.sf[0] = "";
        Restangular.one("schemas", node.schema).get().then(function (e) {
            angular.forEach(e.fields,function(field){
                $scope.sf.push(field.name)
                $scope.tmpSource.push({sourceField:field.name,sourceType:field.type});
            })
        },function(errResponse) {
            auxo.openErrorDialog($scope, ngDialog, errResponse);
        })
    }

//  周期执行还是立即执行
    $scope.triggerTypes =["立即执行","周期执行"];
    $scope.cycle = function(val){
        if(val === "立即执行"){
            $scope.data.cursorCol = "";
            $scope.triggerView = "立即执行";
            $scope.triggerType = "once"
            $scope.data.trigger = "";
        }else{
            $scope.triggerView = $scope.data.trigger;
            $scope.triggerType = "cron"
        }
    }
    if(CollectorID != "EUROPA-SERVER")
        $scope.cycle("立即执行");

    //判断是否能够测试
    $scope.isTest = true;
    $scope.changeTest = function () {
        var regex = $scope.data.dataSource.regex;
        var testText = $scope.data.dataSource.testText;
        if(regex && regex != "" && testText && testText != "")
            $scope.isTest = false;
        else $scope.isTest = true;
    }
    //验证待测文本是否与正则表达式匹配

    $scope.testTextCheck = function () {
        var regex  = $scope.data.dataSource.regex;
        var text = $scope.data.dataSource.testText;
        var schema = $scope.sf.toString().substr(1);
        if(!schema){
            auxo.sgDialogService.alert("请选择schema!","提示")
        }
        console.log("rexpe"+regex +"   text"+text +"  schema"+schema )
        $scope.json= {};
        $scope.json.regex  = regex ;
        $scope.json.text = text;
        $scope.json.columns  = schema;
        $scope.json;
        Restangular.all("europa/tasks/regex_check?operateType="+$scope.data.dataSource.operateType).post($scope.json).then(function (rest) {
            if(rest.success){
                if(rest.ret.length==0)
                    auxo.sgDialogService.alert("匹配结果为空","提示")
                else
                    auxo.sgDialogService.alert(rest.ret,"提示")
            }else{
                auxo.sgDialogService.alert("测试失败","错误")
            }

        })
    }

//  同步任务和采集器任务区分的为参数
    if(CollectorID  && CollectorID != "EUROPA-SERVER")
        parmas =  '?sourceId='+  CollectorID;
    else  parmas =  '';

    $scope.partitionKeyType = function(partitionKey){
        $scope.isDate = false;
        var arr = $scope.st;
        var partitionKeyFound = false;
        angular.forEach(arr,function(e){
            if(e.name == partitionKey && (e.type == "date" || e.type == "timestamp")){
                $scope.data.partitionPattern = "yyyyMMdd";
                $scope.changepartitionKeyFormat ($scope.data.partitionPattern);
                partitionKeyFound = true;
            }
        })
        $scope.isDate = partitionKeyFound;
    }
    $scope.isSuccess = true;
    $scope.changepartitionKeyFormat = function(format){
        Restangular.one("europa/tasks/date_format").get({pattern:format}).then(function (e) {
            $scope.partitionKeyText =e.text
            $scope.isSuccess = e.success;
        })
    }

    //数组去重去空
    function unique(arr){
        var tmp = new Array();
        for(var i in arr){
            if( tmp.indexOf(arr[i])==-1 && arr[i] !="" && arr[i] != undefined){
                tmp.push(arr[i]);
            }
        }
        tmp.unshift("");
        return tmp;
    }

//  将导航引入，并添加保存按钮
    var canNext = true;
    angular.element("#fuelux-wizard-container")
        .ace_wizard({
        })
        .on('actionclicked.fu.wizard' , function(e, info){
            canNext = true;
            if(info.step == 1) {
                if($scope.errormsg.length != 0){
                    toastr.error($scope.errormsg);
                    canNext = false;
                }else{
                    $scope.errormsg.length = 0;
                    $scope.setBlur();
                    if(!$scope.data.name && $scope.errormsg.indexOf("名称不能为空!") === -1){
                        $scope.errormsg.push("名称不能为空！\r");
                    }
                    if(!$scope.data.dataSource.name && $scope.errormsg.indexOf("数据源不能为空!") === -1){
                        $scope.errormsg.push("数据源不能为空！\n");
                    }
                    if($scope.data.dataSource.type === "JDBC" && !$scope.data.dataSource.table && $scope.errormsg.indexOf("数据表名不能为空!") === -1){
                        $scope.errormsg.push("数据表名不能为空！\n");
                    }
                    if(($scope.data.dataSource.type === "HTTP" ||$scope.data.dataSource.type === "SOCKET")&& !$scope.data.dataSource.schemaName && $scope.errormsg.indexOf("schema不能为空!") === -1){
                        $scope.errormsg.push("schema不能为空！\n");
                    }
                    if(($scope.data.dataSource.type === "SOCKET"&& $scope.data.dataSource.operateType != 0) && !$scope.data.dataSource.regex && $scope.errormsg.indexOf("正则表达式不能为空!") === -1){
                        $scope.errormsg.push("正则表达式不能为空！\n");
                    }
                    if($scope.data.dataSource.type === "FTP" && !$scope.data.dataSource.filename && $scope.errormsg.indexOf("文件名不能为空!") === -1){
                        $scope.errormsg.push("文件名不能为空!\n");
                    }
                    if($scope.upDataSourceRest == "testSuccess" && $scope.errormsg.indexOf("正在检查数据源字段是否更新!") === -1){
                        $scope.errormsg.push("正在检查数据源字段是否更新!\n");
                    }
                    if(!$scope.checkOk &&$scope.data.dataSource.type == "JDBC" && $scope.errormsg.indexOf("check失败重新选择表!") === -1){
                        $scope.errormsg.push("check失败重新选择表!\n");
                    }
                    if(!$scope.checkOk &&$scope.data.dataSource.type == "JDBC" && $scope.errormsg.indexOf("无效规则!") === -1){
                        $scope.errormsg.push("check失败重新选择表!\n");
                    }
                    if($scope.errormsg.length > 0){
                        toastr.error($scope.errormsg);
                        $scope.errormsg = [];
                        canNext = false;
                    }
                }
            }
            if(info.step == 2) {
                $scope.errormsg.length = 0;
                if(!$scope.data.dataStore.name && $scope.errormsg.indexOf("数据集不能为空!") === -1){
                    $scope.errormsg.push("数据集不能为空！\r");
                }
                if($scope.errormsg.length > 0){
                    toastr.error($scope.errormsg);
                    canNext = false;
                }
            }
            if(info.step == 3) {
                $scope.errormsg.length = 0;
                if(!$scope.data.dataStore.name && $scope.errormsg.indexOf("数据集不能为空!") === -1){
                    $scope.errormsg.push("数据集不能为空！\r");
                }
                if($scope.errormsg.length > 0){
                    toastr.error($scope.errormsg);
                    canNext = false;
                }

                $scope.data.fieldMapping = [];
                $scope.st.length = 0;
                $scope.st[0] = "";
                var stTmp = $scope.stTmp = [""];

                for(var i=0;i<$scope.fieldMapping.length;i++){
                    for(var x = 0; x<$scope.tmpSource.length; x++){
                        var tmpSourceType;
                        if($scope.fieldMapping[i].sourceField == $scope.tmpSource[x].sourceField){
                            tmpSourceType = $scope.tmpSource[x].sourceType
                            $scope.fieldMapping[i].sourceType = tmpSourceType
                            if($scope.fieldMapping[i].sourceField != ""){
                                stTmp.push($scope.fieldMapping[i].targetField);
                            }
                            break;
                        }
                        else{
                            $scope.fieldMapping[i].sourceType = ""
                        }
                    }
                    $scope.st.push({name : $scope.fieldMapping[i].targetField,type : $scope.fieldMapping[i].targetType});
                    $scope.partitionKeyType($scope.data.partitionKey)
                    $scope.data.fieldMapping.push({
                        sourceField : $scope.fieldMapping[i].sourceField,
                        sourceType : $scope.fieldMapping[i].sourceType,
                        targetType : $scope.fieldMapping[i].targetType,
                        targetField : $scope.fieldMapping[i].targetField,
                        encrypt : $scope.fieldMapping[i].encrypt})
                }
                $scope.stTmp = unique(stTmp);
                $scope.$apply(function(){
                    console.log(angular.toJson($scope.data.fieldMapping))
                })
                var notNollMapping = true;
                for(var i = 0;i<$scope.data.fieldMapping.length;i++){
                    if($scope.data.fieldMapping[i].sourceField){
                        notNollMapping = false;
                        break;
                    }
                }
                if(notNollMapping && $scope.errormsg.indexOf("映射字段不能为空!") === -1){
                    $scope.errormsg.push("映射字段不能为空！\r");
                }
                if($scope.errormsg.length > 0){
                    toastr.error($scope.errormsg);
                    canNext = false;
                }
                $scope.data.fieldMapping = valeu2name($scope.data.fieldMapping)
            }
            if(info.step == 4) {
                if(!$scope.isDate){
                    $scope.data.partitionPattern = ""
                }
                if(!$scope.isSuccess && $scope.errormsg.indexOf("表达式书写错误!") === -1){
                    $scope.errormsg.push("表达式书写错误!");
                }
                if($scope.errormsg.length > 0){
                    toastr.error($scope.errormsg);
                    $scope.errormsg = [];
                    canNext = false;
                }
            }
            return canNext;
        })
        .on('finished.fu.wizard', function(e) {
            $scope.saving = true;
            $scope.data.fieldMapping = name2value($scope.data.fieldMapping);
            $scope.data.dataSource.type = $scope.data.dataSource.type == "DB"?"JDBC":$scope.data.dataSource.type;
            if($scope.data.dataSource.type == "JDBC"){
                if($scope.data.dataSource.user) {
                    $scope.data.dataSource.username = $scope.data.dataSource.user;
                    delete $scope.data.dataSource.user
                }
            }
            if($scope.data.modeTmp){
                $scope.data.dataStore.mode = "append"
            }else $scope.data.dataStore.mode = "overwrite";
            if($scope.data.modeTmp){
                delete $scope.data.modeTmp;
            }
            Restangular.all("europa/synchronizations/submit" + parmas).post($scope.data).then(
                function (facetResult) {
                    $scope.saving = false;
                    auxo.delHotkey($scope)
                    location.href = returnUrl
                },function(errResponse) {
                    $scope.saving = false;
                    $scope.error = errResponse.data.error;
                    auxo.sgDialogService.alert($scope.error,"错误")
                });
            canNext = true;
        })
});
