angular.module('AuxoApp')
    .controller('historyController', function ($rootScope, $scope, $location, modalInstance, Restangular) {

        var NameMapping = {"UPDATE":['更新','primary', 'glyphicon-pencil', handleProcess],
            "CREATE":['创建', 'success', 'glyphicon-plus', handleProcess],
            "DELETE":['删除', 'danger', 'glyphicon-remove', handleRemove],
            "MOVE": ['移动', 'info', 'glyphicon-move', handleMove],
            "COPY": ['复制', 'info', 'glyphicon-copy', handleCopy],
            "SHARE": ['共享', 'warning', 'glyphicon-share', handleShare],
            "RECEIVE": ['接收', 'warning', 'glyphicon-share-alt', handleReceive],
            "EXPORT": ['导出', 'info', 'glyphicon-export'],
            "IMPORT": ['导入', 'success', 'glyphicon-export']};

        if (!$scope.limit)
            $scope.limit = 10;
        if (!$scope.currPage)
            $scope.currPage = 0;
        if (!$scope.queryWord) {
            $scope.queryWord = '';
        }

        $scope.sorts = "-createTime";
        $scope.events = [];
        $scope.userArray = [];
        $scope.busy = false;
        $scope.processEventTypeFilter = 'all';
        $scope.userFilter="all";

        function handleProcess(e) {
            try {
                var action = NameMapping[e.name][0]
                var obj = angular.fromJson(e.description);
                var type = obj.processType;
                if (obj.flowType) {
                    type = obj.flowType;
                }
                return "租户" + obj.tenant + "-用户" + obj.owner + ' ' + action + '了' + type + ' - ' + obj.name;
            } catch (err) {
                console.log(err)
            }

        }

        function handleMove(e) {
            var obj = angular.fromJson(e.description);
            var targetPath = obj[0];
            var sourceList = obj[1];


            return "租户" + e.tenant + "-用户" + e.owner + '将 ' + sourceList.join(", ") + ' 移动到 ' + targetPath;
        }

        function handleCopy(e) {
            var obj = angular.fromJson(e.description);
            var targetPath = obj[0];
            var sourceList = obj[1];


            return "租户" + e.tenant + "-用户" + e.owner + '将 ' + sourceList.join(", ") + ' 复制到 ' + targetPath;
        }

        function handleRemove(e) {
            var obj = angular.fromJson(e.description);
            var names = '';
            for(var i=0; i<obj.length; i++) {
                names += obj[i].name + ',';
            }
            return "租户" + e.tenant + "-用户" + e.owner + '删除了 ' + names + "共" + obj.length + "条流程";
        }

        function handleShare(e) {
            var obj = angular.fromJson(e.description);
            var process = obj[0];
            var sharedUsers = obj[1];
            var names = '';
            for(var i=0; i<sharedUsers.length; i++) {
                names += sharedUsers[i].tenant + '-' + sharedUsers[i].user + ',';
            }

            return names == '' ? "租户" + e.tenant + "-用户" + e.owner +  '将 ' + process.name + ' 取消共享 '
                : "租户" + e.tenant + "-用户" + e.owner +  '将 ' + process.name + ' 共享给 ' + names
        }

        function handleReceive(e) {
            var obj = angular.fromJson(e.description);
            var process = obj[0];
            var tenant = obj[1];
            var user = obj[2];

            return "租户" + e.tenant + "-用户" + e.owner +  ' 从 租户' + tenant + "-用户" + user + "接收共享流程" + process;
        }

        function resetSearch() {
            $scope.totalPages = undefined;
            $scope.currPage = 0;
            $scope.events = [];
            $scope.busy = false;
            $scope.fetchPage();
        }

        function fetchUserList() {
            Restangular.all("/europa/applog/userList").getList().then(function(users) {
                $scope.userArray = users;
            });
        }

        $scope.onProcessEventTypeChange = function(processEventType) {
            $scope.processEventTypeFilter = processEventType;
            resetSearch();
        }

        $scope.onUserChange  = function (user) {
            $scope.userFilter = user;
            resetSearch();
        }

        function composeFilter() {
            var result = "";
            if($scope.processEventTypeFilter != "all") {
                result += "name=" + $scope.processEventTypeFilter;
                if($scope.userFilter != "all") {
                    result += "&owner=" + $scope.userFilter;
                }
            } else if($scope.userFilter != "all") {
                result += "owner=" + $scope.userFilter;
            }
            return result;
        }

        $scope.fetchPage = function () {
            if($scope.busy) return;
            if($scope.totalPages != undefined && $scope.currPage >= $scope.totalPages) {
                return;
            }
            $scope.busy = true;

            var queryWord = $scope.queryWord;
            Restangular.one("/europa/applog").get({
                query: queryWord,
                offset: $scope.currPage  * $scope.limit,
                limit: $scope.limit,
                filter: composeFilter(),
                sorts: $scope.sorts
            })
                .then(function (facetResult) {
                    console.info(facetResult);
                    $scope.rowCollection = facetResult.content;
                    $scope.total = facetResult.total;
                    $scope.totalPages = facetResult.totalPages;

                    auxo.array.forEach($scope.rowCollection, function (e) {
                        $scope.events.push({
                            badgeClass: NameMapping[e.name][1],
                            badgeIconClass: NameMapping[e.name][2],
                            title: NameMapping[e.name][0],
                            timestamp: auxo.date2str(e.createTime),
                            content: NameMapping[e.name][3](e)
                        })
                    });

                    if($scope.currPage < $scope.totalPages) {
                        $scope.currPage += 1;
                    }

                    $scope.busy = false;
                });
        }
        // cancel click
        $scope.cancel = function () {
            auxo.delHotkey($scope)
            modalInstance.closeModal(false)
        }

        $scope.closeModal = function () {
            $scope.cancel();
        }

        $scope.title = '历史消息';
        $scope.modalButtons = [
            {
                action: $scope.cancel,
                text: "关闭", class: "btn-primary"
            }
        ];

        auxo.bindEscEnterHotkey($scope)

        if(auxo.amIAdmin()) {
            fetchUserList();
        }
    });