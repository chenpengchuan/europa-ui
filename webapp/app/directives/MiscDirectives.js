App.directive("sizeGetter", ['$timeout', function ($timeout,$window,$rootScope) {
    return {
        scope: {
            offsetHeight: '=?',
            clientWidth:'=?'
        },
        link: function( scope, elem, attrs ){
            function checkSize(){
                scope.offsetHeight = elem.prop('offsetHeight');
                scope.clientWidth = elem.prop('clientWidth');
                $timeout( checkSize, 1000 );
            }
            checkSize();
        }
    };
}]);

App.directive("windowSizeGetter", ['$timeout', function ($window, $rootScope) {
    return {
        link: function( scope, elem, attrs ){
            scope.$root.windowHeight = $(window).height();
            scope.$root.windowWidth = $(window).width();
        }
    };
}]);


App.directive('backButton', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function () {
                history.back();
                scope.$apply();
            });
        }
    }
});

App.directive('focusIter', function () {
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
            var focusSelector = attrs.focusIter;
            if(!focusSelector)
                focusSelector = "[focus-iter]";
            if(focusSelector !== 'null') {
                elem.bind('keyup', function (e) {
                    var atoms = $(focusSelector),
                        toAtom = null;

                    for (var i = atoms.length - 1; i >= 0; i--) {
                        if (atoms[i] === e.target) {
                            if (e.keyCode === 13) {
                                toAtom = atoms[i + 1];
                            }
                            break;
                        }
                    }

                    if (toAtom) toAtom.focus();
                });

                elem.bind('keydown', function (e) {
                    if (e.keyCode === 13)
                        e.preventDefault();
                })
            }
        }
    };
});

App.directive('enterEvent', function () {
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
            var enterEvent = attrs.enterEvent;
            if(enterEvent) {
                elem.bind('keyup', function (e) {
                    if (e.keyCode === 13)
                        scope[enterEvent]();
                });

                elem.bind('keydown', function (e){
                    if (e.keyCode === 13)
                        e.preventDefault();
                })
            }
        }
    };
});

/*
 This directive allows us to pass a function in on an enter key to do what we want.
 */
App.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});