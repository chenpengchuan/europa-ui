AppDesignerDirectives.directive("checkListDirective",function(sgDialogService){
    return{
        restrict : 'EA',
        replace  : true,
        require  : 'ngModel',
        scope: {
            onInputChanged : '&',
            initInputData : '&',
            getAllItems: '&'
        },
        link:function(scope,ele,attr,ngModel){
            ele.on('click',function(){
                var inputData = auxo.clone(ngModel.$modelValue);
                if(attr.initInputData)
                    inputData = scope.initInputData({inputData:inputData});
                sgDialogService.openModal({
                    templateUrl:'app/directives/checklistDialog/CheckListDlg.html',
                    controller:'CheckListDlgController',
                    data:{
                        selections:inputData,
                        allItems: scope.getAllItems(),
                        title: attr.popTitle,
                        label: attr.popLabel,
                        note: attr.popNote,
                        inputId: attr.inputId
                    },
                    callback: function(result){
                        // if (attr.onInputChanged) {
                        //     scope.onInputChanged({inputText: result.value, inputId: attr.inputId});
                        // } else {
                            ngModel.$setViewValue(result.value)
                        // }
                    },
                    width:900
                });
            });
        }
    }
});