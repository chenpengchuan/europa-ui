angular.module('AuxoApp')
    .controller('HomeController',function($scope, $state, $location, $window, $http, Restangular, Auth) {

    delete auxo.$rootScope.searchParams;
    $state.go('resourceMan')
    /*
    $scope.rows = [
    {
        view : "configuration",
        text : "配置",
        icon : "glyphicon glyphicon-cog",
        active : false,
        roles: [ "admin"],
        items:[{
            type: "tags",
            text: "标签",
            icon: "glyphicon glyphicon-tags text-info",
            createPath: "/tag/new",
            listPath: "/tag"
        }, {
            type: "processconfig",
                text: "自定义函数",
                icon: "glyphicon glyphicon-tags text-info",
                createPath: "/processconfig/new/dataflow interceptor",
                listPath: "/processconfig"
        }]
    },{
        view : "data",
        text : "数据",
        icon : "mdi mdi-folder-outline",
        active : false,
        roles:  ["admin", "user"],
        items:[{
            type : "datasets",
            text : "Dataset",
            icon : "glyphicon glyphicon-list text-info",
            createPath : "/data/new",
            listPath : "/data"
        },
            {
                type : "schemas",
                text : "Schema",
                icon: "mdi mdi-file-document text-info",
                createPath : "/designer/schema/new",
                listPath : "/designer/schema"
            }]
    },{
        view : "designer",
        text : "设计",
        icon : "mdi mdi-pencil-box-outline",
        active : false,
        roles:  ["admin", "user"],
        items : [{
            type : "flows",
            text : "流程",
            icon: "mdi mdi-vector-polyline text-info",
            createPath : "/designer/dataflow//new/dataflow",
            listPath : "/dataflow"
           }]
    },{
        view : "schedule",
        text : "计划",
        icon : "mdi mdi-calendar-clock",
        active : false,
        roles:  ["admin", "user"],
        items : [{
            type : "schedulers",
            text : "计划",
            icon: "mdi mdi-calendar-clock text-info",
            createPath : "/schedule/new",
            listPath : "/schedule"
        },{
            type : "executions",
            text : "执行",
            icon: "mdi mdi-run text-info",
            listPath : "/execute"
        }
        ]
    },{
        view : "monitor",
        text : "监控",
        icon : "mdi mdi-monitor",
        active : false,
        roles:  ["admin", "user"],
        items : [
        {
            type : "executions-RUNNING",
            text : "运行中",
            icon : "mdi mdi-run text-info",
            listPath : "/monitor/RUNNING"
        },{
            type : "executions-READY",
            text : "就绪",
            icon : "glyphicon glyphicon-ok-circle text-primary",
            listPath : "/monitor/READY"
        },{
            type : "executions-SUCCEEDED",
            text : "已成功",
            icon : "glyphicon glyphicon-ok-sign text-success",
            listPath : "/monitor/SUCCEEDED"
        },{
            type : "executions-FAILED",
            text : "已失败",
            icon : "glyphicon glyphicon-exclamation-sign text-danger",
            listPath : "/monitor/FAILED"
        },{
            type : "executions-KILLED",
            text : "已杀死",
            icon : "glyphicon glyphicon-remove-sign text-danger",
            listPath : "/monitor/KILLED"
        },{
            type : "executions-UNKNOWN",
            text : "未知",
            icon : "glyphicon glyphicon-question-sign text-warning",
            listPath : "/monitor/UNKNOWN"
        }]
    },{
        view : "user",
        text : "用户",
        icon : "mdi mdi-account",
        active : false,
        roles:  ["admin"],
        items : [{
            type : "users",
            text : "用户",
            icon : "mdi mdi-account text-info",
            listPath : "/user",
            createPath : "/user/new"
        }]
    }];

    $scope.user = Auth.user;
    $scope.$watch('user', function(user) {
        for(var i = 0; i < $scope.rows.length; i++) {
            var bar = $scope.rows[i];
            bar.visible = bar.roles.indexOf(user.role.title) >= 0;
        }
    }, true);

    Restangular.one("mis", "stats").get().then(function(rt) {
        for (var i = 0; i < $scope.rows.length; i++) {
            var bar = $scope.rows[i];
            for (var k = 0; k < bar.items.length; k++) {
                bar.items[k].count = rt[bar.items[k].type] || 0;
            }
        }
    });

    $scope.components = [{category:"loading"}];

    $scope.fetchComponentsStatus = function() {
        Restangular.one("components").get().then(function(componentsMap){
                $scope.components = [];
                for (var category in componentsMap) {
                   var cs = componentsMap[category];

                   if (!$.isArray(cs)) continue;

                   if (cs.length == 0) {
                        $scope.components.push({category : category, addr : "-", state : "DEAD"});
                   } else {
                        $scope.components = $scope.components.concat(cs);
                   }
                }
            }, function(error) {
                $scope.components = [{category : "Error happens! auxo-ui server is OK?"}];
            })
    };

    $scope.fetchComponentsStatus();
    */
});