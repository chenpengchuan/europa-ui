'use strict';

/* Filters */

var AppFilters = angular.module('AuxoApp.filters', []);

AppFilters.filter('interpolate', ['version', function (version) {
    return function (text) {
        return String(text).replace(/\%VERSION\%/mg, version);
    }
}]);

var OperationMap = {
    "createFlow":"创建流程",
    "createResource":"创建资源",
    "findResourceAll":"查询全部资源",
    "renew":"更新认证",
    "validate":"验证",
    "disable":"停用",
    "enable":"启用",
    "query":"查询",
    "kill":"停止",
    "login":"登陆",
    "findAll":"查询全部",
    "create":"创建",
    "preview":"预览",
    "find":"查询",
    "delete":"删除",
    "update":"更新",
    "groupQuery":"批量查询",
    "fetchRuntimeProperties":"获取运行时信息",
    "findFlowHistoryListById":"根据ID获取Flow历史列表",
    "findHistFlow":"获取Flow历史",
    "findRoots":"获取资源目录根节点信息",
    "findResource":"查找资源信息",
    "updateResource":"更新资源信息",
    "findSchemaByDatasetName ":"根据Dataset名称获取Schema信息",
    "getDatasetLineage":"获取数据集血缘信息",
    "getTableList":"获取数据表列表",
    "getTableColumnList":"获取数据表栏位列表",
    "jdbcConnectionTry":"尝试JDBC连接",
    "getOutputFields":"获取输出栏位",
    "queryGroup":"批量查询",
    "stats":"统计信息",
    "getAllQueueInfo":"获取YARN队列信息",
    "schedulers":"获取调度信息",
    "upload":"上传",
    "imports":"导入",
    "getLogHostUrl":"获取日志服务URL",
    "deleteResources":"删除资源目录项",
    "group":"查询资源列表",
    "currentResouce":"获取当前资源",
    "uploadFile":"上传导入文件",
    "addTags":"添加标签",
    "changePassowrd":"修改密码"

};

var TagMap = {
    "info":"基本信息",
    "warn":"警告",
    "error":"错误",
    "flowexecution":"流程执行",
    "resourcemanager":"资源管理器",
    "auth":"认证",
    "dataset":"数据集",
    "flow":"流程",
    "schema":"模式",
    "flowexecutionoutput":"流程执行输出",
    "flowscheduler":"流程调度器",
    "step":"执行步骤",
    "model":"数据模型",
    "miscellaneous":"杂项",
    "job":"任务",
    "zdaflow":"数据质量流程",
    "rule":"数据质量规则",
    "resourcecontrol":"资源控制",
    "modeldetail":"模型详细信息",
    "configure":"配置",
    "lineage":"血缘分析",
    "user":"用户",
    "processconfig":"配置",
    "std":"标准",
    "role":"角色",
    "standardmapping":"标准映射",
    "permission":"权限",
    "upload":"上传",
    "tag":"标签",
    "datahistory":"数据历史",
    "yarnrs":"YARN资源管理器"
};

AppFilters.filter('interpolate', ['version', function (version) {
    return function (text) {
        return String(text).replace(/\%VERSION\%/mg, version);
    }
}]);


AppFilters.filter('permission_display', function () {
    return function (name) {

        function translate(name) {
            if(name == '.user') {
                return '用户';
            } else if(name == '.admin') {
                return '管理员';
            } else {
                return name;
            }
        }
        var idx = name.indexOf('.');
        if(idx > 0) {
            var app = name.substring(0, idx);
            if(app === 'europa') app = "大数据平台";
            if(app === 'europa-platform') app = "大数据平台";
            name = app + translate(name.substring(idx));
        }
        return name;
    }
});

AppFilters.filter('operation_display', function () {
    return function (name) {
        if(OperationMap[name]) {
            return OperationMap[name] + "(" + name +")";
        } else {
            return name;
        }
    }
});

AppFilters.filter('tag_display', function () {
    return function (name) {
        if(TagMap[name]) {
            return TagMap[name];
        } else {
            return name;
        }
    }
});
