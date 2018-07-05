
App.controller("DemoController", function($scope, $modal){

    $scope.showD3Demo = function (dataflow) {
        var uibModalInstance = $modal.open({
            templateUrl : 'app/resources/html/demo/d3_demo.html',
            controller : 'D3DemoController', // specify controller for modal
            //size : size, // 'lg', 'sm' default middle
            backdrop: 'static',
            resolve : {
                dataflow : function() {
                    return dataflow;
                }
            }
        });
        // modal return result
        uibModalInstance.result.then(function(data) {
            //$scope.editingNode.configuration = configuration;
        }, function() {
            $log.info('Modal dismissed at: ' + new Date())
        });

    };

});


App.controller("D3DemoController", function($scope, $modal, dataflow){
    $scope.myData = [10,20,30,40,60];

    // ok click
    $scope.ok = function() {
        $uibModalInstance.close("");
    };
    // cancel click
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }
});

App.directive('demoChart', function ($parse) {
    //explicitly creating a directive definition variable
    //this may look verbose but is good for clarification purposes
    //in real life you'd want to simply return the object {...}
    var directiveDefinitionObject = {
        //We restrict its use to an element
        //as usually  <bars-chart> is semantically
        //more understandable
        restrict: 'E',
        //this is important,
        //we don't want to overwrite our directive declaration
        //in the HTML mark-up
        replace: false,
        scope: {
            data: '=chartData'
        },
        link: function (scope, element, attrs) {
            //converting all data passed thru into an array
            //var data = attrs.chartData.split(',');
            //in D3, any selection[0] contains the group
            //selection[0][0] is the DOM node
            //but we won't need that this time
            var chart = d3.select(element[0]);
            //to our original directive markup bars-chart
            //we add a div with out chart stling and bind each
            //data entry to the chart
            chart.append("div").attr("class", "chart")
                .selectAll('div')
                .data(scope.data).enter().append("div")
                .transition().ease("elastic")
                .style("width", function(d) { return d + "%"; })
                .text(function(d) { return d + "%"; });
            //a little of magic: setting it's width based
            //on the data value (d)
            //and text all with a smooth transition
        }
    };
    return directiveDefinitionObject;
});