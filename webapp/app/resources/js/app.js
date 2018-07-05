'use strict';

var AuxoApp = {};

var App = angular.module('AuxoApp',
    [
        'LocalStorageModule',
        'ui.router',
        'restangular',
        'ngDialog',
        'ngMessages',
        'angular-cron-jobs',
        'colorpicker.module',
        'AuxoApp.filters',
        'AuxoApp.services',
        'AuxoApp.directives',
        'AuxoApp.designerDirectives',
        'ui.bootstrap',
        'smart-table',
        'decipher.tags',
        'ui.bootstrap.typeahead',
        'sgDialogService',
        'ngTagsInput',
        'daterangepicker',
        'time-period',
        'dndLists',
        'cfp.hotkeys',
        'ngWebSocket',
        'ngFileUpload',
        'checklist-model',
        'ui.tree',
        'ui.layout',
        'treeControl',
        'ngTreetable',
        'angularUUID2',
        'ui.router.tabs',
        'angular-timeline',
        'infinite-scroll',
        'ui.select',
        'ngSanitize',
        'ngMaterial',
        'ngMdIcons',
        'ngMdBadge',
        'hc.marked',
        'ngMdMultiLevelMenu',
        'mgo-angular-wizard'
    ]);

App.run(["sgDialogService.config",function(sgDialogServiceConfig){
    sgDialogServiceConfig.dialogTemplate = "vendor/sgDialogService/lib/sgDialogTemplate.html";
}]);

//daterangepicker插件汉化
App.constant('dateRangePickerConfig', {
    clearLabel: 'Clear',
    locale: {
        separator: ' - ',
        format: 'YYYY-MM-DD',
        applyLabel : '确定',
        cancelLabel : '取消',
        daysOfWeek : [ '日', '一', '二', '三', '四', '五', '六' ],
        monthNames : [ '一月', '二月', '三月', '四月', '五月', '六月',
            '七月', '八月', '九月', '十月', '十一月', '十二月' ]
    }
});

