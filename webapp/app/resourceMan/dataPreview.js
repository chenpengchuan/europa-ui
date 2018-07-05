
App.controller('DataPreviewController', function ($scope, Restangular, modalInstance) {

    if($scope.editingNode.rowHeaders){
        $scope.rowHeaders = $scope.editingNode.rowHeaders;
        if($scope.editingNode.rowHeaders){
            $scope.rowCollection = $scope.editingNode.rowCollection
        }
    }else {
          var id = $scope.editingNode.id;

          $scope.previewLoading = true;

          $scope.doRefreshPreview = function () {
              $scope.previewLoading = true;
              Restangular.one("datasets", id).customGET("preview", {rows : 100, tenant:$scope.editingNode.tenant}).then(
                  function(pdo) {
                      $scope.previewLoading = false;
                      Restangular.one("schemas", $scope.editingNode.schema).get({tenant:$scope.editingNode.tenant}).then(function(dc) {
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

    }



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
        },
//        auxo.buildMessageButton($scope.editingNode)
    ];

    auxo.bindEscEnterHotkey($scope)
});
App.controller('sourceTablePreviewController', function ($scope, Restangular, modalInstance) {
    var result = $scope.result;
            $scope.rowHeaders = result.names;
            obj = angular.toJson(result.rows)
            $scope.rowCollection = result.rows? result.rows: [];
            $scope.page = "preview"
    $scope.cancel = function () {
        auxo.delHotkey($scope)
        modalInstance.closeModal(false)
    }
    $scope.closeModal = function () { $scope.cancel(); }
    $scope.title =  '数据源中的表预览';
    $scope.modalButtons = [
        {
            action: $scope.cancel, text: "确定", class: "btn-warning"
        }
    ];
    auxo.bindEscEnterHotkey($scope)
});
