angular.module('AuxoApp')
.controller('StandardEditController', function ($filter, $scope, $location, $window, $http,$stateParams, Restangular,ngTreetableParams,modalInstance, ngDialog) {
        var isNew = !$scope.editingNode || !$scope.editingNode.id;

        $scope.error="";

        $scope.entity={id:"", name:"", code:"standard",parentCode:"",index:0};
        angular.extend($scope.entity, $scope.editingNode);

        $scope.meta = {
            title: "标准编辑",
            fields : [
                auxo.form.buildItem( { $name: 'name', label: '名称',minLength:1, tooltip:["默认值只做参考，如存在请修改"]}),
                auxo.form.buildItem( { $name: 'code', label: '编号',minLength:1, tooltip:["编号不能重复，默认值只做参考，如存在请修改"]}),
                auxo.form.buildItem( { $name: 'parentCode', label: '父编号',minLength:1, readonly:true, hidden:function () {return !$scope.entity.parentCode}}),
            ],
            init: function () {
                auxo.array.forEach($scope.meta.fields, function (item) {
                    if(item.tooltip) {
                        item.tooltip = auxo.tooltips(item.tooltip);
                    }
                    item.input_length_class = "col-sm-12";
                    item.label_length_class = "col-sm-12";
                    item.label_align = "left";
                    item.data = $scope.entity;
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

        var getCodeMap = function () {
            return $scope.codeMap;
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

            var e = $scope.entity;
            var map = getCodeMap();
            if(!e.name) {
                $scope.error ="名称不能为空值"
            } else if (!e.code) {
                $scope.error ="编码不能为空值"
            } else if(map[e.code]) {
                $scope.error ="编码不能重复：" + e.code;
            }

            return !$scope.error;
        }

        function save() {
            $scope.validate();
            if($scope.error)
                return;
            var entityCopy = auxo.clone($scope.entity);
            //adjust data begin
            //adjust data end
            yes(entityCopy);
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

        $scope.title =  '标准编辑';
        $scope.modalButtons = [
            {
                action: save,
                text: "确定", class: "btn-primary",
                disabled: function () {
                    if ($scope.entity.code && $scope.entity.name && !$scope.error)
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