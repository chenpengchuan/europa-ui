angular.module('AuxoApp')
.controller('EditCollectorSourceController', function ($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, modalInstance) {
    var isNew = !$scope.editingNode || !$scope.editingNode.id;
    var CollectorId = $scope.CollectorId;
    $scope.error="";

    // from caller
    // $scope.editingNode

    $scope.entity={id:"", name:"", resType:"DB",parentId:"",index:0, description:"",
        attributes: {DBType:"",host:"",
            port:"",database:"", user:"", password:"",
            driver: "",
            properties:[{name:"",value:""}],
            url:""
        }
        };
    angular.extend($scope.entity, $scope.editingNode);
    $scope.entityCopy = $scope.editingNode;

    var DBTypes = [{
        "name": "Mysql",
        "url": "jdbc:mysql://[HOST]:[PORT]/[DB]",
        "driver": "com.mysql.jdbc.Driver",
        "defaultPort": 3306,
        "paraPrefix": "?",
        "paraSep": "&",
        "example": "jdbc:mysql://localhost:3306/test?user=root&password=&useUnicode=true&characterEncoding=gbk&autoReconnect=true&failOverReadOnly=false",
        "comment": "DriverManager.getConnection(url);"
    }, {
        "name": "Teradata",
        "url": "jdbc:teradata://[HOST]/DBS_PORT=[PORT],DATABASE=[DB]",
        "driver": "com.teradata.jdbc.TeraDriver",
        "paraPrefix": ",",
        "paraSep": ",",
        "defaultPort": 1025,
        "example": "jdbc:teradata://127.0.0.1/CLIENT_CHARSET=EUC_CN,TMODE=TERA,CHARSET=ASCII,LOB_SUPPORT=o"
    }, {
        "name": "JDBC-ODBC Bridge",
        "url": "jdbc:odbc:[DB]",
        "driver": "sun.jdbc.odbc.JdbcOdbcDriver"
    }, {
        "name": "Oracle Thin",
        "url": "jdbc:oracle:thin:@[HOST]:[PORT]:[DB]",
        "defaultPort": 1521,
        "paraPrefix": ":",
        "paraSep": ";",
        "propertiesFormat": "map",
        "driver": "oracle.jdbc.driver.OracleDriver"
    }, {
        "name": "Microsoft SQL Server (Microsoft Driver)",
        "url": "jdbc:microsoft:sqlserver://[HOST]:[PORT];DatabaseName=[DB]",
        "driver": "com.microsoft.sqlserver.jdbc.SQLServerDriver",
        "defaultPort":1433,
        "paraPrefix": ";",
        "paraSep": ";"
    }, {
        "name": "Microsoft SQL Server(JTDS)",
        "url": "jdbc:jtds:sqlserver://[HOST]:[PORT]/[DB]",
        "driver": "net.sourceforge.jtds.jdbc.Driver",
        "id": "net.sourceforge.jtds.jdbc.Driver@SqlServer",
        "paraPrefix": ";",
        "paraSep": ";",
        "defaultPort":7100
    }, {
        "name": "Sybase",
        "url": "jdbc:jtds:sybase://[HOST]:[PORT]/[DB]",
        "driver": "net.sourceforge.jtds.jdbc.Driver",
        "paraPrefix": ";",
        "paraSep": ";",
        "comment": "jdbc:jtds:sybase://[HOST]:[PORT]/[DB];instance=SQLEXPRESS;user=sa;password=s3cr3t",
        "defaultPort":7100
    }, {
        "name": "PostgreSQL",
        "url": "jdbc:postgresql://[HOST]:[PORT]/[DB]",
        "driver": "org.postgresql.Driver",
        "paraPrefix": "?",
        "paraSep": "&",
        "comment" : "jdbc:postgresql://[HOST]:[PORT]/[DB]?user=xxx&password=yyy",
        "defaultPort":5432
    }, {
        "name": "HSQLDB",
        "url": "jdbc:hsqldb:hsql://[host]:[PORT]/[DB]",
        "driver": "org.hsqldb.jdbcDriver",
        "defaultPort":9001,
        "paraPrefix": ";",
        "paraSep": ";",
    }, {
        "name": "Greenplum",
        "url": "jdbc:pivotal:greenplum://[HOST]:[PORT];DatabaseName=[DB]",
        "driver": "com.pivotal.jdbc.GreenplumDriver",
        "defaultPort":5432,
        "paraPrefix": ";",
        "paraSep": ";",
    }, {
        "name": "Generic DB",
        "url": "",
        "driver": "",
        "driverEditable": true,
        "defaultPort":5432,
        "id": "GenericDriver"
    },{
        "name": "DB2",
        "url": "jdbc:db2://[HOST]:[PORT]/[DB]",
        "driver": "com.ibm.db2.jcc.DB2Driver",
        "defaultPort":5000,
        "paraPrefix": ";",
        "paraSep": ";"
    }]

    DBMetaMap = {}
    auxo.array.forEach(DBTypes, function (e) {
        if(!e.id)
            e.id = e.driver;
        if(!e.value)
            e.value = e.id;
        DBMetaMap[e.id] = e;
    })
    var currentDBMeta = null;
    if($scope.entity.attributes.DBType) {
        currentDBMeta = DBMetaMap[$scope.entity.attributes.DBType];
        if(!$scope.entity.attributes.driver)
            $scope.entity.attributes.driver = currentDBMeta.driver;
    }

    $scope.onChange = function(item) {
        if(item.$name === 'port') {
            var v = item.data[item.$name];
            if(v !== undefined)
                item.data[item.$name] = v + "";
        }

        if(item.$name === 'DBType')
        {
            onDBTypeChanged(item);
        } else if(item.$name === 'properties') {
            var go = true;
            var noMatch = /[^a-zA-Z0-9_]/g
            auxo.array.forEach($scope.entity.properties, function (e) {
                if(e.name) {
                    var v2 = e.name.replace(item.noMatch, '')
                    if (v !== v2) {
                        e.name = v2;
                        go = false;
                    }
                }
                if(e.value) {
                    var v2 = e.value.replace(item.noMatch, '')
                    if (v !== v2) {
                        e.value = v2;
                        go = false;
                    }
                }
            })
            if(go)
                updateUrl();
        } else if(["","host","port","database"].indexOf(item.$name)) {
            updateUrl();
        }

    }

    function updateUrl() {
        var dbMeta = currentDBMeta;
        if(!dbMeta)
            return;

        var url = dbMeta.url;
        if($scope.entity.attributes.host)
            url = url.replace("[HOST]", $scope.entity.attributes.host);
        if($scope.entity.attributes.port)
            url = url.replace("[PORT]", $scope.entity.attributes.port);
        if($scope.entity.attributes.database)
            url = url.replace("[DB]", $scope.entity.attributes.database);

        if($scope.entity.attributes.properties) {
            var p = [];
            auxo.array.forEach($scope.entity.attributes.properties, function (e) {
                if(e.name && e.value) {
                    p.push(e.name + "=" +e.value)
                }
            })
            if(p.length)
                url = url + (dbMeta.paraPrefix? dbMeta.paraPrefix: '?') + p.join(dbMeta.paraSep? dbMeta.paraSep: "&")
        }
        $scope.entity.attributes.url = url;
    }

    $scope.meta = {
        title: "数据源设置",
        fields : [
            {$name: "name", label: "名称",type:"String",  tooltip: ["汉字,字母,数字和下划线的组合,长度4-30，同一目录下唯一"],
                maxLength:100, minLength:1, noMatch:/[^\u4e00-\u9fbfa-zA-Z0-9_]/g, noMatchMsg: "汉字,字母,数字和下划线的组合!",
                data: $scope.entity
            },
            {$name: "description", label: "描述",type:"String", data: $scope.entity, tooltip: "", validator:"", isOptional: function () {return true; }},

            {$name: "DBType", label: "数据库类型",type:"Select", data: $scope.entity.attributes, tooltip: "",
                selectObjEnum: DBTypes
            },
            {$name: "driver", label: "JDBC Driver",type:"String", data: $scope.entity.attributes, tooltip: "jdbc driver", validator:"", readonly: function (item) {
                return !(currentDBMeta && currentDBMeta.driverEditable)
            }},
            {$name: "test", label: "hidden test",type:"String", data: $scope.entity, tooltip: "", validator:"", hidden:true},

            {$name: "host", label: "IP或服务器名",type:"String", data: $scope.entity.attributes,  tooltip:['数据库服务器的IP或名称'],
                maxLength:300, minLength:1,onChange:$scope.onChange,
                hidden:function (item) { return (currentDBMeta && currentDBMeta.driverEditable) }
            },
            {$name: "port", label: "端口",type:"String", data: $scope.entity.attributes, maxLength:10, minLength:1,
                noMatch:/^[0-9]*/g,noMatchMsg: "有非法字符, 只能为数字!", onChange:$scope.onChange,
                hidden:function (item) { return (currentDBMeta && currentDBMeta.driverEditable) }
            },
            {$name: "database", label: "数据库",type:"String", data: $scope.entity.attributes, onChange:$scope.onChange,
                tooltip: ["数据库名称"], validator:"", isOptional: function () {return true; },
                hidden:function (item) { return (currentDBMeta && currentDBMeta.driverEditable) }
            },
            {$name: "user", label: "用户名",type:"String", data: $scope.entity.attributes, tooltip:['用户名'], onChange:$scope.onChange,
                maxLength:300, minLength:1,
            },
            {$name: "password", label: "密码",type: "Password",data: $scope.entity.attributes, tooltip:["字母,数字和下划线,长度6-30, 不能为空"],
                maxLength:100, minLength:1, onChange:$scope.onChange,
            },
            {$name: "properties", label: "其他参数",type:"DataFrame",data: $scope.entity.attributes,  validator:"",onChange: $scope.onChange,
                hidden:function (item) { return (currentDBMeta && currentDBMeta.driverEditable) },
                content: [
                    {
                        $name: 'name',
                        label: '参数',
                        type: 'String',
                        optional: true,
                        onChange: $scope.onChange
                    },
                    {
                        $name: 'value',
                        label: '值',
                        type:"String",
                        optional: true,
                        onChange: $scope.onChange
                    }
                ]
            },
            {$name: "url", label: "URL",type:"String", data: $scope.entity.attributes, tooltip: ['数据库连接字符串，默认自动生成'], validator:"", onChange:$scope.onChange}
        ],
        itemValidator:function (item) {
            $scope.error = "";
            var v = item.data[item.$name] +"";
            if($scope.entityCopy && v === $scope.entityCopy[item.$name])
                return;

            if(!item.isOptional && auxo.isEmpty(v))
                return $scope.error = item.label +  "不能为空!";
            if(auxo.isEmpty(v))
                return;
            if(item.type === "Number") {
                if(item.min !== undefined && v < item.min) {
                    v = item.data[item.$name] = item.min;
                    return;
                }
                if(item.max !== undefined && v > item.max) {
                    v = item.data[item.$name] = item.max;
                    return;
                }
            } else if (item.noMatch) {
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
        },
        init: function () {
            auxo.array.forEach($scope.meta.fields, function (item) {
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
    }
//  $scope.meta.init();

    function onDBTypeChanged(item) {
        auxo.pass();

        if($scope.entity.attributes.DBType) {
            currentDBMeta = DBMetaMap[$scope.entity.attributes.DBType];
            if(currentDBMeta.driver)
                $scope.entity.attributes.driver = currentDBMeta.driver;
            if(currentDBMeta.defaultPort)
               $scope.entity.attributes.port = currentDBMeta.defaultPort;
        }
        else {
            currentDBMeta = null;
        }

        updateUrl()
    }

    $scope.validate = function() {
        $scope.error = "";
        auxo.array.forEach($scope.meta.fields, function (e) {
            if(e.validator) {
                e.validator(e);
            }
            if($scope.error)
                return false;
        })

        return !$scope.error;
    }

    $scope.save = function() {
        $scope.validate();
        if($scope.error)
            return;
        $scope.saving = true;

        var entityCopy = auxo.clone($scope.entity);
        //adjust data begin
        //adjust data end

        if (isNew) {
            Restangular.all("resource").post(entityCopy).then(
                function(resp){
                    $scope.saving = false;
                    yes(resp.id)
                },
                function(es) {
                    $scope.saving = false;
                    auxo.showErrorMsg(es);
                });
        } else {
            Restangular.one("resource", entityCopy.id)
                .customPUT(entityCopy)
                .then(
                    function(){
                        $scope.saving = false;
                        yes(entityCopy.id)
                    },
                    function(es) {
                        $scope.saving = false;
                        auxo.showErrorMsg(es);
                    });
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

    $scope.closeModal = function () {
        $scope.cancel();
    }
//        datasource的entity
    var changeEntity = function(){
        $scope.entity1={
            id: $scope.entity.id,
            name: $scope.entity.name,
            type:"JDBC",
            driver:$scope.entity.attributes.driver,
            url : $scope.entity.attributes.url,
            username:$scope.entity.attributes.user,
            password:$scope.entity.attributes.password,
            table:"",
            selectSQL:"",
            dbType:$scope.entity.attributes.DBType
        }
    }

//  查看元数据的表和字段
    function viewDataCollection(){
        auxo.sgDialogService.openModal({
            templateUrl : 'app/collector/collectorTable.html',
            width:800,
//                data:{editingNode:entity},
            callback: function(newData){
                if(newData) {
                    $scope.onSelected($scope.selectedNode);
                }
            }
            }
        );
    }

//  测试链接
    function testConnection (){
        changeEntity();
        Restangular.all("europa/collectors/"+CollectorId+"/datasource/test").post($scope.entity1)
        .then(function (resp) {
            if(resp ==="true"){
                auxo.sgDialogService.alert("连接成功！","提示");
            }else if(resp ==="false"){
                auxo.sgDialogService.alert("连接失败！","提示");
            }
        },function (error) {
            auxo.showErrorMsg(error);
        })
    }

//按钮
    $scope.title =  '数据源设置';
    $scope.modalButtons = [
        {
            action: testConnection,
            text: "连接验证", class: "btn-primary",
            disabled: function () {
                if ($scope.entity.attributes.url && $scope.entity.attributes.DBType)
                    return false;
                return true;
            }
        },
        {
            action: $scope.save,
            text: "确定", class: "btn-primary",
            disabled: function () {
                if ($scope.entity.attributes.url && $scope.entity.attributes.DBType && $scope.entity.name)
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
});

