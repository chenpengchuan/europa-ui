

App.controller("CronFormController", function($scope, modalInstance, UtilService, StepSchemaService){

    $scope.title = "Cron 表达式设置"
    
    $scope.cronExp = $scope.fromParent;



    console.log("cronExp: " + JSON.stringify($scope.cronExp))
    console.log("cronExpression: " + $scope.cronExp)

    $scope.constants = {
        "appoint":"appoint",
        "everyTime" : "everyTime",
        "cycle" : "cycle",
        "startOn": "startOn",
        "unAppoint": "unAppoint",
        "workDay": "workDay",
        "lastDay": "lastDay",
        "weekOfDay": "weekOfDay",
        "lastWeek": "lastWeek",
        "second": "second",
        "minute": "minute",
        "hour":"hour",
        "day": "day",
        "month": "month",
        "week": "week",
        "year": "year"
    }

    $scope.model = {
        second: {
            option: $scope.constants.everyTime,
            secondStart_0: 1,
            secondEnd_0: 2,
            secondStart_1: 0,
            secondEnd_1: 1,
            list: [],
            minValue: 0,
            maxValue: 59,
        },
        minute: {
            option: $scope.constants.everyTime,
            minuteStart_0: 1,
            minuteEnd_0: 2,
            minuteStart_1: 0,
            minuteEnd_1: 1,
            list: [],
            minValue: 0,
            maxValue: 59,
        },
        hour: {
            option: $scope.constants.everyTime,
            hourStart_0: 0,
            hourEnd_0: 2,
            hourStart_1: 0,
            hourEnd_1: 1,
            list: [],
            minValue: 0,
            maxValue: 23,
        },
        day: {
            option: $scope.constants.everyTime,
            dayStart_0: 1,
            dayEnd_0: 2,
            dayStart_1: 1,
            dayEnd_1: 1,
            dayStart_2: 1,
            list: [],
            minValue: 1,
            maxValue: 31,
        },
        month: {
            option: $scope.constants.everyTime,
            monthStart_0: 1,
            monthEnd_0: 2,
            monthStart_1: 1,
            monthEnd_1: 1,
            list: [],
            minValue: 1,
            maxValue: 12,
        },
        week: {
            option: $scope.constants.unAppoint,
            weekStart_0: 1,
            weekEnd_0: 2,
            weekStart_1: 1,
            weekEnd_1: 1,
            weekStart_2: 1,
            list: [],
            minValue: 1,
            maxValue: 7,
        },
        year: {
            option: $scope.constants.everyTime,
            yearStart_0: 2016,
            yearEnd_0: 2017,
            list: [],
            minValue: 2016,
            maxValue: 2050,
        },

         initAllList : function () {
            $.each($scope.model, function (name, value) {
                // in some case, the base is 1, to avoid exceed, do count+1
                for(var i=value.minValue;i<value.maxValue+1;i++)
                    value.list.push(false);
            })
         }
    };

    $scope.model.initAllList();

    /*
    * set radioValue for dropdown list
    * set minValue and maxValue
    * set options for dropdown list
    * */
    $scope.buildSelectOptions = function (data) {

        var array = UtilService.toObjectArray(data);

        var radioValue;
        for(var i in array) {
            var value = array[i];
            if(value.type == 'radio')
                radioValue = value.value;
            if(value['minVal'] != undefined && value['maxVal'] != undefined) {
                var item = [];
                for(var i=value['minVal'];i<=value['maxVal'];i++){
                    item.push(i);
                }
                value.options = item;
                value.radioValue = radioValue;
            }
        }
    }
    $scope.buildCheckboxLines = function (prefix, count, index, lineNo) {
        var lines = [];
        var line = [];
        if(index == undefined)
            index = 1;
        if(lineNo == undefined)
            lineNo = 10;
        for (var i = index; i <= count; i++) {
            if (i % (lineNo) == 1) {
                if(line.length>0)
                    line = [];
                lines.push(line);
            }
            var label = i;
            if (i < 10 && count > 10)
                label = "0" + i;
            var item = {type: 'checkbox', afterLabel: label, id: prefix +'_' + i};
            if (i % 10 == 1)
                item.style = 'margin-left:20px;';
            line.push(item);
        }
        return lines;
    }

    $scope.buildCheckboxLine = function (prefix, from, to, len2, func) {
        var line = [];
        for (var i = from; i <= to; i++) {
            var label = i;
            if (i < 10 && len2)
                label = "0" + i;
            var item = {type: 'checkbox', afterLabel: label, id: prefix +'_' + i, value:i};
            if (i == from)
                item.style = 'margin-left:20px;';
            line.push(item);
            if(func)
                func(i,item);
        }
        return line;
    }

    $scope.initData = function ()
    {

        var model = $scope.model.second;
        $scope.secondDef = [
            [
                {id: 's_option_1', name:"second",  value: 'everyTime', type: 'radio', afterLabel: '每秒 允许的通配符[, - * /]'},
            ],
            [
                {id: 's_option_2',name:"second", value: 'cycle', type: 'radio', afterLabel: '周期从'},
                {id:'secondStart_0', type: 'text', minVal: 0, maxVal: 58, afterLabel: '-'},
                {id:'secondEnd_0', type: 'text', minVal: 1, maxVal: 59, afterLabel: '秒'},
            ],
            [
                {id: 's_option_3',name:"second",  value: 'startOn', type: 'radio', afterLabel: '从'},
                {id:'secondStart_1',type: 'text', minVal: 0, maxVal: 59, afterLabel: '秒开始,每'},
                {id:'secondEnd_1',type: 'text', minVal: 1, maxVal: 59, afterLabel: '秒执行一次'}
            ],
            [
                {id: 'sencond_appoint',name:"second", value: 'appoint', type: 'radio', afterLabel: '指定'},
            ],
        ];

        $scope.buildSelectOptions($scope.secondDef);
        $scope.secondDef.push($scope.buildCheckboxLine("second", 0,  9,  true));
        $scope.secondDef.push($scope.buildCheckboxLine("second", 10, 19, true));
        $scope.secondDef.push($scope.buildCheckboxLine("second", 20, 29, true));
        $scope.secondDef.push($scope.buildCheckboxLine("second", 30, 39, true));
        $scope.secondDef.push($scope.buildCheckboxLine("second", 40, 49, true));
        $scope.secondDef.push($scope.buildCheckboxLine("second", 50, 59, true));

        //minute
        $scope.minuteDef = [
            [
                {id: 'm_option_1',name:'minute',  value: 'everyTime', type: 'radio', afterLabel: '分钟 允许的通配符[, - * /]'},
            ],
            [
                {id: 'm_option_2', name:'minute', value: 'cycle', type: 'radio', afterLabel: '周期从'},
                {id:'minuteStart_0',type: 'text', minVal: 0, maxVal: 58, afterLabel: '-'},
                {id:'minuteEnd_0',type: 'text', minVal: 1, maxVal: 59, afterLabel: '分钟'},
            ],
            [
                {id: 'm_option_3',name:'minute',  value: 'startOn', type: 'radio', afterLabel: '从'},
                {id:'minuteStart_1',type: 'text', minVal: 0, maxVal: 59, afterLabel: '分钟开始,每'},
                {id:'minuteEnd_1',type: 'text', minVal: 1, maxVal: 59, afterLabel: '分钟执行一次'}
            ],
            [
                {id: 'minute_appoint', name:'minute', value: 'appoint', type: 'radio', afterLabel: '指定'},
            ],
        ];

        $scope.buildSelectOptions($scope.minuteDef);
        $scope.minuteDef.push($scope.buildCheckboxLine("minute", 0,  9, true));
        $scope.minuteDef.push($scope.buildCheckboxLine("minute", 10, 19,true));
        $scope.minuteDef.push($scope.buildCheckboxLine("minute", 20, 29,true));
        $scope.minuteDef.push($scope.buildCheckboxLine("minute", 30, 39,true));
        $scope.minuteDef.push($scope.buildCheckboxLine("minute", 40, 49,true));
        $scope.minuteDef.push($scope.buildCheckboxLine("minute", 50, 59,true));


        //hour
        $scope.hourDef = [
            [
                {id: 'h_option_1',name:"hour", value: 'everyTime', type: 'radio', afterLabel: '小时 允许的通配符[, - * /]'},
            ],
            [
                {id: 'h_option_2',name:"hour", value: 'cycle', type: 'radio', afterLabel: '周期从'},
                {id:'hourStart_0',type: 'text', minVal: 0, maxVal: 22, afterLabel: '-'},
                {id:'hourEnd_0',type: 'text', minVal: 1, maxVal: 23, afterLabel: '小时'},
            ],
            [
                {id: 'h_option_3',name:"hour", value: 'startOn', type: 'radio', afterLabel: '从'},
                {id:'hourStart_1',type: 'text', minVal: 0, maxVal: 23, afterLabel: '小时开始,每'},
                {id:'hourEnd_1',type: 'text', minVal: 1, maxVal: 23, afterLabel: '小时执行一次'}
            ],
            [
                {id: 'hour_appoint',name:"hour", value: 'appoint', type: 'radio', afterLabel: '指定'},
            ],
        ];

        $scope.buildSelectOptions($scope.hourDef);
        $scope.hourDef.push($scope.buildCheckboxLine("hour", 0, 11, true, function (index, item) {
            if(index == 0) {
                item.beforeLabel = "AM:";
                item.beforeLabelStyle = 'margin-left:20px;';
                item.style = "";
            }
        }));
        $scope.hourDef.push($scope.buildCheckboxLine("hour", 12, 23, true, function (index, item) {
            if (index == 12){
                item.beforeLabel = "PM:";
                item.beforeLabelStyle = 'margin-left:20px;';
                item.style = "";
            }
        }));

        //day
        $scope.dayDef = [
            [
                {id: 'd_option_1', value: 'everyTime',  name:"day",type: 'radio', afterLabel: '日 允许的通配符[, - * / L W]'},
            ],
            [
                {id: 'd_option_2', name:"day", value: 'unAppoint', type: 'radio', afterLabel: '不指定'},
            ],
            [
                {id: 'd_option_3', name:"day",  value: 'cycle', type: 'radio', afterLabel: '周期从'},
                {id:'dayStart_0',type: 'text', minVal: 1, maxVal: 30, afterLabel: '-'},
                {id:'dayEnd_0',type: 'text', minVal: 2, maxVal: 31, afterLabel: '日'},
            ],
            [
                {id: 'd_option_4', name:"day",  value: 'startOn', type: 'radio', afterLabel: '从'},
                {id:'dayStart_1',type: 'text', minVal: 1, maxVal: 31, afterLabel: '日开始,每'},
                {id:'dayEnd_1',type: 'text', minVal: 1, maxVal: 31, afterLabel: '日执行一次'}
            ],
            [
                {id: 'd_option_5',name:"day",  value: 'workDay', type: 'radio', afterLabel: '每月'},
                {id:'dayStart_2',type: 'text', minVal: 1, maxVal: 31, afterLabel: '号最近的那个工作日'},
            ],
            [
                {id: 'd_option_6',name:"day",onclick:"lastDay(this)", value: 'lastDay', type: 'radio', afterLabel: '本月最后一天'},
            ],
            [
                {id: 'day_appoint', name:"day",value: 'appoint', type: 'radio', afterLabel: '指定'},
            ],
        ];

        $scope.buildSelectOptions($scope.dayDef);
        $scope.dayDef.push($scope.buildCheckboxLine("day", 1, 10, true));
        $scope.dayDef.push($scope.buildCheckboxLine("day", 11, 20, true));
        $scope.dayDef.push($scope.buildCheckboxLine("day", 21, 31, true));


        //month
        $scope.monthDef = [
            [
                {id: 'M_option_1', name:"month", value: 'everyTime', type: 'radio', afterLabel: '月 允许的通配符[, - * /]'},
            ],
            [
                {id: 'M_option_2', name:"month", value: 'unAppoint', type: 'radio', afterLabel: '不指定'},
            ],
            [
                {id: 'M_option_3',   name:"month", value: 'cycle', type: 'radio', afterLabel: '周期从'},
                {id:'monthStart_0',type: 'text', minVal: 1, maxVal: 11, afterLabel: '-'},
                {id:'monthEnd_0',type: 'text', minVal: 2, maxVal: 12, afterLabel: '月'},
            ],
            [
                {id: 'M_option_4', name:"month", value: 'startOn', type: 'radio', afterLabel: '从'},
                {id:'monthStart_1',type: 'text', minVal: 1, maxVal: 12, afterLabel: '月开始,每'},
                {id:'monthEnd_1',type: 'text', minVal: 1, maxVal: 12, afterLabel: '月执行一次'}
            ],
            [
                {id: 'month_appoint', value: 'appoint', type: 'radio', afterLabel: '指定'},
            ],
        ];

        $scope.buildSelectOptions($scope.monthDef);
        $scope.monthDef.push($scope.buildCheckboxLine("month", 1, 12, true));


        //week
        $scope.weekDef = [
            [
                {id: 'w_option_1', name:"week", value: "everyTime", type: 'radio', afterLabel: '周 允许的通配符[, - * / L #]'},
            ],
            [
                {id: 'w_option_2', name:"week", value: "unAppoint", type: 'radio', afterLabel: '不指定'},
            ],
            [
                {id: 'w_option_3',name:"week", value: "cycle", type: 'radio', afterLabel: '周期 从星期'},
                {id:'weekStart_0',type: 'text', minVal: 1, maxVal: 6, afterLabel: '-'},
                {id:'weekEnd_0',type: 'text', minVal: 2, maxVal: 7, },
            ],
            [
                {id: 'w_option_4',name:"week", value: "weekOfDay", type: 'radio', afterLabel: '第'},
                {id:'weekStart_1',type: 'text', minVal: 1, maxVal: 4, afterLabel: '周 的星期'},
                {id:'weekEnd_1',type: 'text', minVal: 1, maxVal: 7, }
            ],
            [
                {id: 'w_option_5',name:"week", value: "lastWeek", type: 'radio', afterLabel: '本月最后一个星期'},
                {id:'weekStart_2',type: 'text', minVal: 1, maxVal: 7, },
            ],
            [
                {id: 'week_appoint',name:"week", value: "appoint", type: 'radio', afterLabel: '指定'},
            ],
        ];

        $scope.buildSelectOptions($scope.weekDef);
        $scope.weekDef.push($scope.buildCheckboxLine("week", 1, 7));

        //year
        $scope.yearDef = [
            [
                {id: 'y_option_1', name:"year", value: "unAppoint", type: 'radio', afterLabel: '不指定 允许的通配符[, - * /] 非必填'},
            ],
            [
                {id: 'y_option_2', name:"year",value: "everyTime", type: 'radio', afterLabel: '每年'},
            ],
            [
                {id: 'y_option_3', name:"year",  value: "cycle", type: 'radio', afterLabel: '周期 从'},
                {id:'yearStart_0',type: 'text', minVal: 2016, maxVal: 2049, afterLabel: '-'},
                {id:'yearEnd_0',type: 'text', minVal: 2017, maxVal: 2050, }
            ]
        ];

        $scope.buildSelectOptions($scope.yearDef);


    };

    $scope.initData();



    $scope.tabs = [
        {label: "秒", id:'second',data: $scope.secondDef, model: $scope.model.second},
        {label: "分钟", id:'minute', data: $scope.minuteDef, model: $scope.model.minute},
        {label: "小时", id:'hour', data: $scope.hourDef, model: $scope.model.hour},
        {label: "日", id:'day', data: $scope.dayDef, model: $scope.model.day},
        {label: "月", id:'month',data: $scope.monthDef, model: $scope.model.month},
        {label: "周", id:'week', data: $scope.weekDef, model: $scope.model.week},
        {label: "年", id:'year', data: $scope.yearDef, model: $scope.model.year},
    ];

    $scope.expText = {
        "v_second": "*",
        "v_minute": "*",
        "v_hour": "*",
        "v_day": "*",
        "v_month": "*",
        "v_week": "?",
        "v_year": "",
    }

    $scope.cron = {value: "* * * * * ?"}

    if($scope.cronExp)
        $scope.cron.value = $scope.cronExp;


    $scope.currentTab = $scope.tabs[0].id;

    $scope.isCurrentPage = function (tabId) {
        return $scope.currentTab == tabId;
    }

    $scope.openTab = function (tabId) {
        $scope.currentTab = tabId;
    }

    $scope.doValueChange = function (tab, itemId, radioValue) {
        console.log("tab: " + tab + "; itemId: " + itemId + "; radioValue:" + radioValue)
       var model = $scope.model[tab];
        model.option = radioValue;
        var isStart = true;
        var start;
        var end;

        if(itemId.indexOf('Start_0') > 0) {
            start = model[itemId];
            end = model[tab+"End_0"];

            if(start>=end ) {
                if(start < model.maxValue)
                    model[tab+"End_0"] = start+1;
                else {
                    model[itemId] = start - 1;
                    model[tab+"End_0"] = model.maxValue;
                }
            }
        } else if (itemId.indexOf('End_0') > 0) {
            end = model[itemId];
            start = model[tab+"Start_0"];

            if(start>=end ) {
                model[tab+"Start_0"] = end-1;
            }
        }

        $scope.doOptionChange(tab);
    }
    
    $scope.doOptionChange = function (modelName) {
        console.log("radio name: " + modelName + ";option value: " + $scope.model[modelName].option)
        var option = $scope.model[modelName].option;
        if(option == 'everyTime')
             $scope.expText['v_'+modelName] = "*";
        else if(option == 'unAppoint') {
            var val = "?";
            if (modelName == "year")
                val = "";
            $scope.expText['v_'+modelName] = val;
        } else if(option == 'appoint') {

        } else if(option == "cycle") {
            var start = $scope.model[modelName][modelName + "Start_0"];
            var end = $scope.model[modelName][modelName + "End_0"];
            $scope.expText['v_'+modelName] = start + "-" + end;
        } else if(option == 'startOn') {
            var start = $scope.model[modelName][modelName + "Start_1"];
            var end = $scope.model[modelName][modelName + "End_1"];
            $scope.expText['v_'+modelName] = start + "/" + end;
        } else if (option == 'lastDay') {
            $scope.expText['v_'+modelName] = "L";
        } else if(option == "weekOfDay") {
            var start = $scope.model[modelName][modelName + "Start_1"];
            var end = $scope.model[modelName][modelName + "End_1"];
            $scope.expText['v_'+modelName] = start + "#" + end;
        } else if (option == "lastWeek") {
            var start = $scope.model[modelName][modelName + "Start_2"];
            $scope.expText['v_'+modelName] = start + "L";
        } else if(option == "workDay") {
            var start = $scope.model[modelName][modelName + "Start_2"];
            $scope.expText['v_'+modelName] = start + "W";
        }

        // handle conflicts of day and week
        if(modelName == $scope.constants.day || modelName == $scope.constants.week) {
            var another = modelName == $scope.constants.day? $scope.constants.week: $scope.constants.day;
                if($scope.expText['v_'+modelName] != "?")
                {
                    $scope.model[another].option = $scope.constants.unAppoint;
                    $scope.expText['v_'+another] = "?";
                } else if($scope.expText['v_'+ another] == "?"){
                    $scope.model[another].option = $scope.constants.everyTime;
                    $scope.expText['v_'+another] = "*";
                }

        }

        $scope.doCronChange();
    }

    $scope.doCronChange = function () {
        var item = [];
        $.each($scope.expText, function (name, value) {
            item.push(value);
        });
        //console.log("expText: " + JSON.stringify($scope.expText))
        $scope.cron.value = item.join(" ");
        $scope.onCronChange();
    }

    $scope.doCheckChange = function (tab, value) {
        //console.log("tab: " + tab + "; value:" + value)
        var model = $scope.model[tab];
        model.option = $scope.constants.appoint;

        var vals = [];
        for(var i in model.list) {
            if($.isNumeric(i) && model.list[i])
                vals.push(i);
        }
        if(tab == 'second' || tab == 'minute') {
            var val = "?";
            if (vals.length > 0 && vals.length < 59) {
                val = vals.join(",");
            } else if (vals.length == 59) {
                val = "*";
            }
            $scope.expText['v_'+tab] = val;
        } else if(tab == "hour") {
            var val = "?";
            if (vals.length > 0 && vals.length < 24) {
                val = vals.join(",");
            } else if (vals.length == 24) {
                val = "*";
            }
            $scope.expText['v_'+tab] = val;
        } else if(tab == "day") {
            var val = "?";
            if (vals.length > 0 && vals.length < 31) {
                val = vals.join(",");
            } else if (vals.length == 31) {
                val = "*";
            }
            $scope.expText['v_'+tab] = val;
        } else if(tab == "month") {
            var val = "?";
            if (vals.length > 0 && vals.length < 12) {
                val = vals.join(",");
            } else if (vals.length == 12) {
                val = "*";
            }
            $scope.expText['v_'+tab] = val;
        } else if(tab == "week") {
            var val = "?";
            if (vals.length > 0 && vals.length < 7) {
                val = vals.join(",");
            } else if (vals.length == 7) {
                val = "*";
            }
            $scope.expText['v_'+tab] = val;
        }

        $scope.doCronChange();


    }



    $scope.btnFan = function ()
    {
        //获取参数中表达式的值

        if(!$scope.cron.value)
            return;

        var clearCheckbox = function (){
            var types = [
                $scope.constants.second,
                $scope.constants.minute,
                $scope.constants.hour,
                $scope.constants.day,
                $scope.constants.month,
                $scope.constants.week];
            for(var i in types) {
                var model = $scope.model[types[i]];
                for(var i in model.list) {
                    model.list[i] = false;
                }
            }
        }
        clearCheckbox();

        var regs = $scope.cron.value.split(' ');
        $scope.expText.v_second = regs[0];
        $scope.expText.v_minute = regs[1];
        $scope.expText.v_hour = regs[2];
        $scope.expText.v_day = regs[3];
        $scope.expText.v_month = regs[4];
        $scope.expText.v_week = regs[5];



        $scope.initObj(regs[0], "second");
        $scope.initObj(regs[1], "minute");
        $scope.initObj(regs[2], "hour");
        $scope.initDay(regs[3]);
        $scope.initMonth(regs[4]);
        $scope.initWeek(regs[5]);

        if (regs.length > 6)
        {
            $scope.expText.v_year = regs[6];
            $scope.initYear(regs[6]);
        }

    }

    $scope.initObj = function (strVal, strid)
    {
        var model = $scope.model[strid];
        if(strVal == "*") {
            model.option = 'everyTime';
        }else if (strVal.split('-').length > 1)
        {
            ary = strVal.split('-');
            model.option = 'cycle';
            model[strid+"Start_0"] = parseInt(ary[0]);
            model[strid+"End_0"] = parseInt(ary[1]);
        }
        else if (strVal.split('/').length > 1)
        {
            ary = strVal.split('/');
            model.option = 'startOn';
            model[strid+"Start_1"] = parseInt(ary[0]);
            model[strid+"End_1"] = parseInt(ary[1]);
        }
        else if(strid == 'second' || strid == 'minute' || strid == 'hour')
        {
            model.option = 'appoint';
            if (strVal != "?")
            {
                ary = strVal.split(",");
                for (var i = 0; i < ary.length; i++)
                {
                    model.list[parseInt(ary[i])] = true;
                }
            }
        } else
            return false;

        return true;
    }

    $scope.initDay = function (strVal)
    {

        if($scope.initObj(strVal, 'day'))
            return;

        var model = $scope.model['day'];

        var ary = null;
        if (strVal.split('W').length > 1)
        {
            ary = strVal.split('W');
            model.option = 'workDay'
            model["dayStart_2"] = parseInt(ary[0]);
        }
        else if (strVal == "L")
        {
            model.option = 'lastDay'
        }
        else
            $scope.initList(model, 'day');
     }

    $scope.initList = function (model, strVal) {
        model.option = 'appoint';

        var ary = strVal.split(",");
        for (var i = 0; i < ary.length; i++)
        {
            // for week, both 0 and 7 refer to sunday, here 7 is used
            if(ary[i] == '0' && model == $scope.model.week)
                model.list[7] = true;
            else
                model.list[parseInt(ary[i])] = true;
        }
    }

    $scope.initMonth = function (strVal)
    {
        var strid = 'month';
        if($scope.initObj(strVal, strid))
            return;

        var model = $scope.model[strid];
        var ary = null;
        $scope.initList(model, strid);
    }

    $scope.initWeek =function (strVal)
    {
        var strid = 'week';
        if($scope.initObj(strVal, strid))
            return;

        var model = $scope.model[strid];
        var ary = null;

        if (strVal.split('L').length > 1)
        {
            model.option = "lastWeek";
            ary = strVal.split('L');
            model["weekStart_2"] = parseInt(ary[0])
        }
        else
            $scope.initList(model, strid);

    }

    $scope.initYear = function (strVal)
    {
        var strid = 'year';
        if($scope.initObj(strVal, strid))
            return;
    }

    $scope.fiveRunTimes = [];
    $scope.onCronChange = function () {
        try {
            $scope.fiveRunTimes = [];


        } catch (err) {
            $scope.fiveRunTimes.push(err.message)
        }
    }

    // ok click
    $scope.ok = function() {
        modalInstance.closeModal($scope.cron.value)
    };
    // cancel click
    $scope.cancel = function() {
        modalInstance.dismiss();
    }

    $scope.title = '创建 Cron 表达式';
    $scope.modalButtons =[
        {
            action:$scope.ok,
            text:"确定",class:"btn-primary",
            disabled: function(){ if($scope.callbackForm) return $scope.callbackForm.$invalid || !$scope.callbackForm.$dirty;}
        },
        {
            action:$scope.cancel,
            text:"取消",class:"btn-warning"
        }
    ];
    $scope.closeModal = $scope.cancel;


    if($scope.cron.value) {
        console.log("do reverse!")
        $scope.btnFan();
        $scope.onCronChange();
    }
});


