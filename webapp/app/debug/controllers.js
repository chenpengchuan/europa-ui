App.controller('ExportTestController', function ($scope) {

    $scope.selectedTable = "";

    $scope.export = function () {
        var sp = {table: $scope.selectedTable};
        sp['X-AUTH-TOKEN'] = auxo.$rootScope.token;
        var url = '/api/mis/export?'+ $.param(sp);
        auxo.download(url);
    }

    $scope.count = 0;

    $scope.import = function () {

        var data = angular.fromJson($scope.jsonList);
        data = data.content;

        var msg = "";
        $scope.count = 0;

        function doImport() {
            if(data.length>0)
                auxo.Restangular.all("mis").customPOST(data[0], "import/" + $scope.selectedTable).then(
                    function (d) {
                        data.splice(0,1);
                        $scope.count++;
                        doImport();
                    }
                );
        }
        doImport();
    }
});