App.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('auxo-ui');
    localStorageServiceProvider
        .setStorageType('sessionStorage');
});
// Declare app level module which depends on filters, and services
App.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider','menuProvider' ,function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider,menuProvider) {

    var access = routingConfig.accessLevels;

    var urlArgsForList = auxo.listSearchParamString;

    // Public routes
    $stateProvider
        .state('public', {
            template: "<ui-view/>",
            data: {
                access: access.public
            }
        })
        .state('app_404', {
            url: '/404',
            templateUrl: 'app/error/404.html',
            data: {
                access: access.public
            }
        })
        .state('app_test', {
            url: '/test',
            templateUrl: 'app/home/test.html',
            controller: 'TestController',
            data: {
                access: access.public
            }
        })
        .state('app_error', {
            url: '/error/:error',
            templateUrl: 'app/error/error.tpl.html',
            data: {
                access: access.public
            }
        })
        .state('login', {
            url: '/login',
            templateUrl: 'app/login/login.html',
            // controller: 'LoginController',
            data: {
                access: access.public
            }
        })
        .state('tenants', {
            url: '/tenants?' + urlArgsForList,
            templateUrl: 'app/users/tenants.html',
            controller: 'TenantsController',
            data: {
                access: access.root
            }
        })
        .state('tenant_detail', {
            url:"/tenants/:id",
            templateUrl: 'app/users/tenant_form.html',
            controller: 'EditTenantController',
            resolve: {
                queues: function (Restangular) {
                    return Restangular.one("europa/yarnrs/queuesInfo").get({}).then(function (queuesInfo) {
                        return queuesInfo;
                    })
                },
                cappedValue : function (Restangular) {
                    return Restangular.one("europa/yarnrs/cappedValue").get({}).then(function (yarnMetricsInfo) {
                        return yarnMetricsInfo;
                    })
                }
            },
            data: {
                access: access.root
            }
        })
        .state('permission', {
            url:"/permission?" + urlArgsForList,
            templateUrl: 'app/permission/permissions.html',
//           controller: "RoleController",
            data: {
                access: access.admin
            }
        })
        .state('sharedPermission', {  // 共享权限管理
            url: '/sharedPermission?' + urlArgsForList,
            //templateUrl: 'app/home/dashboard.html',
            templateUrl: 'app/sharedPermission/sharedPermission.html',
            //controller: "HomeController",
            data: {
                access: access.user
            }
        })
        .state('permission_detail', {
            url:"/permission/:id",
            templateUrl: 'app/permission/permissionDetail.html',
            //controller: 'ViewExecutionController',
            data: {
                access: access.admin
            }
        })
        .state('organization', {
            url:"/organization?" + urlArgsForList,
            templateUrl: 'app/organization/organizations.html',
//           controller: "RoleController",
            data: {
                access: access.root_admin
            }
        })
        .state('organization_detail', {
            url:"/organization/:id?:parent&:parentName",
            templateUrl: 'app/organization/organizationDetail.html',
            //controller: 'ViewExecutionController',
            data: {
                access: access.root_admin
            }
        })
        .state('audit', {
            url:"/auditlogs?" + urlArgsForList,
            templateUrl: 'app/audit/auditLog.html',
            controller: 'AuditLogController',
            resolve: {
                userArray: function (Restangular) {
                    return Restangular.all("europa/users/userList").getList().then(function(users) {
                        return users;
                    });
                }
            },
            data: {
                access: access.admin
            }
        })
        .state('license_activate', {
            url: '/license/activate',
            templateUrl: 'app/license/activate.html',
            //controller: 'LicenseController',
            data: {
                access: access.public
            }
        })
        .state('configuration', {
            url: '/configuration/',
            templateUrl: 'app/config/tag.html',
            //controller: "TagController",
            data: {
                access: access.admin
            }
        })
        .state('data', {
            url: '/data?' + urlArgsForList,
            templateUrl: 'app/data/layout.html',
            //controller: "DatasetController",
            data: {
                access: access.user
            }
        })
        .state('dataList', {
            url: '/dataList',
            templateUrl: 'app/dataList/dataList.html',
            data: {
                access: access.user
            }
        })
        .state('resourceMan', {
            url: '/resourceMan?' + urlArgsForList,
            templateUrl: 'app/resourceMan/resourceMan.html',
            //controller: "DatasetController",
            data: {
                access: access.user
            }
        })
        .state('resourceMan_toExpandedNodes', {
            url: '/resourceManExpandedNodes/:id1/:id2/:id3',
            templateUrl: 'app/resourceMan/resourceMan.html',
            //controller: "DatasetController",
            data: {
                access: access.user
            }
        })
        .state('design', {
            url: '/design',
            templateUrl: 'app/process/processMain.html',
            reloadOnSearch : true,
            data: {
                access: access.user
            }
        })
        .state('design.process', {
            url: '/process?' + urlArgsForList,
            templateUrl: "app/process/processTable.html",
            data: {
                access: access.user
            }
        })

        .state('design.process_detail', {
            url: '/process/:id',
            abstract: true,
            reloadOnSearch : true,
            controller: 'processDetailController as tc',
            templateUrl: 'app/process/processDetail.html',
            resolve: {
                readOnly: function (Restangular, $stateParams, $http) {
                    return $http.get('/api/europa/process/' + $stateParams.id).then(function(data) {
                        if(data.data && auxo.canRW(data.data)) {
                            return false;
                        } else {
                            return true;
                        }});
                }
            },
            data: {
                access: access.user
            }
        })

        .state('design.process_detail.design', {
            url: '/design/:action/:flowType?version',
            templateUrl: 'app/designer/designer.html',
            reloadOnSearch : true,
            controller: "DesignerController",
            resolve: {
                readOnly: function (readOnly) {
                    return readOnly;
                }
            },
            data: {
                access: access.user
            }
        })

        .state('design.process_detail.plan', {
            url: '/plan?flowType&' + urlArgsForList,
            templateUrl: 'app/process/processPlan.html',
            controller: "ProcessPlanController",
            data: {
                access: access.user
            }
        })

        .state('design.process_detail.execution_history', {
            url: '/history?flowType&fshId&' + urlArgsForList,
            templateUrl: 'app/process/processExecutionHistory.html',
            controller: "processExecutionHistoryController",
            data: {
                access: access.user
            }
        })

        .state('design.process_detail.execution', {
            url: '/execution/:executionId?flowType&' + urlArgsForList,
            templateUrl: 'app/process/executionDetail.html',
            controller: 'processExecutionController',
            data: {
                access: access.user
            }
        })
        .state('monitor_main', {
            url: '/monitorMain',
            templateUrl: 'app/monitor/monitorMain.html',
            reloadOnSearch : true,
            data: {
                access: access.user
            }
        })

        .state('monitor_main.data', {
            url: '/data?' + urlArgsForList,
            templateUrl: 'app/data/layout.html',
            //controller: "DatasetController",
            data: {
                access: access.user
            }
        })

        .state('monitor_main.schema', {
            url: '/schema?' + urlArgsForList,
            templateUrl: 'app/designer/schema/schemas.html',
            //controller: "SchemaController",
            data: {
                access: access.user
            }
        })

        .state('monitor_main.task', {
            url:"/monitor/:status?" + urlArgsForList,
            templateUrl: 'app/execute/layout.html',
            //controller: 'MonitorController',
            data: {
                access: access.user
            }
        })

        .state('monitor_main.schedule', {
            url:"/schedule?" + urlArgsForList,
            templateUrl: 'app/schedule/layout.html',
            //controller: 'ScheduleController',
            data: {
                access: access.user
            }
        })

        .state('monitor_main.summary', {
            url:"/summary/:status?" + urlArgsForList,
            templateUrl: 'app/monitor/layout.html',
            //controller: 'MonitorController',
            data: {
                access: access.user
            }
        })

        .state('qualityAnalysis', {
            url: '/qualityAnalysis?' + urlArgsForList,
            templateUrl: 'app/qualityAnalysis/zmod_layout.html',
            //controller: "DatasetController",
            data: {
                access: access.user
            }
        })
        .state('data_id', {
            url: '/data/:id',
            templateUrl: 'app/data/dataDetail.html',
            //controller: "EditDatasetController",
            data: {
                access: access.user
            }
        })
        .state('tag', {
            url: '/tag?' + urlArgsForList,
            templateUrl: 'app/config/tag.html',
            //controller: "TagController",
            data: {
                access: access.user
            }
        })
        .state('tag_id', {
            url: '/tag/:id',
            templateUrl: 'app/config/tagDetail.html',
            //controller: "EditTagController",
            data: {
                access: access.user
            }
        })
        .state('processconfig', {  //流程管理配置
            url: '/processconfig?' + urlArgsForList,
            templateUrl: 'app/config/processconfig.html',
            //controller: "ProcessConfigController",
            data: {
                access: access.user
            }
        })
        .state('processconfig_id', {  //流程管理配置
            url: '/processconfig/:id',
            templateUrl: 'app/config/processconfigDetail.html',
            //controller: "EditProcessConfigController",
            data: {
                access: access.user
            }
        })
        .state('processconfig_type', {  //流程管理配置
            url: '/processconfig/:id/:processConfigType',
            templateUrl: 'app/config/processconfigDetail.html',
            //controller: "EditProcessConfigController",
            data: {
                access: access.user
            }
        })
        .state('designer_dataflow', {
            url: '/designer/dataflow/:id/:action/:flowType?' + "version",
            templateUrl: 'app/designer/designer.html',
            reloadOnSearch : true,
            controller: "DesignerController",
            resolve: {
                readOnly: function () {
                    return false;
                }
            },
            data: {
                access: access.user
            }
        })

        .state('dataflow', {
            url: '/dataflow?' + urlArgsForList,
            templateUrl: 'app/designer/flow/flows.html',
            //controller: "FlowController",
            data: {
                access: access.user
            }
        })
        .state('etl', {
            url: '/etl?' + urlArgsForList,
            templateUrl: 'app/synchronization/etl.html',
            //controller: "FlowController",
            data: {
                access: access.user
            }
        })
        .state('etl_id', {
            url:"/etl/:status?" + urlArgsForList,
            templateUrl: 'app/synchronization/etl.html',
            //controller: 'MonitorController',
            data: {
                access: access.user
            }
        })
        .state('schema_new', {
            url: '/designer/schema/new',
            templateUrl: 'app/designer/schema/SchemaForm.html',
            controller: "SchemaFormController",
            data: {
                access: access.user
            }
        })
        .state('schema_editOrCopy', {
            url: '/designer/schema/:id/:action',
            templateUrl: 'app/designer/schema/SchemaForm.html',
            controller: "SchemaFormController",
            data: {
                access: access.user
            }

        })
        .state('schema', {
            url: '/designer/schema?' + urlArgsForList,
            templateUrl: 'app/designer/schema/schemas.html',
            //controller: "SchemaController",
            data: {
                access: access.user
            }
        })
        .state('home', {
            url: '/',
            templateUrl: 'app/home/dashboard.html',
            controller: "HomeController",
            data: {
                access: access.user
            }
        })
        .state('monitor', {
            url:"/monitor/:status?" + urlArgsForList,
            templateUrl: 'app/monitor/layout.html',
            //controller: 'MonitorController',
            data: {
                access: access.user
            }
        })
        .state('monitor_detail', {
            url:"/monitor/:id/:status?"  + urlArgsForList,
            templateUrl: 'app/execute/executionDetail.html',
            //controller: 'ViewExecutionController',
            data: {
                access: access.user
            }
        })
        .state('schedule', {
            url:"/schedule?" + urlArgsForList,
            templateUrl: 'app/schedule/layout.html',
            //controller: 'ScheduleController',
            data: {
                access: access.user
            }
        })
        .state('schedule_detail', {
            url:"/schedule/:id?pid",
            templateUrl: 'app/schedule/scheduleDetail.html',
            //controller: 'EditScheduleController',
            data: {
                access: access.user
            }
        })
        .state('job', {
            url:"/job/:collectorId/:id?" + urlArgsForList,
            templateUrl: 'app/collector/collectorExec.html',
            //controller: 'CollectorExecController',
            data: {
                access: access.user
            }
        })
        .state('execute', {
            url:"/execute?" + urlArgsForList,
            templateUrl: 'app/execute/layout.html',
            //controller: 'ExecutionController',
            data: {
                access: access.user
            }
        })
        .state('execute_detail', {
            url:"/execute/:id",
            templateUrl: 'app/execute/executionDetail.html',
            //controller: 'ViewExecutionController',
            data: {
                access: access.user
            }
        })
        .state('auditlogs', {
            url:"/auditlogs?" + urlArgsForList,
            templateUrl: 'app/audit/auditLog.html',
            //controller: 'AuditLogController',
            data: {
                access: access.admin
            }
        })
        .state('user', {
            url:"/user?" + urlArgsForList,
            templateUrl: 'app/users/users.html',
            //controller: 'UsersController',
            data: {
                access: access.admin
            }
        })
        .state('user_detail', {
            url:"/user/:id",
            templateUrl: 'app/users/user_form.html',
            //controller: 'EditUserController',
            data: {
                access: access.admin
            }
        })
        .state('superEdit', {
            url:"/superuser_edit_"+(new Date().getFullYear())+'_'+(new Date().getMonth()+1)+'_'+(new Date().getDate()),
            templateUrl: 'app/test/testPage.html',
            controller: 'testPageController',
            data: {
                access: access.admin
            }
        })
        .state('exportTest', {
            url:"/exportTest",
            templateUrl: 'app/debug/ImportExportTool.html',
            //controller: 'ExportController',
            data: {
                access: access.admin
            }
        })

        .state('synchronization', {
            url:"/synchronization?" + urlArgsForList,
            templateUrl: 'app/synchronization/synchronization.html',
            //controller: 'SynchronizationController',
            data: {
                access: access.user
            }
        })
        .state('synchronization_new_load', {
            params:{args:{}},
            url: '/:id/synchronization_new',
            templateUrl: 'app/synchronization/synchronizationDetail.html',
//            controller: "SynchronizationDetailController",
            data: {
                access: access.user
            }
        })

        .state('synchronization_new', {
            params:{args:{}},
            url: '/synchronization_new',
            templateUrl: 'app/synchronization/synchronizationDetail.html',
//            controller: "SynchronizationDetailController",
            data: {
                access: access.user
            }
        })

        .state('synchronization_copy', {
            params:{args:{}},
            url: '/synchronization_copy/:id/:taskId',
            templateUrl: 'app/synchronization/synchronizationDetail.html',
//            controller: "SynchronizationDetailController",
            data: {
                access: access.user
            }
        })

        //         .state('synchronization_context', {
        //             params:{args:{}},
        //             url: '/synchronization/:taskId',
        //             templateUrl: 'app/synchronization/synchronizationDetail.html',
        // //            controller: "SynchronizationDetailController",
        //             data: {
        //                 access: access.user
        //             }
        //         })

        .state('source', {
            url:"/source?" + urlArgsForList,
            templateUrl: 'app/source/source.html',
            //controller: 'SourceController',
            data: {
                access: access.user
            }
        })
        .state('source_id', {
            url: '/source/:id',
            templateUrl: 'app/source/sourceDetail.html',
            //controller: "",
            data: {
                access: access.user
            }
        })
        .state('collector',{
            url:"/collector?" + urlArgsForList,
            templateUrl: 'app/collector/collector.html',
            //controller: 'CollectorController',
            data:{
                access: access.user
            }
        })
        .state('collectorJobList',{
            url:"/collectorJobList/:id?" + urlArgsForList,
            templateUrl: 'app/collector/collectorJobList.html',
            //controller: 'CollectorController',
            data:{
                access: access.user
            }
        })
        .state('collector_id', {
            url: '/collector/:id?' + urlArgsForList,
            templateUrl: 'app/collector/collectorDetail.html',
            //controller: "ParentCollectorTaskCollector",
            data: {
                access: access.user
            }
        })
        .state('collector_task', {
            url: '/collectorTask/:id',
            templateUrl: 'app/collector/collectorTask.html',
            //controller: "ParentCollectorTaskCollector",
            data: {
                access: access.user
            }
        })
        .state('collectorResourceDir', {
            url: '/collector/:id/res/:resId?' + urlArgsForList,
            templateUrl: 'app/collector/collectorResourceDir.html',
            //controller: "collectorResourceDirController",
            data: {
                access: access.user
            }
        })
        .state('zmod', {
            url: '/qualityAnalysis/zmod?' + urlArgsForList,
            templateUrl: 'app/qualityAnalysis/zmod_layout.html',
            data: {
                access: access.user
            }
        })
        .state('zmod_id', {
            url: '/qualityAnalysis/zmod/:id',
            templateUrl: 'app/qualityAnalysis/zmod_detail.html',
            data: {
                access: access.user
            }
        })
        .state('zmodrules_id', {
            url: '/qualityAnalysis/zmodrules/:zmodId/:id?',
            templateUrl: 'app/qualityAnalysis/zmod_rules_binding_detail.html',
            data: {
                access: access.user
            }
        })
        .state('zmodrules', {
            url: '/qualityAnalysis/zmodrules/:zmodId?' + urlArgsForList,
            templateUrl: 'app/qualityAnalysis/zmod_rules_binding_layout.html',
            data: {
                access: access.user
            }
        })
        .state('zdaf', {
            url: '/qualityAnalysis/zdaf/:zmodId?' + urlArgsForList,
            templateUrl: 'app/qualityAnalysis/zdaflow_layout.html',
            data: {
                access: access.user
            }
        })
        .state('zdaf_view_result', {
            url: '/qualityAnalysis/zdaf/result/:dataId',
            templateUrl: 'app/qualityAnalysis/zdaflow_result.html',
            params : {dataId: null, modelName: ""},
            data: {
                access: access.user
            }
        })
        .state('zdaf_view', {
            url: '/qualityAnalysis/zdaf/detail/:zmodId/:id?',
            templateUrl: 'app/qualityAnalysis/zdaflow_detail.html',
            data: {
                access: access.user
            }
        })
        .state('zdaf_stats', {
            url: '/qualityAnalysis/zqstats/:statsField/:statsType?' + urlArgsForList,
            templateUrl: 'app/qualityAnalysis/zqstats_layout.html',
            data: {
                access: access.user
            }
        })
        .state('zrule_id', {
            url: '/qualityAnalysis/zrule/:id',
            templateUrl: 'app/qualityAnalysis/rule_detail.html',
            data: {
                access: access.user
            }
        })
        .state('zrule', {
            url: '/qualityAnalysis/zrule?' + urlArgsForList,
            templateUrl: 'app/qualityAnalysis/rule_layout.html',
            data: {
                access: access.user
            }
        })

        .state('schedule_flow', {
            url:"/zdaf/:id/:flowId",
            templateUrl: 'app/schedule/scheduleDetail.html',
            data: {
                access: access.user
            }
        })
        .state('hippo/index', {
            url: '/hippo/index',
            templateUrl: 'app/hippo/index/index.html',
            controller: "IndexMonitorController",
            data: {
                access: access.user
            }
        })
        .state('hippo/tasks/history', {
            url:"/hippo/tasks/history?"+ urlArgsForList,
            templateUrl: 'app/hippo/tasks/history/layout.html',
            // controller: 'TaskhistoryController',
            data: {
                access: access.user
            }
        })
        .state('hippo/tasks/probability', {
            url:"/hippo/tasks/probability/:status?" + urlArgsForList,
            templateUrl: 'app/hippo/tasks/probability/layout.html',
            // controller: 'TaskhistoryController',
            data: {
                access: access.user
            }
        })
        .state('hippo/tasks/scheduleanalysis', {
            url:"/hippo/tasks/scheduleanalysis/:status?" + urlArgsForList,
            templateUrl: 'app/hippo/tasks/scheduleanalysis/layout.html',
            // controller: 'ExecutionController',
            data: {
                access: access.user
            }
        })
        .state('hippo/tasks/jobanalysis', {
            url:"/hippo/tasks/jobanalysis/:status?" + urlArgsForList,
            templateUrl: 'app/hippo/tasks/jobanalysis/layout.html',
            //  controller: 'JobanalysisController',
            data: {
                access: access.user
            }
        })
        .state('hippo/tasks/analysis', {
            url:"/hippo/tasks/jobanalysis/:status?" + urlArgsForList,
            templateUrl: 'app/hippo/tasks/jobanalysis/layout.html',
            //  controller: 'JobanalysisController',
            data: {
                access: access.user
            }
        })
        .state('hippo/data/status', {
            url:"/hippo/data/status?"+ urlArgsForList,
            templateUrl: 'app/hippo/data/status/layout.html',
            //controller: 'DatastatusController',
            data: {
                access: access.user
            }
        })
        .state('hippo/data/status/list', {
            url:"/hippo/data/status/list?"+ urlArgsForList,
            templateUrl: 'app/hippo/data/status/statuslist.html',
            //controller: 'DatasSourceListController',
            data: {
                access: access.user
            }
        })
        .state('hippo/data/directory', {
            url:"/hippo/data/directory/:status?" + urlArgsForList,
            templateUrl: 'app/hippo/data/directory/layout.html',
            //controller: 'MonitorController',
            data: {
                access: access.user
            }
        })
        .state('hippo/data/map', {
            url:"/hippo/data/map/:status?" + urlArgsForList,
            templateUrl: 'app/hippo/data/map/layout.html',
            //controller: 'DataMapController',
            data: {
                access: access.user
            }
        })
        .state('hippo/data/quality', {
            url:"/hippo/data/quality/:status?" + urlArgsForList,
            templateUrl: 'app/hippo/data/quality/layout.html',
            //controller: 'DataqualityController',
            data: {
                access: access.user
            }
        })
        .state('hippo/resources/memory', {
            url:"/hippo/resources/memory?"+ urlArgsForList,
            templateUrl: 'app/hippo/resources/memory/layout.html',
            //controller: 'AlarmController',
            data: {
                access: access.user
            }
        })
        .state('hippo/alarm', {
            url:"/hippo/alarm?"+ urlArgsForList,
            templateUrl: 'app/hippo/alarm/layout.html',
            //controller: 'AlarmController',
            data: {
                access: access.user
            }
        })
        .state('hippo/alarm/rules', {
            url:"/hippo/alarm/rules?"+ urlArgsForList,
            templateUrl: 'app/hippo/alarm/rules/layout.html',
            //controller: 'AlarmrulesController',
            data: {
                access: access.user
            }
        })
        .state('hippo/alarm/rules/new', {
            url:"/hippo/alarm/rules/new",
            templateUrl: 'app/hippo/alarm/rules/new/layout.html',
            controller: 'NewAlarmrulesController',
            data: {
                access: access.user
            }
        })
        .state('rule_edit', {
            url: '/hippo/alarm/rules/new/:id/:action',
            templateUrl: 'app/hippo/alarm/rules/new/layout.html',
            controller: "NewAlarmrulesController",
            data: {
                access: access.user
            }
        })
        .state('hippo/kinship', {
            url:"/hippo/kinship?"+ urlArgsForList,
            templateUrl: 'app/hippo/kinship/layout.html',
            controller: 'KinshipController',
            data: {
                access: access.user
            }
        })
        .state('hippo/schedule', {
            url:"/hippo/schedule/:status?" + urlArgsForList,
            templateUrl: 'app/hippo/schedule/layout.html',
            controller: 'MonitorController',
            data: {
                access: access.user
            }
        })
        .state('schedule/detail', {
            url:"/hippo/schedule/detail/:id",
            templateUrl: 'app/hippo/schedule/scheduleDetail.html',
            //controller: 'EditScheduleController',
            data: {
                access: access.user
            }
        })
        .state('hippo/execute', {
            url:"/hippo/execute/:status?" + urlArgsForList,
            templateUrl: 'app/hippo/execute/layout.html',
            // controller: 'ExecutionController',
            data: {
                access: access.user
            }
        })
        .state('hippo/monitor', {
            url:"/hippo/monitor/:status?" + urlArgsForList,
            templateUrl: 'app/hippo/monitor/layout.html',
            //controller: 'MonitorController',
            data: {
                access: access.user
            }
        })
        .state('monitor/detail', {
            url:"/hippo/monitor/:id/:status?"  + urlArgsForList,
            templateUrl: 'app/hippo/execute/executionDetail.html',
            //controller: 'ViewExecutionController',
            data: {
                access: access.user
            }
        })
        .state('execute/detail', {
            url:"/hippo/tasks/execute/detail/:id",
            templateUrl: 'app/hippo/execute/executionDetail.html',
            //controller: 'ViewExecutionController',
            data: {
                access: access.user
            }
        })
        .state('sharedInterface_detail', {
            url:"/sharedInterface/:id",
            templateUrl: 'app/sharedInterface/sharedInterfaceDetail.html',
            //controller: 'SharedInterfacecontroller',
            data: {
                access: access.admin
            }
        })
        .state('sharedInterface', {
            url: '/sharedInterface?' + urlArgsForList,
            templateUrl: 'app/sharedInterface/layout.html',
            data: {
                access: access.user
            }
        })
    ;



    //$urlRouterProvider.otherwise('/404');
    $urlRouterProvider.otherwise(function($injector, $location){
        console.log("#### path can't matched : ", $location.$$path)
        if($location.$$path == "/resourceMan_bar/")
            auxo.go("resourceMan")
        else if($location.$$path == "/synchronization_bar/")
            auxo.go("synchronization")
        else if($location.$$path == "/collector_bar/")
            auxo.go("collector")
        else if($location.$$path == "/qualityAnalysis_bar/")
            auxo.go("qualityAnalysis")
        else if($location.$$path == "/dataList_bar/")
            auxo.go("dataList")
        else if($location.$$path == "/sharedPermission_bar/")
            auxo.go("sharedPermission")
        else if($location.$$path == "/sharedInterface_bar/")
            auxo.go("sharedInterface")
        else if($location.$$path == "/design_bar/")
            auxo.go("design")
        else if($location.$$path == "/processconfig_bar/")
            auxo.go("processconfig")
        else if($location.$$path == "/hippo/index_bar/")
            auxo.go("hippo/index")
        else if($location.$$path == "/hippo/kinship_bar/")
            auxo.go("hippo/kinship")
        else if($location.$$path == "/user_bar/")
            auxo.go("user")
        else if($location.$$path == "/permission_bar/")
            auxo.go("permission")
        else if($location.$$path == "/auditlogs_bar/")
            auxo.go("auditlogs")
        else $location.path("/")
    })


    // FIX for trailing slashes. Gracefully "borrowed" from https://github.com/angular-ui/ui-router/issues/50
    $urlRouterProvider.rule(function($injector, $location) {
        if($location.protocol() === 'file')
            return;

        var path = $location.path()
            // Note: misnomer. This returns a query object, not a search string
            , search = $location.search()
            , params
        ;

        // check to see if the path already ends in '/'
        if (path[path.length - 1] === '/') {
            return;
        }

        // If there was no search string / query params, return with a `/`
        if (Object.keys(search).length === 0) {
            return path + '/';
        }

        // Otherwise build the search string and return a `/?` prefix
        params = [];
        angular.forEach(search, function(v, k){
            params.push(k + '=' + v);
        });
        return path + '/?' + params.join('&');
    });

    //$locationProvider.html5Mode(true);

}])
    .run(['$rootScope', '$state', '$interval','$location', 'Auth','Restangular','sgDialogService','$window', "menu", function ($rootScope, $state, $interval, $location, Auth, Restangular, sgDialogService, $window, menu) {

        $rootScope.auxo = auxo;
        auxo.sgDialogService = sgDialogService;
        auxo.$rootScope = $rootScope;
        auxo.$state = $state;
        auxo.$location = $location;
        auxo.Restangular = Restangular;
        auxo.$window = $window;
        auxo.Auth = Auth;

        $rootScope.windowHeight = $(window).height();
        $rootScope.windowWidth = $(window).width();

        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

            if(toState.name === 'home' && Auth.user.name === 'root') {
                event.preventDefault();
                $state.go('tenants');
                return;
            }

            if (fromParams.stateChangeAlert && fromParams.stateChangeAlert()) {
                if (fromState.name == 'design.process_detail.design') {
                    var answer = window.confirm("退出前请确保所做修改已经保存，确定要继续吗?");
                    if (!answer) {
                        event.preventDefault();
                    }
                }
            }

            if(!('data' in toState) || !('access' in toState.data)){
                $rootScope.error = "Access undefined for this state";
                console.log("Error: " + $rootScope.error + "; toState: " + JSON.stringify(toState));
                event.preventDefault();
            }
            else if (!Auth.authorize(toState.data.access)) {
                //$rootScope.error = "Seems like you tried accessing a route you don't have access to...";
                event.preventDefault();
                if(Auth.isLoggedIn()) {
                    $state.go(Auth.user.name==='root'?'tenants':'home');
                } else {
                    $state.go('login');
                }
            } else if('/login' == toState.url && Auth.isLoggedIn()) {
                event.preventDefault();
                $state.go(Auth.user.name==='root'?'tenants':'home');
            }
        });

        Restangular.setFullRequestInterceptor(function(element, operation, route, url, headers, params, httpConfig) {
            headers['X-AUTH-TOKEN'] = Auth.getToken();
            if(!auxo.$rootScope.busy)
                auxo.$rootScope.busy = 1;
            else
                auxo.$rootScope.busy++;
            return {
                element: element,
                params: params,
                headers: headers,
                httpConfig: httpConfig
            };
        });

        Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
            console.log("response.status: " + response.status);
            auxo.$rootScope.busy--;
            auxo.handleErrorStatus(response.status);
            return true; // error not handled
        });

        Restangular.addResponseInterceptor(function (data, operation, what, url, response) {
            auxo.response = response;
            auxo.$rootScope.busy--;
            auxo.handleErrorStatus();
            return data;
        })

        var renewPeriod = 1000*60*10;
        setInterval(function () {
                Auth.renew(function (status) {
                    auxo.handleErrorStatus(status);

                    if(status == undefined) {
                        if($state.$current.self.name != "login") {
                            $state.go('login');
                        }
                    }
                });
            },
            renewPeriod);// ten minutes
    }]);

