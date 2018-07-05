angular.module('AuxoApp')
    .controller('EditOtherSourceController', function ($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, modalInstance) {
        var isNew = !$scope.editingNode || !$scope.editingNode.id;
        var sourceType = $scope.editingNode.type;
        $scope.storeMeta={fields:[]}
        $scope.error="";
        var entityCopy;
        $scope.readonly = false;
        if(!isNew)
            angular.copy( $scope.editingNode,entityCopy);
        var dict = {
            "HDFS": {
                storage: "HDFS",
                storageConfigurations: {format: "csv", path: "",  recursive:"false", header: "false", separator: ",", quoteChar: "\"", escapeChar: "\\"},
                // storageConfigurations: {format: "csv", path: "", relativePath:"", recursive:"false", header: "false", separator: ",", quoteChar: "\"", escapeChar: "\\"},
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
                storageConfigurations: { host: "", port: "21",fieldsSeparator: ",", dir: "", username: "anonymous", password: "" },
                expiredPeriod : 0
            },
            "MapDB": {
                storage: "MapDB",
                // storageConfigurations: {path: "", relativePath:"",format:"cache", keySchema:"", valueSchema: "", separator: ",", mapName: ""},
                storageConfigurations: {path: "", format:"cache", keySchema:"", valueSchema: "", separator: ",", mapName: ""},
                expiredPeriod : 0
            },
            "SOCKET" :{
                storage: "SOCKET",
                storageConfigurations: {ipAddress: "", port: "", protocol: "TCP"},
                expiredPeriod : 0
            },
            storeMap: {
                "HDFS": "HDFS",
                "KV":"HBASE",
                "FTP":"FTP",
                "MQ":"KAFKA",
                "DB":"JDBC",
                "HIVE":"HIVE",
                "SOCKET":"SOCKET"
            }
        }
        $scope.storeMeta = {

            "HDFS": function () {
                return $scope.storeMeta.common1().concat([
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
                    auxo.form.buildItem({$name: "header", selectEnum: ["true","false"],hidden:function (data) {return $scope.entity.attributes.storageConfigurations.format!=="csv" }}),
                    auxo.form.buildItem({$name: "separator", maxLength: 6, trim:false, hidden:function (data) {return $scope.entity.attributes.storageConfigurations.format!=="csv" }}),
                    auxo.form.buildItem({$name: "quoteChar", maxLength: 1, hidden:function (data) {return $scope.entity.attributes.storageConfigurations.format!=="csv" }}),
                    auxo.form.buildItem({$name: "escapeChar", maxLength: 1,hidden:function (data) {return $scope.entity.attributes.storageConfigurations.format!=="csv" }}),
                ]).concat($scope.storeMeta.common())
            },
            "HIVE":function () {
                return $scope.storeMeta.common1().concat([
                    // HIVE
                    auxo.form.buildItem({$name:"sql", optional: function (d) {return d.table;}}),
                    auxo.form.buildItem({$name:"table", optional: function (d) {return d.table;}}),
                    auxo.form.buildItem({$name:"partitionColumns", optional: function (d) {return d.table;}})
                ]).concat($scope.storeMeta.common())
            },
            "KAFKA": function () {
                return $scope.storeMeta.common1().concat([
                    //KAFKA
                    auxo.form.buildItem({$name:"zookeeper"}),
                    auxo.form.buildItem({$name:"brokers"}),
                    auxo.form.buildItem({$name:"topic"}),
                    auxo.form.buildItem({$name:"groupId"}),
                    auxo.form.buildItem({$name:"version", selectEnum:["0.8", "0.9", "0.10"]}),
                    auxo.form.buildItem({$name:"format",selectObjEnum: [{name:'CSV',value:"csv"},{ name:"parquet",value:"parquet"},{name:"xml",value:"xml"}]}),
                    auxo.form.buildItem({$name: "header", selectEnum: ["true","false"],hidden:function (data) {return $scope.entity.attributes.storageConfigurations.format!=="csv" }}),
                    auxo.form.buildItem({$name: "separator", maxLength: 6, trim:false, hidden:function (data) {return $scope.entity.attributes.storageConfigurations.format!=="csv" }}),
                    auxo.form.buildItem({$name: "quoteChar", maxLength: 1, hidden:function (data) {return $scope.entity.attributes.storageConfigurations.format!=="csv" }}),
                    auxo.form.buildItem({$name: "escapeChar", maxLength: 1,hidden:function (data) {return $scope.entity.attributes.storageConfigurations.format!=="csv" }}),
                    auxo.form.buildItem({$name:"reader", hidden:function (data) {return $scope.entity.attributes.storageConfigurations.format!=="xml" }}),
                ]).concat($scope.storeMeta.common())
            },
            "HBASE": function () {
                return $scope.storeMeta.common1().concat([
                    //HBASE
                    auxo.form.buildItem({$name:"table"}),
                    auxo.form.buildItem({$name:"namespace"}),
                    auxo.form.buildItem({$name:"columns",type: "TextPop", tooltip:"", placeholder:"描述hbase的列，与schema中的列要一一对应，形如，columnFamily1:qualifier1,columnFamily1:qualifier2,columnFamily1:qualifier3,columnFamily2:qualifier1... 其中，rowKey对应的那一列，应写成rowKey:key"})
                ]).concat($scope.storeMeta.common())
            },
            "FTP": function () {
                return $scope.storeMeta.common1().concat([
                    // host: "", port: "",: "", dir: "",filename: ""
                    auxo.form.buildItem({$name:"host",  optional: false}),
                    auxo.form.buildItem({$name:"port", optional: false}),
                    auxo.form.buildItem({$name:"username", optional:false}),
                    auxo.form.buildItem({$name:"password",type: "Password", optional:true}),
                    auxo.form.buildItem({$name:"dir", optional: false}),
                    auxo.form.buildItem({$name:"fieldsSeparator", optional: false}),
                ]).concat($scope.storeMeta.common())
            },
            "MapDB": function () {
                return $scope.storeMeta.common1().concat([
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
                    auxo.form.buildItem({$name:"mapName"})
                ]).concat($scope.storeMeta.common())
            },
            "JDBC": function () {
                return $scope.storeMeta.common1().concat([
                    //JDBC
                    auxo.form.buildItem({$name: "driver"}),
                    auxo.form.buildItem({$name:"url"}),
                    auxo.form.buildItem({$name:"table"}),
                    auxo.form.buildItem({$name:"user"}),
                    auxo.form.buildItem({$name:"password",type: "Password"}),
                ]).concat($scope.storeMeta.common())
            },
            "SOCKET":function () {
                return $scope.storeMeta.common1().concat([
                    auxo.form.buildItem({$name: "ipAddress"}),
                    auxo.form.buildItem({$name: "port"}),
                    auxo.form.buildItem({$name: "protocol", selectEnum: ["TCP","UDP"]}),
                ])
            },
            "common": function () {
                return [
                    auxo.form.buildItem({$name: "expiredPeriod", type: "TimePeriod"}),
                    auxo.form.buildItem({$name: "sliceType", selectEnum: "15QFHD".split(""), optional: true}),
                    auxo.form.buildItem({$name: "sliceTime", type: "Datetime"})
                ]
            },
            "common1": function () {
                return [
                    auxo.form.buildItem({$name: "name", data: $scope.entity,label: "名称",type:"String",  tooltip: ["汉字,字母,数字和下划线的组合,长度4-30，同一目录下唯一"],
                        maxLength:100, minLength:1, noMatch:/[^\u4e00-\u9fbfa-zA-Z0-9_]/g, noMatchMsg: "汉字,字母,数字,下划线的组合!",
                    }),
                    auxo.form.buildItem({$name: "description", data: $scope.entity,label: "描述",type:"String", validator:"", isOptional: function () {return true; }}),
                ]
            }
        }

        function initDataset() {
            var store = sourceType == "JDBC"?"DB":sourceType == "HBASE"?"KV":sourceType == "KAFKA"?"MQ":sourceType;
            if (store) $scope.storage = dict.storeMap[store];
            if(isNew)
                $scope.storageConfigurations = auxo.clone(dict[$scope.storage].storageConfigurations);
            else
                $scope.storageConfigurations = auxo.clone($scope.editingNode.attributes.storageConfigurations);
            $scope.entity = {
                "id": entityCopy ? entityCopy.id : undefined,
                "name": entityCopy ? entityCopy.name : "",
                "description": entityCopy ? entityCopy.description : "",
                "attributes":{
                    "storage": $scope.storage,
                    "expiredPeriod": entityCopy ? entityCopy.expiredPeriod : 0,
                    "storageConfigurations": $scope.storageConfigurations,
                    "sliceTime": entityCopy ? entityCopy.sliceTime : "",
                    "sliceType": entityCopy ? entityCopy.sliceType : "",
                },

            }
            angular.merge($scope.entity, $scope.editingNode);
            $scope.storeMeta.fields = $scope.storeMeta[$scope.storage]();
            auxo.array.forEach($scope.storeMeta.fields, function (item) {
                if ($scope.entity.attributes[item.$name] !== undefined)
                    item.data = $scope.entity.attributes;
                else if ($scope.storageConfigurations[item.$name] !== undefined)
                    item.data = $scope.storageConfigurations;

                if(item.tooltip) {
                    item.tooltip = auxo.tooltips(item.tooltip);
                }

                if(!item.isOptional)
                    item.isOptional = function () { return false; }
                if(auxo.array.contains(["id"],item.$name)){
                    item.readonly = function () {
                        return !isNew
                    }
                }
                item.validator2 = item.validator;
                item.validator = function (i) {
                    $scope.error = "";
                    var v = i.data[i.$name];
                    if($scope.entityCopy && v === $scope.entityCopy[i.$name])
                        return;

                    $scope.meta.itemValidator(i);
                    if($scope.error)
                        return;
                    if(i.validator2)
                        i.validator2(i);
                    if(!$scope.error) {
                        auxo.array.forEach($scope.meta.fields,function (f) {
                            $scope.meta.itemValidator(f);
                            if($scope.error)
                                return "break";
                            if(f.validator2)
                                f.validator2(f);
                            if($scope.error)
                                return "break";
                        })
                    }
                }
            })
        }

        angular.copy( $scope.editingNode,$scope.entity);
        angular.copy( $scope.editingNode,$scope.entityCopy);
//定义显示内容
        $scope.meta = {
            title: "数据源设置",
            itemValidator:function(item) {
                $scope.error = "";
                var v = item.data[item.$name] +"";
                if($scope.entityCopy && v === $scope.entityCopy[item.$name])
                    return;

                if(!item.isOptional && auxo.isEmpty(v))
                    return $scope.error = item.label +  "不能为空!";
                if(auxo.isEmpty(v))
                    return;
                if (item.noMatch) {
                    var v2 = v.replace(item.noMatch, '')
                    if(v !== v2) {
                        item.data[item.$name] = v2;
                        return $scope.error = item.label +  item.noMatchMsg? item.noMatchMsg: "有非法字符!";
                    }
                }
                if(item.minLength && v.length < item.minLength)
                    return $scope.error = item.label + "最小长度为:" + item.minLength;
                if(item.maxLength && v.length > item.maxLength){
                    item.data[item.$name] = v.substring(0, item.maxLength);
                    return $scope.error = item.label + "最大长度为:" + item.maxLength;
                }
            } ,
            init: initDataset(),
            fields:$scope.storeMeta.fields,
        }

//判断是都符合要求
        function validate(dataForSave) {
            if(!dataForSave.name)
                return "名称不能为空"
            var separator = dataForSave.attributes.storageConfigurations.separator;
            var enum_separators = ['\\b','\\t','\\f','\\"','\\\'','\\0',
                '\\u0000','\\u0001','\\u0002','\\u0003','\\u0004','\\u0005','\\u0006','\\u0007','\\u0008',
                '\\u0009','\\u000a','\\u000b','\\u000c','\\u000d','\\u000e','\\u000f','\\u0010','\\u0011',
                '\\u0012','\\u0013','\\u0014','\\u0015','\\u0016','\\u0017','\\u0018','\\u0019','\\u001a',
                '\\u001b','\\u001c','\\u001d','\\u001e','\\u001f'];
            if(dataForSave.attributes.storage ==='HDFS'){
                if(!dataForSave.attributes.storageConfigurations.path)
                    return "path不能为空"
                if((separator && separator.length >1 && !IsInArray(enum_separators,separator))||!separator){
                    return "分隔符(separator) \""+separator+"\" 类型错误,请输入单字符分隔符或标准的unicode转义字符分隔符("+['\\b','\\t','\\f','\\"','\\\'','\\0']+",\\u0000~\\u001f)";
                }
                if(!dataForSave.attributes.storageConfigurations.quoteChar)
                    return "quoteChar不能为空"
                if(!dataForSave.attributes.storageConfigurations.escapeChar)
                    return "escapeChar不能为空"
            }
            // if(dataForSave.attributes.storage ==='KAFKA'){
            //     if(!dataForSave.attributes.storageConfigurations.zookeeper)
            //         return "zookeeper不能为空"
            //     if(!dataForSave.attributes.storageConfigurations.brokers)
            //         return "brokers不能为空"
            //     if(!dataForSave.attributes.storageConfigurations.topic)
            //         return "topic不能为空"
            //     if(!dataForSave.attributes.storageConfigurations.groupId)
            //         return "groupId不能为空"
            //     if(!dataForSave.attributes.storageConfigurations.version)
            //         return "version不能为空"
            //     if((separator && separator.length >1 && !IsInArray(enum_separators,separator))||!separator)
            //         return "分隔符(separator) \""+separator+"\" 类型错误,请输入单字符分隔符或标准的unicode转义字符分隔符("+['\\b','\\t','\\f','\\"','\\\'','\\0']+",\\u0000~\\u001f)";
            //     if(!dataForSave.attributes.storageConfigurations.quoteChar)
            //         return "quoteChar不能为空"
            //     if(!dataForSave.attributes.storageConfigurations.escapeChar)
            //         return "escapeChar不能为空"
            // }
            // if(dataForSave.attributes.storage ==='FTP'){
            //     if(!dataForSave.attributes.storageConfigurations.path)
            //         return "path不能为空"
            //     if((separator && separator.length >1 && !IsInArray(enum_separators,separator))||!separator)
            //         return "分隔符(separator) \""+separator+"\" 类型错误,请输入单字符分隔符或标准的unicode转义字符分隔符("+['\\b','\\t','\\f','\\"','\\\'','\\0']+",\\u0000~\\u001f)";
            //     if(!dataForSave.attributes.storageConfigurations.quoteChar)
            //         return "quoteChar不能为空"
            //     if(!dataForSave.attributes.storageConfigurations.escapeChar)
            //         return "escapeChar不能为空"
            // }
            if(dataForSave.attributes.storage ==='HIVE'){
                if(!dataForSave.attributes.storageConfigurations.sql && !dataForSave.attributes.storageConfigurations.table)
                    return "sql和table 至少需要填一个"
            }
            if(dataForSave.attributes.storage ==='HBASE'){
                if(!dataForSave.attributes.storageConfigurations.table)
                    return "table不能为空"
                if(!dataForSave.attributes.storageConfigurations.namespace)
                    return "namespace不能为空"
                if(!dataForSave.attributes.storageConfigurations.columns)
                    return "columns不能为空"
            }
        }

//保存
        function save () {
            if($scope.storageConfigurations.path) {
                // $scope.storageConfigurations.relativePath = $scope.storageConfigurations.path;
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
            var dataForSave = auxo.clone($scope.entity)

            var msg = validate(dataForSave);
            if(msg) {
                auxo.sgDialogService.alert(msg, "错误", "提示")
                return;
            }
            if (!dataForSave.id) {
                Restangular.all("europa/datasource").post(dataForSave).then(
                    function(resp){
                        yes(resp)
                    },
                    function(es) {
                        auxo.showErrorMsg(es);
                    });
            } else {
                Restangular.one("europa/datasource", dataForSave.id)
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

//确定时的判断
        function yes(data) {
            auxo.delHotkey($scope)
            modalInstance.closeModal(data);
        }

//取消
        $scope.cancel = function () {
            auxo.delHotkey($scope)
            modalInstance.closeModal(false)
        }

//关闭
        $scope.closeModal = function () {
            $scope.cancel();
        }

//按钮设置
        $scope.title =  '数据源设置';
        $scope.modalButtons = [
            {
                action: save,
                text: "确定", class: "btn-primary",
                disabled: function () { if($scope.readonly) return true;},
            },
            {
                action: $scope.cancel,
                text: "取消", class: "btn-warning"
            }
        ];

        auxo.bindEscEnterHotkey($scope)
    });



