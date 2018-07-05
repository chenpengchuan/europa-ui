/**
 * Created by youguili on 2016/9/7.
 */

AppDesignerDirectives.directive("modalsDirective",function(sgDialogService){
    return{
        restrict : 'EA',
        replace  : true,
        require  : 'ngModel',
        scope: {
            onInputChanged : '&',
            initInputData : '&',
        },
        link:function(scope,ele,attr,ngModel){
            ele.on('click',function(){
                var inputData = auxo.clone(ngModel.$modelValue);
                if(attr.initInputData)
                    inputData = scope.initInputData({inputData:inputData});
                sgDialogService.openModal({
                    templateUrl:'app/directives/textArrayInputDialog/modal.html',
                    controller:'ModalsController',
                    data:{
                        modelValue:inputData,
                        title: attr.popTitle,
                        label: attr.popLabel,
                        height: attr.textHeight,
                        note: attr.popNote,
                        single: attr.single
                    },
                    callback: function(result){
                        if (attr.onInputChanged) {
                            scope.onInputChanged({inputText: result.value, inputName: attr.inputName});
                        } else
                            ngModel.$setViewValue(result.value)
                    },
                    width:900
                });
            });
        }
    }
});