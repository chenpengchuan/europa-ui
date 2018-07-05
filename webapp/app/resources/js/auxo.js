var auxo;

auxo = auxo || {};

auxo.version = "_europa-default-version_"; // will be replaced by gulp
auxo.DEV_ENABLED = false;
auxo.systemId = "zebra";  // use for filtering
/*
Please return true for fn if want to step the digging.
fn = function (key, value, path, parent)
 */
auxo.treeWalk = function (obj, fn, functionIncluded) {
    if ('object' != typeof obj)
        return;

    var exit = -1;

    // when exit == true, don't dig into; if exit == 1,quit
    var treeWalk = function (obj, name, path, parent, parentKey) {
        if(exit === false ||exit === 'break')
            return;
        if (!path) path = "";
        if (!('object' == typeof obj))
            return;
        if (fn) {
            // if want to stop this loop, fn return true
            exit = fn(name, obj, path, parent, parentKey)
            if(exit === false || exit === 'break')
                return;
            if(exit === true || exit === 'continue') {
                exit = -1;
                return;
            }
        }

        if (name != undefined)
            path += "." + name;
        var isArray = $.isArray(obj);
        for (var key in obj) {
            if(isArray)
                key = parseInt(key)
            if (!functionIncluded && typeof obj[key] == 'function')
                continue;

            if ('object' == typeof obj[key]) {
                treeWalk(obj[key], key, path, obj, name);
            } else if (fn) {
                // if want to stop this loop, fn return true
                exit = fn(key, obj[key], path, obj)
                if(exit === false || exit === 'break')
                    return;
                if(exit === true || exit === 'continue') {
                    exit = -1;
                    return;
                }
            }
        }
    };
    treeWalk(obj);
};

/*
Please return true for fn if want to step the digging.
fn = function (key, value, path, parent)
 */
auxo.treeWalk2 = function (obj, fn, functionIncluded) {
    if ('object' != typeof obj)
        return;

    var exit = -1;

    // when exit == true, don't dig into; if exit == 1,quit
    var treeWalk = function (obj, name, path, parent, parentKey, level) {
        if(level === undefined)
            level = 0;
        if(exit === 'break')
            return;
        if (!path) path = "";
        if (!('object' == typeof obj))
            return;
        if (fn) {
            // if want to stop this loop, fn return true
            exit = fn({key: name, value:obj, path:path, parent:parent, parentKey: parentKey, level: level})
            if(exit === -1) // break;
                return;
            if(exit === 1) { // continue;
                exit = -1;
                return;
            }
        }

        if (name != undefined)
            path += "." + name;
        var isArray = $.isArray(obj);
        for (var key in obj) {
            if(isArray)
                key = parseInt(key)
            if (!functionIncluded && typeof obj[key] == 'function')
                break;

            if ('object' == typeof obj[key]) {
                treeWalk(obj[key], key, path, obj, name, level+1);
            } else if (fn) {
                // if want to stop this loop, fn return true
                exit = fn({key:key,value: obj[key],path: path, parent:obj, level:level+1})
                if(exit === -1)
                    return;
                if(exit === 1) {
                    exit = -1;
                    return;
                }
            }
        }
    };
    treeWalk(obj);
};

auxo.isArray = function (obj) {
    return $.isArray(obj);
}

auxo.findObjectByKey = function (obj, key) {
    var retValue;
    auxo.treeWalk(obj, function (name, value) {
        if (value && value[attr]) {
            retValue = value;
            return "break";
        }
    })
    return retValue
}

auxo.clone = function(obj, withFun){
    if(!obj || obj == null)
        return;
    var txt=JSON.stringify(obj);
    var nObj = JSON.parse(txt);
    auxo.treeWalk(nObj, function (key, value) {
        if(key && (key+"").indexOf("$$")===0) {
            delete value[key];
            return "continue;"
        }
    })

    if(withFun) {
        var funMap = {}
        var hasFun = false;
        auxo.treeWalk(obj,function (key, value, path, parent) {
            if(key && value && typeof(value) == 'function' ) {
                if(!funMap[path])
                    funMap[path] = {}
                funMap[path][key] = value
                hasFun = true;
            }
        }, true)
        if(hasFun) {
            auxo.treeWalk(nObj,function (key, value, path, parent) {
                if(path && funMap[path]) {
                    var fo = funMap[path];
                    for(var v in fo) {
                        parent[v] = fo[v];
                    }
                    delete funMap[path];
                }
            })
        }
    }

    return nObj
}

auxo.captalizeString = function (text) {
    return text.substr(0,1).toUpperCase() + text.substr(1);
}

auxo.arrayMove = function (array, from, to) {
    array.splice(to, 0, array.splice(from, 1)[0]);
}

/*
if callback returns false, then break for call;
 */
auxo.forEachArray = function (array, callback) {
    if(!array || !Array.isArray(array))
        return;
    for(var i=0;i<array.length;i++) {
        var result = callback(array[i],i)
        if(result === false)
            break;
    }
}

auxo.forEachArrayReverse = function (array, callback) {
    if(!array)
        return;
    for(var i=array.length-1;i>=0;i--) {
        var result = callback(array[i],i)
        if(result === false)
            break;
    }
}

// do not call this in the processing of a dialog opening or closing
auxo.alert = function (sgDialogService, obj, title) {
    auxo.sgDialogService.alert("<div style=' overflow: auto'> <pre>" + JSON.stringify(obj, null, " ") + "</pre></div>", title);
}

