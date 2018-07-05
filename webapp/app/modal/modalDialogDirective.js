
// for jquery dialog
/*
App.directive('openDialog', function(){
    return {
        restrict: 'A',
        link: function(scope, elem, attr, ctrl) {
            var dialogId = '#' + attr.openDialog;
            elem.bind('click', function(e) {
                $(dialogId).dialog('open');
            });
        }
    };
});
*/

/*
App.directive('modalDialog', function(){
    return {
        restrict: 'AC',
        link: function ($scope, element) {

            var draggableStr = "draggableModal";
            var header = $(".modal-header", element);
            header.css("cursor","move");

            header.on('mousedown', function (mouseDownEvent) {
                var modalDialog = element;

                var offset = header.offset();

                modalDialog.addClass(draggableStr).parents().on('mousemove', function (mouseMoveEvent) {
                    $("." + draggableStr, modalDialog.parents()).offset({
                        top: mouseMoveEvent.pageY - (mouseDownEvent.pageY - offset.top),
                        left: mouseMoveEvent.pageX - (mouseDownEvent.pageX - offset.left)
                    });
                }).on('mouseup', function () {
                    modalDialog.removeClass(draggableStr);
                });
            });
        }
    }
});
*/

/*
 <button type="button"
 data-confirm-popup-header="Reject"
 data-confirm-popup-text="Do you want to reject"
 <!--confirmPopupText directive will add confirm dialog functionality -->
 data-ng-click="reject(obj)"
 class="btn btn-danger btn-xs"
 data-ng-class="{disabled : disable}"
 data-ng-if="show"><span>Any HTML</span>Reject</button>
 */
App.directive("confirmPopupText", function  (  $uibModal,   $compile, $parse){
    var directive = {};
    directive.restrict = 'A';
    directive.link= function(scope, elem, attrs) {

        // get reference of ngClick func
        var model = $parse(attrs.ngClick);

        // remove ngClick and handler func
        elem.prop('ng-click', null).off('click');

        elem.bind('click' , function(e) {
            e.stopImmediatePropagation();
            console.log('Clicked');

            $uibModal.open({
                template: '<div class="modal-header"><h4 class="modal-title">'+attrs.confirmPopupHeader+'</h4></div>'+'<div class="modal-body">'+attrs.confirmPopupText+'</div>'+'<div class="modal-footer">'+'<button class="btn btn-primary" data-ng-click="ok()">Yes</button>'+'<button class="btn btn-warning" data-ng-click="cancel()">No</button>'+'</div>',
                controller: function($scope, $uibModalInstance) {
                    $scope.ok = function () {
                        $uibModalInstance.close();

                        // this line will invoke ngClick func from outer scope
                        model(scope);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });

        });
    };
    return directive;
});

