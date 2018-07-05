


/**
 * UI Component For Creating time period
 * @version v1.0
 * @author XiaoRu Hua
 * @license JuYun
 */
angular.module('templates-angulartimeperiod', ['timeperiod.html']);

angular.module("timeperiod.html", []).run(["$templateCache", function($templateCache) {

    $templateCache.put("timeperiod.html",
    "<div class='input-group' >\n" +
    "    <input type='number' class='form-control' ng-pattern='/^-?[0-9][^\.]*$/' ng-maxlength='10' ng-change='data.value=data.value>-1?data.value:0'  ng-model='data.value' ng-disabled='editDisable' placeholder=''>\n" +
    "<div class='input-group-btn' >\n" +
    "    <select ng-disabled='editDisable' class=' form-control' style='margin-left: -1px; width: auto;' ng-model=\"data.unit\" ng-options=\"value for value in data.enum\"></select>\n" +
    "</div>\n" +
    "</div>\n" +
    "");
    
}]);

'use strict';

angular.module('time-period', ['templates-angulartimeperiod']);

'use strict';

angular.module('time-period').directive('timePeriod', ['tpService', function(tpService) {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            config : '=',
            output : '=?',
            init   : '=?',
            editDisable : '=?'
        },
        templateUrl: function(element, attributes) {
            return attributes.template || 'timeperiod.html';
        },
        link: function($scope) {

            var originalInit = undefined;
            var initChanged = false;

            if (!angular.isDefined($scope.init))
                $scope.init = 0;

            if (angular.isDefined($scope.init)) {
                //console.log('init value found: ', $scope.init);
                originalInit = angular.copy($scope.init);
                $scope.data = tpService.fromTP($scope.init);
            }

            $scope.$watch('init', function(newValue){
                //console.log('watch on init fired!', newValue, originalInit);
                if(angular.isDefined(newValue) && newValue && (newValue !== originalInit)){
                    initChanged = true;
                    $scope.data = tpService.fromTP(newValue);
                }
            });

            $scope.$watch('data', function(n, o){
                 $scope.output = tpService.setTP(n);
            }, true);
        }
    };
}])

'use strict';

angular.module('time-period').factory('tpService', function() {

    var timeDef = {
        day: {label: "天", value: 24 * 3600},
        hour: {label: "小时", value: 3600},
        min: {label: "分", value: 60},
        sec: {label: "秒", value: 1},
    }
    
    var service = {};
    
    service.setTP = function(n) {
        var value = n.value;
        var unit = n.unit;
        //  console.log('set cron called: ', n);
        if (unit == timeDef.day.label) return value * timeDef.day.value
        if (unit == timeDef.hour.label) return value * timeDef.hour.value
        if (unit == timeDef.min.label) return value * timeDef.min.value
        if (unit == timeDef.sec.label) return value * timeDef.sec.value
     
    };

    service.fromTP = function(value) {
        value = parseInt(value)
        var newData;
        var n = timeDef.day.value
        if (value % n == 0)
            newData = {value: value / n, unit: timeDef.day.label};
        else {
            n = timeDef.hour.value;
            if (value % n == 0)
                newData = {value: value / n, unit: timeDef.hour.label};
            else {
                n = timeDef.min.value;
                if (value % n == 0)
                    newData = {value: value / n, unit: timeDef.min.label};
                else {
                    n = timeDef.sec.value;
                    newData = {value: value / n, unit: timeDef.sec.label};
                }
            }
        }
        newData.enum = [timeDef.day.label, timeDef.hour.label, timeDef.min.label, timeDef.sec.label];
        return newData
    };

    return service;
});
