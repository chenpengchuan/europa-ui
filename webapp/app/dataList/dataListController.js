App.controller("dataListController", function ($filter, $scope, $location, $window, $http, $state, $stateParams, Restangular, ngDialog) {
    Restangular.one("europa/statistics/settings").get()
        .then(function (data) {
            $scope.id = data.resourceId;
            $scope.name = data.name;
            Restangular.all("europa/resource/children").getList({
                id: $scope.id,
                includes: "dir;dataset_dir",
                tenant: auxo.Auth.user.tenant,
                level: 100
            }).then(function (resp) {
                console.log("resp=", resp)
                $scope.menus = resp;
                $scope.allSystem = 0;
                $scope.allCount = 0;
                $scope.allDatasetCount = 0;
                $scope.allDepartment = 0;
                for (var m = 0; m < $scope.menus.length; m++) {
                    if ($scope.menus[m].resType != "dataset_spool" && $scope.menus[m].resType != "dataset_db") {
                        $scope.allDepartment = $scope.allDepartment + 1;
                    }
                }


                Restangular.all("europa/resource/roots").getList({excludes: "dataset_db|dataset_spool"}).then(function (roots) {
                    for (var i = 0; i < roots.length; i++) {
                        //console.log("roots",roots);
                        if (roots[i].name == "Datasets") {
                            $scope.datasetId = roots[i].id;
                        }
                    }
                });

                // 统计对接系统数量
                for (var i = 0; i < $scope.menus.length; i++) {
                    for (var m = 0; m < $scope.menus[i].children.length; m++) {
                        if ($scope.menus[i].children[m].resType == "dir") {
                            $scope.allSystem = $scope.allSystem + 1;
                        }
                    }
                    // $scope.allSystem = $scope.allSystem + $scope.menus[i].children.length;
                }

                // 将传过来的对象重新组合成自己想要的对象
                function fun2(parent, children, level) {
                    var dirs = 0;
                    var datasets = 0;
                    var count = 0;
                    var arr = [];
                    if (children && children.length) {
                        for (var i = 0; i < children.length; i += 1) {
                            var c = children[i];
                            var obj = {
                                'name': c['name'],
                                'id': c['id']
                            }
                            if (c['resType'] == 'dir' ) {
                                if (level == 2)
                                    dirs++;
                                var ret = fun2(obj, c['children'], level++);
                                datasets += ret['datasets'];
                                dirs += ret['dirs'];
                                count += ret['count'];
                            } else if (c['resType'] == 'dataset_spool') {
                                try{
                                    if(c['attributes']['dataSpool']['attributes']['storeType'] == "HDFS"){
                                        datasets++;
                                    }
                                }catch (e){}
                                if (c['attributes'] && c['attributes']['statistics'] && c['attributes']['statistics']['rowCount']) {
                                    count += c['attributes']['statistics']['rowCount'];
                                }
                            }
                            if (c['resType'] == 'dir') {
                                arr.push(obj)
                            }
                        }
                    }
                    parent['count'] = count;
                    parent['datasets'] = datasets;
                    parent['dirs'] = dirs;
                    parent['children'] = arr;
                    return {
                        'datasets': datasets,
                        'count': count,
                        'dirs': dirs
                    };
                }

                function clear_fun(parent, curr_level, clear_level) {
                    //debugger
                    curr_level++
                    if (parent['children']) {
                        if (curr_level == clear_level) {
                            delete parent['children']
                        } else {
                            var arr = parent['children']
                            for (var i = 0; i < arr.length; i++) {
                                var item = arr[i]
                                clear_fun(item, curr_level, clear_level)
                            }
                        }
                    }
                }

                $(document).ready(function () {
                    (function () {
                        var arr = resp;
                        var root = {'name': '部门'};
                        var ret = fun2(root, arr, 1);
                        console.log('root=', root)
                        console.log('ret=', ret)
                        //$scope.allDepartment = ret.dirs;
                        clear_fun(root, 0, 3);
                        window.rootData = root;
                        $scope.getData = root;
                        $scope.data = root.children; // 统计信息
                        console.log("root", root);
                        $scope.allDatasetCount = root.datasets;
                        $scope.allCount = root.count;
                    })();
                });
            });
        })


    // 部门的跳转
    $scope.linkDepartment = function (item) {

        var url = $state.href('resourceMan_toExpandedNodes', {
            id1: $scope.datasetId,
            id2: $scope.menus.reqParams.id,
            id3: item.id,
            id4: ""
        });
        window.location = url;
        location.reload()
    }

    // path中为当前node的父节点
    $scope.showSystem2 = function (a, b, c, d) {
        var path = d.call(this);
        console.log("path", path)
        var parentId = [];
        for (var i in path) {
            parentId.push(path[path.length - i - 1].id);
        }
        var url = $state.href('resourceMan_toExpandedNodes', {
            id1: $scope.datasetId,
            id2: $scope.menus.reqParams.id,
            id3: parentId[0],
            id4: parentId[1]
        });
        window.location = url;
        location.reload()
    }


    // 设置弹框
    $scope.setTime = function () {
        $scope.openDialog = function () {
            auxo.sgDialogService.openModal({
                templateUrl: 'app/dataList/triggerSetting.html',
                data: {passId: $scope.aa},
                callback: function (result) {
                    //location.reload();
                },
                width: 500
            });
        }();
    }

    $scope.treeOptions = {
        nodeChildren: "children",
        dirSelectable: true,
        injectClasses: {
            ul: "a1",
            li: "a2",
            liSelected: "a7",
            iExpanded: "a3",
            iCollapsed: "a4",
            iLeaf: "a5",
            label: "a6",
            labelSelected: "a8"
        }
    }
});