/**
 * DesignerController
 * @constructor
 */
App.controller("DataflowController", function($scope, $http, $location,Restangular, $uibModal, $log){

    $scope.isSelectAll = false;
    $scope.activedTag = "Dataflow";

    $scope.queryWord = "";
    $scope.tagFilters = {}; // store tag selected values  format  {'tag': true, 'tag2': false}

    $scope.selections = {}; // store row selected states['id_{{dataflow.id}}': true/false, ...]

    $scope.ptableState = {
        currentPageNumber: 1,
        pagination: {
            start: 0
        }
    };

    $scope.currentPageNumber = 1;

    $scope.tagsColorMap = {
        "http-log" : "#337ab7",
        "pv" : "#89e051",
        'demo': 'green',
        'simple': "lightblue",
    }

    $scope.changeCurrentPageNumber = function(cp) {
        if (cp < 1) {
            cp = 1;
        }else if (cp > $scope.totalPages) {
            cp = $scope.totalPages;
        }
        $scope.currentPageNumber = cp;
        $scope.ptableState.pagination.start = cp - 1;
        $scope.fetchPage();
    }
    
    $scope.getAllTags = function () {
         Restangular.one("tags").get({})
            .then(function(facetResult){
                $scope.allTags = facetResult;
                $scope.selectedTag = $scope.allTags[0];
            })
    };

    $scope.initFacets = function (){
        for(var i in $scope.tagfacets) {
            var tag = $scope.tagfacets[i];
            tag.name = tag.facet;
            tag.color = $scope.tagsColorMap[tag.name];
        }
    }

    $scope.refreshTagInfo = function () {
        var data = $scope.dataflows;
        var tagInfo = {};
        for(var i=0;i<data.length;i++) {
            var tags = data[i].tags;
            if(tags) {
                for (var j=0;j<tags.length;j++){
                    var tag = tags[j];
                    if(tagInfo[tag])
                        tagInfo[tag]++;
                    else
                        tagInfo[tag] = 1;
                }
            }
        }
        var tags = [];
        $.each(tagInfo, function(name,value) {
            var t = {"name": name, "total": value};
            tags.push(t);
        });

        $scope.tagUsage = tags;
    };

    $scope.tagInUse = function (tag) {
        return tag.usage > 0;
    }

    $scope.selectAll = function () {
        for(var i=0;i<$scope.dataflows.length;i++) {
            //$scope.dataflows[i].selected = $scope.isSelectAll;
            $scope.selections['id_'+$scope.dataflows[i].id] = $scope.isSelectAll;
        }
    };
    
    $scope.addTag = function () {
        if(!$scope.selectedTag)
            return;

        var tag = $scope.selectedTag

        for(var i=0;i<$scope.dataflows.length;i++) {
            var w = $scope.dataflows[i];
            if($scope.selections['id_'+w.id]) {
                if (w.tags == undefined)
                    w.tags = [];
                if (w.tags.indexOf(tag.name) < 0) {
                    w.tags.push(tag.name);
                    $scope.updateTags(w);
                }
            }
        }
        $scope.refreshTagInfo();
    };

    $scope.updateTags = function (dataflow) {
        var remoteItem = Restangular.copy(dataflow);

        Restangular.one("flows", dataflow.id)
            .customPUT(dataflow)
            .then(function (facetResult) {
                console.log("update tag successfully.")
            });
    }
    
    $scope.removeTag = function () {
        if(!$scope.selectedTag)
            return;
        var tag = $scope.selectedTag

        for(var i=0;i<$scope.dataflows.length;i++) {
            var w = $scope.dataflows[i];
            if($scope.selections['id_'+w.id]) {
                    var index = w.tags.indexOf(tag.name);
                    if(index >=0)
                        w.tags.splice(index, 1);
            }
        };
        $scope.refreshTagInfo();
    };

    $scope.selectRow = function (row) {
        $scope.selectedRow = row;
    }

    $scope.editDataflow = function() {
        if(!$scope.dataflows || $scope.dataflows.length == 0 || $scope.selectedRow == undefined)
            return;

        $location.path('/designer/dataflow/edit/' + $scope.dataflows[$scope.selectedRow].id);
    }; 
    
    $scope.copyDataflow = function() {
        if(!$scope.dataflows || $scope.dataflows.length == 0 || $scope.selectedRow == undefined)
            return;

        $location.path('/designer/dataflow/copy/' + $scope.dataflows[$scope.selectedRow].id);
    };
    
    $scope.scheduleDataflow = function () {
        if(!$scope.dataflows || $scope.dataflows.length == 0 || $scope.selectedRow == undefined)
            return;

        $scope.open = function() {
            var uibModalInstance = $uibModal.open({
                templateUrl : 'app/cron/Scheduler_form_cron.html',
                controller : 'CronFormController', // specify controller for modal
                size : 'lg', // 'lg', 'sm' default middle
                backdrop: 'static',
                resolve : {
                    cronExp : function() {
                        return {value: 'temp exp.'};
                    }
                }
            });
            // modal return result
            uibModalInstance.result.then(function(configuration) {
                $scope.editingNode.inputConfigurations = configuration.inputConfigurations;
                $scope.editingNode.outputConfigurations = configuration.outputConfigurations;
                $scope.editingNode.otherConfigurations = configuration.otherConfigurations;
                $scope.updateDataflowNode($scope.editingNode.id, configuration);
            }, function() {
                console.log('Modal dismissed at: ' + new Date())
            });
        };
        $scope.open();
        
    }

    $scope.openTab = function (tag) {
        if(tag)
            $location.path("/designer/" + tag.toLowerCase());
    };

    $scope.doQuery = function (queryWord) {
        $scope.queryWord = queryWord;
        $scope.changeCurrentPageNumber(1);
    }

    $scope.changeCurrentPageNumber = function(cp) {
        if (cp < 1) {
            cp = 1;
        } else if (cp > $scope.totalPages) {
            cp = $scope.totalPages;
        }
        $scope.currentPageNumber = cp;
        $scope.ptableState.pagination.start = cp - 1;
        $scope.fetchPage();
    }

    $scope.doTagFilter = function () {
        $scope.fetchPage();
    }

    $scope.fetchPage = function() {
        var filter = "";
        var ftags = [];

        for (var tag in $scope.tagFilters) {
            if ($scope.tagFilters[tag]) {
                ftags.push(tag);
            }
        }

        if (ftags.length > 0) {
            if (filter.length > 0) {
                filter += "&";
            }
            filter += "tags="+ftags.join("|")
        }

        Restangular.one("flows").get({query : $scope.queryWord, offset: $scope.ptableState.pagination.start * 10, limit : 10, filter : filter})
            .then(function(facetResult){
                $scope.rowCollection = facetResult.content;
                $scope.total = facetResult.total;
                $scope.totalPages = facetResult.totalPages;

                $scope.dataflowCount = facetResult.total;
                $scope.dataflows = facetResult.content;
                $scope.tagfacets = facetResult.facetContent;
                $scope.initFacets();
                $scope.selections = {};
            })
    }

   $scope.isCurrentPage = function (tag) {
        if($scope.activedTag == tag)
            return true;
        if(!$scope.activedTag && tag == undefined)
            return true;
        return false;
    };

    $scope.onCronChange = function (newValue, oldValue) {
        if(newValue != oldValue) {
            console.log("New cronExpression: " + newValue + "; old Value: " + oldValue);
        }
    }

    $scope.onCronChange2 = function(){

        console.log("scheduler data: " + JSON.stringify($scope.scheduleData));

        var data = {"configurations":{"startTime":1464405562406},"schedulerId":"once","name":"test AAA","flowId":"fsh-001"};

        //{"configurations":{"cronType":"simple","cron":"0 0 0 ? * 0","startTime":1464233920982,"endTime":"4968-01-04T00:00:00.000Z"},"schedulerId":"cron","name":"test BBB","flowId":"fsh-000"}

        data.configurations.startTime = new Date($scope.scheduleData.startDate).getTime();
        if($scope.scheduleData.endDate)
            data.configurations.endTime = new Date($scope.scheduleData.endDate).getTime();
        data.schedulerId = $scope.scheduleData.type ;
        if($scope.scheduleData.cronExpression) {
            data.configurations.cronType = "simple";
            data.configurations.cron = $scope.scheduleData.cronExpression;
        }
        data.flowId = $scope.dataflows[$scope.selectedRow].id
        data.name = $scope.scheduleData.name;

        Restangular.all("schedulers").post(data)
            .then(function (facetResult) {
                console.log("return: " + JSON.stringify(facetResult))
            })
    }

    $scope.fetchPage();
    $scope.getAllTags();
});




App.directive('dataflowChart', function ($parse) {
    //explicitly creating a directive definition variable
    //this may look verbose but is good for clarification purposes
    //in real life you'd want to simply return the object {...}
    var directiveDefinitionObject = {
        //We restrict its use to an element
        //as usually  <bars-chart> is semantically
        //more understandable
        restrict: 'EA',
        //this is important,
        //we don't want to overwrite our directive declaration
        //in the HTML mark-up
        replace: false,
        scope: {
            data: '=chartData'
        },
        link: function (scope, element, attrs) {
            var svg = d3.select(element[0]);

        }
    };
    return directiveDefinitionObject;
});