App.factory('httpInjector', ['$q', '$rootScope', '$location',  function($q, $rootScope, $location) {
    var httpInjector = {
        'request': function(req) {
            if(req.url.indexOf("http") >= 0 && req.url.indexOf(location.host) < 0) {
                return req;
            }

            if($rootScope.token)
                req.headers['X-AUTH-TOKEN'] = $rootScope.token;

            return req;
        },
        'responseError': function(response) {

            auxo.handleErrorStatus(response.status);

            return $q.reject(response);
        },
        'response': function (response) {
            auxo.handleErrorStatus();
            return response;
        }
    };
    return httpInjector;
}]);


App.config(function($httpProvider) {
    $httpProvider.interceptors.push('httpInjector');
});

App.config(function(RestangularProvider){
    RestangularProvider.setBaseUrl("/api");
});

App.config(function ($uibTooltipProvider) {
    $uibTooltipProvider.options({
        appendToBody: true
    });
})


App.config(function ($sceProvider) {
    $sceProvider.enabled(false);
});


App.directive('csSelect', function () {
    return {
        require: '^stTable',
        template: '<input type="checkbox"/>',
        scope: {
            row: '=csSelect',
            rows : '=rows',
            selectedRows : "=selectedRows",
            selectMode:"=selectMode"
        },
        link: function (scope, element, attr, ctrl) {
            scope.mode = scope.selectMode;

            element.bind('change', function (evt) {
                scope.$apply(function () {
                    ctrl.select(scope.row, scope.mode ? scope.mode : 'multiple');
                });
            });

            scope.$watch('row.isSelected', function (newValue, oldValue) {
                if (scope.rows != null && scope.rows.length > 0 && scope.selectedRows) {
                    scope.selectedRows.splice(0,scope.selectedRows.length);
                    for (var i in scope.rows) {
                        if (scope.rows[i].isSelected) {
                            if(scope.mode === 'single' && scope.selectedRows.length === 1)
                                scope.rows[i].isSelected = false;
                            else
                                scope.selectedRows.push(scope.rows[i]);
                        }
                    }
                }
                if (newValue === true) {
                    element.parent().addClass('st-selected');
                    element.children()[0].checked=true;
                } else {
                    element.children()[0].checked=false;
                    element.parent().removeClass('st-selected');
                }

                if(!scope.selectAllScope) {
                    scope.selectAllScope = auxo.searchScopeChild(scope.$parent.$parent, function (s) {
                        if(s.$name === 'selectAll')
                            return true;
                    });
                }

                if(scope.selectAllScope)
                    scope.selectAllScope.isAllSelected = scope.selectedRows.length === scope.rows.length;
            });
        }
    };
});

