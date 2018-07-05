App.controller('processExecutionController', function($state, $scope, $location, $window, $http, $stateParams, Restangular, ngDialog, webSocketService, $interval, $timeout) {
    $scope.searchParams = $location.search();

    var logInterval = undefined;
    var webSocketObj = webSocketService;

    $scope.executionId = $stateParams.executionId;
    $scope.pid = $stateParams.id;

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
            //$scope.sorts = "lastModifiedTime"
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
        {name : "flowSchedulerId", disName : "调度ID", converter : auxo.same},
        {name : "flowSchedulerName", disName : "调度名称", converter : auxo.same},
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

    if($scope.executionId) {
        $scope.queryexec($scope.executionId);
        auxo.startEventSource($scope, {onmessage : function(data){
            $scope.queryexec($scope.executionId);
        }});
    }

    function resetQuery() {
        $scope.currPage = 1;
        $scope.reverse = true;
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
    }

    $scope.cancel = function() {
        resetQuery();
        $state.go("design.process_detail.execution_history", {"id":$scope.pid});
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
                var url = $scope.logInfo.logs[loglength].tailName;
                $scope.logInfo.loghosturl = webSocketObj.loghosturl + url.substring(1, url.length);
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
                obj.tailName =  data[i];
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

App.controller('processExecutionOutputController', function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
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
            {name : "flowId", disName : "processId", converter : auxo.same},
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