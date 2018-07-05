angular.module('AuxoApp')
.directive('pwCheck', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            console.log(attrs);
            var otherInput = elem.inheritedData("$formController")[attrs.pwCheck];
            ctrl.$parsers.push(function(value) {
                if(value === otherInput.$viewValue) {
                    ctrl.$setValidity("passwordMatch", true);
                    return value;
                }
                ctrl.$setValidity("passwordMatch", false);
            });

            otherInput.$parsers.push(function(value) {
                ctrl.$setValidity("passwordMatch", value === ctrl.$viewValue);
                return value;
            });
        }
    }
}]);

angular.module('AuxoApp')
.directive('roleConvert', function() {
	  return { restrict: 'A',
	    require: 'ngModel',
	    link: function(scope, element, attrs, ngModel) {

	      if(ngModel) { // Don't do anything unless we have a model

	        ngModel.$parsers.push(function (value) {
	          return [value];
	        });

	        ngModel.$formatters.push(function (value) {
	          return value ? value[0] : "";
	        });

	      }
	    }
	  };
	});