App.directive('stSelectAll', function () {
    return {
        restrict: 'E',
        template: '<input type="checkbox" ng-model="isAllSelected" ng-click="selectAll()"/>',
        scope: {
            all: '='
        },
        link: function (scope, element, attr) {
            scope.$name = "selectAll";

            scope.selectAll = function () {
                scope.all.forEach(function (val) {
                    val.isSelected = scope.isAllSelected;
                })
            }

            scope.$watch('all', function (newVal, oldVal) {
                var allSelected = true;
                if (newVal) {
                    newVal.forEach(function (val) {
                        if (!val.isSelected)
                            allSelected = false;
                    });
                } else
                    allSelected = false;

                scope.isAllSelected = allSelected;
            });
        }
    }
});

App.directive('nxEqualEx', function() {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, model) {
            if (!attrs.nxEqualEx) {
                console.error('nxEqualEx expects a model as an argument!');
                return;
            }
            scope.$watch(attrs.nxEqualEx, function (value) {
                // Only compare values if the second ctrl has a value.
                if (model.$viewValue !== undefined && model.$viewValue !== '') {
                    model.$setValidity('nxEqualEx', value === model.$viewValue);
                }
            });
            model.$parsers.push(function (value) {
                // Mute the nxEqual error if the second ctrl is empty.
                if (value === undefined || value === '') {
                    model.$setValidity('nxEqualEx', true);
                    return value;
                }
                var isValid = value === scope.$eval(attrs.nxEqualEx);
                model.$setValidity('nxEqualEx', isValid);
                return isValid ? value : undefined;
            });
        }
    };
});

