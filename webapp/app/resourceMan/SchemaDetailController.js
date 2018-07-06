angular.module('AuxoApp')
    .controller('SchemaDetailController', function ($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, modalInstance,ngTreetableParams) {
        var isNew = !$scope.editingNode || !$scope.editingNode.id;

        $scope.error = "";
        $scope.readonly = false;

        var schemaCopy = null;
        $scope.schemaEntity = {
            id: "",
            name :"",
            path : "",
            description: "",
            fields: []
        };

        function initSchema() {
            if(schemaCopy)
                $scope.schemaFields = auxo.clone(schemaCopy.fields);

            $scope.meta = {
                fields: [
                    auxo.form.buildItem({$name: "name", maxLength: 100}),
                    auxo.form.buildItem({$name: "description", maxLength: 300, optional:true} )
                ]
            }
            auxo.array.forEach($scope.meta.fields, function (e) {
                if ($scope.schemaEntity[e.$name] !== undefined)
                    e.data = $scope.schemaEntity;
            })
        }

        if(!isNew) {
            if($scope.editingNode.id){
                Restangular.one("schemas", $scope.editingNode.id).get().then(function (results) {
                    schemaCopy = results;
                    $scope.schemaEntity = auxo.clone(results);
                    $scope.schemaFields = auxo.clone(schemaCopy.fields);
                    initSchema();
                });
            }
        } else
            initSchema();

        function validate(dataForSave) {
            if(!dataForSave.name)
                return "名称不能为空"
            if(!dataForSave.fields || dataForSave.fields.length === 0)
                return "Schema字段不能为空"
            var error = ""
            auxo.array.forEach(dataForSave.fields, function (e) {
                if(!e.type) {
                    error += e.name + ": 类型有误！";
                }
            })
            return error;
        }

        function save () {

            if ($scope.editingNode.resource)
                $scope.schemaEntity.resource =  $scope.editingNode.resource;

            var dataForSave = auxo.clone($scope.schemaEntity)

            if(!dataForSave.id)
                delete  dataForSave.id;

            //adjust data begin
            //adjust data end
            var msg = validate(dataForSave);
            if(msg) {
                auxo.sgDialogService.alert(msg, "错误", "提示")
                return;
            }

            if (!dataForSave.id) {
                Restangular.all("schemas").post(dataForSave).then(
                    function(resp){
                        yes(resp)
                    },
                    function(es) {
                        auxo.showErrorMsg(es);
                    }
                );

            } else {
                if(dataForSave.enabled){
                    delete dataForSave.enabled
                }
                if (dataForSave.isSelected){
                    delete dataForSave.isSelected;
                }
                Restangular.one("schemas", dataForSave.id)
                    .customPUT(dataForSave)
                    .then(
                        function(){
                            yes(dataForSave.id)
                        },
                        function(es) {
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

        $scope.closeModal = function () { $scope.cancel(); }

        $scope.title = "Schema编辑/查看";
        $scope.modalButtons = [
            {
                action: save, text: "确定", class: "btn-primary",
                disabled: function () { if($scope.readonly) return true;},
                hide: function () { }
            },
            {
                action: $scope.cancel, text: "取消", class: "btn-warning",
                hide: function () {  }
            },
//            auxo.buildMessageButton($scope.datasetEntity)
        ];

        auxo.bindEscEnterHotkey($scope)
    })