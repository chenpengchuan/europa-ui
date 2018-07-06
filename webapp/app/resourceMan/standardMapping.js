angular.module('AuxoApp')
.controller('StandardMappingController', function ($filter, $scope, $location, $window, $http,$stateParams, Restangular,ngTreetableParams,modalInstance, ngDialog) {
    var isNew = !$scope.editingNode || !$scope.editingNode.id;

    $scope.error="";

    $scope.standards = [];
    $scope.standardEnum = [];
    $scope.rowCollection = [];
    $scope.standardMapping = [];
    $scope.selectedRows = [];

    $scope.sourceItems = [];
    $scope.targetItems = [];
    $scope.item = {sourceItem:"",targetItem:"" ,targetItem2:""};

    var _id = 0;

    function getId() {
        return _id++;
    }

    $scope.entity={id:"", name:"", type:"standardMapping", description:"",
        attributes: {source:"", target:"",mapping:$scope.standardMapping }};
    angular.extend($scope.entity, $scope.editingNode);
    if(!$scope.entity.attributes.mapping)
        $scope.entity.attributes.mapping = [];
    // $scope.standardMapping = $scope.entity.attributes.mapping;

    if(!isNew) {
        Restangular.one("europa/standardMappings").get({
            query: "",
            filter: "sId=" + $scope.entity.id,
            limit: 10000
        }).then(function (facetResult) {
            auxo.array.forEach(facetResult.content, function (e) {
                $scope.standardMapping.push(e);
                $scope.rowCollection.push(e);
            })
        })
    }

    Restangular.one("europa/standardbd").get({query:"",filter:"type=standard", limit:10000}).then(function (facetResult) {
        auxo.array.forEach(facetResult.content, function (e) {
            $scope.standards.push(e);
            // $scope.standardEnum.push({name:e.path.concat("/").concat(e.name), value:e.id});
        })
    })

    var onSelectChange = function (data, item) {
        var id = data[item.$name];
        var items = $scope.sourceItems;
        if(item.$name === 'target') {
            items = $scope.targetItems;
        }
        auxo.array.removeAll(items);
        Restangular.one("europa/standards").get({query:"",filter:"sId="+id, limit:10000}).then(function (facetResult) {
            auxo.array.forEach(facetResult.content, function (e) {
                items.push(e.name);
            })
        })
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
            auxo.form.buildItem({$name: "source", label: "源标准", data: $scope.entity.attributes, selectObjEnum:$scope.standardEnum, onSelectChange: onSelectChange }),
            auxo.form.buildItem({$name: "description", label: "描述", data: $scope.entity, optional:true}),
            auxo.form.buildItem({$name: "chineseName", label: "中文名",type:"String", data: $scope.entity.attributes, tooltip: "", validator:"", isOptional: function () {return true; }}),
            auxo.form.buildItem({$name: "target", label: "目标标准", data: $scope.entity.attributes, selectObjEnum:$scope.standardEnum, onSelectChange: onSelectChange })
        ],
        init: function () {
            auxo.array.forEach($scope.meta.fields, function (item) {
                item.class = "auxo-form-item";
                if(item.tooltip) {
                    item.tooltip = auxo.tooltips(item.tooltip);
                }
                item.input_length_class = "col-sm-9";
                item.label_length_class = "col-sm-3";
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

    if(!isNew) {
        onSelectChange($scope.entity.attributes, $scope.meta.fields[1]);
        onSelectChange($scope.entity.attributes, $scope.meta.fields[3]);
    }

    $scope.meta2 = {
        fields: [
            auxo.form.buildItem({$name: "sourceItem", label: "从",   data: $scope.item, selectEnum:$scope.sourceItems, optional:true }),
            auxo.form.buildItem({$name: "targetItem", label: "到",  data: $scope.item, selectEnum:$scope.targetItems, optional:true }),
            auxo.form.buildItem({$name: "targetItem2", label: "录入", data: $scope.item, optional:true }),
        ]
    }
    auxo.array.forEach($scope.meta2.fields, function (item) {
        item.class = "auxo-form-item";
        if (item.tooltip) {
            item.tooltip = auxo.tooltips(item.tooltip);
        }
        item.input_length_class = "col-sm-9";
        item.label_length_class = "col-sm-3";
    })

    $scope.addItem = function () {
        var item = {source: $scope.item.sourceItem, target:$scope.item.targetItem? $scope.item.targetItem: $scope.item.targetItem2, $id:getId()}
        $scope.standardMapping.push(item);
        $scope.rowCollection.push(item);
    }

    $scope.deleteNode = function () {
        if(!$scope.selectedRows || $scope.selectedRows.length === 0)
            return;

        auxo.sgDialogService.confirm(auxo.buildErrorMsg("确定要删除所选的项吗？","question"), function (result) {
            if(result) {
                var remove = function (rows,e) {
                    auxo.array.forEach(rows, function (e1,i) {
                        if(e.$id) {
                            if(e.$id === e1.$id) {
                                auxo.array.remove(rows, i);
                                return false;
                            }
                        } else {
                            if(e.id === e1.id) {
                                auxo.array.remove(rows, i);
                                return false;
                            }
                        }
                    })
                }
                auxo.array.forEach($scope.selectedRows, function (e) {
                    remove($scope.rowCollection,e);
                    remove($scope.standardMapping,e);
                })
            }
        }, "确认");
    }

    $scope.isButtonDisabled = function(name) {
        if(name === 'delete') {
            return $scope.selectedRows.length === 0;
        } else if(name === 'addItem') {
            return !$scope.item.sourceItem;
        } else if(name === 'add') {
           // return !$scope.item.sourceItem;
        }
    }

    $scope.editRow = function (row) {
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/standardMappingEdit.html',
                data:{
                    editingNode:row,
                    sourceItems: $scope.sourceItems,
                    targetItems: $scope.targetItems
                },
                callback: function(newData){
                    if(newData) {
                        auxo.array.forEach($scope.entity.attributes.mapping, function (e) {
                            if(e.id === newData.id) {
                                e.source = newData.source;
                                e.target = newData.target;
                                return false;
                            }
                        })
                    }

                },
                width:800
            });
        }
        openDialog();
    }
    
    $scope.import = function () {
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/standardMappingImport.html',
                data:{editingNode:$scope.entity, codeMap:$scope.standardCodeMap},
                callback: function(newData){
                    if(newData) {
                        auxo.array.forEach(newData, function (e) {
                            e.$id = getId()
                            $scope.rowCollection.push(e);
                            $scope.standardMapping.push(e);
                        })
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
                auxo.array.removeAll($scope.rowCollection);
                auxo.array.removeAll($scope.standardMapping);
                auxo.array.removeAll($scope.selectedRows);
            }
        }, "确认");
    }

    $scope.addNode = function () {
        var openDialog = function(){
            auxo.sgDialogService.openModal({
                templateUrl : 'app/resourceMan/standardMappingEdit.html',
                data:{
                    editingNode:{},
                    sourceItems: $scope.sourceItems,
                    targetItems: $scope.targetItems
                },
                callback: function(newData){
                    if(newData) {
                        newData.$id = getId();
                        $scope.rowCollection.push(newData);
                        $scope.standardMapping.push(newData);
                    }
                },
                width:800
            });
        }
        openDialog();
    }

    $scope.doQuery = function () {
        auxo.array.removeAll($scope.rowCollection);

        var queryWord = $scope.queryWord;

        if(queryWord) {
            auxo.array.forEachReverse($scope.standardMapping,function (e) {
                if(e.source.indexOf(queryWord)>=0 || e.target.indexOf(queryWord) >=0)
                    $scope.rowCollection.push(e);
            })
        }else {
            auxo.array.forEachReverse($scope.standardMapping,function (e) {
                    $scope.rowCollection.push(e);
            })
        }

        $scope.fetchPage($scope.ptableState);
    }
    
    $scope.fetchPage = function (ptableState) {
        if(ptableState && ptableState.sort ) {
            if(ptableState.sort.predicate) {
                $scope.rowCollection.sort(function(a1, a2) {
                    var v1 = a1[ptableState.sort.predicate];
                    var v2 = a2[ptableState.sort.predicate];
                    if(ptableState.sort.reverse)
                        return v2>v1;
                    return v1>v2
                })
            }
        }
    }

    $scope.validate = function() {
        $scope.error = "";
        if(!$scope.entity.name) {
            $scope.error = "名称不能为空！"
        } else if(!$scope.entity.attributes.source) {
            $scope.error = "源标准不能为空！"
        } else if(!$scope.entity.attributes.target) {
            $scope.error = "目标标准不能为空！"
        } else if(!$scope.entity.attributes.mapping.length === 0) {
            $scope.error = "标准映射项不能为0！"
        }

        return $scope.error;
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

        entityCopy.attributes.mapping = $scope.standardMapping;

        auxo.array.forEach(entityCopy.attributes.mapping, function (e) {
            delete e.$id;
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
                if (!$scope.validate() && !$scope.saving)
                    return false;
                return true;
            }
        },
        {
            action: $scope.cancel,
            text: "取消", class: "btn-warning"
        },
//        auxo.buildMessageButton($scope.entity)
    ];

    auxo.bindEscEnterHotkey($scope)


    $scope.rowHeaders = [
            {name : "source", disName : "源", converter : auxo.same},
            {name : "target", disName : "目标", converter : auxo.same}
        ]


});