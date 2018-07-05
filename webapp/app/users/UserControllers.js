angular.module('AuxoApp')
    .controller('UserController', ['$rootScope', '$scope', '$location', '$stateParams', 'Auth','Restangular', function($rootScope, $scope, $location,$stateParams, Auth, Restangular) {
        $scope.role = Auth.userRoles.user;
        $scope.userRoles = Auth.userRoles;

        console.log ("role: " + JSON.stringify(Auth.userRoles.user))
        console.log ("userRoles: " + JSON.stringify($scope.userRoles))

        var id = $stateParams.id;

        var isNew = true;

        if(id && id != 'new' && id.length > 0)
            isNew = false;

        $scope.isNew = isNew;

        if (isNew) {
            $scope.entity={ };
        }else {
            Restangular.one("europa/users", id).get().then(function(entity) {
                $scope.entity = entity;
                $scope.name = entity.name;
                $scope.id =entity.id;
                $scope.password = entity.password;
                $scope.role = entity.roles[0].replace(/ROLE_/, '');

                console.log("user: " + JSON.stringify(entity))
            });
        }

        $scope.register = function() {
            $scope.entity.name = $scope.name;
            $scope.entity.password = $scope.password;
            $scope.entity.roles = [];
            $scope.entity.roles.push('ROLE_' + $scope.role);

            if ($scope.isNew) {
                Restangular.all("europa/users").post($scope.entity).then(function (data) {
                    $location.path("/user");
                });
            }else {
                $scope.entity.put().then(function () {
                    $location.path("/user");
                });
            }
        };

    }]);

