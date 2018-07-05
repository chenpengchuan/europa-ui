App.controller('SchedulerFormController',  function($scope,  $http, UtilService, Restangular, modalInstance) {

    $scope.cronConfig = {
        allowMultiple: true,
        options: {
            allowWeek : true,
            allowMonth : true,
            allowYear : true
        },
        quartz: true
    };

    $scope.scheduleData = $scope.fromParent.scheduleData;
    $scope.uuid = 0;

    if(!$scope.fromParent.dataflow.parameters)
        $scope.fromParent.dataflow.parameters = [];

    var data = $scope.fromParent.dataflow

    if(!data.parameters)
        data.parameters = [];

    $scope.parameters = data.parameters;

    var parameters = $scope.parameters = auxo.clone(data.parameters);

    $scope.arguments = [];

    for (var i = 0; i < parameters.length; i++) {
        var description = parameters[i].description;
        var options = null;
        var disabled = false;
        var dependOn = "false";
        if (parameters[i].description && parameters[i].description.indexOf(";") >= 0 ) {
            var descNodes = parameters[i].description.split(";");
            description = descNodes[0];
            for (var j = 1; j <  descNodes.length; j++) {
                if (descNodes[j]) {
                    var nodeArr = descNodes[j].split("?");
                    if (nodeArr.length == 2 && nodeArr[1]) {
                        if (nodeArr[0] === "options")
                            options = nodeArr[1].split(",");
                        if (nodeArr[0] === "dependon")
                            dependOn = nodeArr[1];
                        if (nodeArr[0] === "disabled")
                            disabled = (nodeArr[1] == "true" || nodeArr[1] == "TRUE");
                    }
                }
            }

        }
        $scope.arguments.push({name : parameters[i].name, value : parameters[i].defaultVal, description: description, disabled: disabled, options: options, dependOn: dependOn });
        $scope[parameters[i].name] = $scope.arguments[i];
    }

    var formMeta = $scope.formMeta = [{id:"dataflow_commit_parameters", $name:"parameters", data: parameters, tooltip: "parameters 变量列表"}];

    $scope.runtimeProperties = [];
    $scope.runtimePropertiesFormMeta = {groups: [], hide: true};
    auxo.flowRuntime.initAndFetch($scope, $scope.fromParent.dataflow.id);

    $scope.constants = {
        name: "name",
        type: "type",
        startDate: "startDate",
        endDate: "endDate",
        id: "id",
        once: "once",
        cron: "cron",
        cronExpression: "cronExpression"

    }

    $scope.cronFirstFiveTimes = [];

    $scope.getId = function () {
        return "scheduler-form-item-" + $scope.uuid++;
    }

    $scope.formDef = {
        def: {
            name: {type: 'String', label:"名称",  show: true},
            type: {type: 'Dropdown', label:"类型", show:true, value:'once', enum :[{code:'once', title:"单次"},{code:'cron',title:"周期性"}]},
            startDate: {type: 'Date', label:"开始时间",show: true},
            endDate: {type: 'Date', label:"结束时间"},
            cronExpression: {type: 'String', label:"执行周期", value:"0 10 * ? * *"},
        },
        data: {
            id: "",
            type :"",
            startDate: "",
            endDate: "",
            cronExpression: ""
        }
    };

    UtilService.insertName($scope.formDef.def);

    $scope.dataToSchema = function(data) {
        var def = UtilService.clone($scope.formDef.def)
        var schema = [];
        if(data) {
            if (data.name)
                def.name.value = data.name;
            if (data.type)
                def.type.value = data.type;
            if (data.cronExpression)
                def.cronExpression.value = data.cronExpression;
            if (data.startDate)
                def.startDate.value = data.startDate;

            if (data.endDate)
                def.endDate.value = data.endDate;

        }
        if(!def.type.value)
            def.type.value = $scope.constants.once;
        if(!def.startDate.value)
            def.startDate.value = $.datepicker.formatDate('yy-mm-dd 00:00', new Date())
        if(!def.endDate.value)
            def.endDate.value = $.datepicker.formatDate('yy-mm-dd 23:50', new Date(new Date().getTime() + 3600*1000*24*365))
        //  def.endDate.value = $.datepicker.formatDate('yy-mm-dd 23:50', new Date(3600*1000*24*365*3000))


        schema.push(def.name);
        schema.push(def.type);
        schema.push(def.startDate);
        schema.push(def.endDate);
        schema.push(def.cronExpression);

        var array = UtilService.toObjectArray(schema);
        for(var i in array) {
            array[i].id = $scope.getId();
        }
        return schema;
    }

    $scope.schemaToData = function () {
        var schema = $scope.configuration;
        var data = {};

        for(var i in schema) {
            var item = schema[i];
            if(item.$name ) {
                data[item.$name] = item.value;
            }
        }

        if(data.type == $scope.constants.once) {
            delete data.cronExpression;
            delete data.endDate;
        }

        data.arguments = $scope.arguments;
        data.properties = [];
        auxo.array.forEach($scope.runtimeProperties, function (e) {
            data.properties.push({name:e.name, value:e.value})
        })

        return data;
    }

    $scope.onCronChange = function (cronExpression, cronExpressionCopy) {
        $scope.cronFirstFiveTimes = [];

        var cronExp = null;
        var schema = $scope.configuration;
        var start;
        var end;

        for(var i in schema) {
            var item = schema[i];
            if(item.$name == $scope.constants.cronExpression) {
                item.value = cronExpression;
                cronExp = cronExpression;
            } else if(item.$name == $scope.constants.startDate) {
                var  d  =  new  Date(Date.parse(item.value.replace(/-/g,   "/")));
                start = d;
            } else if(item.$name == $scope.constants.endDate) {
                var  d   =  new   Date(Date.parse(item.value.replace(/-/g,   "/")));
                end = d;
            }
        }
        if(cronExp) {
            ///api/schedulers/cron-validate?cron={cron-expression}&start={start-time-ms}&end={end-time-ms}'
            Restangular.one("schedulers").customGET("cron-validate",{cron:cronExp,start:start, end:end}).then(function (data) {
                console.log("data: " + JSON.stringify(data))
            })
        }
    }

    $scope.onTypeChange = function () {
        var schema = $scope.configuration;
        var type;
        for(var i in schema) {
            var item = schema[i];
            if(item.$name == $scope.constants.type) {
                type = item.value;
                break;
            }
        }

        for(var i in schema) {
            var item = schema[i];
            if(item.$name == $scope.constants.endDate) {
                if(type == $scope.constants.once)
                    delete item.show;
                else
                    item.show = true;
            } else if(item.$name == $scope.constants.cronExpression) {
                if(type == $scope.constants.once)
                    delete item.show;
                else
                    item.show = true;
            }
        }

        $scope.scheduleType = type;
    }

    $scope.cronValidate = function (data, callback) {
        if(!data)
            data = $scope.schemaToData( );
        if(data.type == $scope.constants.cron) {
            var  start =  new  Date(Date.parse(data.startDate.replace(/-/g,   "/")));
            var  end =  new  Date(Date.parse(data.endDate.replace(/-/g,   "/")));
            var cronExp = data.cronExpression;

            Restangular.one("schedulers")
                .customGET("cron-validate",{cron:cronExp,start:start.getTime(), end:end.getTime()})
                .then(
                    function (data) {
                        console.log("data: " + JSON.stringify(data))
                        if(data instanceof  Array) {
                            $scope.cronValidateResult = [];
                            var index =1;
                            for(var i in data) {
                                if($.isNumeric(i))
                                    $scope.cronValidateResult.push({index: index++, value: new Date(data[i]).toLocaleString()});
                            }
                        }
                        if(callback)
                            callback(data);
                    },
                    function (data) {
                        console.log("error data: " + JSON.stringify(data))
                        $scope.cronValidateResult = [];
                        $scope.cronValidateResult.push({index: "error", value:data.data.err});
                    }
                );
        }
    }

    // ok click
    $scope.ok = function() {
//    	data.arguments = parameters;
//    	var data1 =data.arguments
        /*for(var i=parameters.length-1;i>=0;i--) {
        var item = parameters[i]
        if(item.name === undefined || item.name.length == 0 ||
           item.refs === undefined || item.refs.length == 0  ||
           item.defaults === undefined || item.defaults.length  == 0 ||
           item.description === undefined || item.description.length == 0 ){
            parameters.splice(i,1);
        }
        }*/
        var data = $scope.schemaToData( );
        //node.configuration = data;
        console.log("node.configuration: "  + JSON.stringify(data));

        if(data.type == 'cron') {
            $scope.cronValidate(data, function (res) {
                modalInstance.closeModal(data)
            });
        } else {
            modalInstance.closeModal(data)
        }
    };
    // cancel click
    $scope.cancel = function() {
        modalInstance.dismiss();
    }


    $scope.title = '执行计划设置';
    $scope.modalButtons =[
        // {
        //     action:$scope.cronValidate,
        //     text:"Cron 表达式校验",class:"btn-primary",
        //     hide: function () { return $scope.scheduleType!='cron' }
        // },
        {
            action:$scope.ok,
            text:"确定",class:"btn-primary",
            disabled: function(){ if($scope.callbackForm) return $scope.callbackForm.$invalid || !$scope.callbackForm.$dirty;}
        },
        {
            action:$scope.cancel,
            text:"取消",class:"btn-warning"
        }
    ];
    $scope.closeModal = $scope.cancel;

    $scope.configuration = $scope.dataToSchema($scope.scheduleData);
    $scope.onTypeChange();
});