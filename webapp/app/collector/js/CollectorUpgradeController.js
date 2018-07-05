
App.controller('CollectorUpgradeController', function CollectorUpgradeController($scope, $window, $http, $stateParams,Upload, $location,$timeout, ngDialog, Restangular, sgDialogService, Auth, modalInstance) {

    $scope.cancel = function () {
        modalInstance.dismiss();
        auxo.delHotkey($scope)
    };

    $scope.collector = $scope.fromparent.selected;
    $scope.id = $scope.collector[0].id;

    $scope.selectFiles = function(file){
        $scope.f = file;
    }

     $scope.uploadFiles = function() {

        $scope.destination = document.getElementById("destination").value;
        $scope.executeCmd = document.getElementById("executeCmd").value;
        $scope.cancel();
        file = $scope.f;
        destination = $scope.destination;
        executeCmd = $scope.executeCmd;
        restart = $scope.restart;
        if (file) {
            file.upload = Upload.upload({
                url: 'api/europa/collectors/' + $scope.id + "/upload",
                data: {file: file,restart:restart,destination:destination,executeCmd:executeCmd}
            });
            file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                    $scope.result = file.result;
                    auxo.sgDialogService.alert(file.result.msg, "提示");
                });
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 *
                    evt.loaded / evt.total));
            });
        }
        }

       $scope.restart = false;

       $scope.isRestart = function(){
              var obj = document.getElementsByName("restart");
               for(i=0; i<obj.length;i++){
                    if(obj[i].checked){
                        if(obj[i].value == '是'){
                            $scope.restart = true;
                        }
                        if(obj[i].value == '否'){
                            $scope.restart = false;
                        }
                        return  $scope.restart;
                    }
               }
              return "undefined";
       }

});