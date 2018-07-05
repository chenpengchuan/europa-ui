angular.module('AuxoApp')
    .controller('StandardController', function ($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, modalInstance) {
        var isNew = !$scope.editingNode || !$scope.editingNode.id;

        $scope.error="";

        $scope.entity={id:"", name:"", resType:"standard",parentId:"",index:0, description:""};
        angular.extend($scope.entity, $scope.editingNode);
        $scope.entity.attributes = {standards:[]}
        if($scope.entity.id) {
            Restangular.one("europa/standards").get({query:"",filter:"sId="+$scope.entity.id + ($scope.editingNode.owner? ("&owner=" + $scope.editingNode.owner):""), limit:10000,}).then(function (facetResult) {
                $scope.entity.attributes.standards = facetResult.content;
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
                auxo.form.buildItem({$name: "description", label: "描述", data: $scope.entity, }),
                {$name:"standards", label:"条目", data: $scope.entity.attributes,type:"DataFrame",
                    content: [
                        { $name: 'name', label: '名称', type: 'String'},
                        { $name: 'code', label: '编号', type: "String"},
                        { $name: 'parentCode', label: '父编号', type: "String", optional: true}
                    ]
                }
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

        $scope.validate = function() {
            $scope.error = "";
            auxo.array.forEach($scope.meta.fields, function (e) {
                if(e.validator) {
                    e.validator(e);
                }
                if($scope.error)
                    return false;
            })

            var map = {};
            auxo.array.forEach($scope.entity.attributes.standards, function (e) {
                if(!e.code) {
                    $scope.error ="编码不能为空值"
                }else if(map[e.code]) {
                    $scope.error ="编码不能重复：" + e.code;
                } else
                    map[e.code] = e;
                if(!e.name) {
                    $scope.error ="名称不能为空值"
                }
            })

            return !$scope.error;
        }

        function save() {
            $scope.validate();
            if($scope.error)
                return;
            $scope.saving = true;

            var entityCopy = auxo.clone($scope.entity);
            //adjust data begin
            //adjust data end

            if (isNew) {
                Restangular.all("europa/resource").post(entityCopy).then(
                    function(resp){
                        $scope.saving = false;
                        yes(resp.id)
                    },
                    function(es) {
                        $scope.saving = false;
                        auxo.showErrorMsg(es);
                    });
            } else {
                Restangular.one("europa/resource", entityCopy.id)
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

        $scope.closeModal = function () {
            $scope.cancel();
        }

        $scope.title =  '存储池设置';
        $scope.modalButtons = [
            {
                action: save,
                text: "确定", class: "btn-primary",
                disabled: function () {
                    if ($scope.entity.attributes.standards.length  && $scope.entity.name)
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