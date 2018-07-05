var SideBarController = function($scope, $window, $http, $rootScope, Restangular,$location, Auth, hotkeys) {
    var content = [];
    var url;
    auxo.hotkeys.hotkeys = hotkeys;

    //console.log("Enter into SideBarController.");
    $scope.bars = [{
        view : "resourceMan",
        text : "资源目录",
//        icon : "glyphicon glyphicon-folder-open",
        icon : "icon  icon-folder-open",
        active : false,
        roles:  ["admin", "user"]
    },{
        view : "synchronization",
        text : "数据导入",
        icon : "glyphicon glyphicon-import",
        active : false,
        roles:  ["admin", "user"]
    },{
        view : "collector",
        text : "采集器",
        icon : "icon icon-cloud-download",
        active : false,
        roles:  ["admin", "user"]
    },{
        view : "design",
        text : "流程管理",
        icon : "iconfont icon-flow",
        active : false,
        roles:  ["admin", "user"]
    },{
        view : "monitor_main.summary",
        text : "监控",
        icon : "iconfont icon-computer",
        active : false,
        roles:  ["admin", "user"]
    },{
        view : "configuration",
        text : "配置",
        icon : "iconfont icon-settings-6",
        active : false,
        roles:  ["admin", "user"]
    },{
        view : "qualityAnalysis",
        text : "质量分析",
        icon : "glyphicon glyphicon-eye-open",
        visible: true,
        active : false,
        roles:  ["admin","user"]
    },{
        view : "user",
        text : "用户",
        icon : "iconfont icon-users",
        active : false,
        roles:  ["admin"]
    },{
        view : "permission",
        text : "权限",
        icon : "iconfont icon-calendar",
        active : false,
        roles:  ["admin"]
    },{
        view : "audit",
        text : "审计",
        icon : "iconfont icon-computer",
        active : false,
        roles:  ["admin"]
    },{
        view : "hippo/index",
        text : "运维管控",
        icon : "iconfont icon-home",
        active : false,
        roles:  ["admin", "user"]
    },{
        view : "hippo/kinship",
        text : "血缘分析",
        icon : "iconfont icon-flow",
        active : false,
        roles:  ["admin", "user"]
    },{
        view : "tenants",
        text : "租户",
        icon : "iconfont icon-users",
        active : false,
        roles:  ["root"]
    }];

    $.each($scope.bars,function(e,ele){
        content.push(ele.view);
    })

    $scope.selectBar = function(bar) {
        // url = "/"+bar.view;
        auxo.go(bar.view);
        for (var i in $scope.bars) {
            $scope.bars[i].active = $scope.bars[i] == bar;
        }
    }

    $scope.user = Auth.user;
    $scope.$watch('user', function(user) {
        for(var i in $scope.bars) {
            if(!$.isNumeric(i))
                continue;

            var bar = $scope.bars[i];
            bar.visible = bar.roles.indexOf(user.role.title) >= 0;
        }
    }, true);

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        url = $location.$$url;
        // alert(url.lastIndexOf('/synchronization_new'))
        if(toState.name.indexOf('resourceMan') == 0 || toState.name.indexOf('resourceMan_toExpandedNodes')==0||toState.name.indexOf('resourceManExpandedNodes')==0 ){
            $scope.bars[0].active=true;
        }else if((url.indexOf('/synchronization')==0 && url.indexOf('/synchronization_') == -1) || (url.lastIndexOf('/synchronization_new') == 0 && url.lastIndexOf('/')==url.indexOf('/'))|| (url.substring(0,4) == '/job' && url.substring(4,19) == '/EUROPA-SERVER') || (url.substring(0,21) == '/synchronization_copy' && url.substring(21,36) == '/EUROPA-SERVER')){
            $scope.bars[1].active=true;
        }else if( toState.name.indexOf('collector') == 0 || (url.lastIndexOf('/')!=url.indexOf('/') && url.indexOf('/synchronization_new') != 0) || toState.name.indexOf('collectorJobList') == 0|| (url.substring(0,4) == '/job' && url.substring(4,19) != '/EUROPA-SERVER') || (url.substring(0,21) == '/synchronization_copy' && url.substring(21,36) != '/EUROPA-SERVER')){
            $scope.bars[2].active=true;
        }else if(toState.name.indexOf('design') == 0){
            $scope.bars[3].active=true;
        }
    });
}

App.controller('SideBarController', SideBarController)

App.config(['markedProvider', function(markedProvider) {
    markedProvider.setOptions({
        gfm: true,
        tables: true,
        highlight: function(code, language) {
            if (!language) {
                language = 'bash';
            } else if (language == 'html') {
                language = 'markup';
            }
            return Prism.highlight(code, Prism.languages[language]);
        }
    });
}]);

App.controller('indexController', ['$rootScope','$scope', '$menu', '$mdSidenav', function($rootScope, $scope, $menu, $mdSidenav ,hotkeys) {
    auxo.hotkeys.hotkeys = hotkeys;
    $scope.breadcrumb = $menu.breadcrumb();
    $scope.style = $menu.style();

    $rootScope.loaded = true;

    $scope.getFlag = localStorage.getItem("flag");
    if($scope.getFlag == "true"){
        window.addEventListener("storage", function(event){
            if(event.key == "flag" && event.storageArea.flag == "false"){
                $scope.logout = function() {
                    Auth.logout(function() {
                        if($scope.getFlag == "true"){
                            location.reload();
                        }
                        // location.reload();
                    }, function() {
                        $rootScope.error = "退出发生错误";
                    });
                }();
            }
        });
    }

    $scope.toggle = function() {
        $mdSidenav('left').toggle();
        $scope.icon = $scope.icon == 'menu' ? 'close' : 'menu';
    };


    $menu.callback(function(item) {
        console.log('You are going to', item.link);
        $scope.toggle();
    });

    $mdSidenav('left', true).then(function(instance) {
        $scope.icon = 'menu';
        instance.onClose(function () {
            $scope.icon = 'menu';
        });
    });

    $scope.$watch('style', function(value) {
        $menu.style(value);
    });
}]);