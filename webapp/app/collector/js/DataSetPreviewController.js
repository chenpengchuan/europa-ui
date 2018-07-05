App.controller('dataSetPreviewController', function ($scope, Restangular, modalInstance) {
    var id = $scope.editingNode.attributes.dataset.id;

    $scope.previewLoading = true;
    $scope.doRefreshPreview = function () {
        $scope.previewLoading = true;
        Restangular.one("datasets", id).customGET("preview", {rows : 100}).then(
            function(pdo) {
                $scope.previewLoading = false;
                Restangular.one("schemas", $scope.editingNode.attributes.schema.id).get().then(function(dc) {
                    $scope.previewError = null;
                    $scope.rowHeaders = dc.fields;
                    $scope.rowCollection = pdo;
                });
            }, function (errorResponse) {

                $scope.previewError = errorResponse.data;
                $scope.previewLoading = false;
            });
    };

    $scope.doRefreshPreview();

    // cancel click
    $scope.cancel = function () {
        auxo.delHotkey($scope)
        modalInstance.closeModal(false)
    }

    $scope.closeModal = function () { $scope.cancel(); }

    $scope.title =  '数据集预览';
    $scope.modalButtons = [
        {
            action: $scope.cancel, text: "确定", class: "btn-warning"
        }
//        ,
//        {
//            text: "信息", class: "btn-primary",
//            action:function () {
//                auxo.sgDialogService.openModal({
//                    templateUrl : 'app/resourceMan/objMessage.html',
//                    data:{obj: JSON.stringify($scope.editingNode,'',4)},
//                    width:800
//                });
//            },
//            hide: function () { return false}
//        }
    ];

    auxo.bindEscEnterHotkey($scope)
});