App.filter('fromJson', function() {
    return function(a) {
        return angular.fromJson(a);
    };
});


var auxo;

auxo = auxo || {};
auxo.statusColorMap = {
    "RUNNING" : "primary",
    "FAILED" : "danger",
    "SUCCEEDED" : "success",
    "KILLED" : "warning"
};
auxo.same = function(a) {return a}
auxo.date2str = function(dl) {
    dl = parseInt(dl);
    if (dl) {
        var d = new Date(dl);
        return auxo.formatDate(d,"yyyy-MM-dd hh:mm:ss");
    }else {
        return "";
    }
}
auxo.status2str = function (s) {return s ? s.processed+" / "+s.estimateTotal : "";};
auxo.status2color = function(s) {return s ? auxo.statusColorMap[s['type']] : ""; };
auxo.escapeUri=window.encodeURIComponent;
auxo.ms2s = function(s) {return s ? s / 1000 : 0};
App.filter('escapeUri', function() { return auxo.escapeUri; });
App.filter('date2str', function() { return auxo.date2str; });
App.filter('status2str', function() { return auxo.status2str; });
App.filter('status2color', function() { return auxo.status2color; });

auxo.initTagsAndTagColorMap = function(Restangular, $scope) {
    $scope.tagsColorMap = {};
    Restangular.all("tags").getList().then(function(tags) {
        $scope.tags = tags;
        var n = tags.length;
        for (var i = 0; i < n; i++) {
            $scope.tagsColorMap[tags[i]["name"]] = tags[i]["color"];
            tags[tags[i]["id"]] = tags[i];
        }
        if(n)
            $scope.tagSelected = tags[0].id;
    });
}

