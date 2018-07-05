angular.module('AuxoApp')
.controller('StandardDetailController', function ($filter, $scope, $location, $window, $http,$stateParams, Restangular,ngTreetableParams,modalInstance, ngDialog) {
    var isNew = !$scope.editingNode || !$scope.editingNode.id;

    $scope.error="";

    $scope.dataForTheTree = [];
    $scope.selectedNode = null;
    $scope.treeDataCopy = [];
    $scope.standardCodeMap = {};
    $scope.standardCount = 0;

    $scope.entity={id:"", name:"", type:"standard", description:"",attributes:{}};
    angular.extend($scope.entity, $scope.editingNode);

    Restangular.one("europa/standards").get({query:"",filter:"sId="+$scope.entity.id +($scope.editingNode.owner? ("&owner=" + $scope.editingNode.owner):""), limit:10000}).then(function (facetResult) {
        auxo.array.forEach(facetResult.content, function (e) {
            $scope.standardCodeMap[e.code] = e;
        })
        auxo.listToTree(facetResult.content,$scope.dataForTheTree);
        initTreeTable();
        $scope.treeDataCopy = [];
        auxo.array.insertArray($scope.treeDataCopy, auxo.clone($scope.dataForTheTree));
    })

    function updateStandsCount() {
        $scope.standardCount = Object.keys($scope.standardCodeMap).length
    }

    $scope.meta = {
        title: "标准设置",
        fields : [
            auxo.form.buildItem(
                {$name: "name", label: "名称", tooltip: ["汉字,字母,数字和下划线的组合,长度4-30，同一目录下唯一"],
                    maxLength:100, minLength:1, noMatch:/[^\u4e00-\u9fbfa-zA-Z0-9_]/g, noMatchMsg: "汉字,字母,数字,下划线的组合!",
                    data: $scope.entity
                }
            ),
            auxo.form.buildItem({$name: "description", label: "描述", data: $scope.entity, optional:true })
        ],
        init: function () {
            auxo.array.forEach($scope.meta.fields, function (item) {
                if(item.tooltip) {
                    item.tooltip = auxo.tooltips(item.tooltip);
                }
                item.input_length_class = "col-sm-10";
                item.label_length_class = "col-sm-2";
                //item.label_align = "left";
                //item.data = $scope.entity;
                if(!item.isOptional)
                    item.isOptional = function () { return false; }
                if(auxo.array.contains(["id"],item.$name)){
                    item.readonly = function () {
                        return !isNew
                    }
                }
                item.validator2 = item.validator;
                item.validator = function (i) {
                    $scope.error = "";
                    var v = i.data[i.$name];
                    if(i.validator2)
                        i.validator2(i);
                }
            })
        }
    }
    $scope.meta.init();

    $scope.doQuery = function () {
        auxo.array.removeAll($scope.dataForTheTree);
        auxo.array.insertArray($scope.dataForTheTree, auxo.clone($scope.treeDataCopy))
        if(!$scope.queryWord) {
            initTreeTable();
            return;
        }

        var queryWord = $scope.queryWord;

        var containers = [];
        //containers.push($scope.dataForTheTree);
        auxo.treeWalk($scope.dataForTheTree, function (key, value,path,parent) {
            if(value && value.children) {
                if(value.children.length === 0)
                    delete value.children;
                else
                    containers.push(value);
            }
        })

        while(true) {
            var go = false;
            auxo.array.forEachReverse(containers, function (e, i) {
                auxo.array.forEachReverse(e.children, function (e1, j) {
                    if (e1 && !e1.children) {
                        if (e1.name && e1.name.indexOf(queryWord) < 0) {
                            auxo.array.remove(e.children, j);
                            go = true;
                        }
                        if (j === 0 && e.children.length === 0) {
                            delete e.children;
                            go = true;
                        }
                    }
                })
            })
            if(!go)
                break;
        }

        auxo.array.forEachReverse($scope.dataForTheTree, function (e1, j) {
            if (e1 && !e1.children) {
                if (e1.name && e1.name.indexOf(queryWord) < 0) {
                    auxo.array.remove($scope.dataForTheTree, j);
                }
            }
        })

        initTreeTable();
    }


    $scope.dynamic_params = new ngTreetableParams({
        getNodes: function(parent) {
            var nodes = parent ? parent.children : $scope.dataForTheTree;
            return nodes;
        },
        getTemplate: function(node) {
            return 'app/resourceMan/standardTreeTableTemplate.html';
        },
        options: {
            //initialState: "expanded",
            onNodeExpand: function() {
                console.log('A node was expanded!');
            },
            onNodeSelected: function (node) {
                console.log(node.name + ' node was selected!');
            },
            onInitialized: function () {
            }
        }
    });

    function initTreeTable() {
        updateStandsCount();
        if($scope.dynamic_params.refresh)
            $scope.dynamic_params.refresh()
        if(!$scope.selectedNode)
            return;
    }

    $scope.deleteNode = function () {
        if(!$scope.selectedNode)
            return;
        auxo.sgDialogService.confirm(auxo.buildErrorMsg("确定要删除所选的项及其子项吗？","question"), function (result) {
            if(result) {
                auxo.treeWalk($scope.dataForTheTree, function (key, value,path ,parent) {
                    if(value === $scope.selectedNode) {
                        auxo.array.remove(parent,key);
                        return 'break';
                    }
                })
                auxo.treeWalk($scope.treeDataCopy, function (key, value,path, parent) {
                    if(value && value.code === $scope.selectedNode.code) {
                        auxo.array.remove(parent,key);
                        return 'break';
                    }
                })

                auxo.treeWalk($scope.selectedNode, function (key, value) {
                    if(value && value.code)
                        delete $scope.standardCodeMap[$scope.selectedNode.code];
                })

                delete $scope.standardCodeMap[$scope.selectedNode.code];
                initTreeTable();
            }
        }, "确认");
    }

    var addRoot = function () {
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/standardEdit.html',
                data:{
                    editingNode:{
                        parentCode: "",
                        code:"",
                        name:""
                    },
                    codeMap:$scope.standardCodeMap
                },
                callback: function(newData){
                    if(newData) {
                        $scope.dataForTheTree.push(newData);
                        $scope.treeDataCopy.push(auxo.clone(newData))

                        $scope.standardCodeMap[newData.code] = newData
                        initTreeTable();
                    }
                },
                width:800
            });
        }
        openDialog();
    }

    $scope.addBrother = function () {
        if(!$scope.selectedNode) {
            addRoot();
            return;
        }

        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/standardEdit.html',
                data:{
                    editingNode:{
                        parentCode: $scope.selectedNode? $scope.selectedNode.parentCode:"",
                        code:$scope.selectedNode? $scope.selectedNode.code+"xxx":"",
                        name:$scope.selectedNode? $scope.selectedNode.name + "xxx":""
                    },
                    codeMap:$scope.standardCodeMap
                },
                callback: function(newData){
                    if(newData) {
                        var parentNode = null;
                        auxo.treeWalk($scope.dataForTheTree, function (key, value, path, parent) {
                            if (value === $scope.selectedNode) {
                                parent.push(newData);
                                parentNode = parent;
                                return "break;"
                            }
                        })
                        if (parentNode) {
                            auxo.treeWalk($scope.treeDataCopy, function (key, value) {
                                if (value && value.code === parentNode.code && value !== parentNode) {
                                    value.push(auxo.clone(newData));
                                    return "break";
                                }
                            })
                        }
                        $scope.standardCodeMap[newData.code] = newData
                        initTreeTable();
                    }

                },
                width:800
            });
        }
        openDialog();
    }

    $scope.addChild = function () {
        if(!$scope.selectedNode) {
            addRoot();
            return;
        }

        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/standardEdit.html',
                data:{editingNode:{parentCode: $scope.selectedNode.code,code:$scope.selectedNode.code+"xxx",name:$scope.selectedNode.name + "xxx"}, codeMap:$scope.standardCodeMap},
                callback: function(newData){
                    if(newData) {
                        if(!$scope.selectedNode.children)
                            $scope.selectedNode.children = [];
                        $scope.selectedNode.children.push(newData)

                        auxo.treeWalk($scope.treeDataCopy, function (key, value) {
                            if(value && value.code === $scope.selectedNode.code) {
                                if(!value.children)
                                    value.children = [];
                                value.children.push(auxo.clone(newData));
                                return "break";
                            }
                        })
                    }
                    $scope.standardCodeMap[newData.code] = newData
                    initTreeTable();
                },
                width:800
            });
        }
        openDialog();
    }

    $scope.isButtonDisabled = function(name) {
        if(name === 'delete') {
            return !$scope.selectedNode;
        } else if(name === 'addRoot') {
        } else if(name === 'addBrother' || name === 'addChild') {
            //return !$scope.selectedNode && $scope.treeDataCopy.length>0;
        } else if(name === "delete") {
            return !$scope.selectedNode;
        } else if(name ==="edit") {
            return !$scope.selectedNode;
        }
    }

    auxo.listToTree2 = function(list, tree) {
        var tree2 = []
        var nodeMap = {}
        auxo.array.forEach(list, function (e) {
            nodeMap[e.code] = e;
            if(!e.parentCode) {
                tree2.push(e)
            }
        })

        auxo.array.forEach(list, function (e) {
            if(e.parentCode) {
                var p = nodeMap[e.parentCode];
                if(!p.children)
                    p.children = [];
                p.children.push(e);
            }
        })
        auxo.array.insertArray(tree, tree2);
    }


    $scope.import = function () {
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/standardImport.html',
                data:{editingNode:$scope.entity, codeMap:$scope.standardCodeMap},
                callback: function(newData){
                    if(newData) {
                        $scope.standardCodeMap = {};
                        console.log("aa: " +new Date().getTime())
                        auxo.array.forEach(newData, function (e) {
                            $scope.standardCodeMap[e.code] = e;
                        })
                        auxo.array.removeAll($scope.dataForTheTree);
                        auxo.listToTree2(newData,$scope.dataForTheTree);
                        initTreeTable();
                        auxo.array.removeAll($scope.treeDataCopy);
                        auxo.array.insertArray($scope.treeDataCopy ,auxo.clone($scope.dataForTheTree));
                    }
                },
                width:800
            });
        }
        openDialog();
    }

    $scope.deleteAll = function () {
        auxo.sgDialogService.confirm(auxo.buildErrorMsg("确定要删除所有的项目吗？","question"), function (result) {
            if(result) {
                auxo.array.removeAll($scope.dataForTheTree);
                auxo.array.removeAll($scope.treeDataCopy);
                $scope.standardCodeMap = {};
                $scope.selectedNode = null;

                initTreeTable();
            }
        }, "确认");
    }

    $scope.edit = function () {
        if(!$scope.selectedNode) {
            return;
        }
        auxo.openInputDialog("编辑标准名",$scope.selectedNode.name,
            function (newValue) {
                if(newValue) {
                    $scope.selectedNode.name = newValue;
                    auxo.treeWalk($scope.treeDataCopy, function (key, value) {
                        if(value && value.code === $scope.selectedNode.code) {
                            value.name = newValue;
                        }
                    })
                }
            }
        )
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

    function save() {
        $scope.validate();
        if($scope.error)
            return;
        $scope.saving = true;
        $scope.dlgStatus = {text:"正在保存中...", getIcon: function () {
            return {"glyphicon glyphicon-info-sign":true }
        }};

        var entityCopy = auxo.clone($scope.entity);
        entityCopy.attributes.standards = [];

        var treeCopy = auxo.clone($scope.treeDataCopy);
        auxo.treeWalk(treeCopy, function (key, value) {
            if(value && value.code) {
                entityCopy.attributes.standards.push(value);
            }
        })
        auxo.array.forEach(entityCopy.attributes.standards, function (e) {
            delete e.children;
        })

        //adjust data begin
        //adjust data end

        if (isNew) {
            Restangular.all("europa/standardbd").post(entityCopy).then(
                function(resp){
                    $scope.saving = false;
                    yes(resp.id)
                },
                function(es) {
                    $scope.saving = false;
                    auxo.showErrorMsg(es);
                    $scope.dlgStatus = {text:"正在保存中...", getIcon: function () {
                        return {"glyphicon glyphicon-info-sign":true }
                    }};
                });
        } else {
            Restangular.one("europa/standardbd", entityCopy.id)
                .customPUT(entityCopy)
                .then(
                    function(){
                        $scope.saving = false;
                        yes(entityCopy.id)
                    },
                    function(es) {
                        $scope.saving = false;
                        auxo.showErrorMsg(es);
                    });
        }
    }

    function yes(data) {
        auxo.delHotkey($scope)
        modalInstance.closeModal(data);
    }

    // cancel click
    $scope.cancel = function () {
        auxo.delHotkey($scope)
        modalInstance.closeModal(false)
    }

    $scope.onNodeSelected = function (node) {
        $scope.selectedNode = node;
    }

    $scope.closeModal = function () {
        $scope.cancel();
    }

    $scope.title =  "标准配置";
    $scope.modalButtons = [
        {
            action: save,
            text: "确定", class: "btn-primary",
            disabled: function () {
                if ($scope.treeDataCopy && $scope.treeDataCopy.length>0  && $scope.entity.name && !$scope.saving)
                    return false;
                return true;
            }
        },
        {
            action: $scope.cancel,
            text: "取消", class: "btn-warning"
        }
    ];

    auxo.bindEscEnterHotkey($scope)

});