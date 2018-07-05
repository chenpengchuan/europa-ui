'use strict';

/* Controllers */

angular.module('AuxoApp')
    .controller('NavController', function ($rootScope, $scope, $location, $uibModal, Auth, sgDialogService, menu) {
        $scope.user = Auth.user;
        $scope.userRoles = Auth.userRoles;
        $scope.accessLevels = Auth.accessLevels;
        menu.items = [{
            id: 'europa',
            label: '数据集成',
            icon: 'folder_open',
            items: [{
                label: '资源目录',
                link: 'resourceMan_bar',
                icon: 'folder_open'
            }, {
                label: '数据导入',
                link: 'synchronization_bar',
                icon: 'inbox'
            }, {
                label: '采集器',
                link: 'collector_bar',
                icon: 'cloud_download'
            }]
        }, {
            id: 'zebra',
            label: '数据治理',
            icon: 'remove_red_eye',
            items: [
                {
                    label: '质量分析',
                    link: 'qualityAnalysis_bar',
                    icon: 'remove_red_eye'
                },
                {
                    link : "dataList_bar",
                    label: "数据目录",
                    icon: "directions"
                },
                {
                    link : "sharedPermission_bar",
                    label: "共享权限",
                    icon: "folder_shared"
                },
                {
                    link : "sharedInterface_bar",
                    label: "共享接口",
                    icon: "screen_share"
                }
            ]
        }, {
            id: 'rhinos',
            label: '数据分析',
            link: 'design_bar',
            icon: 'shuffle',
            items: [{
                label: '流程管理',
                link: 'design_bar',
                icon: 'shuffle'
                /*}, {
                    label: '监控',
                    link: 'monitor',
                    icon: 'desktop_windows'*/
            }, {
                label: '配置',
                link: 'processconfig_bar',
                icon: 'settings'
            }]
        }, {
            id: 'hippo',
            label: '数据监控',
            link: 'hippo/index_bar',
            icon: 'show_chart',
            items: [{
                label: '运维管控',
                link: 'hippo/index_bar',
                icon: 'show_chart'
            }, {
                label: '血缘分析',
                link: 'hippo/kinship_bar',
                icon: 'computer'
            }]
        }];

        if (auxo.Auth.user && auxo.Auth.user.role && auxo.Auth.user.role.title == 'admin') {
            menu.items.push({
                id: 'griffin',
                label: '5A认证',
                link: 'user_bar',
                icon: 'people',
                items: [{
                    label: '用户',
                    link: 'user_bar',
                    icon: 'people'
                }, {
                    label: '权限',
                    link: 'permission_bar',
                    icon: 'perm_contact_calendar'
                }, {
                    label: '审计',
                    link: 'auditlogs_bar',
                    icon: 'apps'
                    /* }, {
                         label: '租户',
                         link: 'tenants',
                         icon: 'iconfont icon-users'*/
                }]
            })
        }
        $scope.logout = function () {
            Auth.logout(function () {
                $location.path('/login');
            }, function () {
                $rootScope.error = "退出发生错误";
            });
        };
        $scope.changeUserInfo = function (user) {
            sgDialogService.openModal({
                templateUrl: 'app/users/user_password_change_form.html',
                controller: 'ChangePasswordController', // specify controller for modal
                data: {
                },
                width: 800
            });
        };

        $scope.showHistory = function (obj) {
            sgDialogService.openModal({
                templateUrl: 'app/process/history.html',
                data: {},
                width: 800
            });
        }

        $scope.doTest = function () {
            auxo.Restangular.one("mis", "debug").customPOST({data: "debug"})
                .then(function (data) {
                    console.log(data);
                })
        }

    });

angular.module('AuxoApp')
    .controller('LoginController',
        ['$rootScope', '$scope', '$location', '$window', 'Auth', '$timeout', 'Restangular', function ($rootScope, $scope, $location, $window, Auth, $timeout, Restangular) {

            var stopTimer = false;
            delete $rootScope.error;

            function validate() {
                if ($scope.name && $scope.password)
                    delete $scope.error;
                else if (!$scope.name)
                    $scope.error = "姓名为必输项"
                else {
                    var e1 = document.getElementById("password")
                    var c = getComputedStyle(e1).backgroundColor
                    if (c === "rgb(250, 255, 189)") {
                        delete $scope.error;
                        stopTimer = true
                    } else
                        $scope.error = "密码为必输项"
                }
            }

            $scope.license = {"exp": "UNKNOWN"};
            Restangular.one("license", "info").get().then(function (license) {
                $scope.license = license;
                var date = new Date(license.notAfter);
                $scope.license.exp = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                if (license.error) {
                    alert("请注意：您的license非法或者已经过期，过期时间是" + $scope.license.exp);
                } else if (date.getTime() - new Date().getTime() < 7 * 24 * 3600 * 1000) {
                    alert("请注意：您的license接近过期时间，过期时间是:" + $scope.license.exp);
                }
            })

            $scope.ok = $scope.login = function () {
                validate();
                if ($scope.error)
                    return false;

                Auth.login({
                        tenant:$scope.tenant,
                        name: $scope.name,
                        password: $scope.password,
                        version: auxo.version
                        // rememberme: $scope.rememberme
                    },
                    function (res) {
                        $location.path('/');
                    },
                    function (err) {
                        if (err.err === "No Permission")
                            $scope.error = "用户名或者密码错误";
                        else
                            $scope.error = auxo.getResponseErrorMsg(err);
                    });
            };

            $scope.onChange = function (name) {
                validate()
                if (name === "password")
                    stopTimer = true;
            }

            function checkValidate() {
                $timeout(function () {
                    validate();
                    if (!stopTimer)
                        checkValidate()
                }, 300)
            }

            validate();
            checkValidate();
        }]);

