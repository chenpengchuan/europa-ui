
angular.module('AuxoApp')
    .controller('EditTenantController', function EditTenantController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, queues, cappedValue) {
        var isNew = $scope.isNew = $stateParams.id == "new";

        $scope.queuesInfo = queues;
        $scope.selectQueues = new Array();

        var queueNames = [];
        var itemInfo = new Object()
        var queuesCapacity = new Object();
        angular.forEach($scope.queuesInfo, function (queue) {
            var $name = queue.name;
            queueNames.push($name);
            queuesCapacity[$name] = queue;
        })

        var id = $stateParams.id;

        $scope.error="";

        $scope.entity={id:"", name:"", description:"",hosts:"",
            resourceQueues: "", maxRam : 0, maxCpus : 0, maxRunningJobs:1, adminPassword:"", verifyPassword: "",
            hdfsSpaceQuota: 0, selectObjEnum:[], queueInfo:[]};
        Restangular.one("europa/tenants").get({offset:0, limit:10000}).then(function(tenants) {
            $scope.tenants = tenants.content;
        });

        $scope.loadTagInputSource = function () {
            var fields = $scope.meta.fields;
            var resourceQueues = fields[0].data.selectObjEnum;
            return resourceQueues;
        }

        $scope.meta = {
            title: "租户信息",
            fields : [
                {$name: "id", label: "租户ID",type:"String", tooltip: ["字母,数字和下划线的组合,长度5-30, 非空, 唯一"],
                    maxLength:30, minLength:5, noMatch:/[^a-zA-Z0-9_]*/g, noMatchMsg: "有非法字符, 合法的字符为字母,数字和下划线!",
                    validator : function (item) {
                        function check(item) {
                            auxo.array.forEach($scope.tenants, function (i) {
                                if(i[item.$name]  === item.data[item.$name]) {
                                    $scope.error = item.data[item.$name] + "已经被使用!"
                                    return false;
                                }
                            })
                        }
                        if($scope.tenants && isNew) {
                            check(item);
                        }
                    }
                },
                {$name: "name", label: "租户名称",type:"String",  tooltip: ["汉字,字母,数字和下划线的组合,长度4-30,非空, 唯一"],
                    maxLength:50, minLength:4, noMatch:/[^\u4e00-\u9fbfa-zA-Z0-9_]/g, noMatchMsg: "汉字,字母,数字和下划线的组合!",
                    validator : function (item) {
                        function check(item) {
                            auxo.array.forEach($scope.tenants, function (i) {
                                if(i[item.$name]  === item.data[item.$name] && i.id !== item.data[item.$name]) {
                                    $scope.error = "该租户名称已经被使用!"
                                    return false;
                                }
                            })
                        }
                        if($scope.tenants) {
                            check(item);
                        }
                    }
                },
                {$name: "description", label: "描述",type:"String",  tooltip: "", validator:"", isOptional: function () {return true; }},
                {$name: "hosts", label: "域名列表",type:"String",  tooltip:["字母,点,逗号,数字和下划线, 格式为:域名A,域名B,..."],
                    maxLength:300, minLength:1, noMatch:/[^a-zA-Z0-9_.,]*/g,noMatchMsg: "有非法字符,必须为字母,点,逗号,数字和下划线!",
                    validator:function (item) {
                        var v = item.data[item.$name];
                        if(v) {
                            var ss = v.split(",");
                            if(ss.length == 0)
                                $scope.error = "域名列表不合法!"
                        }
                    }
                },
                {$name: "resourceQueues", label: "资源队列",type:"StringArray",  tooltip:["必须是有效资源, 格式为:资源A,资源B,..."],
                    maxLength:300, minLength:1
                },
                {$name: "maxRam", label: "最大内存(M)",type:"Number",  tooltip:["正整数"],min:0,max: 0,
                    noMatch:/^[0-9]*/g,noMatchMsg: "有非法字符, 只能为数字!",
                    validator:function (item) {
                        if(item.data.maxRam < 0)
                            $scope.error = "非法的配置"
                    }
                },
                {$name: "maxCpus", label: "最大CPU数(vCore)",type:"Number",  tooltip:["正整数"],min:0,max: 0,
                    noMatch:/^[0-9]*/g,noMatchMsg: "有非法字符, 只能为数字!",
                    validator:function (item) {
                        if(item.data.maxCpus < 0)
                            $scope.error = "非法的配置"
                    }
                },
                {$name: "maxRunningJobs", label: "最大并行任务数",type:"Number",  tooltip:["正整数"],min:1,max: 1000000,
                    noMatch:/^[0-9]*/g,noMatchMsg: "有非法字符, 只能为数字!"
                },
//                {$name: "hdfsSpaceQuota", label: "存储配额(M)", type:"Number",  tooltip:["存储配额(M),最小为0,即不设置, 最大为1125899906842624 MB = 1 ZB"],
//                    min: 0, max: 1024*1024*1024*1024*1024
//                },
                {$name: "adminPassword", label: "管理员密码",type: "Password", tooltip:["字母,数字和下划线,长度6-30, 不能为空"],
                    maxLength:30, minLength:6,  noMatch:/[^a-zA-Z0-9_]*/g,noMatchMsg: "非法字符, 合法的字符为字母,数字和下划线!!"
                },
                {$name: "verifyPassword", label: "管理员密码确认",type:"Password", tooltip:["再次输入密码"],
                    validator:function (item) {
                        if(item.data.adminPassword !== item.data[item.$name])
                            $scope.error = "两次密码输入不匹配!"
                    }
                }
            ],
            itemValidator:function (item) {
                $scope.error = "";
                var v = item.data[item.$name];
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
                var refactMaxRamCpusItem = function () {
                    var refactor = new Object();
                    angular.forEach($scope.meta.fields, function (item) {
                        var name = item.$name;
                        refactor[name] = item;
                    })
                    return refactor;
                }
                itemInfo = refactMaxRamCpusItem();
                $scope.entity.selectObjEnum = queueNames;
                auxo.array.forEach($scope.meta.fields, function (item) {
                    if(item.tooltip) {
                        item.tooltip = auxo.tooltips(item.tooltip);
                    }

                    item.input_length_class = "col-sm-12";
                    item.label_length_class = "col-sm-12";
                    item.label_align = "left";
                    item.data = $scope.entity;
                    if (item.type === "StringArray"){
                        item.selectObjEnum = $scope.entity.selectObjEnum;
                        item.queueInfo = $scope.entity.queueInfo;
                    }
                    if(!item.isOptional)
                        item.isOptional = function () { return false; }
                    if(auxo.array.contains(["id"],item.$name)){
                        item.readonly = !$scope.isNew;
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
        $scope.meta.init();

        if (!isNew) {
            Restangular.one("europa/tenants", id).get().then(function(entity) {
                angular.extend($scope.entity , entity);
                $scope.entity.verifyPassword = entity.adminPassword;
                $scope.entity.resourceQueues = entity.resourceQueues;
                getCappedValue(entity.resourceQueues);
                //$scope.entity.spaceQuotas = entity.spaceQuotas.join(",");
                if(entity.hosts)
                    $scope.entity.hosts = entity.hosts.join(",");
                $scope.entityCopy = entity;
                $scope.selectQueues = entity.resourceQueues;
            });
        } else {
            var refactMaxRamCpusItem = function () {
                var refactor = new Object();
                angular.forEach($scope.meta.fields, function (item) {
                    var name = item.$name;
                    refactor[name] = item;
                })
                return refactor;
            }
            itemInfo = refactMaxRamCpusItem();
        }

        /**
         * 根据队列名称组成的数组去获取可配置的资源上限值
         * @param queueNames
         */
        var getCappedValue = function (queueNames) {
            var flag = 0;//刷新页面初始化最大值时，初始值为0，之后累加
            angular.forEach(queueNames, function (queueName) {
                var queueInfo = queuesCapacity[queueName];
                if (flag == 0){
                    itemInfo['maxRam'].max = queueInfo.maxRam;
                    itemInfo['maxCpus'].max = queueInfo.maxCpus;
                    flag = 1;
                } else {
                    itemInfo['maxRam'].max += queueInfo.maxRam;
                    itemInfo['maxCpus'].max += queueInfo.maxCpus;
                }
            })
            //cappedValue
            if (itemInfo['maxRam'].max > cappedValue.totalMB){
                itemInfo['maxRam'].max = cappedValue.totalMB;
            }
            if (itemInfo['maxCpus'].max > cappedValue.totalVirtualCores){
                itemInfo['maxCpus'].max = cappedValue.totalVirtualCores;
            }
        }

        /**
         * fairScheduler 多个queue的话，获取最大的值作为maxRam
         */
        var getFairSchedulerMax = function (queueName) {
            var maxValue = new Object();
            maxValue.maxRam = 0;
            maxValue.maxCpus = 0;
            if ($scope.selectQueues.length == 0){
                var queueInfo = queuesCapacity[queueName];
                var ram = queueInfo.maxRam;
                var cpus = queueInfo.maxCpus;
                if (maxValue.maxRam < ram && maxValue.maxCpus < cpus){
                    maxValue.maxRam = ram;
                    maxValue.maxCpus = cpus;
                }
            } else {
                angular.forEach($scope.selectQueues, function (queueNameInner) {
                    if (queueNameInner !== queueName) {
                        var queueInfo = queuesCapacity[queueName];
                        var ram = queueInfo.maxRam;
                        var cpus = queueInfo.maxCpus;
                        if (maxValue.maxRam < ram && maxValue.maxCpus < cpus) {
                            maxValue.maxRam = ram;
                            maxValue.maxCpus = cpus;
                        }
                    }
                })
            }
           return maxValue;
        }

        /**
         * 点击事件删除queue时，重新计算最大值以及上限值
         * @param queueName
         */
        var getMaxAndCappedRemoved = function (queueName, itemCopy) {
            if ($scope.entity.maxRam == undefined){
                $scope.entity.maxRam = 0;
            }
            if ($scope.entity.maxCpus == undefined){
                $scope.entity.maxCpus = 0;
            }
            if (cappedValue.type === "capacityScheduler"){
                var queueInfo = queuesCapacity[queueName];
                $scope.entity.maxRam -= queueInfo.maxRam;
                $scope.entity.maxCpus -= queueInfo.maxCpus;
                itemInfo['maxRam'].max -= queueInfo.maxRam;
                itemInfo['maxCpus'].max -= queueInfo.maxCpus;
                if ($scope.entity.maxRam < 0 || $scope.entity.maxCpus < 0){
                    $scope.entity.maxRam = 0;
                    $scope.entity.maxCpus = 0;
                }
            } else if (cappedValue.type === "fairScheduler"){
                $scope.entity.maxRam = getFairSchedulerMax(queueName).maxRam;
                $scope.entity.maxCpus = getFairSchedulerMax(queueName).maxCpus;
                itemInfo['maxRam'].max = getFairSchedulerMax(queueName).maxRam;
                itemInfo['maxCpus'].max = getFairSchedulerMax(queueName).maxCpus;
                if ($scope.entity.maxRam < 0 || $scope.entity.maxCpus < 0){
                    $scope.entity.maxRam = 0;
                    $scope.entity.maxCpus = 0;
                }
                var index = $scope.selectQueues.indexOf(queueName);
                $scope.selectQueues.splice(index);
            } else {
                var queueInfo = queuesCapacity[queueName];
                $scope.entity.maxRam = queueInfo.maxRam;
                $scope.entity.maxCpus = queueInfo.maxCpus;
                itemInfo['maxRam'].max =  queueInfo.maxRam;
                itemInfo['maxCpus'].max = queueInfo.maxCpus;
                var index = $scope.selectQueues.indexOf(queueName);
                $scope.selectQueues.splice(index);
            }
        }

        /**
         * 点击事件增加queue时，重新计算最大值以及上限值
         * @param queueName
         */
        var getMaxAndCappedAdd = function (queueName, itemCopy) {
            if ($scope.entity.maxRam == undefined){
                $scope.entity.maxRam = 0;
            }
            if ($scope.entity.maxCpus == undefined){
                $scope.entity.maxCpus = 0;
            }
            if (cappedValue.type === "capacityScheduler"){
                var queueInfo = queuesCapacity[queueName];
                $scope.entity.maxRam += queueInfo.maxRam;
                $scope.entity.maxCpus += queueInfo.maxCpus;
                itemInfo['maxRam'].max += queueInfo.maxRam;
                itemInfo['maxCpus'].max += queueInfo.maxCpus;

            } else if (cappedValue.type === "fairScheduler"){
                $scope.entity.maxRam = getFairSchedulerMax(queueName).maxRam;
                $scope.entity.maxCpus = getFairSchedulerMax(queueName).maxCpus;
                itemInfo['maxRam'].max = getFairSchedulerMax(queueName).maxRam;
                itemInfo['maxCpus'].max = getFairSchedulerMax(queueName).maxCpus;
                $scope.selectQueues.push(queueName)
            } else {
                var queueInfo = queuesCapacity[queueName];
                $scope.entity.maxRam = queueInfo.maxRam;
                $scope.entity.maxCpus = queueInfo.maxCpus;
                itemInfo['maxRam'].max =  queueInfo.maxRam;
                itemInfo['maxCpus'].max = queueInfo.maxCpus;
                $scope.selectQueues.push(queueName)
            }

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
            delete entityCopy.queueInfo;
            delete entityCopy.selectObjEnum;
            delete  entityCopy.verifyPassword;
            var queues = [];
            angular.forEach(entityCopy.resourceQueues, function (resourceQueues) {
                var queue = resourceQueues.text;
                queues.push(queue);
            })
            delete entityCopy.resourceQueues;
            entityCopy.resourceQueues = queues;
            entityCopy.hosts = entityCopy.hosts.split(',');
            if ($scope.isNew) {
                Restangular.all("europa/tenants").post(entityCopy).then(
                    function(){
                        $scope.saving = false;
                        auxo.loadPage(auxo.meta.tenant.currUrl,{});
                    },
                    function(es) {
                        $scope.saving = false;
                        auxo.showErrorMsg(es);
                    });
            } else {

                Restangular.one("europa/tenants", entityCopy.id)
                    .customPUT(entityCopy)
                    .then(
                        function(){
                            $scope.saving = false;
                            auxo.loadPage(auxo.meta.tenant.currUrl);
                        },
                        function(es) {
                            $scope.saving = false;
                            auxo.showErrorMsg(es);
                        });
            }
        }

        $scope.cancel = function() {
            //auxo.loadPage(auxo.meta.user.currUrl);
            auxo.goBack();
        }

        $scope.onTagRemoved = function($tag, itemCopy){
            getMaxAndCappedRemoved($tag.text, itemCopy);
        }

        $scope.onTagAdded = function ($tag, itemCopy) {
            getMaxAndCappedAdd($tag.text, itemCopy);
        }

    });

auxo.meta.tenant = {
    currUrl:"/tenants",
    restRootPath:"europa/tenants",
    detailTemplate : "",
    entityDisplayName:"租户",
    getBaseFilter: function() {
        return "";
    },
    rowHeaders : [
        {name : "id", disName : "ID", converter : auxo.same},
        {name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
        {name : "resourceQueues", disName : "资源队列", converter : auxo.same},
        {name : "maxRam", disName : "最大内存(M)", converter : auxo.same},
        {name : "maxCpus", disName : "最大CPU数(vCore)", converter : auxo.same},
        {name : "maxRunningJobs", disName : "最大并行任务数", converter : auxo.same},
//        {name : "hdfsSpaceQuota", disName : "存储配额(M)", converter : auxo.same},
        {name : "enabled", disName : "状态", converter : function(data){
            if(data == 0){
                return "停用";
            }else if(data == 1){
                return "启用";
            }
            return data;
        }},
        {name : "createTime", disName : "创建时间", converter : auxo.date2str},
        {name : "creator", disName : "创建人", converter : auxo.same},
        {name : "lastModifier", disName : "修改人", converter : auxo.same},
        {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
    ]
};

angular.module('AuxoApp')
    .controller('TenantsController',function($filter,$scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {

        CrudBaseController.call(this, auxo.meta.tenant, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

        //启用
        $scope.enabledList = function() {
            auxo.openConfirmDialog($scope, ngDialog, "确认要启用"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？", function(){
                var ids = $scope.getSelectRowIds();
                Restangular.all($scope.restRootPath).customPOST(ids, "enable").then(function(d){
                    $scope.fetchPage($scope.ptableState);
                }, function(err){
                    auxo.openErrorDialog($scope, ngDialog, err.data.err);
                });
            });
        };

        //停用
        $scope.disabledList = function() {
            var message = "确认要停用"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？";

            auxo.openConfirmDialog($scope, ngDialog, message, function(){
                var ids =  $scope.getSelectRowIds();
                Restangular.all($scope.restRootPath).customPOST(ids, "disable").then(function(d){
                    $scope.fetchPage($scope.ptableState);
                }, function(err){
                    auxo.openErrorDialog($scope, ngDialog, err.data.err);
                });
            });
        };

        $scope.isCheckEnabled = function (rowData) {
            if(rowData.id === 'root')
                return false;
            return true;
        }

        $scope.isLinkEnabled = function (col, rowData) {
            if(rowData.id === 'root')
                return false;
            if(col === 'id')
                return true;
            return false;
        }
    });