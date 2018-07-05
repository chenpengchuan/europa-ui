angular.module('AuxoApp')
    .controller('ProcessControllerNew', function ($state, $filter, $scope, $location, $window, $http, $stateParams, Restangular,
                                                  ngDialog, sgDialogService) {
        $scope.error = "";

        $scope.tabTitle = "流程目录"

        $scope.dataBackup = {}
        $scope.selectedNode = null;

        $scope.rowCollection = []
        $scope.selectedRows = []

        $scope.treeOptions = {
            nodeChildren: "children",
            dirSelectable: true,
            allowDeselect: false,
            ainjectClasses: {
                ul: "a1",
                li: "a2",
                liSelected: "a7",
                iExpanded: "a3",
                iCollapsed: "a4",
                iLeaf: "a5",
                label: "a6",
                labelSelected: "a8"
            },
            injectClasses: {
                "ul": "c-ul",
                "li": "c-li",
                "liSelected": "c-liSelected",
                "iExpanded": "c-iExpanded",
                "iCollapsed": "c-iCollapsed",
                "iLeaf": "c-iLeaf",
                "label": "c-label",
                "labelSelected": "c-labelSelected"
            },
            isLeaf: function (node) {
                return !node.children || node.children.length === 0;
            }
        }

        $scope.transform = function (name) {
            var map = {"share_category": "共享", "inbox_category": "跨租户共享"};
            if (map[name]) {
                return map[name];
            } else {
                return name
            }
        }

        $scope.tooltip = function(node) {
            if(auxo.isMyShared(node)) {
                return auxo.shareTooltips(node.sharedUsers);
            } else if(auxo.sharedWithMe(node)) {
                return auxo.receiveShareTooltips(node);
            }
        }

        function compare(a, b) {
            if (a.name == auxo.Auth.user.name) {
                return -1;
            } else if (b.name == auxo.Auth.user.name) {
                return 1
            }
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        }

        function sortTree(roots) {
            if (!roots)
                return;
            roots.sort(compare);
        }

        function fullPath(nodeArr) {
            return nodeArr.map(function (node) {
                return $scope.transform(node.name);
            }).reverse().join("/");
        }


        Restangular.all("europa/process/roots").getList({
            includes: "dir;share_dir;user_dir",
            excludes: ""
        }).then(function (roots) {
            sortTree(roots)
            $scope.dataForTheTree = roots;
            $scope.dataBackup.roots = auxo.clone(roots);
        });

        $scope.addOrEditDir = function (node) {
            if ($scope.isButtonDisabled('dir')) return;
            var path, edit;
            if (node) {
                edit = true;
                path = '/' + fullPath($scope.selectedNodePath);
                var idx = path.lastIndexOf("/");
                if (idx != -1) {
                    path = path.substring(0, idx);
                }
            } else {
                edit = false;
                path = ($scope.selectedNodePath == undefined) ? '/' : '/' + fullPath($scope.selectedNodePath) + "/";
            }
            auxo.openInputDialog("输入目录名称（字母，数字和下划线）",
                node ? node.name : "新建目录",
                function (newValue) {
                    if (newValue) {
                        if (!node) {
                            node = {name: newValue, processType: 'dir', flowType: '', sharedUsers: $scope.selectedNode.sharedUsers}
                            if ($scope.selectedNode != null) {
                                node.parentId = $scope.selectedNode.id;
                            }
                        } else {
                            node = auxo.clone(node);
                            node.name = newValue;
                            node.flowType = '';
                            if (node.enabled == '正常') {
                                node.enabled = 1;
                            } else {
                                node.enabled = 0;
                            }
                        }
                        Restangular.all("europa/process").post(node).then(function (result) {
                            if (edit) {
                                if ($scope.parentNode) {
                                    var arr = $scope.parentNode.children.filter(function (el) {
                                        return el.id !== node.id;
                                    });
                                    $scope.parentNode.children = arr;
                                    $scope.onNodeToggle($scope.parentNode, true);
                                } else {
                                    $state.reload();
                                }
                            } else {
                                if ($scope.selectedNode) {
                                    $scope.onNodeToggle($scope.selectedNode, true);
                                } else {
                                    $state.reload();
                                }
                            }
                        }, function (errmsg) {
                            auxo.showErrorMsg(errmsg)
                        })
                    }
                },
                sgDialogService,
                300,
                path
            )
        }

        $scope.addProcess = function (node, edit) {
            if ($scope.isButtonDisabled('process')) return;
            var parentPath = $scope.selectedNodePath == undefined ? '' : fullPath($scope.selectedNodePath) + "/";
            $scope.openAddProcessDialog("输入流程名称（字母，数字和下划线）",
                node ? node.name : "新建流程",
                function (newValue) {
                    if (newValue) {
                        if (!node) {
                            node = {
                                name: newValue.flowName,
                                processType: 'process',
                                flowType: newValue.flowType,
                                attributes: {flowName: (parentPath + newValue.flowName), flowType: newValue.flowType},
                                sharedUsers: $scope.selectedNode.sharedUsers
                            };
                            if ($scope.selectedNode != null) {
                                node.parentId = $scope.selectedNode.id;
                            }
                        } else {
                            node = auxo.clone(node);
                            node.name = newValue;
                            node.attributes.flowName = parentPath + newValue.flowName;
                            if (node.enabled == '正常') {
                                node.enabled = 1;
                            } else {
                                node.enabled = 0;
                            }
                        }
                        Restangular.all("europa/process").post(node).then(function (result) {
                            $scope.onSelected($scope.selectedNode, $scope.parentNode, $scope.selectedNodePath)
                        }, function (errmsg) {
                            auxo.showErrorMsg(errmsg)
                        })
                    }
                },
                sgDialogService,
                300,
                "/" + parentPath
            )
        }

        $scope.renameProcess = function (node) {
            if($scope.isButtonDisabled("rename")) return;
            auxo.openInputDialog("输入流程名称（字母，数字和下划线）",
                node ? node.name : "重命名流程",
                function (newValue) {
                    if (newValue) {
                        if (!node) {
                            node = {name: newValue, processType: 'process'}
                            if ($scope.selectedNode != null) {
                                node.parentId = $scope.selectedNode.id;
                            }
                        } else {
                            node = auxo.clone(node);
                            node.name = newValue;
                            if (node.enabled == '正常') {
                                node.enabled = 1;
                            } else {
                                node.enabled = 0;
                            }
                        }
                        Restangular.all("europa/process").post(node).then(function (result) {
                            $scope.onSelected($scope.selectedNode, $scope.parentNode, $scope.selectedNodePath)
                        }, function (errmsg) {
                            auxo.showErrorMsg(errmsg)
                        })
                    }
                },
                sgDialogService,
                300,
                ($scope.selectedNodePath == undefined ? '/' : '/' + fullPath($scope.selectedNodePath) + "/")
            )
        }


        //获取选中的id
        function getSelectRowFlowIds() {
            var ids = [];
            for (var i = 0; i < $scope.selectedRows.length; i++) {
                ids.push($scope.selectedRows[i].attributes['flowId']);
            }
            return ids;
        }

        $scope.exportProcess = function (exp) {
            var message = '';
            if ($scope.selectedRows.length > 0) {
                var invalid = false;
                for (idx in $scope.selectedRows) {
                    if (!$scope.selectedRows[idx].attributes['flowId']) {
                        sgDialogService.alert('选中流程<label>' + $scope.selectedRows[idx].name + "</label>尚未设计, 无法导出!", '提示');
                        return;
                    }
                }
                message += '中选中的<label><i>' + $scope.selectedRows.length + '</i></label>条流程';
            }

            if ($scope.selectedNode) {
                if($scope.total == 0){
                    sgDialogService.alert('请先选择有数据的目录再进行导出', '提示');
                    return;
                }else
                    message = '确定要导出目录<label><i>' + '/' + fullPath($scope.selectedNodePath) + '</i></label>' + message + '?';
            } else {
                sgDialogService.alert('请先选择目录或者流程', '提示');
                return;
            }

            var openDialog = function (msg, download_flow) {
                auxo.sgDialogService.openModal({
                    template: "<div>" + msg + "</div><div class='list-group-item no-border'><input type='checkbox' data-ng-model='cascading_export'>" +
                    "<a ng-click='cascading_export=!cascading_export'><span>级联导出</span></a></div>",

                    controller: function ($scope, Restangular, modalInstance, hotkeys) {
                        $scope.ok = function () {
                            if (!isOkDisabled() && exp===true) {
                                download_flow($scope.cascading_export, modalInstance);
                                exp = isOkDisabled();
                            }
                        }

                        $scope.cancel = function () {
                            modalInstance.dismiss();
                        }

                        hotkeys.bindTo($scope)
                            .add({
                                combo: 'esc',
                                description: 'call cancel',
                                callback: function (event) {
                                    event.preventDefault();
                                    $scope.cancel()
                                }
                            })
                            .add({
                                combo: 'enter',
                                description: 'call ok',
                                allowIn: ['INPUT'],
                                callback: function (event) {
                                    event.preventDefault();
                                    $scope.ok()
                                }
                            })

                        function isOkDisabled() {
                            return false;
                        }

                        $scope.modalButtons = [
                            {
                                action: $scope.ok,
                                text: "确定", class: "btn-primary",
                                disabled: function () {
                                    return isOkDisabled();
                                }
                            },
                            {
                                action: $scope.cancel,
                                text: "取消", class: "btn-warning"
                            }
                        ];
                        $scope.closeModal = $scope.cancel
                    },
                    data: {cascading_export: false, title: '导出流程'},
                    width: 500
                });
            }


            openDialog(message, function (cascading, modalInstance) {
                function download(ids) {

                    var sp = {offset: 0, limit: 0x7fffffff};

                    var array = []
                    auxo.array.forEach(ids, function (e) {
                        array.push("id=" + e)
                    })
                    sp.query = array.join("|")

                    if (!sp.filter)
                        sp.filter = "";

                    if (cascading)
                        sp.withDependencies = true;
                    else
                        sp.withDependencies = false;


                    sp['X-AUTH-TOKEN'] = auxo.$rootScope.token;
                    var url = '/api/flows/export?' + $.param(sp);
                    console.log("downlaod url:" + url)
                    auxo.download(url);
                }

                var ids = [];
                if ($scope.selectedRows.length > 0) {
                    ids = getSelectRowFlowIds();
                    download(ids);
                    modalInstance.closeModal(false)
                } else {
                    Restangular.all("europa/process/children?id=" + $scope.selectedNode.id).getList().then(function (list) {
                        if (list && list.length > 0) {
                            download(list)
                        } else {
                            sgDialogService.alert('没有对应选择ID的流程可以下载', '提示');
                        }
                        modalInstance.closeModal(false);
                    });
                }
            });

        }

        $scope.importProcess = function () {
            if (!$scope.selectedNode) {
                sgDialogService.alert('请先选择要导入的目录', '提示');
                return;
            }

            auxo.sgDialogService.openModal({
                templateUrl: 'app/designer/flow/import.html',
                data: {selectedNode: $scope.selectedNode, path: ('/' + fullPath($scope.selectedNodePath))},
                width: 800
            });
        }

        $scope.copyProcess = function () {
            copyOrMove(true);
        }

        function copyOrMove(copy) {
            if (!verifySelectedNode('process'))
                return;

            //获取选中的id
            function getSelectRowIds() {
                var ids = [];
                for (var i = 0; i < $scope.selectedRows.length; i++) {
                    ids.push($scope.selectedRows[i].id);
                }
                return ids;
            }

            var openDialog = function () {
                var parent = $scope.parentNode;
                auxo.sgDialogService.openModal({
                    templateUrl: 'app/process/processDialog.html',
                    data: {
                        editingNode: {
                            id: $scope.selectedNode.id,
                            path: $scope.selectedNodePath,
                            rows: getSelectRowIds()
                        },
                        copy: copy
                    },
                    callback: function (data) {
                        if(data) {
                            auxo.treeWalk($scope.dataForTheTree, function (key, value, path, parent) {
                                if (value && value.id === data) {
                                    if($scope.selectedRows.length === 0)
                                         $scope.onNodeToggle(value, true);
                                    $scope.onSelected($scope.selectedNode, $scope.parentNode, $scope.selectedNodePath);
                                    return;
                                }
                            })
                        }
                        if(parent) {
                            $scope.onNodeToggle(parent, true);
                        } else {
                            $state.reload();
                        }
                    },
                    width: 800
                });
            }
            openDialog();
        }

        $scope.moveProcess = function () {
            copyOrMove(false);
            $scope.doQuery2();
        }

        function removeTreeNode(node) {
            auxo.treeWalk($scope.dataForTheTree, function (key, value, path, parent) {
                if (value === node) {
                    auxo.array.remove(parent, key)
                    return "break"
                }
            })
        }

        $scope.showHistory = function() {
            if($scope.isButtonDisabled('history')) {
                return;
            }

            if($scope.selectedNode) {
                sgDialogService.openModal({
                    templateUrl : 'app/process/history.html',
                    data:{
                        queryWord: 'targetId:' + $scope.selectedNode.id
                    },
                    width:800
                });
            }
        }

        $scope.getRootNodeName = function () {
            if($scope.selectedNodePath) {
                return $scope.selectedNodePath[$scope.selectedNodePath.length - 1].name;
            }
        }

        $scope.isShowDropdownMenu = function () {
            if ($scope.selectedNode != null ){
                var isShow = ($scope.selectedNode.processType === 'user_dir' && $scope.selectedNode.name === auxo.Auth.user.name && !($scope.selectedRows && $scope.selectedRows.length > 0));
                isShow = isShow || $scope.selectedNode.processType === 'admin_dir';
                return !isShow;
            }
            return false;

        }

        $scope.isButtonDisabled = function (name) {
            if ("share" === name) {
                return !$scope.selectedNode || ($scope.selectedNode.processType === 'share_dir' ||
                    $scope.selectedNode.processType === 'admin_dir' ||
                    $scope.selectedNode.processType === 'user_dir' ||
                    $scope.selectedNode.processType === 'user_share_dir' ||
                    !auxo.isMine($scope.selectedNode) || ($scope.selectedRows && $scope.selectedRows.length > 0));
            } else if ("move" === name || "copy" === name) {
                return !$scope.selectedNode || (($scope.selectedNode.processType === 'share_dir' ||
                    $scope.selectedNode.processType === 'admin_dir' ||
                    $scope.selectedNode.processType === 'user_dir' ||
                    $scope.selectedNode.processType === 'user_share_dir' ||
                    !auxo.canChange($scope.selectedNode)) && !($scope.selectedRows && $scope.selectedRows.length > 0 && !$scope.selectedNode.sharedUsers));
            } else if ("rename" === name) {
                return !$scope.selectedNode || ($scope.selectedNode.processType === 'share_dir' ||
                    $scope.selectedNode.processType === 'admin_dir' ||
                    $scope.selectedNode.processType === 'user_share_dir' ||
                    ($scope.selectedNode.processType === 'user_dir' && $scope.selectedNode.name === "admin" && !($scope.selectedRows && $scope.selectedRows.length > 0)) ||
                    !auxo.canChange($scope.selectedNode));
            } else if ("delete" === name) {
                return !$scope.selectedNode || (($scope.selectedNode.processType === 'share_dir' ||
                    $scope.selectedNode.processType === 'admin_dir' ||
                    $scope.selectedNode.processType === 'user_dir' ||
                    $scope.selectedNode.processType === 'user_share_dir' ||
                    !auxo.canChange($scope.selectedNode)) && !($scope.selectedRows && $scope.selectedRows.length > 0 && !$scope.selectedNode.sharedUsers));
            } else if ("process" === name) {
                return !$scope.selectedNode || ($scope.selectedNodePath && ($scope.selectedNode.processType === 'share_dir' ||
                    $scope.selectedNode.processType === 'user_share_dir' ||
                    $scope.selectedNode.processType === 'admin_dir' || !auxo.isMine($scope.selectedNode)));
            } else if ("dir" === name) {
                return !$scope.selectedNode || ($scope.selectedNodePath && ($scope.selectedNode.processType === 'share_dir' ||
                    $scope.selectedNode.processType === 'user_share_dir' ||
                    $scope.selectedNode.processType === 'admin_dir' || !auxo.isMine($scope.selectedNode)));
            } else if ("import" === name) {
                return !$scope.selectedNode || ($scope.selectedNodePath && ($scope.selectedNode.processType === 'share_dir' ||
                    $scope.selectedNode.processType === 'user_share_dir' ||
                    $scope.selectedNode.processType === 'admin_dir') ||
                    ($scope.selectedNode.processType === 'user_dir' && $scope.selectedNode.name === "admin") ||
                    !auxo.canChange($scope.selectedNode)) ;
            } else if ("export" === name) {
                return !$scope.selectedNode ||($scope.selectedNodePath && ($scope.selectedNode.processType === 'share_dir' ||
                    $scope.selectedNode.processType === 'user_share_dir' ||
                    $scope.selectedNode.processType === 'admin_dir' ) ||
                    ($scope.selectedNode.processType === 'user_dir' && $scope.selectedNode.name === "admin") ||
                    !auxo.canChange($scope.selectedNode));
            } else if ("history" === name) {
                return !$scope.selectedNode || ($scope.selectedNodePath && $scope.selectedNode.processType === 'admin_dir' ||
                    $scope.selectedNode.processType === 'user_share_dir' ||
                    $scope.selectedNode.processType === 'user_dir');
            }
        }

        //获取选中的ids
        $scope.getSelectedRowIds = function () {
            var ids = [];
            for (var i = 0; i < $scope.selectedRows.length; i++) {
                ids.push($scope.selectedRows[i].id);
            }
            return ids;
        }

        $scope.batchShare = function () {
            if($scope.isButtonDisabled("share")) return;
            if (!$scope.selectedNode || $scope.getRootNodeName() === 'share_category' || !auxo.isMine($scope.selectedNode)) {
                auxo.openErrorDialog($scope, ngDialog, "仅支持共享当前用户拥有目录下内容");
                return;
            }
            var node = $scope.selectedNode;
            var msg = "要修改'" + $scope.selectedNode.name + "'及其子目录的共享设置吗？";

            auxo.sgDialogService.confirm(auxo.buildErrorMsg(msg, "question"), function (result) {
                if (result) {
                    var openDialog = function (entity) {
                        auxo.sgDialogService.openModal({
                            templateUrl: 'app/process/share.html',
                            data: {editingNode: entity},
                            callback: function () {
                                $scope.onNodeToggle($scope.parentNode, true);
                            },
                            width: 800
                        });
                    }
                    Restangular.one("europa/process/" + node.id + "?includes=process").get().then(function (entity) {
                        openDialog(entity);
                    })
                }
            }, "确认");
        }

        $scope.deleteNode = function () {
            if($scope.isButtonDisabled("delete")) return;
            if (!$scope.selectedRows || $scope.selectedRows.length === 0) {
                if (!$scope.selectedNode) {
                    return;
                } else {
                    var ids = [];
                    ids.push($scope.selectedNode.id);
                    if ($scope.getRootNodeName() === 'share_category' || $scope.getRootNodeName() === 'default_category') {
                        auxo.openErrorDialog($scope, ngDialog, "can't delete system default or share directory.");
                        return;
                    }
                    auxo.sgDialogService.confirm(auxo.buildErrorMsg("要删除'" + $scope.selectedNode.name + "'及其子目录吗？", "question"), function (result) {
                        if (result) {
                            Restangular.all("europa/process").customPOST(ids, "removeList").then(function (d) {
                                if ($scope.parentNode) {
                                    //auxo.array.removeAll($scope.parentNode.children);
                                    removeTreeNode($scope.selectedNode);
                                    $scope.onSelected($scope.parentNode, $scope.parentNode.parentNode, $scope.selectedNodePath.shift());
                                } else {
                                    $state.reload();
                                }

                            }, function (err) {
                                auxo.openErrorDialog($scope, ngDialog, err.data.err);
                            });
                        }
                    }, "确认");
                }
            } else {
                //获取选中的id
                function getSelectRowIds() {
                    var ids = [];
                    for (var i = 0; i < $scope.selectedRows.length; i++) {
                        ids.push($scope.selectedRows[i].id);
                    }
                    return ids;
                }

                auxo.sgDialogService.confirm(auxo.buildErrorMsg("要删除" + $scope.selectedRows.length + "个Process吗？", "question"), function (result) {
                    if (result) {
                        var ids = getSelectRowIds();
                        Restangular.all("europa/process").customPOST(ids, "removeList").then(function (d) {
                            auxo.array.removeAll($scope.selectedRows)
                            $scope.onSelected($scope.selectedNode, $scope.parentNode, $scope.selectedNodePath);
                        }, function (err) {
                            auxo.openErrorDialog($scope, ngDialog, err.data.err);
                        });
                    }
                }, "确认");
            }
        }

        $scope.onSelected = function (node, $parentNode, $path) {
            $scope.queryWord = "";
            $scope.selectedNode = node;
            $scope.parentNode = $parentNode;
            $scope.selectedNodePath = $path ? ($.isFunction($path) ? $path() : $path) : undefined;

            function resetQuery() {
                $scope.currPage = 1;
                $scope.reverse = true;
                $scope.sorts = "lastModifiedTime"
                $scope.ptableState = {
                    pagination: {
                        start: $scope.currPage > 0 ? $scope.currPage - 1 : 0,
                        totalItemCount: 0
                    },
                    sort: {
                        predicate: $scope.sorts,
                        reverse: $scope.reverse
                    }
                }
            }
            $scope.fetchPage($scope.ptableState);

            initData();

            $state.go('design.process');

            $scope.queryWord = "";

        }

        $scope.onNodeToggle = function (node, expanded) {
            if (expanded) {
                Restangular.one("europa/process/" + node.id + "?includes=dir;user_dir;user_share_dir").get().then(function (e) {
                    auxo.array.removeAll(node.children);
                    auxo.array.forEach(e.children, function (i) {
                        if ((i.processType === "dir" || i.processType === "user_dir" || i.processType === "user_share_dir"))
                            node.children.push(i);
                    })
                    sortTree(node.children);
                });
            }
        }


        $scope.fetchPage2 = function (tableState) {

            $scope.fetchPage(tableState)

//            $scope.queryWord = "";
        }

        $scope.initSplitter = function () {
            $scope.splitter = $('#foo').height(500).split({
                orientation: 'vertical',
                limit: 280,
                position: '30%', // if there is no percentage it interpret it as pixels
                onDrag: function (event) {
                    console.log($scope.splitter.position());
                }
            });
        }

        $scope.editResource = function () {
            if ($scope.selectedRows.length > 1) {
                auxo.showErrorMsg('仅支持选中一条流程进行重命名')
            } else if ($scope.selectedRows.length == 1) {
                $scope.renameProcess($scope.selectedRows[0]);
            } else {
                if ($scope.selectedNode) {
                    $scope.addOrEditDir($scope.selectedNode);
                }
            }
        }

        $scope.entity = angular.toJson($scope.entity, true);

        $scope.hideShareButton = function (row) {
            return row.owner != auxo.Auth.user.name;
        }

        $scope.shareProcessWith = function (node) {
            var openDialog = function (entity) {
                auxo.sgDialogService.openModal({
                    templateUrl: 'app/process/share.html',
                    data: {editingNode: entity},
                    callback: function (newData) {
                        if (newData) {
                            $scope.onSelected($scope.selectedNode, $scope.parentNode, $scope.selectedNodePath);
                        }
                    },
                    width: 800
                });
            }
            Restangular.one("europa/process/" + node.id + "?includes=process").get().then(function (entity) {
                openDialog(entity);
            })
        }

        function verifySelectedNode(type) {
            //$scope.callbackResult = "No callbacks yet";
            if (type === 'process') {
                if (!$scope.selectedNode || ["", "root", "dir", "user_dir", "share_dir"].indexOf($scope.selectedNode.processType) <= 0) {
                    auxo.alert(null, "请选择数据集或者子目录", "提示")
                    return;
                }
            }
            return true;
        }

        $scope.doQuery = function (queryWord) {
            $scope.queryWord = queryWord;
            delete $scope.offset;
            delete $scope.currPage;
            $scope.other.ts = new Date().getTime();
            reloadPage();
        }

        $scope.doQuery2 = function () {
            $scope.fetchPage2($scope.ptableState);
        }


        //daterangepicker时间插件apply对应方法
        $scope.onDateRangeApply2 = function (ev, picker) {
            if (ev.$parent.dateRange.startDate)
                $scope.startDate = $filter('date')(ev.$parent.dateRange.startDate.toDate(), "yyyy-MM-dd")
            else
                $scope.startDate = ""
            if (ev.$parent.dateRange.endDate)
                $scope.endDate = $filter('date')(ev.$parent.dateRange.endDate.toDate(), "yyyy-MM-dd")
            else
                $scope.endDate = ""
            $scope.dateRange = ev.$parent.dateRange;
            $scope.doQuery2();
        };

        //为时间input添加keydown事件，指定backspace
        $scope.keydown2 = function ($event, dataRange) {
            if($event.keyCode==46){
                $event.target.value = "";
                dataRange.startDate = null;
                dataRange.endDate = null;
                $scope.dateRange = dataRange;
                $scope.startDate = "";
                $scope.endDate = "";
                $scope.doQuery2();
            }
        };


        $scope.openAddProcessDialog = function (title, value, callback, sgDialogService, width, prompt) {
            if (!width || width < 500)
                width = 500;

            var openDialog = function () {
                auxo.sgDialogService.openModal({
                    template: "<div><label>名字：</label><i>" + prompt + "</i><input data-ng-model='flowName' class='form-control' style='width:100%;' required /> </div>" +
                    "<div><label>Process类型：</label><select class='form-control' data-ng-model='flowType'><option value='dataflow' selected='selected'>dataflow</option>" +
                    "<option value='streamflow'>streamflow</option><option value='workflow'>workflow</option></select></div>",

                    controller: function ($scope, Restangular, modalInstance, hotkeys) {
                        $scope.ok = function () {
                            if (!isOkDisabled())
                                modalInstance.closeModal({flowName: $scope.flowName, flowType: $scope.flowType});
                        }

                        $scope.cancel = function () {
                            modalInstance.dismiss();
                        }

                        hotkeys.bindTo($scope)
                            .add({
                                combo: 'esc',
                                description: 'call cancel',
                                callback: function (event) {
                                    event.preventDefault();
                                    $scope.cancel()
                                }
                            })
                            .add({
                                combo: 'enter',
                                description: 'call ok',
                                allowIn: ['INPUT'],
                                callback: function (event) {
                                    event.preventDefault();
                                    $scope.ok()
                                }
                            })

                        function isOkDisabled() {
                            if ($scope.flowName === undefined || $scope.flowName.length == 0
                                || $scope.flowType === undefined || !($scope.flowType === 'dataflow'
                                    || $scope.flowType === 'workflow' || $scope.flowType === 'streamflow')) {
                                return true;
                            }
                            return false;
                        }

                        $scope.modalButtons = [
                            {
                                action: $scope.ok,
                                text: "确定", class: "btn-primary",
                                disabled: function () {
                                    return isOkDisabled();
                                }
                            },
                            {
                                action: $scope.cancel,
                                text: "取消", class: "btn-warning"
                            }
                        ];
                        $scope.closeModal = $scope.cancel
                    },
                    data: {input: value, title: title},
                    callback: function (result) {
                        if (callback)
                            callback(result)
                    },
                    width: width
                });
            }
            openDialog();
        }

        var initData = function () {
            auxo.meta.process = {
                currUrl: "/europa/process",
                restRootPath: "/europa/process",
                detailTemplate: "",
                entityDisplayName: "Process",
                getBaseFilter: function () {
                    if ($scope.selectedNodePath && !auxo.isMine($scope.selectedNode) && auxo.Auth.user.role.title != 'admin') {
                        if($scope.selectedNode.processType === 'share_dir') {
                            return "parentId=" + $scope.selectedNode.id + "&processType=process&owner=" + auxo.Auth.user.name;
                        } else {
                            var shareString = auxo.Auth.user.tenant + ":" + auxo.Auth.user.name;
                            return "parentId=" + $scope.selectedNode.id + "&processType=process&sharedUsers=" + shareString + ":r|" + shareString + ":rw|";
                        }
                    } else if(!$scope.selectedNode){
                        return "processType=process";
                    } else {
                        if($scope.selectedNode.processType === "user_dir" && !$scope.selectedNode.path)
                            $scope.selectedNode.path = $scope.selectedNode.tenant+'/'+$scope.selectedNode.name;
                        if($scope.queryWord && $scope.queryWord.length>0 && $scope.selectedNode.path){
                            return "path=" + $scope.selectedNode.path + "&processType=process";
                         }else{
                            if($scope.queryWord && $scope.queryWord.length>0 && !$scope.selectedNode.path){
                                return "processType=process";
                            }else
                            return "parentId=" + $scope.selectedNode.id + "&processType=process";
                        }
                    }
                },
                displayMap: {"dir": "目录", "process": "Process"},
                rowHeaders: [
                    {name: "name", disName: "名称", sortName: "name_sort", converter:function(value,row){
                          if($scope.queryWord && row.path)
                           return row.path;
                           else
                           return value;
                    }},
                    {
                        name: "processType", "disName": "类型", converter: function (value, row) {
                        var r;
                        if (row.attributes.flowType) {
                            r = row.attributes.flowType;
                        } else {
                            r = auxo.meta.process.displayMap[value];
                        }
                        return r;
                    }
                    },
                    //{name: "version", "disName": "版本", converter: auxo.same},
                    {name: "tenant", disName: "租户", converter: auxo.same},
                    {name: "owner", disName: "拥有者", converter: auxo.same},
                    {name: "creator", disName: "创建人", converter: auxo.same},
                    {name: "createTime", disName: "创建时间", converter: auxo.date2str},
                    {name: "lastModifier", disName: "修改人", converter: auxo.same},
                    {name: "lastModifiedTime", disName: "修改时间", converter: auxo.date2str}
                ],
                sort: {predicate: "lastModifiedTime", reverse: true}
            };

            CrudBaseController.call(this, auxo.meta.process, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
        }

        initData();


    });


angular.module('AuxoApp')
    .controller('AddProcessController', function ($state, $filter, $scope, $location, $window, $http, $stateParams, Restangular,
                                                  ngDialog, sgDialogService) {

    });

