angular.module('AuxoApp')
    .controller('SchemaFromDatasetController', function ($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, modalInstance,ngTreetableParams) {
        var isNew = !$scope.editingNode || !$scope.editingNode.id;

        $scope.error = "";
        //
        $scope.selectedNode = null;

        $scope.schemaEntity = {
            "id": "",
            "name": "",
            "fields": []
        };

        angular.merge($scope.schemaEntity, $scope.editingNode);

        Restangular.all("europa/resource/roots").getList({includes:"schema_dir;$Schemas",excludes:"dataset_dir,datasource_dir;standard_dir",strict:"true"}).then(function(roots) {
            $scope.dataForTheTree = roots;
        });

        $scope.meta = {
            fields: [
                auxo.form.buildItem({$name:"name", maxLength:100, data:$scope.schemaEntity }),
                auxo.form.buildItem({$name:"description", maxLength:300, optional:true, data: $scope.schemaEntity})
            ]
        }

        auxo.setupCommonTree($scope, Restangular);

        $scope.onSelectedOld = $scope.onSelected;
        $scope.onSelected = function (node) {
            $scope.onSelectedOld(node);
            $scope.schemaEntity.path = $scope.selectedNode.path;
        }

        $scope.onNodeToggle = function (node, expanded) {
            console.log("########" + node.name + ";" + expanded)
            if(expanded && node.resType !== 'user') {
                auxo.array.removeAll(node.children);

                Restangular.one("europa/resource", node.id).get({includes: "dir", tenant:node.tenant}).then(function (e) {
                    angular.merge(node, e);
                    auxo.array.removeAll(node.children);
                    auxo.array.forEach(e.children, function (i) {
                        if (i.resType === "dir")
                            node.children.push(i);
                    })
                    $scope.sortTree(node.children);
                })
            }
        }

        function validate(dataForSave) {
            if(!dataForSave.name )
                return "名称不能为空"
            if(!dataForSave.fields || dataForSave.fields.length === 0)
                return "Schema字段不能为空";
            if(!dataForSave.path) {
                return "请选择要挂载的目录";
            }
        }

        function save () {
            $scope.saving = true;

            var dataForSave = auxo.clone($scope.schemaEntity)

            //adjust data begin
            //adjust data end
            var msg = validate(dataForSave);
            if(msg) {
                auxo.sgDialogService.alert(msg, "错误", "提示")
                return;
            }

            if (!dataForSave.id) {
                delete  dataForSave.id;
            }
                Restangular.all("schemas").post(dataForSave).then(
                    function(resp){
                        alert("保存成功！");
                        resp.schemaName = dataForSave.name;
                        yes(resp)
                    },
                    function(es) {
                        auxo.showErrorMsg(es);
                    });
            // } else {
            //     Restangular.one("schemas", dataForSave.id)
            //         .customPUT(dataForSave)
            //         .then(
            //             function(){
            //                 yes(dataForSave.id)
            //             },
            //             function(es) {
            //                 auxo.showErrorMsg(es);
            //             });
            // }
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

        $scope.title =  "Schema提取";
        $scope.modalButtons = [
            {
                action: save, text: "确定", class: "btn-primary",
                disabled: function () {if($scope.readonly) return true;},
                hide: function () { }
            },
            {
                action: $scope.cancel, text: "取消", class: "btn-warning",
                hide: function () { return $scope.page === 'preview' }
            },
//            auxo.buildMessageButton($scope.datasetEntity)
        ];

        auxo.bindEscEnterHotkey($scope)
    })