//根据提示内容拼接 tooltip提示的html代码;
auxo.tooltips = function (arr) {
    var tip = "<div>";
    for (i = 0; i < arr.length; i++) {
        var num = arr.length>1? ((i+1) + ". "): ""
        tip += "<p align=\"left\">" + num + arr[i] + "</p>";
    }
    tip += "</div>"
    return tip;
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
auxo.formatDate = function(date, fmt) {
    var o = {
        "M+" : date.getMonth()+1,                 //月份
        "d+" : date.getDate(),                    //日
        "h+" : date.getHours(),                   //小时
        "m+" : date.getMinutes(),                 //分
        "s+" : date.getSeconds(),                 //秒
        "q+" : Math.floor((date.getMonth()+3)/3), //季度
        "S"  : date.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}

auxo.removeNullFromArray = function (array) {
    if (array)
        for (i = array.length - 1; i >= 0; i--) {
            if (!array[i] || array[i] === '' || array[i] === {}) {
                array.splice(i, 1);
            }
        }
    return array
}

auxo.removeAttributes = function (obj, attrs) {
    auxo.forEachArray(attrs, function (e,i) {
        delete obj[e]
    })
}

auxo.keepAttributes = function (obj, attrs) {
    var args = [];
    for(var i in obj) {
        if(attrs.indexOf(i) < 0)
            args.push(i)
    }
    auxo.removeAttributes(obj, args)
}

auxo.removeObj = function (index, array) {
    array.splice(index, 1);
}

auxo.getCurrentTime = function () {
    return auxo.formatDate(new Date(),"yyyy-MM-dd hh:mm:ss");
}

auxo.openInputDialog = function (title, value, callback, sgDialogService,width, prompt) {
    if(!width || width <500)
        width = 500;
    var openDialog = function(){
        auxo.sgDialogService.openModal({
            template:"<div>" + (prompt ? "<i>" + prompt + "</i>":"") +  "<input data-ng-model='input' class='form-control' style='width:100%;' required /> </div>",
            controller: function ($scope, Restangular, modalInstance, hotkeys) {
                //  $scope.title = "查询";
                //  $scope.input = $scope.inputData

                $scope.ok = function () {
                    if(!isOkDisabled())
                        modalInstance.closeModal({value:$scope.input});
                }

                $scope.cancel = function () {
                    modalInstance.dismiss();
                }

                hotkeys.bindTo($scope)
                    .add({
                        combo: 'esc',
                        description: 'call cancel',
                        callback: function(event) {event.preventDefault(); $scope.cancel()}
                    })
                    .add({
                        combo: 'enter',
                        description: 'call ok',
                        allowIn: ['INPUT'],
                        callback: function(event) {event.preventDefault(); $scope.ok()}
                    })

                function isOkDisabled() {
                    if($scope.input === undefined || $scope.input.length == 0){
                        return true;
                    }
                    return false;
                }

                $scope.modalButtons =[
                    {
                        action:$scope.ok,
                        text:"确定",class:"btn-primary",
                        disabled: function(){
                            return isOkDisabled();
                        }
                    },
                    {
                        action: $scope.cancel,
                        text:"取消",class:"btn-warning"
                    }
                ];
                $scope.closeModal = $scope.cancel
            },
            data:{input:value, title: title},
            callback: function(result){
                if(callback)
                    callback(result.value)
            },
            width:width
        });
    }
    openDialog();
}

auxo.filterNonWordChar = function (str) {
    if(str !== undefined)
        return str.replace(/[^a-zA-Z0-9_]/g,"")
}

auxo.hotkeys = {
    hotkeys: null,
    boundScopes: {
        scopes: []
        // id: hotkey
    },
    bindEscEnterHotkey: function ($scope, hotkeys, allowIn) {
        if (hotkeys && !auxo.hotkeys.hotkeys)
            auxo.hotkeys.hotkeys = hotkeys;
        if(!hotkeys)
            hotkeys = auxo.hotkeys.hotkeys;

        var boundScopes = auxo.hotkeys.boundScopes;

        if (!($scope.$id in boundScopes)) {
            // Add the scope to the list of bound scopes
            boundScopes[$scope.$id] = [];
            boundScopes.scopes.push({scope: $scope, allowIn: allowIn})
            $scope.$on('$destroy', function () {
                auxo.hotkeys.delHotkey($scope)
            });
        }

        var hotkey = hotkeys.add({
            combo: 'enter',
            description: 'call ok',
            allowIn: allowIn ? allowIn : [],
            callback: function (event) {
                event.preventDefault();
                $scope.ok()
            }
        })
        boundScopes[$scope.$id].push(hotkey)

        hotkey = hotkeys.add({
            combo: 'alt+enter',
            description: 'call ok',
            allowIn: ["INPUT", "SELECT", "TEXTAREA"],
            callback: function (event) {
                event.preventDefault();
                $scope.ok()
            }
        })
        boundScopes[$scope.$id].push(hotkey)

        hotkey = hotkeys.add({
            combo: 'esc',
            description: 'call cancel',
            allowIn: ["INPUT", "SELECT", "TEXTAREA"],
            callback: function (event) {
                event.preventDefault();
                $scope.cancel();
            }
        })
        boundScopes[$scope.$id].push(hotkey)
    },
    delHotkey: function ($scope, noRefresh) {
        var hotkeys = auxo.hotkeys.hotkeys;
        var boundScopes = auxo.hotkeys.boundScopes;

        if(!boundScopes[$scope.$id])
            return;

        var i = boundScopes[$scope.$id].length;
        while (i--) {
            hotkeys.del(boundScopes[$scope.$id].pop());
        }

        for(var i=0;i<boundScopes.scopes.length;i++) {
            if($scope === boundScopes.scopes[i].scope) {
                boundScopes.scopes.splice(i,1)
                break;
            }
        }
        delete boundScopes[$scope.$id]
        if(!noRefresh)
            auxo.hotkeys.refreshTopScope();
    },
    refreshTopScope: function () {
        var boundScopes = auxo.hotkeys.boundScopes;
        if(boundScopes.scopes.length == 0)
            return;
        var $scope = boundScopes.scopes[boundScopes.scopes.length-1].scope;
        var allowIn = boundScopes.scopes[boundScopes.scopes.length-1].allowIn;

        auxo.hotkeys.delHotkey($scope, true)
        auxo.hotkeys.bindEscEnterHotkey($scope, auxo.hotkeys.hotkeys, allowIn)
    }
}

auxo.bindEscEnterHotkey = function ($scope, hotkeys, allowIn) {
    auxo.hotkeys.bindEscEnterHotkey($scope, hotkeys, allowIn)
}
auxo.delHotkey = function ($scope) {
    auxo.hotkeys.delHotkey($scope)
}
auxo.pass = function () {
    //do nothing
}

auxo.handleDecimal = function(args) {
    var scale = args[0] ? args[0]:0;
    var precision = args[1]? args[1]:0;
    var type = "decimal";
    if(precision == 0) {
        if(scale == 1) {
            type = 'boolean';
        } else if(scale < 4) {
            type = 'byte';
        } else if(scale < 6) {
            type = 'short';
        } else if(scale < 11) {
            type = 'int';
        } else if(scale < 39) {
            type = 'bigint';
        }
    } else {
        if(scale < 20 && precision < 5) {
            type = 'double'
        } else {
            type = 'decimal(' + scale + ',' + precision + ')';
        }
    }
    return type;
}


auxo.jdbc = {
    driverList: [
        "com.mysql.jdbc.Driver",
        "oracle.jdbc.driver.OracleDriver",
        "com.teradata.jdbc.TeraDriver",
        "org.postgresql.Driver",
        "com.microsoft.sqlserver.jdbc.SQLServerDriver",
        "COM.ibm.db2.jdbc.app.DB2Driver",
        "com.gbase.jdbc.Driver",
        "weblogic.jdbc.mssqlserver4.Driver",
        "com.inet.tds.TdsDriver",
        "com.ashna.jturbo.driver.Driver",
        "com.inet.pool.PoolDriver",
        "ncom.sybase.jdbc2.jdbc.SybDriver",
        "com.pointbase.jdbc.jdbcUniversalDriver",
        "COM.cloudscape.core.JDBCDriver",
        "RmiJdbc.RJDriver",
        "org.firebirdsql.jdbc.FBDriver",
        "ids.sql.IDSDriver",
        "com.informix.jdbc.IfxDriver",
        "org.enhydra.instantdb.jdbc.idbDriver",
        "interbase.interclient.Driver",
        "org.hsql.jdbcDriver",
        "com.pivotal.jdbc.GreenplumDriver"
    ],
    drivers: [{
        "name": "IBM DB2",
        "url": "jdbc:db2://[HOST]:[PORT]/[DB]",
        "driver": "COM.ibm.db2.jdbc.app.DB2Driver"
    }, {
        "name": "JDBC-ODBC Bridge",
        "url": "jdbc:odbc:[DB]",
        "driver": "sun.jdbc.odbc.JdbcOdbcDriver"
    }, {
        "name": "Microsoft SQL Server",
        "url": "jdbc:weblogic:mssqlserver4:[DB]@[HOST]:[PORT]",
        "driver": "weblogic.jdbc.mssqlserver4.Driver"
    }, {
        "name": "Oracle Thin",
        "url": "jdbc:oracle:thin:@[HOST]:[PORT]:<SID>",
        "driver": "oracle.jdbc.driver.OracleDriver"
    }, {
        "name": "PointBase Embedded Server",
        "url": "jdbc:pointbase://embedded[:[PORT]]/[DB]",
        "driver": "com.pointbase.jdbc.jdbcUniversalDriver"
    }, {
        "name": "Cloudscape",
        "url": "jdbc:cloudscape:[DB]",
        "driver": "COM.cloudscape.core.JDBCDriver"
    }, {
        "name": "Cloudscape RMI",
        "url": "jdbc:rmi://[HOST]:[PORT]/jdbc:cloudscape:[DB]",
        "driver": "RmiJdbc.RJDriver"
    }, {
        "name": "Firebird (JCA/JDBC Driver)",
        "url": "jdbc:firebirdsql:[//[HOST][:[PORT]]/][DB]",
        "driver": "org.firebirdsql.jdbc.FBDriver"
    }, {
        "name": "IDS Server",
        "url": "jdbc:ids://[HOST]:[PORT]/conn?dsn='<ODBC_DSN_NAME>'",
        "driver": "ids.sql.IDSDriver"
    }, {
        "name": "Informix Dynamic Server",
        "url": "jdbc:informix-sqli://[HOST]:[PORT]/[DB]:INFORMIXSERVER=<SERVER_NAME>",
        "driver": "com.informix.jdbc.IfxDriver"
    }, {
        "name": "InstantDB (v3.13 and earlier)",
        "url": "jdbc:idb:[DB]",
        "driver": "jdbc.idbDriver"
    }, {
        "name": "InstantDB (v3.14 and later)",
        "url": "jdbc:idb:[DB]",
        "driver": "org.enhydra.instantdb.jdbc.idbDriver"
    }, {
        "name": "Interbase (InterClient Driver)",
        "url": "jdbc:interbase://[HOST]/[DB]",
        "driver": "interbase.interclient.Driver"
    }, {
        "name": "Hypersonic SQL (v1.2 and earlier)",
        "url": "jdbc:HypersonicSQL:[DB]",
        "driver": "hSql.hDriver"
    }, {
        "name": "Hypersonic SQL (v1.3 and later)",
        "url": "jdbc:HypersonicSQL:[DB]",
        "driver": "org.hsql.jdbcDriver"
    }, {
        "name": "Microsoft SQL Server (JTurbo Driver)",
        "url": "jdbc:JTurbo://[HOST]:[PORT]/[DB]",
        "driver": "com.ashna.jturbo.driver.Driver"
    }, {
        "name": "Microsoft SQL Server (Sprinta Driver)",
        "url": "jdbc:inetdae:[HOST]:[PORT]?database=[DB]",
        "driver": "com.inet.tds.TdsDriver"
    }, {
        "name": "Microsoft SQL Server 2000 (Microsoft Driver)",
        "url": "jdbc:microsoft:sqlserver://[HOST]:[PORT][;DatabaseName=[DB]]",
        "driver": "com.microsoft.sqlserver.jdbc.SQLServerDriver"
    }, {
        "name": "MySQL (MM.MySQL Driver)",
        "url": "jdbc:mysql://[HOST]:[PORT]/[DB]",
        "driver": "org.gjt.mm.mysql.Driver"
    }, {
        "name": "Oracle OCI 8i",
        "url": "jdbc:oracle:oci8:@<SID>",
        "driver": "oracle.jdbc.driver.OracleDriver"
    }, {
        "name": "Oracle OCI 9i",
        "url": "jdbc:oracle:oci:@<SID>",
        "driver": "oracle.jdbc.driver.OracleDriver"
    }, {
        "name": "PostgreSQL (v6.5 and earlier)",
        "url": "jdbc:postgresql://[HOST]:[PORT]/[DB]",
        "driver": "postgresql.Driver"
    }, {
        "name": "PostgreSQL (v7.0 and later)",
        "url": "jdbc:postgresql://[HOST]:[PORT]/[DB]",
        "driver": "org.postgresql.Driver"
    }, {
        "name": "Sybase (jConnect 4.2 and earlier)",
        "url": "jdbc:sybase:Tds:[HOST]:[PORT]",
        "driver": "com.sybase.jdbc.SybDriver"
    }, {
        "name": "Sybase (jConnect 5.2)",
        "url": "jdbc:sybase:Tds:[HOST]:[PORT]",
        "driver": "com.sybase.jdbc2.jdbc.SybDriver"
    }, {
        "name": "Mysql",
        "url": "jdbc:mysql://[HOST]:[PORT]/[DB]",
        "driver": "com.mysql.jdbc.Driver"
    }, {
        "name": "Teradata",
        "url": "jdbc:teradata://[HOST]/DBS_PORT=[PORT]",
        "driver": "com.teradata.jdbc.TeraDriver"
    }, {
        "name": "Oracle(OranhoDriver)",
        "url": "jdbc:inetpool:inetora:[HOST]",
        "driver": "com.inet.pool.PoolDriver"
    }, {
        "name": "Sybase(jConnect5.2)",
        "url": "jdbc:sybase:Tds:[HOST]:[PORT]",
        "driver": "ncom.sybase.jdbc2.jdbc.SybDriver"
    }, {
        "name": "GBase",
        "url": "jdbc:gbase://[HOST]:[PORT]/[DB]",
        "driver": "com.gbase.jdbc.Driver"
    }, {
        "name": "Greenplum",
        "url": "jdbc:pivotal:greenplum://[HOST]:[PORT];DatabaseName=[DB]",
        "driver": "com.pivotal.jdbc.GreenplumDriver"
    }],
    getUrl: function (d) {
        var url = ''
        auxo.forEachArray(auxo.jdbc.drivers, function (e, i) {
            if (e.driver === d) {
                url = e.url;
                return false;
            }
        })
        return url;
    },
    mysqlTypeMap: {
        "TINYINT":"int",
        "SMALLINT":"int",
        "MEDIUMINT":"int",
        "INT":"int",
        "INTEGER":"int",
        "BIGINT":"bigint",
        "FLOAT":"float",
        "DOUBLE":"double",
        "DECIMAL":auxo.handleDecimal,
        "CHAR":"string",
        "VARCHAR":"string",
        "TINYBLOB":"binary",
        "TINYTEXT":"string",
        "BLOB":"binary",
        "BIT":"boolean",
        "TEXT":"string",
        "MEDIUMBLOB":"binary",
        "MEDIUMTEXT":"string",
        "LOGNGBLOB":"binary",
        "LONGTEXT":"string",
        "DATE":"date",
        "TIME":"timestamp",
        "YEAR":"date",
        "DATETIME":"timestamp",
        "TIMESTAMP":"timestamp",
        "ENUM":"string"
    },
    oracleTypeMap: {
        "CHAR":"string",
        "VARCHAR":"string",
        "VARCHAR2":"string",
        "LONGVARCHAR":"string",
        "NUMERIC":"decimal",
        "NUMBER": auxo.handleDecimal,
        "DECIMAL":auxo.handleDecimal,
        "BIT":"boolean",
        "TINYINT":"int",
        "SMALLINT":"int",
        "INTEGER":"int",
        "LONG":"bigint",
        "BIGINT":"bigint",
        "REAL":"float",
        "FLOAT":"double",
        "BINARY_FLOAT":"double",
        "DOUBLE":"double",
        "BINARY_DOUBLE":"double",
        "BINARY":"binary",
        "VARBINARY":"binary",
        "LONGVARBINARY":"binary",
        "DATE":"date",
        "TIME":"timestamp",
        "TIMESTAMP":"timestamp",
        "BLOB":"binary",
        "CLOB":"string"
    },
    defaultTypeMap: {
        "TINYINT":"int",
        "SMALLINT":"int",
        "MEDIUMINT":"int",
        "INT":"int",
        "INTEGER":"int",
        "BIGINT":"bigint",
        "FLOAT":"float",
        "DOUBLE":"double",
        "DECIMAL":"decimal",
        "CHAR":"string",
        "VARCHAR":"string",
        "TINYBLOB":"binary",
        "TINYTEXT":"string",
        "BLOB":"binary",
        "TEXT":"string",
        "MEDIUMBLOB":"binary",
        "MEDIUMTEXT":"string",
        "LOGNGBLOB":"binary",
        "LONGTEXT":"string",
        "DATE":"date",
        "TIME":"timestamp",
        "YEAR":"date",
        "DATETIME":"timestamp",
        "TIMESTAMP":"timestamp",
        "ENUM":"string",
        "BLOB":"binary",
        "CLOB":"string"
    },
    europaDataTypes:  ["string", "byte", "short", "bigint", "int", "float", "double", "boolean", "date", "timestamp", "binary", "decimal"]
}

auxo.isString = function (value) {
    return typeof value == "string" || value instanceof String
}

auxo.trimValues = function (data, delEmpty, excludings) {
    if(!data)
        return;
    auxo.treeWalk(data, function (key, value,path, parent,parentKey) {
        if(key && value !== undefined) {
            if(auxo.isString(value)) {
                var v = value.replace(/^ */,"").replace(/ *$/,"");
                parent[key] = v;
                if (v == '' && delEmpty) {
                    if ($.isNumeric(key)) {
                    }
                    else {
                        if (excludings && excludings.indexOf(key) > -1) {
                        } else
                            delete parent[key]
                    }
                }

                if (delEmpty && $.isNumeric(key) && key == parent.length - 1) {
                    if (parentKey && excludings && excludings.indexOf(parentKey) > -1) {
                    } else {
                        auxo.forEachArrayReverse(parent, function (e, i) {
                            if (e.length == 0)
                                parent.splice(i, 1)
                        })
                    }
                }
            }
        }
    })
}

auxo.test = function () {
    var data = {
        a: "abc ",
        b: {c:['',' d',' ',' f ']},
        g: {l:{m: 'm', k:' ',o:{p:'',q:' quu    '}}},
        s:''
    }
    console.log(JSON.stringify(data,null,8))
    //auxo.trimValues(data)
    //console.log(JSON.stringify(data,null,8))

    auxo.trimValues(data)
    console.log(JSON.stringify(data,null,8))

}
//auxo.test()
/**
 * variable should be like #{name: value}
 * @param str
 */
auxo.searchVariables = function (str) {
    var patt = new RegExp("#\{[^}]+:[^}]+\}","g");
    var vars = []
    var result;
    while ((result = patt.exec(str)) != null)  {
        var index = result[0].indexOf(':')
        var name = result[0].substr(2,index-2).replace(/^\s*/,'').replace(/\s*$/,'')
        var value = result[0].substr(index+1).replace(/^\s*/,'').replace(/\s*\}$/,'')
        vars.push({name: name, value: value})
    }

    return vars;
}

auxo.arrayRemoveAll = function (array) {
    array.splice(0, array.length)
}

auxo.fetchFlowParameters = function (Restangular, flowId, callback) {
    Restangular.one("flows", flowId).get()
        .then(function (facetResult) {
            if(facetResult.parameters && facetResult.parameters.length > 0) {
                var paras = {}
                auxo.forEachArray(facetResult.parameters, function (e, i) {
                    paras[e.name] = e.defaultVal;
                })
                callback(paras);
            }
        })
}

auxo.isEmpty = function (v) {
    return v === undefined || v === '' || v === null;
}

auxo.replaceAttribute = function (obj, from, to) {
    if(!obj)
        return;
    var s = JSON.stringify(obj);
    s = s.replace(from, to);
    return eval("(" + s + ")");
}

auxo.isStepType = function (src, expect) {
    return src === expect || src === "spark_" + expect || src === "sf_" + expect;
}

auxo.buildErrorMsg = function (msg, icon) {
    //return "<span style='color:orangered;'>" + msg +"</span>"

    var ret =  "<span style='color:hotpink;'>"+msg + "</span>";
    if(icon === 'warning')
        ret = "<span style='color:hotpink;'><i class='glyphicon glyphicon-exclamation-sign right-margin-5'></i></span>" + ret;
    else if(icon === 'error') {
        ret = "<span style='color:hotpink;'><i class='glyphicon glyphicon-remove-sign right-margin-5'></i></span>" + ret;
    } else if (icon === "question")
        ret = "<span style='color:hotpink;'><i class='glyphicon glyphicon-question-sign right-margin-5'></i></span>" + ret;
    return ret;
}

auxo.array = {
    last:  function (array) {
        return array[array.length-1]
    },
    setAttrValue: function (array, attr, value) {
        auxo.forEachArray(array, function (e, i) {
            e[attr] = value;
        })
    },
    getItemByAttr: function (array, attr, value) {
        var ret;
        auxo.forEachArray(array, function (e, i) {
            if (e[attr] === value) {
                ret = e;
                return false;
            }
        })
        return ret;
    },
    removeAll: function (array) {
        array.splice(0, array.length)
    },
    insertArray: function (baseArray, insertedArray, index) {
        if(index === undefined)
            index = baseArray.length;
        auxo.forEachArray(insertedArray, function (e,i) {
            baseArray.splice(index+i,0,e);
        })
    },
    insert: function (baseArray, item, index) {
        if(index === undefined)
            index = baseArray.length;
        baseArray.splice(index, 0, item);
    },
    remove: function (array, index) {
        array.splice(index, 1);
    },
    forEach: auxo.forEachArray,
    forEachReverse: auxo.forEachArrayReverse,
    contains: function (arr, obj) {
        var i = arr.length;
        while (i--) {
            if (arr[i] === obj) {
                return true;
            }
        }
        return false;
    }
}

auxo.list2List = function ($scope, synchData) {

    $scope.deleteItem = function (index) {
        $scope.rightList.items.splice(index, 1)
        synchData()
    }

    $scope.selectAll = function () {
        var leftList = $scope.leftList;
        if(leftList.items.length==0)
            return;
        auxo.forEachArray(leftList.items, function (e,i) {
            e.selected = $scope.allSelected;
        })
    }

    /**
     * dnd-dragging determines what data gets serialized and send to the receiver
     * of the drop. While we usually just send a single object, we send the array
     * of all selected items here.
     */
    $scope.getSelectedItemsIncluding = function(list, item) {
        if(!item.selected) {
            auxo.array.forEach(list.items, function (e) {
                e.selected = false;
            })
        }
        item.selected = true;
        return list.items.filter(function(item) { return item.selected; });
    };

    /**
     * In the dnd-drop callback, we now have to handle the data array that we
     * sent above. We handle the insertion into the list ourselves. By returning
     * true, the dnd-list directive won't do the insertion itself.
     */
    $scope.onDrop = function(list, items, index) {
        angular.forEach(items, function(item) { item.selected = false; });

        var itemsCopy = auxo.clone(items);
        auxo.forEachArray(itemsCopy, function (e, i) {
            e.valid = true;
        })

        list.items = list.items.slice(0, index)
            .concat(itemsCopy)
            .concat(list.items.slice(index));

        synchData()
        return true;
    }

    /**
     * Last but not least, we have to remove the previously dragged items in the
     * dnd-moved callback.
     */
    $scope.onMoved = function(list) {
        list.items = list.items.filter(function(item) { return !item.selected; });
        synchData()
    };

    $scope.onSelected = function (list, item, event) {
        if(event.target.nodeName === "SELECT" || event.target.nodeName === "INPUT") return;

        var items = list==='left'? $scope.leftList.items: $scope.rightList.items

        if(event.ctrlKey) {
            item.selected = !item.selected;
        } else if(event.shiftKey) {
            var from=-1, to=-1;
            var isFrom = false;
            auxo.forEachArray(items, function (e,i) {
                if(e === item){
                    if(from < 0) {
                        from = i;
                        isFrom = true;
                    } else {
                        to = i;
                    }
                } else if(e.selected) {
                    if(from < 0) {
                        from = i;
                    } else {
                        if(isFrom) {
                            if(to<0)
                                to = i;
                        } else {
                            from = i;
                        }
                    }
                }
                e.selected = false;
            })
            if(from >=0 && to >=0) {
                auxo.forEachArray(items, function (e,i) {
                    if(i>=from && i<=to)
                        e.selected = true;
                })
            } else {
                item.selected = true;
            }
        } else {
            auxo.forEachArray(items, function (e) {
                e.selected = false;
            })
            item.selected = true;
        }
    }

    $scope.mouseDown = function (event) {
        if(event.target.nodeName === "SELECT" || event.target.nodeName === "INPUT")
            $scope.dragDisabled = true;
        else
            $scope.dragDisabled = false;
    }

    // Model to JSON for demo purpose
    // $scope.$watch('rightList', function(model) {
    //     $scope.modelAsJson = angular.toJson(model, true);
    // }, true);

    $scope.deleteInvalid = function () {
        auxo.forEachArrayReverse($scope.rightList.items,function (e,i) {
            if(!e.valid)
                $scope.rightList.items.splice(i,1)
        })
        synchData()
    }

    $scope.deleteAll = function () {
        $scope.rightList.items = []
        synchData()
    }

    $scope.hasItemWithAttr = function (list, attr, value) {
        return !auxo.array.getItemByAttr(list, attr, value)
    }
}

auxo.handleErrorStatus = function (responseStatus) {
    var $rootScope = auxo.$rootScope;
    if($rootScope.httpError)
        $rootScope.httpError.error = '';
    else
        $rootScope.httpError = {};

    auxo.closeHttpErrorDlg();

    if (responseStatus === 401 || responseStatus === 403){
        $rootScope.httpError.error = "服务请求无效或者禁止访问！"
    } else if(responseStatus === -1) {
        $rootScope.httpError.error = "服务器连接无效！"
    } else if (responseStatus == 511) {
        auxo.$location.path('/license/activate');
    } else if (responseStatus == 409) {
        localStorage.clear();
        sessionStorage.clear();
        if (window.confirm("系统刚刚进行了升级，需要退出重新登录，马上退出登录吗?")) {
            window.location.assign("/?t=" + new Date().getTime() + "#/login");
        } else {
            return;
        }
    }

    if($rootScope.httpError && $rootScope.httpError.error && !auxo.isLoginPage() && !auxo.isLicensePage()) {
        auxo.sgDialogService.alert(auxo.buildErrorMsg($rootScope.httpError.error), "错误", function () {
            if($rootScope.httpError) {
                delete $rootScope.httpError.error;
                delete $rootScope.httpError.$scope;
            }
        },function ($scope) {
            $rootScope.httpError.$scope = $scope;
        })
    }
}

auxo.closeHttpErrorDlg = function () {
    var error = auxo.$rootScope.httpError;
    if (error && error.$scope) {
        var s = error.$scope;
        delete error.error;
        delete error.$scope;
        s.ok();
    }
}

auxo.isLoginPage = function () {
    return window.location.href.indexOf("#/login") > 5;
}

auxo.isLicensePage = function () {
    return window.location.href.indexOf("#/license/activate") > 5;
}


function isNull( str )
{
    if ( str == "" ) {
        return true;
    }
    var regu = "^[ ]+$";
    var re = new RegExp(regu);
    return re.test(str);
};

auxo.getResponseErrorMsg = function (error) {

    var errors = [];
    var warnings = [];
    auxo.treeWalk(error, function (key, value) {
        if(key) {
            if (key === 'error' || key === 'err' || key === 'Error' || key === "errorlist" || key === "errorList" || key === "ErrorList") {
                errors.push(value);
                return 'continue';
            } else if (key === 'warning' || key === "Warning" || key === "warninglist" || key === "warningList" || key === "WarningList") {
                warnings.push(value);
                return 'continue';
            }
        }
    })
    if(errors.length == 0 && warnings.length == 0)
        return;

    var msg = ""

    function buildMsg(errors) {
        var str = angular.toJson(errors, true);
        var ss = str.split("\n");

        function buildLeftTag(level) {
            return "<p style='padding-left: " + level*20 + "px;'>"
        }

        var lines = [];
        auxo.treeWalk2(errors, function (ops) {
            if('object' == typeof ops.value ) {
                if(Array.isArray(ops.parent) ){
                } else if (ops.key) {
                    lines.push (buildLeftTag(ops.level) + ops.key + "</p>")
                }
            } else {
                var key = ops.key + ": ";
                if(Array.isArray(ops.parent) && ops.parent.length == 1)
                    key = ""
                lines.push(buildLeftTag(ops.level) + key + ops.value + "</p>");
            }
        })

        msg += lines.join("\n");
    }

    if(errors.length>0) {
        msg += "<p><strong>错误信息：</strong></p>";
        buildMsg(errors)
    }
    if(warnings.length>0) {
        if(errors.length>0)
            msg += "<br>"
        msg += "<p><strong>警告信息：</strong></p>";
        buildMsg(warnings)
    }

    msg = msg.replace("is duplicate","已经被使用").replace("name :","名称:");
    return msg;
}

auxo.exec = function (o, arg) {
    if(o && $.isFunction(o))
        return o(arg);
    return o;
}

auxo.callAttr = function (attr, obj) {
    if(obj && obj[attr] && $.isFunction(obj[attr]))
        return obj[attr](obj);
    else if(obj && obj[attr])
        return obj[attr];
    return null;
}

auxo.getFooterMsg = function () {
    // return auxo.$location.path()
    return auxo.$rootScope.debugMsg
}

auxo.setDebugMsg = function (key, value) {
    if(!auxo.$rootScope.debugMsg)
        auxo.$rootScope.debugMsg = {};
    if(value)
        auxo.$rootScope.debugMsg[key] = value;
    else
        delete auxo.$rootScope.debugMsg[key]
}

auxo.loadPage = function (path, searchParams) {
    if(!searchParams)
        searchParams = auxo.$rootScope.searchParams;
    var noSearch = true;
    if(searchParams) {
        for (var i in searchParams) {
            noSearch = false;
        }
    }

    if(path && !noSearch)
        auxo.$location.path(path).search(searchParams)
    else if(path)
        auxo.$location.path(path);
    else if(!noSearch)
        auxo.$location.search(searchParams)
    else
        auxo.$location.path();
}

auxo.buildParam = function (obj) {
    auxo.$rootScope.searchParams = obj;
}

auxo.meta = {};

auxo.listSearchParamString = "currPage&limit&sorts&queryWord&reverse&tagSelection&startDate&endDate&other&filter";

auxo.showErrorMsg = function (error) {
    auxo.sgDialogService.alert(auxo.getResponseErrorMsg(error), "错误")
}

auxo.interceptor = function (obj, interceptor, params) {
    if(interceptor)
        return interceptor(obj, params)
    return obj;
}

auxo.getIconName = function (name) {
    if("hawq" === name || "mapreduce" == name)
        name = 'unknown';

    if("validate" === name)
        return "glyphicon glyphicon-check";
    if("supplement" === name)
        return "glyphicon glyphicon-import";

    return "iconfont icon-" + name;
}

auxo.maxLengthCheck = function (item) {
    if(item.maxLength) {
        if(item.data&& item.data[item.$name]) {
            if(item.data[item.$name].length > item.maxLength)
                item.data[item.$name] = item.data[item.$name].substr(0,item.maxLength);
        }
    }
}

// Save as Code
auxo.saveAs = function(blob, fileName) {
    var url = window.URL.createObjectURL(blob);
    var doc = document.createElement("a");
    doc.href = url;
    doc.download = fileName;
    doc.click();
    // window.URL.revokeObjectURL(url);
}

auxo.download = function(strPath) {
    var varExt = strPath.split('.');
    //alert(varExt.length);
    if (varExt[varExt.length - 1] == "txt") {
        window.open(strPath);
    }
    else {
        var iframe;
        iframe = document.getElementById("hiddenDownloader");
        if (iframe == null) {
            iframe = document.createElement('iframe');
            iframe.id = "hiddenDownloader";
            iframe.style.visibility = 'hidden';
            document.body.appendChild(iframe);
        }
        iframe.src = strPath;
    }
    return false;
}

auxo.showWarnigAlert = function (msg, title) {
    auxo.sgDialogService.alert(auxo.buildErrorMsg(msg,"warning"), title);
}

auxo.parseOtherParameter = function (other) {
    if(other) {

        var o = angular.fromJson(other);
        return o;

        /*
        var a = {};
        var ss = other.split(";");
        auxo.array.forEach(ss, function (e) {
            var b = e.split(":")
            a[b[0]] = b[1];
        })
        return a;
        */
    }
}

auxo.buildOtherString = function (other) {
    if(other){
        return JSON.stringify(other);
    }
    return "";

    /*
    var s = "";
    var a = [];
    for(k in other) {
        a.push(k + ":" + other[k]);
    }
    s = a.join(";")
    return s;
    */
}

auxo.reloadPage = function ($scope) {
    var ARGS = auxo.listSearchParamString.split("&");
    function buildPathParams() {
        var ss = {}
        auxo.array.forEach(ARGS, function (e) {
            ss[e] = $scope[e]
            if(e === "other") {
                ss[e] = auxo.buildOtherString($scope[e])
            }
        })

        return ss;
    }

    auxo.$location.search(buildPathParams())
}

auxo.solrTypes = [
    {value:"schemas", name:"cdc",table:"csm"},
    {value:"datasets", name:"cdo", table:"cds"},
    {value:"flows", name:"flow", table:"cfd"},
    {value:"schedulers", name:"schedule", table:"fsh"}
];

auxo.solrAllTypes = [
    {value:"schemas", name:"cdc",table:"csm"},
    {value:"datasets", name:"cdo", table:"cds"},
    {value:"flows", name:"flow", table:"cfd"},
    {value:"schedulers", name:"schedule", table:"fsh"},
    {value:"executions", name:"execution", table:"fes"},
    {value:"executionOutputs", name:"executionOutput", table: "feo"},
    {value:"flowHistories", name:"flowHistory", table: "cfh"}
];

auxo.flowTypeArray = [
    {name:"all", value:"all"},
    {name:"dataflow", value:"dataflow"},
    {name:"workflow", value:"workflow"},
    {name:"streamflow", value:"streamflow"}
];
auxo.processEventTypeArray = [
    {name:"全部", value:"all"},
    {name:"创建", value:"CREATE"},
    {name:"更新", value:"UPDATE"},
    {name:"删除", value:"DELETE"},
    {name:"共享", value:"SHARE"},
    {name:"接收共享", value:"RECEIVE"},
    {name:"移动", value:"MOVE"},
    {name:"复制", value:"COPY"},
    {name:"重命名", value:"RENAME"},
    {name:"导出", value:"EXPORT"},
    {name:"导入", value:"IMPORT"}
];
auxo.dateTypeArray = [
    {name:"day", value:"day"},
    {name:"hour", value:"hour"}
];
auxo.systemTypeArray = [
    {name:"all", value:"all"},
    {name:"rhinos", value:"rhinos"},
    {name:"zebra", value:"zebra"}
];
auxo.alarmTypeArray = [
    {name:"所有", value:"all"},
    {name:"警告", value:"warning"},
    {name:"致命", value:"deadly"},
    {name:"严重", value:"serious"}
];
auxo.alarmTypeArray_new = [
    {name:"警告", value:"warning"},
    {name:"致命", value:"deadly"},
    {name:"严重", value:"serious"}
];
auxo.datasourceStatusArray = [
    {name:"all", value:"all"},
     {name:"FAILED", value:"FAILED"},
    {name:"SUCCEEDED", value:"SUCCEEDED"}

];
auxo.goBack = function() {
    auxo.$window.history.back();
};

auxo.flowRuntime = {
    initRuntimePropertiesFormMeta: function ($scope) {
        var meta =  $scope.runtimePropertiesFormMeta;
        auxo.array.forEach($scope.runtimeProperties, function (e) {
            var prefix = e.name.replace(/\..*$/,"");
            if(meta.groups.indexOf(prefix)<0) {
                meta.groups.push(prefix);
                meta[prefix] = {items:[], name: prefix};
            }
            if (e.name === "dataflow.queue") {
                var options = e.value;
                if(!$.isArray(options)) {
                    auxo.array.forEach($scope.defaultRuntimeProperties, function (i) {
                        if(i.name === "dataflow.queue") {
                            options = i.value;
                        }
                    })
                } else
                    e.value = options[0];
                meta[prefix].items.push({name:e.name.replace(/^.*\./,""), data: e, options : options})
            } else {
                meta[prefix].items.push({name:e.name.replace(/^.*\./,""), data: e})
            }

        })
    },
    fetchRuntime: function ($scope, flowId) {
        auxo.Restangular.one("flows",flowId).getList("runtime-properties")
            .then(function (data) {
                $scope.defaultRuntimeProperties = data;
                if(!$scope.runtimeProperties.length)
                    auxo.array.forEach (data, function (e) {
                        $scope.runtimeProperties.push({name: e.name, value: e.value})
                    })
                auxo.flowRuntime.initRuntimePropertiesFormMeta($scope);
            })
    },
    init: function ($scope, flowId) {
        if(!$scope.runtimeProperties)
            $scope.runtimeProperties = [];
        else
            auxo.array.removeAll($scope.runtimeProperties)
        if(!$scope.runtimePropertiesFormMeta)
            $scope.runtimePropertiesFormMeta = {groups: [], hide: true};
        else {
            for(var k in $scope.runtimePropertiesFormMeta )
                delete  $scope.runtimePropertiesFormMeta[k]
            $scope.runtimePropertiesFormMeta.groups = [];
            $scope.runtimePropertiesFormMeta.hide = true;
        }
    },
    initAndFetch: function ($scope,flowId) {
        auxo.flowRuntime.init($scope, flowId);
        auxo.flowRuntime.fetchRuntime($scope,flowId);
    }
}

auxo.ellipsisfy = function (str, length) {
    if(str.length<length)
        return str;
    return str.substring(0,length) + "...";
}

auxo.startEventSource = function ($scope, callbacks) {
    var eventSourceMonitor = undefined;
    var url = "api/europaEvents/executions";
    var eventSourceMonitor = new EventSource(url);
    eventSourceMonitor.onerror = function (event) {
        console.info(event);
    };

    eventSourceMonitor.onopen = function (event) {
        console.log("eventsource opened!");
    };

    eventSourceMonitor.onmessage = function (event) {
        console.info("#######################")
        console.info(event.data);
        console.info("#######################")

        if (callbacks && callbacks.onmessage) {
            callbacks.onmessage(event.data);
        } else
            $scope.fetchPage($scope.ptableState);
    };
    $scope.$on("$destroy", function() {
        console.log("Destory is being called.")
        eventSourceMonitor.close();
        delete eventSourceMonitor;
    });
}

auxo.go = function(hash) {
    auxo.$location.url(hash);
}

auxo.searchScopeAncestor = function (scope, callback) {
    function getParent(scope) {
        if(!scope)
            return;
        if(callback(scope))
            return scope;

        return getParent(scope.$parent);
    }

    return getParent(scope);
}

auxo.searchScopeChild = function (scope, callback) {
    function getChild(scope) {
        //console.log("scope id:" + scope.$id);

        if(callback(scope))
            return scope;

        if(scope.$$childHead) {
            var s = getChild(scope.$$childHead);
            if(s)
                return s;
        }

        if(scope.$$nextSibling) {
            var s = getChild(scope.$$nextSibling);
            if(s)
                return s;
        }
    }

    return getChild(scope);
}

auxo.sessionCacheOptions = [
    {name: "无", value: "NONE"},
    {name: "原始内容到内存优先兼磁盘（费空间省时间）", value: "MEMORY_AND_DISK"},
    {name: "原始内容到纯内存（费空间省时间）", value: "MEMORY_ONLY"},
    {name: "序列化到纯内存（费时间省空间）", value: "MEMORY_ONLY_SER"},
    {name: "序列化到内存优先兼磁盘（费时间省空间）", value: "MEMORY_AND_DISK_SER"},
    {name: "纯磁盘", value: "DISK_ONLY"},
    {name: "纯内存且复制2份 ", value: "MEMORY_ONLY_2"},
    {name: "内存优先兼磁盘且复制2份 ", value: "MEMORY_AND_DISK_2"},
    {name: "非Java堆内存（体验版）", value: "OFF_HEAP"},
]

auxo.copyBindingData = function (d,f, bindings) {
    if(d && f && bindings) {
        auxo.array.forEach(bindings, function (e) {
            if(e.indexOf(f)>=0) {
                auxo.array.forEach(e, function (i) {
                    if(i !== f)
                        d[i] = d[f];
                })
            }
        })
    }
}

auxo.isEmpty = function (v) {
    if(!v && v !== 'false' && v !== false && v !== 0)
        return true;
    return false;
}

auxo.isColumnVisible = function(col, rh){
    if(rh && rh.visible !== undefined)
        return rh.visible;
    if((col === "creator" || col === "lastModifier")&& auxo.Auth.user.role.title !== auxo.Auth.userRoles.admin.title)
        return false;
    return true;
}
auxo.isAdmin = function () {
    return auxo.Auth.user.role.title === auxo.Auth.userRoles.admin.title;
}
auxo.form = {
    buildItem: function (desc) {
        if ((desc.selectEnum || desc.selectObjEnum ) && !desc.type)
            desc.type = "Select";
        if (!desc.type)
            desc.type = "String";
        if (!desc.tooltip && !desc.label)
            desc.tooltip = [desc.$name];
        if (desc.illegal !== undefined || desc.min !== undefined || desc.max !== undefined || desc.maxlength !== undefined) {
            desc.validator = function (self, params) {
                var value = "";
                if(self.data)
                    value = self.data[self.$name] + "";
                else if (params && params.data && params.data[self.$name])
                    value = params.data[self.$name] + "";
                var v = value;
                if(desc.illegal) {
                    var reg = new RegExp(self.illegal, "g");
                    var v = value.replace(reg, '');
                }
                if(self.numType === 'f') {
                    var ss = v.split(".");
                    if (ss.length >= 2) {
                        v = ss[0] === '0' ? ss[0] + "." + ss[1] : '0.' + ss[1]
                    }
                    if(self.min !== undefined && parseFloat(v)<self.min)
                        v = self.min + "";
                    else if(self.max != undefined && parseFloat(v)>self.max)
                        v = self.max + "";
                } else if(self.numType === 'i') {
                    if(self.min !== undefined && parseInt(v)<self.min)
                        v = self.min + "";
                    else if(self.max != undefined && parseInt(v)>self.max)
                        v = self.max + "";
                }

                if(self.maxLength && self.maxlength < v.length)
                    v = v.substr(0,self.maxLength)

                if(self.data)
                    self.data[self.$name] = v;
                else if(params && params.data)
                    params.data[self.$name] = v;

            }
        }

        return desc;
    }
}

/*
 list item is like {code: "", parentCode:"", name:"",...}
 tree is a blank array : []
 */
auxo.listToTree = function(list, tree) {
    var remains = [];
    var leafMap = [];
    auxo.array.forEach(list, function (e) {
        if(!e.parentCode) {
            tree.push(e)
            leafMap[e.code] = e
        } else
            remains.push(e);
    })

    function orgnize(leafMap, remains) {
        var remains2 = [];
        var leafMap2 = []
        auxo.array.forEach(remains, function (e) {
            var s = leafMap[e.parentCode];
            if(s) {
                if(!s.children)
                    s.children = [];
                s.children.push(e);
                leafMap2[e.code] = e;
            } else
                remains2.push(e);
        })

        if(remains2.length)
            orgnize(leafMap2, remains2);
    }
    orgnize(leafMap, remains);
}

auxo.amIAdmin = function() {
    return auxo.Auth.user.role.title == 'admin'
}
auxo.hasSharedRight = function (obj, right) {
    if(obj && obj.sharedUsers && right) {
        var s = auxo.Auth.user.tenant + ":" + auxo.Auth.user.name + ":" + right;
        if(obj.sharedUsers.indexOf(s)>=0)
            return true;
    }
}
auxo.sharedWithMe = function(obj) {
    if(obj && obj.sharedUsers) {
        var s1 = auxo.Auth.user.tenant + ":" + auxo.Auth.user.name + ":rw";
        var s2 = auxo.Auth.user.tenant + ":" + auxo.Auth.user.name + ":r";
        if(obj.sharedUsers.indexOf(s1)>=0 || obj.sharedUsers.indexOf(s2)>=0)
            return true;
    }
}
auxo.isMyShared = function(obj) {
    if(obj && obj.tenant == auxo.Auth.user.tenant && obj.owner == auxo.Auth.user.name
        && obj.sharedUsers && obj.sharedUsers.length > 0) {
        return true;
    }
}
auxo.isMine = function (obj) {
    if(obj && obj.tenant === auxo.Auth.user.tenant && obj.owner === auxo.Auth.user.name)
        return true;
    else
        return false;
}
auxo.canChange = function (obj) {
    if(obj && obj.tenant === auxo.Auth.user.tenant && (obj.owner === auxo.Auth.user.name ||
            auxo.Auth.user.role.title === 'admin'))
        return true;
    else
        return false;
}
auxo.canRW = function (obj) {
    if(obj && obj.tenant === auxo.Auth.user.tenant && (obj.owner === auxo.Auth.user.name ||
            auxo.Auth.user.role.title === 'admin' || auxo.hasSharedRight(obj, "rw")))
        return true;
    else
        return false;
}
auxo.shareTooltips = function (arr) {
    if(arr) {
        var tip = "<div>已共享给:<br>";
        for (i = 0; i < arr.length; i++) {
            var a = arr[i].split(":");
            tip += "<p align=\"left\">" + "租户-" + a[0] + ", 用户-" + a[1] + ", 权限-" + a[2] + "</p>";
        }
        tip += "</div>"
        return tip;
    }
}
auxo.receiveShareTooltips = function(node) {
    var right = '';
    for (i = 0; i < node.sharedUsers.length; i++) {
        var share = node.sharedUsers[i];
        if(share.startsWith(auxo.Auth.user.tenant + ":" + auxo.Auth.user.name)) {
            right = share.substr(share.lastIndexOf(':') + 1);
            break;
        }
    }
    var tip = "<div>";
    tip += "<p align=\"left\">从" + "租户-" + node.tenant + ", 用户-" + node.owner + "</p>";
    tip += "接受共享, 权限-" + right + "</div>";
    return tip;
}

auxo.buildMessageButton = function (obj) {
    return {
        text: "信息", class: "btn-primary",
        action: function () {
            if($.isFunction(obj))
                obj = obj();
            auxo.sgDialogService.openModal({
                templateUrl: 'app/resourceMan/objMessage.html',
                data: {obj: JSON.stringify(obj, '', 4)},
                width: 800
            });
        },
        hide: function () {
            return false
        }
    }
}
auxo.getScopeFieldValue = function ($scope, scopeName,fieldName) {
    var scope = auxo.searchScopeChild($scope.$root&&scopeName? $scope.$root: $scope,  null, scopeName);
    if(scope)
        return scope[fieldName];
}
auxo.getScopes=function(root) {
    var scopes = [];
    function visit(scope) {
        scopes.push(scope);
    }
    function traverse(scope) {
        visit(scope);
        if (scope.$$nextSibling)
            traverse(scope.$$nextSibling);
        if (scope.$$childHead)
            traverse(scope.$$childHead);
    }
    traverse(root);
    return scopes;
}
auxo.isIE = function () {
    var userAgent = navigator.userAgent;
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
    if(isIE || isEdge || isIE11) {
        return true;
    } else {
        return false;
    }
}