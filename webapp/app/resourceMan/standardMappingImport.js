App.controller('StandardMappingImportController', ['$scope', 'Upload', '$timeout', 'modalInstance', function ($scope, Upload, $timeout, modalInstance) {


    $scope.data = [[]];
    $scope.treeMode = false;
    $scope.uploading = false;

    $scope.uploadFiles = function(file, errFiles) {
        if(!file.name.match(/^.*(\.xls)$/)) {
            auxo.sgDialogService.alert("请选择类型为xls的文件！")
            return;
        }
        $scope.uploading = true;
        $scope.dlgStatus = {text: "正在导入，请稍后......"}
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            file.upload = Upload.upload({
                url: 'api/europa/upload/read/excel?maxSheet=1&maxRow=10000&maxColumn=3',
                data: {file: file}
            });
            file.upload.then(function (response) {
                $timeout(function () {
                    $scope.data = response.data;
                    $scope.error = response.data.error;
                    if(!$scope.error) {
                        for(var a in response.data) {
                            $scope.sheetName = a;
                            $scope.data = response.data[a];
                            break;
                        }
                    }
                   // $scope.uploading = false;
                });
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
                $scope.dlgStatus = null;
                $scope.uploading = false;
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 *
                    evt.loaded / evt.total));
               // $scope.uploading = false;
            });
        }
    }

    $scope.lastNotify = function(last) {
        if(last) {
            $scope.dlgStatus = null;
            $scope.uploading = false;
        }
    }

    $scope.ok = function () {
        var list = [];
        auxo.array.forEach($scope.data, function (e, j) {
            if(j>0) {
                list.push( {source: e[0], target: e[1]});
            }
        })

        if($scope.treeMode) {
            list.sort(function (a,b) {
                return a.code.length - b.code.length;
            })
            auxo.array.forEachReverse(list, function (e, i) {
                for(var j=i-1;j>=0;j--) {
                    if(e.code.indexOf(list[j].code) === 0){
                        e.parentCode = list[j].code;
                        break;
                    }
                }
            })
            list.sort(function (a, b) {
                return a.index - b.index;
            })
            /*
            auxo.array.forEach(list, function (e) {
                if(e.parentCode)
                    $scope.data[e.index].push(e.parentCode);
            })
            $scope.data[0].push("parentCode")
            */
        }
        console.log("-------------------------------")
        console.log(JSON.stringify(list, null, 4))

        auxo.delHotkey($scope)
        modalInstance.closeModal(list);
    }

    // cancel click
    $scope.cancel = function (callback, data) {
        auxo.delHotkey($scope)
        modalInstance.closeModal(false);
        if(callback)
            callback(data);
    }

    $scope.closeModal = function () {
        $scope.cancel();
    }

    $scope.title = '导入选项';
    $scope.modalButtons = [
        {
            action: $scope.ok,
            text: "确定", class: "btn-primary",
            disabled: function() {
                if($scope.uploading && $scope.data.length<2)
                    return true;
            }
        },
        {
            action: $scope.cancel,
            text: "取消", class: "btn-warning"
        }
    ];
    auxo.bindEscEnterHotkey($scope)
}]);