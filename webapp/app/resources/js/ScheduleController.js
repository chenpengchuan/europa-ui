


App.factory('webSocketService', function($websocket, Restangular, $timeout){
    var webSocketCount = 0;
    var webSocketObj = {
        'dataStream' : undefined,
        '$websocket' : $websocket
    };

    Restangular.one('config/getloghosturl').get().then(function(url) {
        if (url.charAt(0) == '/') {
            webSocketObj.loghosturl = window.location.protocol + "//" + window.location.host + url;
            webSocketObj.wsUrl = "ws://"+window.location.host
        } else {
            webSocketObj.loghosturl = url;
            webSocketObj.wsUrl = "ws://"+url.substring("http://".length);
        }

        function connect () {
            webSocketObj.dataStream = webSocketObj['$websocket'](webSocketObj.wsUrl + '/activity-log');
            webSocketObj.dataStream.onOpen(function() {
                console.info("websocket open");
                webSocketCount = 0;
            });
        }

        connect();

        webSocketObj.dataStream.onClose(function(){
            if(webSocketCount === 3) {
                return;
            }
            webSocketCount ++;
            $timeout(connect, 10000 );
        });

        webSocketObj.dataStream.onError(function(){
            if(webSocketCount === 3) {
                return;
            }
            webSocketCount ++;
            $timeout(connect, 10000 );
        });

    });

    return webSocketObj;
});

