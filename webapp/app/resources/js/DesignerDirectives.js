'use strict';

/* Directives */

var AppDesignerDirectives = angular.module('AuxoApp.designerDirectives', []);

AppDesignerDirectives.directive('postRender', [ '$timeout', function($timeout) {
    var def = {
        restrict : 'A',
        terminal : true,
        transclude : true,
        link : function(scope, element, attrs) {
            $timeout(scope.redraw, 0);  //Calling a scoped method
        }
    };
    return def;
}]);


//directives link user interactions with $scope behaviours
//now we extend html with <div plumb-item>, we can define a template <> to replace it with "proper" html, or we can
//replace it with something more sophisticated, e.g. setting jsPlumb arguments and attach it to a double-click
//event
AppDesignerDirectives.directive('plumbItem', function() {
    return {
        replace: false,
        link: function (scope, element, attrs) {
            //console.log("Add plumbing for the 'item' element");
            // make all the window divs draggable
             scope.jplumbInstance.draggable(jsPlumb.getSelector(".drop-container .plumb-item"), 
                 { 
                     drag: function (evt) {
                         var node = evt.el;

                         if (parseInt (node.style.top) < 0)
                             node.style.top = "0px";

                         if (parseInt (node.style.left) < 0)
                             node.style.left = "0px";
                     },
                     grid: [20, 20], 
                     stop: function(event, ui) {
                         scope.refreshNodesXY();
                    },
                     scroll: true,
                     scrollSpeed: 100
                 });
            /*
            scope.jplumbInstance.draggable(element, {
                containment: element.parent()
            });
            */
        }
    };
});


//
// This directive should allow an element to be dragged onto the main canvas. Then after it is dropped, it should be
// painted again on its original position, and the full module should be displayed on the dragged to location.
//
AppDesignerDirectives.directive('plumbMenuItem', function() {
    return {
        replace: true,
        link: function (scope, element, attrs) {

        }
    };
});


AppDesignerDirectives.directive('droppable', function($compile) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            console.log("Make this element droppable");

            element.droppable({
                drop:function(event,ui) {
                    // angular uses angular.element to get jQuery element, subsequently data() of jQuery is used to get
                    // the data-identifier attribute
                    var dragName = angular.element(ui.draggable).data('identifier');
                    var dragIndex = angular.element(ui.draggable).data('identifier'),
                        dragEl = angular.element(ui.draggable),
                        dropEl = angular.element(this);

                    // if dragged item has class menu-item and dropped div has class drop-container, add module
                    if (dragEl.hasClass('menu-item') && dropEl.hasClass('drop-container')) {
                        console.log("Drag event on " + dragIndex);
                        //var position = dropEl.position();
                        var parent = $(".drop-container");
                        var position = parent.offset();
                        var x = event.pageX - position.left + parent.scrollLeft() - 40;
                        var y = event.pageY - position.top  + parent.scrollTop() - 40;

                        //scope.addModuleToNode(dragIndex, x, y);
                        scope.addModuleToNode(dragName, x, y);
                    }
                    //console.log("%%%%%%%%scope.data before apply: " + JSON.stringify(scope.data));
                    var data = scope.data;
                    scope.$apply(function(){
                        //console.log("scope.node_uuid: " + scope.node_uuid);
                        //scope.node_uuid = node_uuid;
                        // scope.library_uuid = library_uuid;
                        scope.data = data;
                        //console.log("**********After apply, scope.data: " +JSON.stringify(scope.data));
                    });

                }
            });
        }
    };
});


AppDesignerDirectives.directive('cloneDraggable', function() {
    return {
        // A = attribute, E = Element, C = Class and M = HTML Comment
        restrict:'A',
        //The link function is responsible for registering DOM listeners as well as updating the DOM.
        link: function(scope, element, attrs) {
            //console.log("Let draggable item snap back to previous position");
            if(attrs.cloneDraggable !=='false') {
                //angular.element(element).attr("draggable", "true");
                /*
                angular.element(element).draggable({
                    accept: '*',
                    activeClass: false,
                    addClasses: true,
                    greedy: false,
                    hoverClass: false,
                    scope: 'default',
                    tolerance: 'intersect'
                })*/


                element.draggable({
                    // let it go back to its original position
                    //revert:true,
                   // appendTo: '#temp-menu-item-container',
                    //containment: 'body',
                    //scroll: true,
                   // helper: "clone", // make a copy
                    //stack: "div"
                     //addClasses: true,
                     appendTo: ".moving-menu-item-container",//"#menu-item-moving-contaiment",
                     //axis: false,
                     //connectToSortable: false,
                     //containment: false,
                     //cursor: "auto",
                     //cursorAt: false,
                     //grid: false,
                    // handle: false,
                     helper: "clone",//"original",
                     //iframeFix: false,
                     //opacity: false,
                     //refreshPositions: false,
                     //revert: false,
                    // revertDuration: 500,
                     //scope: "default",
                     scroll: true,
                     //scrollSensitivity: 20,
                     //scrollSpeed: 20,
                     //snap: false,
                     //snapMode: "both",
                     //snapTolerance: 20,
                     //stack: 'div',
                     zIndex: 500
                });




            }
        }
    };
});


AppDesignerDirectives.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                // add 0 to make sure render is completed
                 $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                 }, 0);
            }
        }
    }
});

AppDesignerDirectives.directive('bsPopup', function ($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch(function () {
                return $parse(ctrl.$modelValue)(scope);
            }, function (newValue) {
                if (newValue ==0) {
                    $(elem).modal('hide');
                    return;
                }
                if (newValue == 1) {
                    $(elem).modal('show');
                    return;
                }
            });
        }
    }
});