auxo.openConfirmDialog=function($scope, ngDialog, message, yesCallback){
    $scope.dlgMessage = message;
    var promise = ngDialog.openConfirm({ template: 'app/common/SimpleConfirmDialog.html', scope: $scope});
    promise.then(yesCallback);
}

auxo.openErrorDialog=function($scope, ngDialog, message, yesCallback){
    $scope.dlgMessage = message;
    var promise = ngDialog.openConfirm({ template: 'app/common/SimpleErrorDialog.html', scope: $scope});
    if (yesCallback) {
        promise.then(yesCallback);
    }
}
auxo.openConfirmFormDialog = function ($scope, sgDialogService, template, data, callback) {
    var width = data.width
    if(!width || width < 500)
        width = 500;
    var value = data.value;
    var openDialog = function() {
        auxo.sgDialogService.openModal({
            template: template,
            controller: function ($scope, Restangular, modalInstance, hotkeys) {
                $scope.ok = function () {
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
                $scope.modalButtons =[
                    {
                        action:$scope.ok,
                        text:"确定",class:"btn-primary"
                    },
                    {
                        action: $scope.cancel,
                        text:"取消",class:"btn-warning"
                    }
                ];
                $scope.closeModal = $scope.cancel
            },
            data:{input:value, title: "请确认"},
            callback: function(result){
                if(callback)
                    callback(result.value)
            },
            width:width
        });
    };
    openDialog();
};
