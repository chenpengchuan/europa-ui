'use strict';

/* Services */

var AppServices = angular.module('AuxoApp.services', []);

AppServices.value('version', '0.1');

AppServices.factory('UtilService', function() {
    var service = {
        toObjectArray1: function (obj, array, func) {
           var toArray = function (obj, array, func) {
                if(!array)
                    array = [];
                $.each(obj, function (name, value) {
                    if(func)
                        func(name, value);
                    /*
                     if ($.isNumeric(name))
                     value['$index'] = name;
                     else
                     value['$name'] = name;
                     */
                    if('object' == typeof value)
                    {
                        if(!$.isArray(value))
                            array.push(value);
                        toArray(value, array, func);
                    }
                });
                return array;
            }

            return toArray(obj, array, func);
        },
        toObjectArray: function (obj, insertName) {
            if ('object' != typeof obj)
                return;
            var array = [];
            if (!$.isArray(obj))
                array.push(obj);
            var toArray = function (obj) {
                $.each(obj, function (name, value) {
                    if ('object' == typeof value) {
                        if (!$.isArray(value)) {
                            array.push(value);
                            if(insertName) {
                                if($.isNumeric(name))
                                    value.$index = name;
                                else
                                    value.$name = name;
                            }
                        }
                        toArray(value);
                    }
                });
            };
            toArray(obj);
            return array;
        },
        treeWalk: function (obj, fn) {
            if ('object' != typeof obj)
                return;

            var treeWalk = function (obj, name) {
                if(fn) fn(name,obj);
                $.each(obj, function (name, value) {
                    if ('object' == typeof value) {
                        treeWalk(value,name);
                    } else
                        if(fn)fn(name,value);

                });
            };
            treeWalk(obj);
        },
        insertName: function (obj){
            if ('object' != typeof obj)
                return;

            var treeWalk = function (obj) {
                $.each(obj, function (name, value) {
                    if(($.isNumeric(name) || name.indexOf("$")<0)
                    && 'object' == typeof value) {
                        if (!$.isArray(value)){
                            if ($.isNumeric(name))
                                value.$index = name;
                            else
                                value.$name = name;
                         }
                        treeWalk(value);
                    }
                });
            };
            treeWalk(obj);
        },
        date2str: function(dl) {
            return new Date(dl).toLocaleString();
        },
        clone: function(obj){
            var txt=JSON.stringify(obj);
            return JSON.parse(txt);
        },
        captalizeString: function (text) {
            return text.substr(0,1).toUpperCase() + text.substr(1);
        },
        searchValue : function(data, dataCondition,  field, key) {
            var objectArray = service.toObjectArray(data);
            
            for(var i in objectArray) {
                if(!$.isNumeric(i))
                    break;
                var obj = objectArray[i];
                if(!obj)
                    continue;
                if (dataCondition) {
                    var equal = true;
                    $.each(dataCondition, function (name1, value1) {
                        if ( obj[name1] == value1) {
                        }
                        else {
                            equal = false;
                        }
                    });

                    if (equal) {
                        if (field)
                            return obj[field];
                        else if (key)
                            return obj[key];
                        else
                            return;
                    }
                }
                else if (field && obj[field] != undefined) {
                    return obj[field];
                } else if (key && obj[key] != undefined) {
                    return obj[key];
                };
            }
        },
        
        /*
        * param val source
        * param data target
        * param dataCondition match criterion
        * param the corresponding field for value if dataCondition is not defined
        * param the corresponding field for value if dataCondition and field are not defined
        * */
        setValueToData: function  (val, data, dataCondition, field, key) {

            var dataItems = service.toObjectArray(data);

            for(var i in dataItems) {
                if(!$.isNumeric(i))
                    break;
                var value = dataItems[i];
                if(!value)
                    continue;
                if(dataCondition) {
                    var equal = true;
                    $.each(dataCondition, function(name1,value1)
                    {
                        if(value[name1] == value1){
                        }
                        else {
                            equal = false;
                        }
                    });
                    if(equal) {
                        if(field) {
                            value[field] = val;
                            return true;
                        }
                        else {
                            value[key] = val;
                            return true;
                        }
                    }
                }
                else if(field && value[field] != undefined){
                    value[field] = val;
                    return true;
                } else if(value[key] != undefined) {
                    value[key] = val;
                    return true;
                }
            }
        },
        findObjectByKey : function (obj, key) {

            var retValue;
            var findObject = function (obj, key) {
                if (!obj)
                    return;

                if(retValue)
                    return;

                if(obj[key]) {
                    retValue = obj[key];
                    return;
                }

                $.each(obj, function (name, value) {
                    if ("object" == typeof value) {
                        findObject(value, key);
                    }
                    if (retValue) {
                        return;
                    }
                });
            };
            findObject(obj, key);
            return retValue;
        },
        // 对Date的扩展，将 Date 转化为指定格式的String
        // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
        // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
        // 例子：
        // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
        // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
        formatDate: function(date, fmt) {
            var o = {
            "M+" : date.getMonth()+1,                 //月份
            "d+" : date.getDate(),                    //日
            "h+" : date.getHours(),                   //小时
            "m+" : date.getMinutes(),                 //分
            "s+" : date.getSeconds(),                 //秒
            "q+" : Math.floor((date.getMonth()+3)/3), //季度
            "S"  : date.getMilliseconds()             //毫秒
        };
        if(/(y+)/.test(fmt))
            fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
            if(new RegExp("("+ k +")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        return fmt;
    }

}
    return service;

});

AppServices.factory('StepSchemaService', function(UtilService) {
    var service = {
        dataToSchema : {
            "default": function(data, schema) {

                var setDefaultValue = function(array) {
                    for(var i in array) {
                        if(!$.isNumeric(i))
                            break;
                        var item = array[i];
                        if(item.default != undefined && item.value == undefined)
                            item.value = item.default;
                    }
                }

                var buildGroups = function(groups, data) {
                    var groupName = groups.$$group.$$name;
                    var d = UtilService.findObjectByKey(data, groupName);
                    var groupArray = [];
                    if(d) {
                       for(var i in d) {
                           if(!$.isNumeric(i))
                               break;
                           var item = d[i];
                           var copy = UtilService.clone(groups);
                           delete copy.$name;
                           $.each(item, function(name,value){
                               copy[name].value = value;
                           });
                           var array = step_schemas.formlizeDef(copy);
                           groupArray.push(array);
                       }
                    } else {
                        var copy = UtilService.clone(groups);
                        delete copy.$name;
                        var array = step_schemas.formlizeDef(copy);
                        setDefaultValue(array);
                        groupArray.push(array);
                    }
                    return groupArray;
                }

                var convertStringToNumber = function (formItems) {
                    for(var i in formItems) {
                        if(!$.isNumeric(i))
                            continue;
                        var item = formItems[i];
                        if(item.type == 'Number' && item.value != undefined) {
                            item.value = parseInt(item.value);
                        }
                    }
                }

                var populateDataToSchema = function (def, data) {
                    if(data) {
                        $.each(def, function(name,value) {
                            if(name == "groups"){
                                var groupArray = buildGroups(value,data);
                                def.groups = groupArray;
                            } else if (value.type == undefined || value.type == 'label' || value.type == 'title') {
                                // skip
                            } else {
                                var v = UtilService.searchValue(data, value.$condition, value.dataField, name);
                                if(v)
                                    value['value'] = v;
                            }
                        });
                    }
                }

                var def = UtilService.clone(schema);
                UtilService.insertName(def);
                populateDataToSchema(def,data);

                var formItems = step_schemas.formlizeDef(def);
                setDefaultValue(formItems);
                convertStringToNumber(formItems);


                for(var i in formItems) {
                    if(!$.isNumeric(i))
                        continue;
                    var item = formItems[i];
                    if(item.$name == 'delimiter') {
                        angular.extend(item, {enum: [',',';',':']});
                    } else if(item.$name == 'dataFormat') {
                        angular.extend(item, {popInput: 'schemas', popTitle: 'Schema', popMulti:'true'});
                    } else if(item.$name == 'input' || item.$name == 'output') {
                        var tags = [];
                        if(item.value) {
                            var cols = item.value.split(/,| |;|:/)
                            for(var k in cols) {
                                tags.push({text: cols[k], name:cols[k]});
                            }
                        }
                        console.log("tags: " + JSON.stringify(tags))
                        angular.extend(item, {tagSource: 'parentOutput', tags: tags});
                    }
                }
                console.log("#############################data: " + JSON.stringify(data))
                console.log("#############################form items: " + JSON.stringify(formItems))


                return formItems;
            }
        },
 
        "schemaToData": {
            "default": function(formItems, schema) {
                var data = UtilService.clone(schema.data);
                if(formItems) {
                    for(var i in formItems) {
                        if(!$.isNumeric(i))
                            break;
                        var formItem = formItems[i];
                        var type = formItem.type;
                        if(type && type != 'separate' && type != 'label' && type != 'title') {
                        	if (formItem.tags) {
                        		var values = [];
                        		angular.forEach(formItem.tags, function(tag) {
                        		  this.push(tag.name);
                        		}, values);
                        		formItem.value = values.join(",");
                        	}
                        	UtilService.setValueToData(formItem.value, data, formItem.$condition, formItem.dataField, formItem.$name);
                        }
                            
                        if(angular.isArray(formItems[i])) {
                                var groupName = formItems[i][0][0].$$name;
                                var d = UtilService.findObjectByKey(data, groupName);
                                var dGroup = d[0];
                                d.splice(0, 1);
                                for(var j in formItems[i]) {
                                    if(!$.isNumeric(j))
                                        break;
                                    var d1 = UtilService.clone(dGroup);
                                    for(var k in formItems[i][j]) {
                                        if(!$.isNumeric(k))
                                            break;
                                        var item = formItems[i][j][k];
                                        if(item.type && item.type != 'hidden')
                                            d1[item.$name] = item.value;
                                    }
                                    d.push(d1);
                                }
                        }
                    }
                }

                return data;
            },
        },
    }
    return service;
});