auxo.meta.user = {
    currUrl:"/user",
    restRootPath:"europa/users",
    detailTemplate : "",
    entityDisplayName:"用户",
    getBaseFilter: function() {
        return "";
    },
    rowHeaders : [
        //{name : "id", disName : "ID", converter : auxo.same},
        {name : "name", disName : "姓名", sortName: "name_sort", converter : auxo.same},
        {name : "enabled", disName : "状态", converter : function(data){
            if(data == 0){
                return "停用";
            }else if(data == 1){
                return "启用";
            }
            return data;
        }},
        {name : "roles", disName : "角色", converter : function (data) {
            for(var i in data) {
                data[i] = data[i].replace(/ROLE_/, "")
            }
            return data.join(' ');
        }},
        {name : "resourceQueues", disName : "资源队列", converter : auxo.same},
        {name : "maxRam", disName : "最大内存(M)", converter : auxo.same},
        {name : "maxCpus", disName : "最大CPU数(vCore)", converter : auxo.same},
        {name : "maxRunningJobs", disName : "最大并行任务数", converter : auxo.same},
//        {name : "hdfsSpaceQuota", disName : "存储配额(M)", converter : auxo.same},
        {name : "createTime", disName : "创建时间", converter : auxo.date2str},
        {name : "creator", disName : "创建人", converter : auxo.same},
        {name : "lastModifier", disName : "修改人", converter : auxo.same},
        {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
    ]
};
angular.module('AuxoApp')
    .controller('UsersController',function($filter,$scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {

        CrudBaseController.call(this, auxo.meta.user, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

        //获取每行选中数据的role信息
        function getselectRowRoles(){
            var roles = [];
            for (var i = 0; i < $scope.selectedRows.length; i++) {
                roles.push($scope.selectedRows[i].roles);
            }
            return roles;
        }


        //用户启用
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

        //用户停用
        $scope.disabledList = function() {
            var roles = getselectRowRoles();
            var message = "确认要停用"+$scope.selectedRows.length+"个"+$scope.entityDisplayName+"？";
            var num = 0; //admin的个数
            for (var i = 0; i < roles.length; i++) {
                if (roles[i] == "admin") {
                    num += 1;
                }
            }

            if( roles.length == num){ //所选角色都是admin
                message = "管理员不可以停用!";
            }else if(roles.length > num && num!=0){ //所选角色中包含admin
                message = message + "其中管理员不可以停用!";
            }else{
                message = message;
            }

            auxo.openConfirmDialog($scope, ngDialog, message, function(){
                var ids =  $scope.getSelectRowIds();
                Restangular.all($scope.restRootPath).customPOST(ids, "disable").then(function(d){
                    $scope.fetchPage($scope.ptableState);
                }, function(err){
                    auxo.openErrorDialog($scope, ngDialog, err.data.err);
                });
            });
        };
    });

angular.module('AuxoApp')
    .controller('EditUserController', function EditTagController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular) {
        var isNew = $scope.isNew = $stateParams.id == "new";

        var cappedValue;
        Restangular.one("europa/yarnrs/cappedValue").get({}).then(function (yarnMetricsInfo) {
            cappedValue = yarnMetricsInfo;
        })

        $scope.entityDisplayName = "用户";

        $scope.selectQueues = new Array();

        $scope.roles = [{label:"管理员", value: "ROLE_admin"}, {label:"用户", value: "ROLE_user"}];

        var id = $stateParams.id;

        var availableRoles = {'europa.admin':false, 'europa.user':false, 'europa.user':false};
        // var availableRoles = {'europa.admin':false, 'europa.user':false, 'hippo.user':false,'zebra.user':false,'europa.user':false, 'rhinos.user':false};

        $scope.error=false;

        $scope.entity={ roles : ["ROLE_user"], resourceQueues: [], maxRunningJobs:1, hdfsSpaceQuota: 0, maxRam: 0, maxCpus: 0};

        if (!isNew) {
            Restangular.one("europa/users", id).get().then(function(entity) {
                angular.extend($scope.entity, entity);
                $scope.verifyPassword = entity.password;
                // if($scope.entity.resourceQueues && $scope.entity.resourceQueues.length)
                //   $scope.entity.resourceQueues = $scope.entity.resourceQueues.split(',')

                if (entity.loginId === "admin" && entity.creator === "root"){
                    $scope.isAdmin = true;
                }

                $scope.userCopy = entity;
                for(var i in entity.permissions) {
                    if(entity.permissions[i] in availableRoles) {
                        availableRoles[entity.permissions[i]] = true;
                    }
                }
                $scope.permissions= availableRoles;
                $scope.selectQueues = entity.resourceQueues;
            });
        } else {
            availableRoles['europa.user'] = true;
            availableRoles['europa.user'] = true;
            $scope.permissions= availableRoles;
        }



        $scope.maxRunningJobs = 1000;
        $scope.hdfsSpaceQuota = 1000*1000*1000;
        Restangular.one("europa/users", auxo.Auth.user.id).get().then(function(entity) {
            $scope.self = entity;
            if($scope.self && $scope.self.maxRam)
                $scope.maxRam = $scope.self.maxRam;
            if($scope.self && $scope.self.maxCpus)
                $scope.maxCpus = $scope.self.maxCpus;
            if($scope.self && $scope.self.maxRunningJobs)
                $scope.maxRunningJobs = $scope.self.maxRunningJobs;
            if($scope.self && $scope.self.hdfsSpaceQuota)
                $scope.hdfsSpaceQuota = $scope.self.hdfsSpaceQuota;
            $scope.userMaxRam = $scope.maxRam;
            $scope.userMaxCpus = $scope.maxCpus;

        });

        // Restangular.one("roles?filter=&limit=20&offset=0&query=&sorts=-lastModifiedTime").get().then(function (resp) {
        //     $scope.permissions = resp.content;
        // });

        $scope.loadTagInputSource = function () {
            if(!$scope.self || !$scope.self.resourceQueues)
                return [];
            return $scope.queueNames;
        }

        $scope.toggleAdmin = function () {
            if($scope.permissions['europa.admin'] == true) {
                for( p in $scope.permissions) {
                    if(p !== 'europa.admin' && typeof($scope.permissions[p]) == "boolean") {
                        $scope.permissions[p] = false;
                    }
                }
            }
        }

        $scope.toggleUser = function (app) {
            if(app === 'europa.user' && $scope.permissions['europa.user'] == false) {
                for( p in $scope.permissions) {
                    if(p !== 'europa.admin' && typeof($scope.permissions[p]) == "boolean") {
                        $scope.permissions[p] = false;
                    }
                }
            }
            if($scope.permissions[app] == true) {
                if($scope.permissions['europa.user'] == false) {
                    $scope.permissions['europa.user'] = true;
                    $scope.permissions['europa.user'] = true;
                } else {
                    $scope.permissions['europa.user'] = true;
                }
                if($scope.permissions['europa.admin'] == true) {
                    $scope.permissions['europa.admin'] = false;
                }
            }
        }

        $scope.save = function() {
            $scope.saving = true;
            var entityCopy = auxo.clone($scope.entity);
            var resourceQueues = [];
            entityCopy.resourceQueues.forEach(function (value, index, array) {
                resourceQueues.push(value.text);
            })
            entityCopy.resourceQueues = resourceQueues;

            if(entityCopy.enabled) {
                entityCopy.enabled = 1;
            } else {
                entityCopy.enabled = 0;
            }

            var permissions = [];
            for(var p in $scope.permissions) {
                if ($scope.permissions.hasOwnProperty(p) && $scope.permissions[p] == true) {
                    permissions.push(p);
                }
            }
            entityCopy.permissions = permissions;

            if($scope.permissions['europa.admin'] == true) {
                entityCopy.roles = ["ROLE_admin"];
            } else {
                entityCopy.roles= ["ROLE_user"];
            }

            if ($scope.isNew) {
                Restangular.all("europa/users").post(entityCopy).then(
                    function(){
                        $scope.saving = false;
                        auxo.loadPage(auxo.meta.user.currUrl,{});
                    },
                    function(es) {
                        $scope.saving = false;
                        auxo.showErrorMsg(es);
                    });
            }else {
                Restangular.one("europa/users", entityCopy.id)
                    .customPUT(entityCopy)
                    .then(
                        function(){
                            $scope.saving = false;
                            auxo.loadPage(auxo.meta.user.currUrl);
                        },
                        function(es) {
                            $scope.saving = false;
                            auxo.showErrorMsg(es);
                        });
            }
        }

        Restangular.one("europa/yarnrs/tntQueuesInfo").get({}).then(function (queuesInfo) {
            $scope.queuesInfo = queuesInfo;
            $scope.queuesCapacity = new Object();
            $scope.queueNames = [];
            $scope.userMaxRam = 0;
            $scope.userMaxCpus = 0;
            angular.forEach($scope.queuesInfo, function (queue) {
                var $name = queue.name;
                if($name == 'europa') {
                    $name = "大数据平台"
                    debugger
                }
                $scope.queueNames.push($name);
                $scope.queuesCapacity[$name] = queue;
                $scope.userMaxRam += queue.maxRam;
                $scope.userMaxCpus += queue.maxCpus;
            })

            //TODO get max value
            Restangular.one("europa/yarnrs/tntMaxValue").get({}).then(function (maxValueInfo) {
                var maxRamValue = maxValueInfo.maxRam;
                var maxCpusValue = maxValueInfo.maxCpus;
                if ($scope.userMaxRam > maxRamValue)
                    $scope.userMaxRam = maxRamValue;
                if ($scope.userMaxCpus > maxCpusValue)
                    $scope.userMaxCpus = maxCpusValue;
            })
        })


        /**
         * fairScheduler 多个queue的话，获取最大的值作为maxRam
         */
        var getFairSchedulerMax = function (queueName) {
            var maxValue = new Object();
            maxValue.maxRam = 0;
            maxValue.maxCpus = 0;
            if ($scope.selectQueues.length == 0){
                var queueInfo = $scope.queuesCapacity[queueName];
                var ram = queueInfo.maxRam;
                var cpus = queueInfo.maxCpus;
                if (maxValue.maxRam < ram && maxValue.maxCpus < cpus){
                    maxValue.maxRam = ram;
                    maxValue.maxCpus = cpus;
                }
            } else {
                angular.forEach($scope.selectQueues, function (queueNameInner) {
                    if (queueNameInner !== queueName){
                        var queueInfo = $scope.queuesCapacity[queueName];
                        var ram = queueInfo.maxRam;
                        var cpus = queueInfo.maxCpus;
                        if (maxValue.maxRam < ram && maxValue.maxCpus < cpus){
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
            if (cappedValue.type === "capacityScheduler"){
                var queueInfo = $scope.queuesCapacity[queueName];
                $scope.entity.maxRam -= queueInfo.maxRam;
                $scope.entity.maxCpus -= queueInfo.maxCpus;
                if ($scope.entity.maxRam < 0 || $scope.entity.maxCpus < 0){
                    $scope.entity.maxRam = 0;
                    $scope.entity.maxCpus = 0;
                }
                var maxRam = $scope.entity.maxRam;
                var maxCpus = $scope.entity.maxCpus;
                $scope.maxRam = maxRam;
                $scope.maxCpus = maxCpus;
            } else if (cappedValue.type === "fairScheduler"){
                $scope.entity.maxRam = getFairSchedulerMax(queueName).maxRam;
                $scope.entity.maxCpus = getFairSchedulerMax(queueName).maxCpus;
                if ($scope.entity.maxRam < 0 || $scope.entity.maxCpus < 0){
                    $scope.entity.maxRam = 0;
                    $scope.entity.maxCpus = 0;
                }
                var maxRam = $scope.entity.maxRam;
                var maxCpus = $scope.entity.maxCpus;
                $scope.maxRam = maxRam;
                $scope.maxCpus = maxCpus;
                var index = $scope.selectQueues.indexOf(queueName);
                $scope.selectQueues.splice(index);
            } else {
                $scope.entity.maxRam = getFairSchedulerMax(queueName).maxRam;
                $scope.entity.maxCpus = getFairSchedulerMax(queueName).maxCpus;
                if ($scope.entity.maxRam < 0 || $scope.entity.maxCpus < 0){
                    $scope.entity.maxRam = 0;
                    $scope.entity.maxCpus = 0;
                }
                var maxRam = $scope.entity.maxRam;
                var maxCpus = $scope.entity.maxCpus;
                $scope.maxRam = maxRam;
                $scope.maxCpus = maxCpus;
                var index = $scope.selectQueues.indexOf(queueName);
                $scope.selectQueues.splice(index);
            }
        }

        /**
         * 点击事件增加queue时，重新计算最大值以及上限值
         * @param queueName
         */
        var getMaxAndCappedAdd = function (queueName, itemCopy) {

            if (!$scope.entity.maxRam || $scope.entity.maxRam <=0 )
                $scope.entity.maxRam = 0;
            if (!$scope.entity.maxCpus || $scope.entity.maxCpus <=0 )
                $scope.entity.maxCpus = 0;
            if (cappedValue.type === "capacityScheduler"){
                var queueInfo = $scope.queuesCapacity[queueName];
                $scope.entity.maxRam += queueInfo.maxRam;
                $scope.entity.maxCpus += queueInfo.maxCpus;
                if ($scope.entity.maxRam > $scope.userMaxRam){
                    $scope.entity.maxRam = $scope.userMaxRam;
                }
                if ($scope.entity.maxCpus > $scope.userMaxCpus){
                    $scope.entity.maxCpus = $scope.userMaxCpus;
                }
                var maxRam = $scope.entity.maxRam;
                var maxCpus = $scope.entity.maxCpus;
                $scope.maxRam = maxRam;
                $scope.maxCpus = maxCpus;
            } else if (cappedValue.type === "fairScheduler"){
                $scope.entity.maxRam = getFairSchedulerMax(queueName).maxRam;
                $scope.entity.maxCpus = getFairSchedulerMax(queueName).maxCpus;
                if ($scope.entity.maxRam < 0 || $scope.entity.maxCpus < 0){
                    $scope.entity.maxRam = 0;
                    $scope.entity.maxCpus = 0;
                }
                var maxRam = $scope.entity.maxRam;
                var maxCpus = $scope.entity.maxCpus;
                $scope.maxRam = maxRam;
                $scope.maxCpus = maxCpus;
                $scope.selectQueues.push(queueName)
            } else {
                $scope.entity.maxRam = getFairSchedulerMax(queueName).maxRam;
                $scope.entity.maxCpus = getFairSchedulerMax(queueName).maxCpus;
                if ($scope.entity.maxRam < 0 || $scope.entity.maxCpus < 0){
                    $scope.entity.maxRam = 0;
                    $scope.entity.maxCpus = 0;
                }
                var maxRam = $scope.entity.maxRam;
                var maxCpus = $scope.entity.maxCpus;
                $scope.maxRam = maxRam;
                $scope.maxCpus = maxCpus;
                $scope.selectQueues.push(queueName)
            }
        }

        $scope.onTagRemoved = function($tag, itemCopy){
            getMaxAndCappedRemoved($tag.text, itemCopy);
        }

        $scope.onTagAdded = function ($tag, itemCopy) {
            getMaxAndCappedAdd($tag.text, itemCopy);
        }

        $scope.cancel = function() {
            //auxo.loadPage(auxo.meta.user.currUrl);
            auxo.goBack();
        }
    });

angular.module('AuxoApp')
    .controller('ChangePasswordController',  function($rootScope, $scope, $location, modalInstance, Auth, sgDialogService) {

        $scope.ok = function() {
            if(isOkDisabled())
                return;
            auxo.delHotkey($scope)
            Auth.changePassword(
                {
                    oldPassword: $scope.presentPassword,
                    newPassword: $scope.password
                },
                function () {
                    modalInstance.dismiss();
                    sgDialogService.alert("修改成功！","提示")
                },
                function () {
                    $scope.changePasswordError = "原密码输入错误！"
                }
            )
        };
        // cancel click
        $scope.cancel = function() {
            modalInstance.dismiss();
            auxo.delHotkey($scope)
        }

        function isOkDisabled () {
            if(!$scope.presentPassword || $scope.presentPassword.length <6)
                return true;

            if(!$scope.password ||  $scope.password.length < 6)
                return true;

            if( $scope.password !==  $scope.confirmPassword)
                return true;

            return false;
        }

        $scope.title = '密码修改';
        $scope.modalButtons =[
            {
                action:$scope.ok,
                text:"确定",class:"btn-primary",
                disabled: function(){ return isOkDisabled()}
            },
            {
                action:$scope.cancel,
                text:"取消",class:"btn-warning"
            }
        ];
        $scope.closeModal = $scope.cancel;
        auxo.bindEscEnterHotkey($scope)
    });
