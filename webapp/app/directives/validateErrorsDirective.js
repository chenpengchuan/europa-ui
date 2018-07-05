/**
 * Created by youguili on 2016/10/8.
 */
App.directive('validateErrorsDirective',function($compile){
    return{
        scope:true,
        require:"ngModel",
        link:function(scope,element,attrs,ngModelCtrl){
            scope.hasErrors=function(){
                return ngModelCtrl.$invalid&&ngModelCtrl.$dirty;
            };
            scope.errors=function(){
                return ngModelCtrl.$error;
            }

            var tmpl='<p class="help-block" style="color:red" ng-show="hasErrors()" ng-repeat="(key,value) in errors()">{{key|errors}}</p>';
            var message=$compile(tmpl)(scope);
            element.after(message);
        },
    }
}).filter('errors',function(messagesDesc){
    return function(input){
      // return input;
       return messagesDesc[input];
    }
}).constant('messagesDesc',{
    'required':'必填',
    'email':'必须是邮箱格式',
    'unique':'必须唯一'
});