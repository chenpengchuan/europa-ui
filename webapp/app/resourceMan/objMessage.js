angular.module('AuxoApp')
    .controller('ObjMessageController', function ($scope, modalInstance) {
        //need $scope.obj
        $scope.closeModal = function () {
            modalInstance.closeModal(false)
        }

        $scope.title =  'Message';
        $scope.modalButtons = [
            {
                action: $scope.closeModal,
                text: "取消", class: "btn-warning"
            }
        ];
    });