auxo.meta.schedule = {
    currUrl:"/hippo/schedule",
    restRootPath:"schedulers",
    detailTemplate : "",
    entityDisplayName:"计划",
    getBaseFilter: function() {
        return "";
    },
    selectedTabStatus : "RUNNING",
    rowHeaders : [{name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
        {name : "enabled", disName:"启停状态" , converter : auxo.same},
        //{name : "version", disName : "版本", converter : auxo.same},
        {name : "flowName", disName : "流程", converter : auxo.same},
        {name : "createTime", disName : "创建时间", converter : auxo.date2str},
//		                     {name : "period", disName : "周期情况", converter : same},
        {name : "creator", disName : "创建人", converter : auxo.same},
        {name : "lastModifier", disName : "修改人", converter : auxo.same},
        {name : "totalExecuted", disName : "执行次数", converter : auxo.same},
        {name : "configurations", disName : "周期情况", converter : function (c) { return c.cron || "一次性";}, disableSort:true}
    ]
};
var ScheduleController = function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {

    CrudBaseController_hippo.call(this, auxo.meta.schedule, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

    $scope.cronConfig = {
        allowMultiple: true,
        options: {
            allowWeek : true,
            allowMonth : true,
            allowYear : true
        },
        quartz: true
    };
    $scope.buttonStatus = {
        "enable" : true,
        "stop" : true,
        "delete" : true
    }

    $scope.$watch('selectedRows.length', function (newValue, oldValue) {
        var selectedRows = $scope.selectedRows;
        buttonStatusRecover();
        if(selectedRows.length > 0) {
            $scope.buttonStatus['delete'] = false;
            for(var i in selectedRows) {
                if(selectedRows[i].enabled === 0) {
                    $scope.buttonStatus['enable'] = false;
                    continue;
                }

                if(selectedRows[i].enabled === 1) {
                    $scope.buttonStatus['stop'] = false;
                }
            }
        }
    });

    function buttonStatusRecover() {
        $scope.buttonStatus["enable"] = true;
        $scope.buttonStatus["stop"] = true;
        $scope.buttonStatus["delete"] = true;
    }
};

App.controller('ScheduleController', ScheduleController)

auxo.meta.execute = {
    currUrl:"/execute",
    restRootPath:"executions",
    detailTemplate : "",
    entityDisplayName:"执行",
    getBaseFilter: function() {
        return "";
    },
    selectedTabStatus : "RUNNING",
    rowHeaders : [{name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
        {name : "flowName", disName : "流程", converter : auxo.same},
        {name : "flowSchedulerName", index: "fshName", sortName:"fshName", disName : "调度", converter : auxo.same},
        {name : "createTime", disName : "创建时间", converter : auxo.date2str},
//		                     {name : "period", disName : "周期情况", converter : same},
        {name : "status", disName : "进度", converter : auxo.status2str, disableSort:true}
        //{name: "enabled",disName:"状态",converter:auxo.same}
    ]
};
App.controller('ExecutionController', function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
    //用户Kill进程
    $scope.killExecution = function() {
        auxo.openConfirmDialog($scope, ngDialog, "确认要停止"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？", function(){
            var ids = $scope.getSelectRowIds();
            Restangular.all("executions").customPOST(ids, "kill").then(function(d){
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    };

    $scope.rerunExecution = function() {
        auxo.openConfirmDialog($scope, ngDialog, "确认要重启"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？", function(){
            var ids = $scope.getSelectRowIds();
            Restangular.all("executions").customPOST(ids, "rerun").then(function(d){
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    };




    CrudBaseController_hippo.call(this, auxo.meta.execute, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
})

App.controller('ExecutionOutputController', function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
    var eid = $stateParams.executionId;

    $scope.stepPathFilter = "all";
    $scope.stepPathArray = [{value: "all", name:"all"}];

    auxo.feo_meta = {
        currUrl:"/monitor/",
        currPage:$stateParams.currPage,
        restRootPath:"executionOutputs",
        path:"/monitor",
        detailTemplate : "",
        entityDisplayName:"ExecutionOuput",
        getBaseFilter: function() {
            var filter = "executionId="+eid;
            if($scope.stepPathFilter&&$scope.stepPathFilter !== 'all') {
                filter += "&stepPath="+$scope.stepPathFilter;
            }
            return filter;
        },
        rowHeaders : [
            //{name : "id", disName : "ID", converter : auxo.same},
            {name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
            {name : "schema", disName : "Schema", converter : auxo.same},
            {name : "outputSize", disName : "outputSize", converter : auxo.same},
            {name : "outputRecords", disName : "outputRecords", converter : auxo.same},
            {name : "action", disName : "action", converter : auxo.same},
            {name : "flowId", disName : "flowId", converter : auxo.same},
            {name : "stepPath", disName : "stepPath", converter : auxo.same},
            {name : "creator", disName : "创建人", converter : auxo.same},
            {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
        ],
        sort : {predicate:"lastModifiedTime", reverse:true}

    };
    CrudBaseController.call(this, auxo.feo_meta, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

    $scope.onStepPathChange = function () {
        $scope.other.stepPathFilter = $scope.stepPathFilter;
        $scope.reloadPage();
    }
    $scope.afterFetch = function (facetResult) {
        var fc = facetResult.facetContent;
        for (var fci in fc) {
            if ( fc[fci].field == "stepPath") {
                var a = {value: fc[fci].facet, name:fc[fci].facet + " ("+fc[fci].count + ")"};
                $scope.stepPathArray.push(a);
            }else {
                tagfacets.push({name : fc[fci].facet, count : fc[fci].count, color : $scope.tagsColorMap[fc[fci].facet]})
            }
        }
    }

    auxo.startEventSource($scope);
})


App.controller('EditScheduleController', function EditScheduleController($scope, $state, $window, $http, $stateParams, $location,$timeout, ngDialog, Restangular) {
    var isNew = $scope.isNew = $stateParams.id == "new";

    $scope.cronConfig = {
        allowMultiple: true,
        options: {
            allowWeek : true,
            allowMonth : true,
            allowYear : true
        },
        quartz: true
    };
    var id = $stateParams.id;

//	$scope.fields = [ {name:"id", disName:"ID", required=false, show=!$scope.isNew, readonly=true},
//	                  {name:"name", disName:"名称",  required=true, show=true, readonly=false},
//	                  {name:"schedulerId", ""}];
    function currentDate(dateTime){
        return auxo.formatDate(dateTime,"yyyy/MM/dd hh:mm");
    }

    $scope.runtimeProperties = [];
    $scope.runtimePropertiesFormMeta = {groups: [], hide: true};

    if (isNew) {
        $scope.entity={ configurations : {startTime : currentDate(new Date())}, schedulerId : "once"};
        if($stateParams.pid) {
            Restangular.one("flows", $stateParams.pid).get().then(function(flow) {
                $scope.parameters = flow.parameters;
                $scope.onSelectChanged(flow);
            })
        }
//		$scope.entity.schedulerDebug = "false";
    }else {
        Restangular.one("schedulers", id).get().then(function(entity) {
            entity.configurations.startTime = currentDate( new Date(entity.configurations.startTime));
            if(entity.configurations.cronType == 'simple' && entity.configurations.endTime != null){
                entity.configurations.endTime =currentDate( new Date(entity.configurations.endTime));
            }
            $scope.entity = entity;

            Restangular.one("flows", entity.flowId).get().then(function(flow) {
                $scope.parameters = flow.parameters;
            })

            $scope.runtimeProperties = $scope.entity.configurations.properties;
            auxo.flowRuntime.fetchRuntime($scope, entity.flowId);


//			if(entity.schedulerDebug.toString() == "true"){
//				$scope.entity.schedulerDebug = "true";
//			}else{
//				$scope.entity.schedulerDebug = "false";
//			}
        });
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


    $scope.onSchedulerIdChange = function() {
        var args = $scope.entity.configurations.arguments;

        if ($scope.entity.schedulerId == 'once') {
            if ($scope.entity.configurations == null || $scope.entity.configurations.startTime == null) {
                $scope.entity.configurations = {};
                $scope.entity.configurations.startTime = currentDate(new Date());
            }
        }else {
            if ($scope.entity.configurations == null || $scope.entity.configurations.cron == null) {
                $scope.entity.configurations = {};
                $scope.entity.configurations.cronType = "simple";
                $scope.entity.configurations.cron = "0 0 4 1 * ?";
            }
        }

        if ($scope.entity.configurations.startTime == null) {
            $scope.entity.configurations.startTime =currentDate( new Date());
        }

        if ($scope.entity.configurations.endTime == null) {
            $scope.entity.configurations.endTime =currentDate( new Date(3600*1000*24*365*100));
        }

        $scope.entity.configurations.arguments = args;
    }

    $scope.save = function() {
        console.log("save Scheduler "+JSON.stringify($scope.entity));
        var entity = Restangular.copy($scope.entity);
        if(entity.schedulerId=="once"){
            entity.configurations.cron='一次性';
        }

        if (auxo.isIE()){
            var date = entity.configurations.startTime.toString().replace(/-/g, "/");//兼容IE
            entity.configurations.startTime = new Date(date).getTime();
        } else {
            entity.configurations.startTime = new Date(entity.configurations.startTime).getTime();
        }
        if (entity.configurations.endTime) {
            entity.configurations.endTime = new Date(entity.configurations.endTime).getTime();
        }
        entity.configurations.properties = $scope.runtimeProperties;
        entity.source = "rhinos";

        if ($scope.isNew) {
            Restangular.all("schedulers").post(entity).then(function (facetResult) {

                if($stateParams.pid) {
                    $state.go("design.process_detail.plan", {'id' : $stateParams.pid});
                } else {
                    auxo.loadPage(auxo.meta.schedule.currUrl, {});
                }
            }, function (error) {
                auxo.showErrorMsg(error);
            })
        } else {
            entity.put().then(
                function (facetResult) {
                    if($stateParams.pid) {
                        $state.go("design.process_detail.plan", {'id' : $stateParams.pid});
                    } else {
                        auxo.loadPage(auxo.meta.schedule.currUrl);
                    }

                }, function (error) {
                    auxo.showErrorMsg(error);
                }
            );
        }
    }

    $scope.cancel = function() {
        //auxo.loadPage(auxo.meta.schedule.currUrl);
        auxo.goBack();
    }

    $scope.startTimePopup = { opened : false};

    $scope.endTimePopup = { opened : false};


    $scope.openStartTimePopup = function() {
        $scope.startTimePopup.opened = true;
    }

    $scope.openEndTimePopup = function() {
        $scope.endTimePopup.opened = true;
    }

    $scope.onSelectChanged = function (flow) {
        $scope.entity.flowId = flow.id;
        $scope.entity.flowName = flow.name;
        $scope.entity.flowType = flow.flowType;
        $scope.entity.configurations.arguments = [];
        var params = flow.parameters;
        $scope.parameters = params;
        if (params != null) {
            for (var i = 0; i < params.length; i++) {
                $scope.entity.configurations.arguments.push({name : params[i].name, value : params[i].defaultVal});
            }
        }
        auxo.flowRuntime.initAndFetch($scope, flow.id);
    }

    $scope.cronValidate = function () {
        if(!$scope.entity)
            return;

        var entity = Restangular.copy($scope.entity);
        $scope.cronValidateResult = [];
        if(entity.schedulerId =="once" ){
            entity.configurations.cron='一次性';
            return;
        }

        var startTime = new Date(entity.configurations.startTime).getTime();
        var endTime = null;
        if (entity.configurations.endTime) {
            endTime = new Date(entity.configurations.endTime).getTime();
        }

        Restangular.one("schedulers")
            .customGET("cron-validate",{cron : entity.configurations.cron, start : startTime, end : endTime})
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
                },
                function (data) {
                    console.log("error data: " + JSON.stringify(data))
                    $scope.cronValidateResult = [];
                    $scope.cronValidateResult.push({index: "error", value:data.data.err});
                }
            );
    }

    $scope.$watch('entity.configurations.cron', function(newVal, oldVal){
        $scope.cronValidate();
    });

    $scope.$watch('entity.configurations.startTime', function(newVal, oldVal){
        $scope.cronValidate();
    });

    $scope.$watch('entity.configurations.endTime', function(newVal, oldVal){
        $scope.cronValidate();
    });
});

auxo.meta.selectflow = {
    restRootPath:"flows",
    detailTemplate : "",
    entityDisplayName:"流程",
    getBaseFilter: function() {
        return "";
    },
    selectedTabStatus : "RUNNING",
    rowHeaders : [   //{name : "id", disName : "ID", converter : auxo.same},
        {name : "name", disName : "名称", converter : auxo.same},
        {name : "createTime", disName : "创建时间", converter : auxo.date2str},
    ]
};
App.controller('SelectFlowController', function SelectFlowController($filter, $scope, $location, $window, $http, $stateParams, ngDialog, Restangular) {

    CrudBaseController.call(this, auxo.meta.selectflow, $scope, $location, $window, $http, Restangular, ngDialog, $filter)

});


App.controller('ViewExecutionController', function($scope, $location, $window, $http, $stateParams, Restangular, ngDialog, webSocketService, $interval, $timeout) {
    $scope.searchParams = $location.search();

    var logInterval = undefined;
    $scope.executionId = $stateParams.id;

    var webSocketObj = webSocketService;

    $scope.activeTab = "detail"; // cdos, log

    $scope.other = {activeTab:$scope.activeTab};
    if($scope.searchParams.other) {
        $scope.other = {};
        var args = auxo.parseOtherParameter($scope.searchParams.other);
        if(args) {
            angular.extend($scope, args);
            angular.extend($scope.other, args);
        }
    }

    $scope.showLog = false;

    function updateActiveTabIndex() {
        $scope.activeTabIndex = ['detail','outputs','log'].indexOf($scope.activeTab);
    }
    updateActiveTabIndex();
    $scope.showTab = function(tab) {
        if($scope.activeTab !== tab) {
            $scope.activeTab = tab;
            $scope.other.activeTab = $scope.activeTab;
            auxo.reloadPage($scope);
        }
    }

    $scope.headers = [{name : "id", disName : "ID", converter : auxo.same},
        {name : "name", disName : "名称", converter : auxo.same},
        {name : "externalId", disName : "EID", converter : auxo.same},
        {name : "cost", disName : "耗时(秒)",  converter : auxo.ms2s},
        {name : "status", disName : "状态", converter : auxo.status2str},
        {name : "flowId", disName : "流程ID", converter : auxo.same},
        {name : "flowName", disName : "流程名称", converter : auxo.same},
        {name : "flowShedulerId", disName : "调度ID", converter : auxo.same},
        {name : "flowShedulerName", disName : "调度名称", converter : auxo.same},
        {name : "createTime", disName : "创建时间", converter : auxo.date2str},
        {name : "creator", disName : "创建人", converter : auxo.same},
        {name : "lastModifier", disName : "修改人", converter : auxo.same},
        {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
    ];


    $scope.queryexec = function (id) {
        Restangular.one("executions", id).get().then(function(entity) {
            $scope.entity = entity;
            if($scope.entity.status['type'] === "SUCCEEDED" || $scope.entity.status['type'] === "FAILED") {
                $scope.islogTitleShow = false;
            } else {
                $scope.islogTitleShow = true;
            }

            if($scope.entity.status['type'] === "SUCCEEDED" || $scope.entity.status['type'] === "FAILED" || $scope.entity.status['type'] === "KILLED") {
                $scope.logInfo.refresh();
                clearInterval(logInterval);
            }
        });
    };
    $scope.queryexec($scope.executionId);
    auxo.startEventSource($scope, {onmessage : function(data){
        $scope.queryexec($scope.executionId);
    }});

    $scope.cancel = function() {
        if($stateParams.status){
            $location.path("monitorMain/monitor/"+$stateParams.status).search(auxo.$rootScope.searchParams);
        }else{
            $location.path("monitorMain/monitor").search(auxo.$rootScope.searchParams);
        }
    }

    $scope.logInfo = $scope.logInfo || {};
    $scope.logInfo.processId="*";
    $scope.logInfo.filterWord = "";
//	$scope.logInfo.reconnectTime = 0;
    $scope.logInfo.loghosturl = undefined;
    $scope.logTitle = undefined;
    $scope.logInfo.url="";
    $scope.logs = [];
    $scope.logInfo.logShowStatus = "waitting";
    $scope.logInfo.logs=[
//	                     {"showName":"asdb0000","content":["123456789199999999999999999999999999999fffffffffffffffffffffffffffffffffffffffff99999999","1234567892","1234567893","1234567894","1234567895","1234567896","1234567897","1234567898"]},
//	    	             {"showName":"asdb1","content":["1234567892","1234567893","1234567894","1234567895","1234567896","1234567897","1234567898","1234567899"]},
//	    	             {"showName":"asdb2","content":["1234567893","1234567894asddddddddddddddddddddffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffddddddddddddddddddddddddddddddddddddddddddddddddddddddddd","1234567895","1234567896","1234567897","1234567898","1234567899","1234567890"]},
//	    	             {"showName":"asdb3","content":["1234567894","1234567895","1234567896","1234567897","1234567898","1234567899","1234567890","1234567891"]},
//	    	             {"showName":"asdb4","content":["1234567895","1234567896","1234567897","1234567898","1234567899","1234567890","1234567891","1234567892"]},
//	    	             {"showName":"asdb5","content":["1234567896","1234567897","1234567898","1234567899","1234567890","1234567891","1234567892","1234567893"]},
//	    	             {"showName":"asdb6","content":["1234567897","1234567898","1234567899","1234567890","1234567891","1234567892","1234567893","1234567894"]},
//	    	             {"showName":"8888888888888888888","content":[]}
    ];
    $scope.logInfo.generateLog = function(message) {
//		console.info(message);
//		$scope.$apply(function () {
        $scope.logInfo.addLogToShow(message);
//		});
    };

    $scope.logInfo.addLogToShow = function(strs) {
        var index = this.checkCurrentNameIsNoExistLogs(strs[0]);
        if(index < 0) {
            var obj = null;
            obj = {
                'showName':strs[0],
                'content':[strs[1]],
                'tailName':"/" + $scope.entity.id+"/"+ strs[0]+".log"
            }
            this.logs.push(obj);
        } else {
            if(this.logs[index].content.length<=100) {
                this.logs[index].content.push(strs[1]);
            } else {
                this.logs[index].content.shift();
                this.logs[index].content.push(strs[1]);
            }
        }

        if($scope.logTitle === strs[0] && $("#ececutionDetailLogShow")[0] !== undefined) {
            $("#ececutionDetailLogShow").scrollTop($("#ececutionDetailLogShow")[0].scrollHeight);
        }

        this.doQuery(this.filterWord);
    };

    $scope.logInfo.checkCurrentNameIsNoExistLogs = function(name) {
        for(var i in this.logs ) {
            if(this.logs[i].showName === name) {
                return i;
            }
        }
        return -1;
    };

    $scope.logInfo.changeLogContent = function(nodeName, $event) {
//		webSocketObj.dataStream.close(true);
        $scope.logInfo.loghosturl = undefined;
        for(var loglength=0; loglength< $scope.logInfo.logs.length; loglength ++) {
            if($scope.logInfo.logs[loglength].showName === nodeName) {
                $scope.logInfo.loghosturl = webSocketObj.loghosturl + $scope.logInfo.logs[loglength].tailName;
                break;
            }
        }

        for(var i in $scope.logInfo.logs) {
            if($scope.logInfo.logs[i].showName === nodeName) {
                $scope.logInfo.logContent = $scope.logInfo.logs[i].content;
                $scope.logTitle = nodeName;

                webSocketObj.dataStream.send(JSON.stringify({ 'topic': $scope.entity.id + "$" + $scope.logTitle}));

                if($scope.logInfo.logContent.length === 0) {

                    $http({
                        url:webSocketObj.loghosturl + "log/tail?logpath=" + auxo.escapeUri($scope.logInfo.logs[i].tailName) + "&size=1000" ,
                        method:"get"
                    }).then(function(response){

                        var data = eval(response.data);
                        $scope.logInfo.logs[i].content = data;
                        $scope.logInfo.logContent = $scope.logInfo.logs[i].content;
                        $scope.logTitle = nodeName;
                    });

                    break;
                }
            }
        }

        if($event!==undefined) {
            $(".logTitle").css("background", "#FFF");
            $(".logTitle:contains(" + $event.currentTarget.innerText + ")").css("background", "#F0F0F0");
        }
    }


    $scope.logInfo.webSocket = $scope.logInfo.webSocket || {};

    $scope.logInfo.doQuery = function(queryWord) {

        if(queryWord===undefined) {
            queryWord = this.filterWord;
        }
        var logTitleFlagExist = false;
        this.filterWord = queryWord;
//		console.log("query word : " + this.filterWord);

        if(queryWord.replace(/(^\s*)|(\s*$)/g,"")==="") {
            $scope.logs = this.logs;
            if(!logTitleFlagExist && $scope.logs.length != 0) {
                if($scope.logTitle !== undefined)  {
                    return;
                }
                $(".logTitle").css("background", "#FFF");
                $(".logTitle:first").css("background", "#F0F0F0");
                this.changeLogContent($scope.logs[0].showName);
            }
            return;
        }

        var tempLogs = [];
        for(var i in this.logs) {
            if(this.logs[i].showName.indexOf(queryWord) >= 0) {
                tempLogs.push(this.logs[i]);
                if($scope.logTitle === this.logs[i].showName) {
                    logTitleFlagExist = true;
                }
            }
        }
        $scope.logs = tempLogs;

        if(!logTitleFlagExist && $scope.logs.length != 0) {
            $(".logTitle").css("background", "#FFF");
            $(".logTitle:first").css("background", "#F0F0F0");
            this.changeLogContent($scope.logs[0].showName);
        }
    }

    var loadnumber = 0;

    function webSocketOperate() {
        webSocketObj.dataStream.onMessage(function(message) {
            $scope.logInfo.logShowStatus = "running";
            message = message.data;
            console.log("message websocket: " + message);
            var index = message.indexOf("#");
            if(index > 0) {
                $scope.logInfo.generateLog([message.substring(0,index), message.substring(index+1, message.lenght)]);

                if($scope.logTitle === undefined) {
                    $scope.logTitle = $scope.logInfo.logs[0].showName;
                    $scope.logInfo.logContent = $scope.logInfo.logs[0].content;
                }
            }
        });
    }

    $scope.logInfo.refresh = function(args) {
        var urlPre = webSocketObj.loghosturl + 'log/';
        if(!$scope.entity || !$scope.entity.id)
            return;
        var urlSub = "/"+$scope.entity.id + "," + $scope.entity.externalId +"?random=" + Math.random()*10000;

        $http({
            url:urlPre + "list" + urlSub,
            type:"get",
        }).then(function(response){
            $scope.logInfo.logShowStatus = "running";
            var data = response.data;
            for(var i in data) {
                var obj = {};
                obj.showName = (data[i].split("/")[data[i].split("/").length - 1]).split("\.")[0];
                var lkPath = data[i];
                if(lkPath && lkPath.length>0 && lkPath.substring(0,1) === "/"){
                    obj.tailName =  lkPath.substring(1,lkPath.length);
                }else{
                    obj.tailName =  data[i];
                }
                obj.content = [];
                if($scope.logInfo.checkCurrentNameIsNoExistLogs(obj.showName) === -1) {
                    $scope.logInfo.logs.push(obj);
                }
            }

            if($scope.logInfo.logs.length === 0 ) {
                return;
            }

            if($scope.logInfo.logs[0].showName !== undefined && $scope.logInfo.logs[0].content.length === 0) {
                $http({
                    url:webSocketObj.loghosturl + "log/tail?logpath=" + auxo.escapeUri($scope.logInfo.logs[0].tailName) + "&size=1000" ,
                    method:"get"
                }).then(function(response){
                    var data = eval(response.data);
                    $scope.logInfo.logs[0].content = data;
                    $scope.logInfo.logContent = $scope.logInfo.logs[0].content;
                    $scope.logTitle = $scope.logInfo.logs[0].showName;
                    webSocketObj.dataStream.send(JSON.stringify({ 'topic': $scope.entity.id + "$" + $scope.logTitle}));
                });
            }
            if(loadnumber === 0) {
                webSocketOperate();
                loadnumber ++;
            }

            $scope.logInfo.doQuery();
        },function(){
            $scope.logInfo.logShowStatus = "error";
            $scope.logInfo.errorMessage = "没有日志信息。";
        });
    }

    function cleanup() {
        if(logInterval) {
            clearInterval(logInterval);
            logInterval = undefined;
        }
    }
    cleanup();
    logInterval = setInterval($scope.logInfo.refresh, 5000);

    $scope.$on("$destroy", function() {
        cleanup();
    });

    $scope.logInfo.download=function() {
        var urlPre = webSocketObj.loghosturl + 'log/';
        var urlSub = "/"+$scope.entity.id + "," + $scope.entity.externalId;
        downLoadFile(urlPre + "zip" + urlSub);

        function downLoadFile(filePathURL){
            if(!document.getElementById("_SAVEASFILE_TEMP_FRAME")) {
                $('<iframe style="display:none;" id="_SAVEASFILE_TEMP_FRAME" name="_SAVEASFILE_TEMP_FRAME" width="0" height="0" src="about:blank"></iframe>').appendTo("body");
            }
            document.all._SAVEASFILE_TEMP_FRAME.src = filePathURL;
        }
    }
});

