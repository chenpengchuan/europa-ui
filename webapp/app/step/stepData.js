function _StepData() {

    /*
     * A complete setting item allow attributes
     * {
     * "type": "TextArray",
     * "$name": attribute name,
     * "label": display name,
     * "label_length_class": "col-sm-*",
     * "input_length_class": "col-sm-*",
     * "label_align": "left",
     * "tooltip":[],
     * "after_edit": function (data, self, parent){},
     * "before_edit": function (data, self, parent) {},
     * "onChange": function (data, self, parent) {},
     * "selectEnum": [],
     * "optional": true/false, // the opposite of required
     * "label_hidden": true/false,
     * "hidden": true/false,
     * "readonly": true/false,
     * "dependency": attribute name,
     * "unique" : true/false,
     * "source" : "",
     * "default" : "",
     * "selectSource": "" // for select type,
     * "unit": s/m/*** // for number
     * }
     *
     */

    var commons = this.commons = {
        buildDFItem: function (desc) {
            if(desc.selectEnum && !desc.type)
                desc.type = "Select";
            if(!desc.type)
                desc.type = "String";
            if(!desc.tooltip && !desc.label)
                desc.tooltip = [desc.$name];
            if (desc.illegal)
                desc.onChange = function (self, params) {
                    self.$errorTip = null;
                    var value = "";
                    if (self.data)
                        value = self.data[self.$name] + "";
                    else if (params && params.data)
                        value = params.data[self.$name] + "";
                    var reg = new RegExp(self.illegal, "g");
                    var v = value.replace(reg, '');
                    if (self.numType === 'f') {
                        var ss = v.split(".");
                        if (ss.length >= 2) {
                            v = ss[0] === '0' ? ss[0] + "." + ss[1] : '0.' + ss[1]
                        }
                        if (self.min !== undefined && parseFloat(v) < self.min)
                            v = self.min + "";
                        else if (self.max != undefined && parseFloat(v) > self.max)
                            v = self.max + "";
                    } else if (self.numType === 'i') {
                        if (self.min !== undefined && parseInt(v) < self.min)
                            v = self.min + "";
                        else if (self.max != undefined && parseInt(v) > self.max)
                            v = self.max + "";
                    }

                    if (self.data)
                        self.data[self.$name] = v;
                    else if (params && params.data)
                        params.data[self.$name] = v;
                }
            return desc;
        },
        buildFeatureColumns: function (obj) {
            var item = {
                "type": "CheckListPop",
                "$name": "featureColumns",
                "toDisplay": function (d) {
                    if(d)
                        return d.join(",")
                },
                "editSetup": function (d) {
                    return d;
                },
                "selectSource": "input",
                "tooltip": ["featureColumns"]
            };
            if (obj)
                angular.extend(item, obj)
            return item;
        },
        buildDFInteceptor: function (label_length_class,input_length_class,label_align ) {
            return {
                "type": "SelectPop",
                "$name": "interceptor",
                "tooltip":["添加自定函数中定义的dataflow interceptor"],
                "optional": true,
                "selectSource": "processconfigs",
                "filter$": "processConfigType='dataflow interceptor'",
                "popTitle": "dataflow interceptor",
                "keyword": "name",
                "label_length_class": label_length_class,
                "input_length_class": input_length_class,
                "label_align": label_align,
                "removable":true,
                "advanced":true
            }
        },
        buildDFUdf: function (label_length_class, input_length_class, label_align) {
            return {
                "type": "SelectPop",
                "$name": "udf",
                "tooltip": ["添加自定义函数中定义的dataflow udf"],
                "optional": true,
                "selectSource": "processconfigs",
                "filter$": "processConfigType='dataflow udf'",
                "popTitle": "dataflow udf",
                "keyword": "name",
                "label_length_class": label_length_class,
                "input_length_class": input_length_class,
                "label_align": label_align,
                "removable": true,
                "advanced": false
            }
        },
        buildWFInteceptor: function (label_length_class,input_length_class,label_align ) {
            return {
                "type": "SelectPop",
                "$name": "interceptor",
                "tooltip":["添加自定函数中定义的workflow interceptor"],
                "optional": true,
                "selectSource": "processconfigs",
                "filter$": "processConfigType='workflow interceptor'",
                "popTitle": "dataflow interceptor",
                "keyword": "name",
                "label_length_class": label_length_class,
                "input_length_class": input_length_class,
                "label_align": label_align,
                "removable":true,
                "advanced":true
            }
        },
        buildSessionCache: function (label_length_class,input_length_class,label_align ) {
            return {
                "type": "Select",
                "$name": "sessionCache",
                "default": "NONE",
                "selectObjEnum": auxo.sessionCacheOptions,
                "tooltip":["Session Cache选项"],
                "optional": true,
                "label_length_class": label_length_class,
                "input_length_class": input_length_class,
                "label_align": label_align,
                "advanced":true
            }
        },
        buildFilterClass: function (label_length_class,input_length_class,label_align ) {
            return {
                "type": "SelectPop",
                "$name": "filterClass",
                "tooltip":["添加自定函数中定义的workflow filterClass"],
                "optional": true,
                "selectSource": "processconfigs",
                "filter$": "processConfigType='filter class'",
                "popTitle": "Filter Class",
                "keyword": "name",
                "label_length_class": label_length_class,
                "input_length_class": input_length_class,
                "label_align": label_align,
                "removable":true,
                "advanced":true
            }
        },
        buildFlowParameters: function (data, self, parent, typeMap) { //parent: tab.content
            var index;
            auxo.forEachArray(parent,function (e,i) {
                if(e.$name === 'dataflowId$') {
                    index = i;
                    return false;
                }
            })
            var para = [];
            auxo.forEachArray(self.parameters,function (e,i) {
                var tooltip = e.description;
                if(!tooltip) tooltip = e.name;
                para.push({
                    "$name": e.name,
                    'type': typeMap && typeMap[e.name] ? typeMap[e.name] : 'String',
                    'data': self.data,
                    'label_length_class': self.label_length_class,
                    'input_length_class': self.input_length_class,
                    tooltip: tooltip,
                    generated: true
                })
            })

            auxo.array.insertArray(parent, para, index+1)
        },
        buildEndPoints: function () {
            return {
                "type": "ObjectArrayV",
                "$name": "endpoints",
                "label": "End points",
                "tooltip":["需要做流数据转发则需要定义此项, 如转发到kafka"],
                "label_length_class": 'col-sm-12',
                "input_length_class": 'col-sm-12',
                "label_align": "left",
                "advanced":true,
                "addable": true,
                "removable" : true,
                "style": function (self) {
                    return {'margin-top':'20px'}
                },
                "group_style": function (self) {
                    return {'margin-top':self.$index&&self.$index>0? '10px':0}
                },
                "group": [
                    {
                        "type": "String",
                        "$name": "name",
                        "tooltip":["类型"],
                        "dataPath": ["endpoints",""],
                        "advanced":true,
                        "input_length_class": 'col-sm-9',
                        "optional": true,
                        "input_style": function (self) {
                            return {'padding-right':0}
                        }

                    },
                    {
                        "type": "TextArea",
                        "$name": "properties",
                        "input_length_class": 'col-sm-9',
                        "tooltip":["properties"],
                        "dataPath": ["endpoints",""],
                        "optional": true,
                        "advanced":true,
                        "style" : function (self) {
                            return {'margin-top':self.$index>0?'5px':0 }
                        },
                        "input_style": function (self) {
                            return {'padding-right':0}
                        }
                    }
                ],
                "content": [] // group array
            }
        },
        data : {
            "endpoints" : [
                {
                    "name": "",//"localhost:9092",
                    "properties": "",  //"test"
                }
            ]
        },
        buildDefaultInputTab: function () {
            return {
                "category": "Input",
                "title": "input",
                "content": [
                    {
                        "type": "fields",
                        "dataField": "fields",
                        "$name": "input",
                        "source": ""
                    }
                ]
            };
        },
        buildDefaultOutputTab: function () {
            return {
                "category": "Output",
                "title": "output",
                "content": [
                    {
                        "type": "fields",
                        "dataField": "fields",
                        "$name": "output"
                    }
                ]
            }
        },
        buildDefaultInputConfiguration : function () {
            return [
                {
                    "id": "input",
                    "fields": []
                }
            ];
        },
        buildDefaultOutConfiguration: function () {
            return [
                {
                    "id": "output",
                    "fields": []
                }
            ];
        }
    }

    this.types = {
        "default": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input"
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "ResourceSelector",
                                "$name": "dataset",
                                "label": "数据集",
                                "keyword": "dataset",
                                "rootDir": "数据集",
                                "modelId": "id",
                                "selectMode": "single",
                                "popTitle": "数据集选择",
                                "popSource": "datasets",
                                "tooltip": ["数据集名称,从资源目录选择", "格式为字符串：字符/数字/下划线/-的组合"]
                            },
                            // {
                            //     "type": "StringPop",
                            //     "$name": "dataset",
                            //     "popSource": "datasets",
                            //     "tooltip":["cdo名称,从cdo列表选择，或者用户输入", "格式为字符串：字符/数字/下划线/-的组合"]
                            // },
                            {
                                "type": "SelectPop",
                                "selectSource": "schemas",
                                "$name": "schema",

                                "tooltip":["cdc名称；必填项；从cdc名称列表选择；格式为字符串。"]
                            },
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data":
                {
                    "inputConfigurations": [
                        {
                            "id": "output",
                            "fields": []
                        }
                    ],
                    "outputConfigurations": [
                        {
                            "id": "output",
                            "fields": []
                        }
                    ],
                    "otherConfigurations": {}

                }
        },
        "test": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input"
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "StringPop",
                                "$name": "dataset",
                                "popSource": "datasets",
                                "tooltip":["cdo名称,从cdo列表选择，或者用户输入", "格式为字符串：字符/数字/下划线/-的组合"]
                            },
                            {
                                "type": "SelectPop",
                                "selectSource": "schemas",
                                "$name": "schema",

                                "tooltip":["cdc名称；必填项；从cdc名称列表选择；格式为字符串。"]
                            },
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data":
                {
                    "inputConfigurations": [
                        {
                            "id": "output",
                            "fields": []
                        }
                    ],
                    "outputConfigurations": [
                        {
                            "id": "output",
                            "fields": []
                        }
                    ],
                    "otherConfigurations": {

                    }
                }
        },
        "spark_sqlsource": {
            "def": {
                "tabs": [
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "TextArea",
                                "$name": "sql",
                                "height": 250,
                                "tooltip": ["sql"]
                            },
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data":
                {
                    "outputConfigurations": [
                        {
                            "id": "output",
                            "fields": []
                        }
                    ],
                    "otherConfigurations": {
                        "sql": "",
                        "interceptor": ""
                    }
                }
        },
        "spark_source": {
            "def": {
                "tabs": [
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            /*{
                                "type": "StringPop",
                                "$name": "dataset",
                                "popSource": "datasets",
                                "tooltip":["cdo名称,从cdo列表选择，或者用户输入", "格式为字符串：字符/数字/下划线/-的组合"]
                            },
                            {
                                "type": "SelectPop",
                                "selectSource": "schemas",
                                "$name": "schema",

                                "tooltip":["cdc名称；必填项；从cdc名称列表选择；格式为字符串。"]
                            },*/
                            {
                                "type": "ResourceSelector",
                                "$name": "dataset",
                                "label": "数据集",
                                "keyword":"dataset",
                                "rootDir": "Datasets",
                                "modelId": "id",
                                "selectMode": "single",
                                "popTitle": "数据集选择",
                                "popSource": "datasets",
                                "tooltip":["数据集名称,从资源目录选择", "格式为字符串：字符/数字/下划线/-的组合"]
                            },
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data":
                {
                    "outputConfigurations": [
                        {
                            "id": "output",
                            "fields": []
                        }
                    ],
                    "otherConfigurations": {
                        "dataset": "",
                        "schema": ""
                    }
                }
        },
        "spark_analyzeDataset": {
            "def": {
                "tabs": [
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "StringPop",
                                "$name": "dataset",
                                "popSource": "datasets",
                                "tooltip": ["cdo名称,从cdo列表选择，或者用户输入", "格式为字符串：字符/数字/下划线/-的组合"]
                            },
                            {
                                "type": "SelectPop",
                                "selectSource": "schemas",
                                "$name": "schema",

                                "tooltip": ["cdc名称；必填项；从cdc名称列表选择；格式为字符串。"]
                            },
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data":
                {
                    "outputConfigurations": [
                        {
                            "id": "output",
                            "fields": []
                        }
                    ],
                    "otherConfigurations": {
                        "dataset": "",
                        "schema": ""
                    }
                }
        },
        "spark_show": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "String",
                                "$name": "numRows",
                                "example": "10",
                                "tooltip": ["显示行数"],
                            },
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "numRows": "10"
                }
            }
        },
        "sf_source": {
            "def": {
                "tabs": [
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "ResourceSelector",
                                "$name": "dataset",
                                "label": "数据集",
                                "keyword":"dataset",
                                "rootDir": "数据集",
                                "modelId": "id",
                                "selectMode": "single",
                                "popTitle": "数据集选择",
                                "popSource": "datasets",
                                "tooltip":["数据集名称,从资源目录选择", "格式为字符串：字符/数字/下划线/-的组合"]
                            },

                            {
                                "type": "String",
                                "$name": "parallelism",
                                "optional": true,
                                "advanced": true,
                                "tooltip":["并发度"]
                            }
                        ]
                    }
                ]
            },
            "data":
                {
                    "outputConfigurations": [
                        {
                            "id": "output",
                            "fields": []
                        }
                    ],
                    "otherConfigurations": {
                        "dataset": "",
                        "schema": ""
                    }
                }
        },
        "spark_decision": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "yes",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "yes"
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "no",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "no"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "TextArea",
                                "$name": "condition",
                                'label_length_class':'col-sm-12',
                                'input_length_class':'col-sm-12',
                                'label_align' : 'left',
                                'height':200,
                                "tooltip":["添加自定函数中定义的dataflow selector"]
                            },
                            commons.buildDFInteceptor("col-sm-12","col-sm-12","left")
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "yes",
                        "fields": []
                    },
                    {
                        "id": "no",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "interceptor": "",
                    "condition":""
                }
            }
        },
        "sf_decision": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "yes",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "yes"
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "no",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "no"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "String",
                                "$name": "parallelism",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["并发度"]
                            },
                            commons.buildDFUdf("col-sm-12", "col-sm-12", "left")
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "yes",
                        "fields": []
                    },
                    {
                        "id": "no",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "interceptor": "",
                    "condition":""
                }
            }
        },
        "spark_validate": {
            "helper": {
                "actions": [
                    {value:"ignore",name:"忽略"},
                    {value:"error" ,name:"中止执行"},
                    {value:"save"  ,name:"保存错误信息"}
                ]
            },
            "beforeValidate": function(d) {
                if(d.otherConfigurations.action === 'ignore') {
                    d.outputConfigurations.splice(1,1);
                }
                return d;
            },
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "ok",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "ok"
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "error",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "error"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "TextArrayWithName",
                                "$name": "validationRules",
                                "height": 150,
                                "tooltip":["验证规则"],
                                "bindings": [["$text", "expression"]], //df - data field; uf - ui field
                                "onTextChange": function(d) { d.expression = d.$text;},
                                "after_edit": function (d) {
                                    auxo.array.forEachReverse(d, function (e,i) {
                                        if(!e.name && !e.$text) {
                                            d.splice(i, 1);
                                        } else {
                                            e.expression = e.$text;
                                            delete e.$text;
                                        }
                                    })
                                },
                                "before_edit": function (d) {
                                    if(d.length==0) d.push({name:'',$text:''});
                                    else auxo.array.forEach(d, function (e) {
                                        e.$text = e.expression;
                                    })
                                }
                            },
                            {
                                "type": "SelectAction",
                                "default": "$$$.helper.actions[0].value",
                                "selectObjEnum": "$$$.helper.actions",
                                "$name": "action",
                                "tooltip":["错误处理模式"]
                            },
                            {
                                "type": "Boolean",
                                "default": true,
                                "$name": "showDetails",
                                "selectEnum": [
                                    true,
                                    false
                                ],
                                "tooltip":["当不符合规则时, 是否输出这些规则"]
                            },
                            {
                                "type": "String",
                                "$name": "detailColumn",
                                "tooltip":["定义不匹配规则输出信息的标题"],
                            },
                            commons.buildDFInteceptor("col-sm-3","col-sm-9","right")
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "ok",
                        "fields": []
                    },
                    {
                        "id": "error",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "validationRules": [],
                    "action": "$$$.helper.actions[0].value",
                    "showDetails": true,
                    "detailColumn": "errorInfo",
                    "interceptor": ""
                }
            }
        },
        "sf_validate": {
            "helper": {
                "actions": [
                    {value:"ignore",name:"忽略"},
                    {value:"error" ,name:"中止执行"},
                    {value:"save"  ,name:"保存错误信息"}
                ]
            },
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "ok",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "ok"
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "error",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "error"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "TextArrayWithName",
                                "$name": "validationRules",
                                "height": 150,
                                "tooltip":["验证规则"],
                                "bindings": [["$text", "expression"]], //df - data field; uf - ui field
                                "onTextChange": function(d) { d.expression = d.$text;},
                                "after_edit": function (d) {
                                    auxo.array.forEachReverse(d, function (e,i) {
                                        if(!e.name && !e.$text) {
                                            d.splice(i, 1);
                                        } else {
                                            e.expression = e.$text;
                                            delete e.$text;
                                        }
                                    })
                                },
                                "before_edit": function (d) {
                                    if(d.length==0) d.push({name:'',$text:''});
                                    else auxo.array.forEach(d, function (e) {
                                        e.$text = e.expression;
                                    })
                                }
                            },
                            {
                                "type": "SelectAction",
                                "default": "$$$.helper.actions[0].value",
                                "selectObjEnum": "$$$.helper.actions",
                                "$name": "action",
                                "tooltip":["错误处理模式"]
                            },
                            {
                                "type": "Boolean",
                                "default": true,
                                "$name": "showDetails",
                                "selectEnum": [
                                    true,
                                    false
                                ],
                                "tooltip":["当不符合规则时, 是否输出这些规则"]
                            },
                            {
                                "type": "String",
                                "$name": "detailColumn",
                                "tooltip":["定义不匹配规则输出信息的标题"],
                            },
                            {
                                "type": "String",
                                "$name": "parallelism",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["并发度"]
                            }
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "ok",
                        "fields": []
                    },
                    {
                        "id": "error",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "validationRules": [],
                    "action": "$$$.helper.actions[0].value",
                    "showDetails": true,
                    "detailColumn": "errorInfo",
                    "interceptor": ""
                }
            }
        },
        "spark_transform": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "TextArray",
                                "$name": "expressions",
                                "label_length_class": "col-sm-12",
                                "input_length_class": "col-sm-12",
                                "label_align": "left",
                                "height": 150,
                                "example": "timeStamp2Date(report_time,'H')as hour_id, cola,colb, colc as c",
                                "tooltip":["处理字段的表达式。"],
                                "after_edit": function (d) {
                                    auxo.removeNullFromArray(d)
                                },
                                "before_edit": function (d) {
                                    if (d.length == 0) d.push('')
                                }
                            },
                            commons.buildDFInteceptor("col-sm-12","col-sm-12","left")
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "expressions": []
                }
            }
        },
        "sf_transform": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "TextArray",
                                "$name": "expressions",
                                "label_length_class": "col-sm-12",
                                "input_length_class": "col-sm-12",
                                "label_align": "left",
                                "example": "timeStamp2Date(report_time,'H')as hour_id, cola,colb, colc as c",
                                "tooltip":["处理字段的表达式。"],
                                "after_edit": function (d) {
                                    auxo.removeNullFromArray(d)
                                },
                                "before_edit": function (d) {
                                    if (d.length == 0) d.push('')
                                }
                            },
                            {
                                "type": "String",
                                "$name": "parallelism",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["并发度"]
                            }
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "expressions": []
                }
            }
        },
        "spark_cache": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "ResourceSelector",
                                "$name": "dataset",
                                "label": "数据集",
                                "keyword":"dataset",
                                "rootDir": "数据集",
                                "modelId": "id",
                                "selectMode": "single",
                                "popTitle": "数据集选择",
                                "popSource": "datasets",
                                "tooltip":["数据集名称,从资源目录选择", "格式为字符串：字符/数字/下划线/-的组合"]
                            }, {
                                "type": "ResourceSelector",

                                "$name": "schema",
                                "label": "Schema",
                                "keyword": "schema",
                                "rootDir": "Schemas",
                                "modelId": "id",
                                "selectMode": "single",
                                "popTitle": "Schema选择",
                                "popSource": "schemas",
                                "tooltip": ["Schema名称,从资源目录选择", "格式为字符串：字符/数字/下划线/-的组合"]
                            }, {
                                "type": "Select",
                                "selectSource": "input",
                                "$name": "keyColumn",
                                "tooltip":["用作key的字段。"],
                                exportable: true
                            },
                            {
                                "type": "SelectArray",
                                "selectSource": "input",
                                "$name": "valueColumns",
                                "tooltip":["用作value的字段，多个字段用逗号分隔。"]
                            }, {
                                "type": "Select",
                                "selectEnum": [
                                    "MapDB",
                                    "REDIS",
                                    "IGNITE"
                                ],
                                "default": "MapDB",
                                "$name": "engine",
                                "before_edit": function (d, self, parent) {
                                    self.onChange(d, self, parent)
                                },
                                "onChange": function (d, self, parent) {
                                    var value = self.data[self.$name]
                                    auxo.forEachArray(parent, function (e, i) {
                                        switch (e.$name) {
                                            case "path":
                                                e.hidden = value !== "MapDB";
                                                break;
                                            case "url":
                                                e.hidden = ((value !== "IGNITE") && (value !== "REDIS"));
                                                break;
                                            case "cacheName":
                                                e.hidden = value !== "IGNITE";
                                                break;
                                            case "key":
                                            case "password":
                                                e.hidden = value !== "REDIS";
                                                break;
                                        }
                                    })
                                },
                                "tooltip": ["cache系统，包括MapDB和REDIS"]
                            }, {
                                "type": "String",
                                "$name": "path",
                                "tooltip": ["存储cache文件的路径，指定一个目录。"],
                                "isOptional": false
                            }, {
                                "type": "String",
                                "default": "",
                                "$name": "url",
                                "tooltip": ["服务器的url,格式host:port,host:port,......,ignite可以给端口号指定范围如:host:47500..47509"],
                                "isOptional": false
                            }, {
                                "type": "StringRandom",
                                "default": "",
                                "$name": "key",
                                "tooltip": ["Redis中存储的key"],
                                "isOptional": false
                            }, {
                                "type": "StringRandom",
                                "default": "",
                                "$name": "cacheName",
                                "tooltip": ["ignite中缓存的名称"],
                                "isOptional": false
                            }, {
                                "type": "Password",
                                "$name": "password",
                                "optional": true,
                                "tooltip": ["Redis连接密码"]
                            }, {
                                "type": "Separate",
                                "height": '50px',
                                exportable: true
                            },
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "engine": "MapDB",
                    "url": "",
                    "key": "",
                    "cacheName": "",
                    "password": "",
                    "path": "",
                    "keyColumn": "",
                    "valueColumns": [],
                    "dataset": "",
                    "schema": "",
                    "repartition": true
                }
            }
        },
        "sf_lookup": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "Select",
                                "default": "mapping",
                                "selectEnum": [
                                    "mapping",
                                    "chain"
                                ],
                                "$name": "mode",
                                "label_length_class": "col-sm-2",
                                "input_length_class": "col-sm-10",
                                "tooltip":["查找模式"]
                            },
                            {
                                "type":"tabs",
                                "$name":"ruleSettings",
                                "content": [
                                    {
                                        type: "tab",
                                        content: [
                                            {
                                                "type": "ResourceSelector",
                                                "$name": "dataset",
                                                "label": "数据集",
                                                "keyword":"dataset",
                                                "rootDir": "数据集",
                                                "modelId": "id",
                                                "selectMode": "single",
                                                "popTitle": "数据集选择",
                                                "popSource": "datasets",
                                                "label_length_class": "col-sm-12",
                                                "input_length_class": "col-sm-12",
                                                "label_align": "left",
                                                "tooltip":["数据集名称,从资源目录选择", "格式为字符串：字符/数字/下划线/-的组合"]
                                            },
                                            {
                                                "type": "SelectPop",
                                                "selectSource": "schemas",
                                                "$name": "schema",
                                                "label_length_class": "col-sm-12",
                                                "input_length_class": "col-sm-12",
                                                "label_align": "left",
                                                "tooltip":["cdc名称；必填项；从cdc名称列表选择；格式为字符串。"]
                                            },
                                            {
                                                "type": "Select",
                                                "selectSource": "input",
                                                "$name": "inputKeyColumn",
                                                "label_length_class": "col-sm-12",
                                                "input_length_class": "col-sm-12",
                                                "label_align": "left",
                                                "tooltip":["用作key的字段。"]
                                            },
                                            {
                                                "type": "ObjectArray",
                                                "$name": "valueColumns",
                                                "tooltip":["Value columns"],
                                                "label_length_class": "col-sm-12",
                                                "input_length_class": "col-sm-12",
                                                "label_align": "left",
                                                "content" : [
                                                    {
                                                        "type": "Select",
                                                        "selectSource": "api",
                                                        "$name": "name",
                                                        "label": "列名",
                                                        "tooltip":["用作value的字段"]
                                                    },
                                                    {
                                                        "type": "String",
                                                        "$name": "alias",
                                                        "label": "别名",
                                                        "tooltip":["输出时的字段名"]
                                                    },
                                                    {
                                                        "type": "String",
                                                        "$name": "defaultNoMatch",
                                                        "label": "默认值 (no match)",
                                                        "tooltip":["不匹配时的默认值。"]
                                                    },
                                                    {
                                                        "type": "String",
                                                        "$name": "defaultNullKey",
                                                        "label": "默认值 (null key)",
                                                        "tooltip":["为null或空字符串时的默认值。"]
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "String",
                                                "$name": "parallelism",
                                                "optional": true,
                                                "advanced": true,
                                                "tooltip": ["并发度"]
                                            }
                                        ]
                                    }

                                ]
                            }
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "mode":"",
                    "ruleSettings": [
                        {
                            "dataset": "",
                            "schema": "",
                            "inputKeyColumn": "",
                            "valueColumns": [{name:'',alias:'',defaultNoMatch:'',defaultNullKey:''}]
                        }
                    ]
                }
            }
        },
        "spark_lookup": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "Select",
                                "default": "mapping",
                                "selectEnum": [
                                    "mapping",
                                    "chain"
                                ],
                                "$name": "mode",
                                "label_length_class": "col-sm-2",
                                "input_length_class": "col-sm-10",
                                "tooltip":["查找模式"]
                            },
                            {
                                "type":"tabs",
                                "$name":"ruleSettings",
                                "content": [
                                    {
                                        type: "tab",
                                        content: [
                                            {
                                                "type": "ResourceSelector",
                                                "$name": "dataset",
                                                "label": "数据集",
                                                "keyword": "dataset",
                                                "rootDir": "数据集",
                                                "modelId": "id",
                                                "selectMode": "single",
                                                "popTitle": "数据集选择",
                                                "popSource": "datasets",
                                                "label_length_class": "col-sm-12",
                                                "input_length_class": "col-sm-12",
                                                "label_align": "left",
                                                "tooltip": ["数据集名称,从资源目录选择", "格式为字符串：字符/数字/下划线/-的组合"]
                                            },
                                            {
                                                "type": "Select",
                                                "selectSource": "input",
                                                "$name": "inputKeyColumn",
                                                "label_length_class": "col-sm-12",
                                                "input_length_class": "col-sm-12",
                                                "label_align": "left",
                                                "tooltip":["用作key的字段。"]
                                            },
                                            {
                                                "type": "ObjectArray",
                                                "$name": "valueColumns",
                                                "tooltip":["Value columns"],
                                                "label_length_class": "col-sm-12",
                                                "input_length_class": "col-sm-12",
                                                "label_align": "left",
                                                "content" : [
                                                    {
                                                        "type": "Select",
                                                        "selectSource": "api",
                                                        "$name": "name",
                                                        "label": "列名",
                                                        "tooltip":["用作value的字段"]
                                                    },
                                                    {
                                                        "type": "String",
                                                        "$name": "alias",
                                                        "label": "别名",
                                                        "tooltip":["输出时的字段名"]
                                                    },
                                                    {
                                                        "type": "String",
                                                        "$name": "defaultNoMatch",
                                                        "label": "默认值 (no match)",
                                                        "tooltip":["不匹配时的默认值。"]
                                                    },
                                                    {
                                                        "type": "String",
                                                        "$name": "defaultNullKey",
                                                        "label": "默认值 (null key)",
                                                        "tooltip":["为null或空字符串时的默认值。"]
                                                    }
                                                ]
                                            },
                                            commons.buildDFInteceptor("col-sm-12","col-sm-12","left")
                                        ]
                                    }

                                ]
                            }
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "mode":"",
                    "ruleSettings": [
                        {
                            "dataset": "",
                            "schema": "",
                            "inputKeyColumn": "",
                            "valueColumns": [{name:'',alias:'',defaultNoMatch:'',defaultNullKey:''}]
                        }
                    ]
                }
            }
        },
        "spark_aggregate": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "SelectArray",
                                "selectSource": "input",
                                "optional": true,
                                "$name": "groupBy",
                                "tooltip":["用作汇聚的字段，（一般是维度），支持1-n 个字段。"]
                            },
                            {
                                "type": "ObjectArray",
                                "$name": "aggregations",
                                "selectSource": "input",
                                'functions': ['count','avg','countDistinct','sum','sumDistinct','max','min','approxCountDistinct'],
                                "tooltip":["需要汇聚的字段（一般为指标）。目前支持的聚合函数有avg、countDistinct、sum、sumDistinct、max、min和approxCountDistinct. 同样也支持1-n 个字段。必填项，无默认值。字段和函数从下拉列表中选择，别名为手动输入的字母/数字/_组成的字符串, 且第一个字符不允许为数字。"]
                            },

                            commons.buildDFInteceptor()

                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "groupBy": [],
                    "aggregations": []
                }
            }
        },
        "sf_aggregate": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "SelectArray",
                                "selectSource": "input",
                                "optional": true,
                                "$name": "groupBy",
                                "tooltip":["用作汇聚的字段，（一般是维度），支持1-n 个字段。"]
                            },
                            {
                                "type": "ObjectArray",
                                "$name": "aggregations",
                                "selectSource": "input",
                                'functions': ['count','avg','countDistinct','sum','sumDistinct','max','min','approxCountDistinct'],
                                "tooltip":["需要汇聚的字段（一般为指标）。目前支持的聚合函数有avg、countDistinct、sum、sumDistinct、max、min和approxCountDistinct. 同样也支持1-n 个字段。必填项，无默认值。字段和函数从下拉列表中选择，别名为手动输入的字母/数字/_组成的字符串, 且第一个字符不允许为数字。"]
                            },
                            {
                                "type": "String",
                                "$name": "window",
                                "label": "window",
                                "tooltip":["时间筛选，选在该时间段的内生成的数据"]
                            },
                            {
                                "type": "String",
                                "$name": "parallelism",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["并发度"]
                            }

                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "groupBy": [],
                    "aggregations": [{function:'',column:'',alias:""}]
                }
            }
        },
        "spark_filter": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "TextArea",
                                "$name": "condition",
                                "example" : "age<>20",
                                "tooltip":["过滤条件，满足条件的数据将被保留。语法规则与sql类似"],
                                'label_length_class':'col-sm-12',
                                'input_length_class':'col-sm-12',
                                'label_align' : 'left',
                                'height': 200
                            },
                            commons.buildDFInteceptor("col-sm-12","col-sm-12","left")

                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "condition": ""
                }
            }
        },
        "sf_filter": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "TextArea",
                                "$name": "condition",
                                "example" : "age<>20",
                                "tooltip":["过滤条件，满足条件的数据将被保留。语法规则与sql类似"],
                                'label_length_class':'col-sm-12',
                                'input_length_class':'col-sm-12',
                                'label_align' : 'left',
                                'height': 200
                            },
                            {
                                "type": "String",
                                "$name": "parallelism",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["并发度"]
                            }

                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "condition": ""
                }
            }
        },
        "sf_count": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "SelectArray",
                                "selectSource": "input",
                                "$name": "keyColumns",
                                "label": "keyColumns",
                                "tooltip": ["用于分组的列"]
                            }, {
                                "type": "Select",
                                "selectSource": "input",
                                "$name": "timeColumn",
                                "label": "timeColumn",
                                "tooltip": ["作为时间的列"]
                            }, {
                                "type": "String",
                                "$name": "windowSize",
                                "label": "windowSize",
                                "tooltip": ["窗口大小"]
                            }, {
                                "type": "String",
                                "$name": "windowSlideSize",
                                "label": "windowSlideSize",
                                "tooltip": ["窗口滑动间隔"]
                            }, {
                                "type": "Select",
                                "default": "",
                                "selectEnum": [
                                    "yyyy-MM-dd HH:mm:ss",
                                    "yyyyMMddHHmmss"
                                ],
                                "optional": true,
                                "$name": "timeFormat",
                                "label": "timeFormat",
                                "tooltip": ["事件时间格式"]
                            }, {
                                "type": "String",
                                "$name": "allowedLateness",
                                "label": "allowedLateness",
                                "tooltip": ["允许数据最迟到达时间，即新到达的数据如果晚于当前已到达数据的中最早时间与该值的差，将会被丢弃"]
                            }, {
                                "type": "String",
                                "$name": "parallelism",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["并发度"]
                            }
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "keyColumns": [],
                    "timeFormat": "yyyy-MM-dd HH:mm:ss"
                }
            }
        },
        "sf_defake": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "SelectArray",
                                "selectSource": "input",
                                "$name": "keyColumns",
                                "label": "keyColumns",
                                "tooltip": ["用于分组的列"]
                            }, {
                                "type": "Select",
                                "selectSource": "input",
                                "$name": "timeColumn",
                                "label": "timeColumn",
                                "tooltip": ["作为时间的列"]
                            }, {
                                "type": "String",
                                "$name": "windowSize",
                                "label": "windowSize",
                                "tooltip": ["窗口大小"]
                            }, {
                                "type": "Select",
                                "default": "",
                                "selectEnum": [
                                    "yyyy-MM-dd HH:mm:ss",
                                    "yyyyMMddHHmmss"
                                ],
                                "optional": true,
                                "$name": "timeFormat",
                                "label": "timeFormat",
                                "tooltip": ["事件时间格式"]
                            }, {
                                "type": "String",
                                "$name": "allowedLateness",
                                "label": "allowedLateness",
                                "tooltip": ["允许数据最迟到达时间，即新到达的数据如果晚于当前已到达数据的中最早时间与该值的差，将会被丢弃"]
                            }, {
                                "type": "String",
                                "$name": "maxSpeed",
                                "label": "maxSpeed",
                                "tooltip": ["最快时速,单位:km/h"]
                            }, {
                                "type": "Select",
                                "selectSource": "input",
                                "$name": "longitude",
                                "label": "longitude",
                                "tooltip": ["经度"]
                            }, {
                                "type": "Select",
                                "selectSource": "input",
                                "$name": "latitude",
                                "label": "latitude",
                                "tooltip": ["纬度"]
                            }, {
                                "type": "String",
                                "$name": "parallelism",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["并发度"]
                            }
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "keyColumns": [],
                    "timeFormat": "yyyy-MM-dd HH:mm:ss"
                }
            }
        },
        "spark_sql": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "TextArea",
                                "$name": "sql",
                                "example" : "age<>20",
                                "tooltip":["过滤条件，满足条件的数据将被保留。语法规则与sql类似"],
                                'label_length_class':'col-sm-12',
                                'input_length_class':'col-sm-12',
                                'label_align' : 'left',
                                'height': 200
                            },
                            commons.buildDFInteceptor("col-sm-12","col-sm-12","left")
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "sql": ""
                }
            }
        },
        "spark_union": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "Boolean",
                                "default": false,
                                "$name": "distinct",
                                "selectEnum": [
                                    true,
                                    false
                                ],
                                'label_length_class':'col-sm-3',
                                'input_length_class':'col-sm-9',
                                "tooltip":["是否要去除掉输出数据中重复的数据。从下拉框中选择，取值范围为(true, false)。默认值false。"]
                            },
                            commons.buildDFInteceptor("col-sm-3","col-sm-9")

                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "distinct": false
                }
            }
        },
        "sf_union": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "Boolean",
                                "default": false,
                                "$name": "distinct",
                                "selectEnum": [
                                    true,
                                    false
                                ],
                                'label_length_class':'col-sm-3',
                                'input_length_class':'col-sm-9',
                                "tooltip":["是否要去除掉输出数据中重复的数据。从下拉框中选择，取值范围为(true, false)。默认值false。"]
                            },
                            {
                                "type": "String",
                                "$name": "parallelism",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["并发度"]
                            }

                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "distinct": false
                }
            }
        },
        "spark_intersect": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                }
            }
        },
        "spark_minus": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input1",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input2",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input1",
                        "fields": []
                    },
                    {
                        "id": "input2",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                }
            }
        },
        "spark_top": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "Select",
                                "default": 20,
                                "min": 1,
                                "selectEnum": [
                                    "ROW_COUNT",
                                    "RATE"
                                ],
                                "$name": "limitType",
                                "before_edit": function (d, self, parent) {self.onSelectChange(d, self,parent,'init')},
                                "onSelectChange": function (d, self,parent,init) {
                                    var value = self.data[self.$name]
                                    var itemLimitValue = null;
                                    auxo.treeWalk(parent, function (key, value) {
                                        if(value && value.$name ==="limit") {
                                            itemLimitValue = value;
                                            return "break";
                                        }
                                    })
                                    if(!self.data['limit'] || !init) {
                                        if (value === "ROW_COUNT") {
                                            self.data['limit'] = '20'
                                        } else {
                                            self.data['limit'] = '0.2'
                                        }
                                    }
                                    itemLimitValue.$errorTip = null;
                                },
                                "tooltip":["limit 类型，默认值行数"]
                            },
                            {
                                "type": "String",
                                "default": 0.5,
                                "min": 1,
                                "$name": "limit",
                                "onChange": function (self) {
                                    self.$errorTip = null;
                                    var value = self.data[self.$name] + ""
                                    var limitType = self.data['limitType']
                                    if(limitType === 'ROW_COUNT') {
                                        if(!value && value !== '0' )
                                            self.data[self.$name] = '20'
                                        else {
                                            self.data[self.$name] = value.replace(/[^0-9]/g,'');
                                        }
                                    } else {
                                        if(!value && value !== '0' )
                                            self.data[self.$name] = '0.2'
                                        else if(value === 'undefined' || value === '')
                                            0;
                                        else {
                                            var v = value.replace(/[^0-9.]/g, '');
                                            var ss = v.split(".")
                                            if(ss.length >= 2){
                                                self.data[self.$name] = ss[0]==='0'? ss[0] + "." + ss[1]  : '0.' + ss[1]
                                            } else
                                                self.data[self.$name] = v

                                            v = parseFloat(self.data[self.$name])
                                            if(v<0 || v>1)
                                                self.$errorTip = auxo.$sce.trustAsHtml("<div style='color:deeppink;font-weight: bold; font-size: 14px;'>取值范围或者格式有误！</div>")
                                        }
                                    }
                                },
                                "tooltip":["选取数据的行数或者比率，行数默认值为20，比率默认值为0.5,有效值为0-1"]
                            },
                            {
                                "type": "SelectArray",
                                "selectSource": "input",
                                "optional": true,
                                "$name": "groupBy",
                                "example" : "col1, col2, col3, col4",
                                "tooltip":["用于对数据集进行分组的字段，默认值\"\"。"]
                            },
                            {
                                "type": "SelectArray",
                                "$name": "orderBy",
                                "selectSource": "inputOriginal",
                                "example": "col1, col2 desc",
                                "optional": true,
                                "tooltip":["排序规则"]
                            },

                            commons.buildDFInteceptor()

                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "limit": "20",
                    "limitType": "ROW_COUNT",
                    "groupBy": [],
                    "orderBy": []
                }
            }
        },
        "sf_top": '$$$spark_top',
        "sf_top":  {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "Select",
                                "default": 20,
                                "min": 1,
                                "selectEnum": [
                                    "ROW_COUNT",
                                    "RATE"
                                ],
                                "$name": "limitType",
                                "before_edit": function (d, self, parent) {
                                    self.onSelectChange(d, self, parent, 'init')
                                },
                                "onSelectChange": function (d, self, parent, init) {
                                    var value = self.data[self.$name]
                                    var itemLimitValue = null;
                                    auxo.treeWalk(parent, function (key, value) {
                                        if (value && value.$name === "limit") {
                                            itemLimitValue = value;
                                            return "break";
                                        }
                                    })
                                    if (!self.data['limit'] || !init) {
                                        if (value === "ROW_COUNT") {
                                            self.data['limit'] = '20'
                                        } else {
                                            self.data['limit'] = '0.2'
                                        }
                                    }
                                    itemLimitValue.$errorTip = null;
                                },
                                "tooltip": ["limit 类型，默认值行数"]
                            },
                            {
                                "type": "String",
                                "default": 0.5,
                                "min": 1,
                                "$name": "limit",
                                "onChange": function (self) {
                                    self.$errorTip = null;
                                    var value = self.data[self.$name] + ""
                                    var limitType = self.data['limitType']
                                    if (limitType === 'ROW_COUNT') {
                                        if (!value && value !== '0')
                                            self.data[self.$name] = '20'
                                        else {
                                            self.data[self.$name] = value.replace(/[^0-9]/g, '');
                                        }
                                    } else {
                                        if (!value && value !== '0')
                                            self.data[self.$name] = '0.2'
                                        else if (value === 'undefined' || value === '')
                                            0;
                                        else {
                                            var v = value.replace(/[^0-9.]/g, '');
                                            var ss = v.split(".")
                                            if (ss.length >= 2) {
                                                self.data[self.$name] = ss[0] === '0' ? ss[0] + "." + ss[1] : '0.' + ss[1]
                                            } else
                                                self.data[self.$name] = v

                                            v = parseFloat(self.data[self.$name])
                                            if (v < 0 || v > 1)
                                                self.$errorTip = auxo.$sce.trustAsHtml("<div style='color:deeppink;font-weight: bold; font-size: 14px;'>取值范围或者格式有误！</div>")
                                        }
                                    }
                                },
                                "tooltip": ["选取数据的行数或者比率，行数默认值为20，比率默认值为0.5,有效值为0-1"]
                            },
                            {
                                "type": "SelectArray",
                                "selectSource": "input",
                                "optional": true,
                                "$name": "groupBy",
                                "example": "col1, col2, col3, col4",
                                "tooltip": ["用于对数据集进行分组的字段，默认值\"\"。"]
                            },
                            {
                                "type": "SelectArray",
                                "$name": "orderBy",
                                "selectSource": "inputOriginal",
                                "example": "col1, col2 desc",
                                "optional": true,
                                "tooltip": ["排序规则"]
                            },
                            {
                                "type": "String",
                                "$name": "window",
                                "label": "window",
                                "tooltip":["输入时间窗口的大小"]
                            },
                            commons.buildDFInteceptor()

                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "limit": "20",
                    "limitType": "ROW_COUNT",
                    "groupBy": [],
                    "orderBy": []
                }
            }
        },
        "spark_join": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "left",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "left",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Input",
                        "title": "right",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "right",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "Select",
                                "default": "inner",
                                "selectEnum": [
                                    "inner",
                                    "outer",
                                    "left_outer",
                                    "right_outer",
                                    "leftsemi"
                                ],
                                "$name": "joinType",
                                "tooltip":["join的类型。"]
                            },
                            {
                                "type": "ObjectArray",
                                "$name": "joinConditions",
                                "label": "Join condition",
                                "tooltip":["join条件，左边为左输入字段，右边为右输入字段"]
                            },
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "left",
                        "fields": []
                    },
                    {
                        "id": "right",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "joinType": "inner",
                    "joinConditions": [{leftColumn: "",rightColumn: ""}]
                }
            }
        },
        "sf_join": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "left",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "left",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Input",
                        "title": "right",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "right",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "Select",
                                "default": "inner",
                                "selectEnum": [
                                    "inner",
                                    "outer",
                                    "left_outer",
                                    "right_outer",
                                    "leftsemi"
                                ],
                                "$name": "joinType",
                                "label": "Join Type",
                                "tooltip":["join的类型。"]
                            },
                            {
                                "type": "ObjectArray",
                                "$name": "joinConditions",
                                "label": "Join condition",
                                "tooltip":["join条件，左边为左输入字段，右边为右输入字段"]
                            },
                            {
                                "type": "String",
                                "$name": "window",
                                "label": "window",
                                "tooltip": ["输入时间窗口的大小(单位：秒)"]
                            },
                            {
                                "type": "Select",
                                "selectSource": "left",
                                "optional": true,
                                "$name": "leftTimeColumn",
                                "label": "LeftEventTimeColumn",
                                "tooltip": ["左表事件时间字段"]
                            },
                            {
                                "type": "Select",
                                "default": "",
                                "selectEnum": [
                                    "",
                                    "yyyy-MM-dd HH:mm:ss",
                                    "yyyyMMddHHmmss"
                                ],
                                "optional": true,
                                "$name": "leftTimeFormat",
                                "label": "LeftEventTimeFormat",
                                "tooltip": ["左表事件时间格式"]
                            },
                            {
                                "type": "Select",
                                "selectSource": "right",
                                "optional": true,
                                "$name": "rightTimeColumn",
                                "label": "RightEventTimeColumn",
                                "tooltip": ["右表事件时间字段"]
                            },
                            {
                                "type": "Select",
                                "default": "",
                                "selectEnum": [
                                    "",
                                    "yyyy-MM-dd HH:mm:ss",
                                    "yyyyMMddHHmmss"
                                ],
                                "optional": true,
                                "$name": "rightTimeFormat",
                                "label": "RightEventTimeFormat",
                                "tooltip": ["右表事件时间格式"]
                            },
                            {
                                "type": "String",
                                "$name": "parallelism",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["并发度"]
                            }
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "left",
                        "fields": []
                    },
                    {
                        "id": "right",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "joinType": "inner",
                    "joinConditions": [{leftColumn: "", op: "=", rightColumn: ""}]
                }
            }
        },
        "sf_merge": {"def": {
            "tabs": [
                {
                    "category": "Input",
                    "title": "left",
                    "content": [
                        {
                            "type": "fields",
                            "dataField": "fields",
                            "$name": "left",
                            "source": ""
                        }
                    ]
                },
                {
                    "category": "Input",
                    "title": "right",
                    "content": [
                        {
                            "type": "fields",
                            "dataField": "fields",
                            "$name": "right",
                            "source": ""
                        }
                    ]
                },
                {
                    "category": "Output",
                    "title": "leftOut",
                    "content": [
                        {
                            "type": "String",
                            "dataField": "fields",
                            "$name": "leftOut"
                        }
                    ]
                },
                {
                    "category": "Output",
                    "title": "rightOut",
                    "content": [
                        {
                            "type": "String",
                            "dataField": "fields",
                            "$name": "rightOut"
                        }
                    ]
                },
                {
                    "category": "Other",
                    "title": "Other",
                    "content": [
                        {
                            "type": "Select",
                            "default": "both",
                            "selectEnum": [
                                "both",
                                "left_only",
                                "right_only"
                            ],
                            "$name": "joinType",
                            "tooltip":["join的类型。"]
                        },
                        {
                            "type": "ObjectArray",
                            "$name": "joinConditions",
                            "label": "Join condition",
                            "tooltip":["join条件，左边为左输入字段，右边为右输入字段"]
                        },
                        {
                            "type": "ObjectArray",
                            "$name": "selectsOnRight",
                            "label": "selectsOnRight",
                            "tooltip":["select data from right side"],
                            "label_length_class": "col-sm-12",
                            "input_length_class": "col-sm-12",
                            "content" : [
                                {
                                    "type": "Select",
                                    "selectSource": "right",
                                    "$name": "column",
                                    "label": "列名",
                                    "tooltip":["用作value的字段"]
                                },
                                {
                                    "type": "String",
                                    "$name": "alias",
                                    "label": "别名",
                                    "tooltip":["输出时的字段名"]
                                },
                                {
                                    "type": "String",
                                    "$name": "defaultValue",
                                    "label": "默认值",
                                    "tooltip":["不匹配时的默认值。"]
                                }
                            ]
                        },{
                            "type": "ObjectArray",
                            "$name": "selectsOnLeft",
                            "label": "selectsOnLeft",
                            "tooltip":["select data from left side"],
                            "label_length_class": "col-sm-12",
                            "input_length_class": "col-sm-12",
                            "content" : [
                                {
                                    "type": "Select",
                                    "selectSource": "left",
                                    "$name": "column",
                                    "label": "列名",
                                    "tooltip":["用作value的字段"]
                                },
                                {
                                    "type": "String",
                                    "$name": "alias",
                                    "label": "别名",
                                    "tooltip":["输出时的字段名"]
                                },
                                {
                                    "type": "String",
                                    "$name": "defaultValue",
                                    "label": "默认值",
                                    "tooltip":["不匹配时的默认值。"]
                                }
                            ]
                        },{
                            "type": "String",
                            "$name": "window",
                            "label": "window",
                            "tooltip":["输入时间窗口的大小"]
                        },
                        {
                            "type": "Select",
                            "selectSource": "left",
                            "$name": "leftTimeColumn",
                            "label": "LeftTimeColumn",
                            "tooltip": ["左表事件时间字段"]
                        },
                        {
                            "type": "Select",
                            "default": "",
                            "selectEnum": [
                                "",
                                "yyyy-MM-dd HH:mm:ss",
                                "yyyyMMddHHmmss"
                            ],
                            "optional": true,
                            "$name": "leftTimeFormat",
                            "label": "LeftTimeFormat",
                            "tooltip": ["左表事件时间格式"]
                        },
                        {
                            "type": "Select",
                            "selectSource": "right",
                            "$name": "rightTimeColumn",
                            "label": "RightTimeColumn",
                            "tooltip": ["右表事件时间字段"]
                        },
                        {
                            "type": "Select",
                            "default": "",
                            "selectEnum": [
                                "",
                                "yyyy-MM-dd HH:mm:ss",
                                "yyyyMMddHHmmss"
                            ],
                            "optional": true,
                            "$name": "rightTimeFormat",
                            "label": "RightTimeFormat",
                            "tooltip": ["右表事件时间格式"]
                        },
                        {
                            "type": "String",
                            "$name": "parallelism",
                            "optional": true,
                            "advanced": true,
                            "tooltip": ["并发度"]
                        }
                    ]
                }
            ]
        },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "left",
                        "fields": []
                    },
                    {
                        "id": "right",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "leftOut",
                        "fields": []
                    },
                    {
                        "id": "rightOut",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "joinType": "both",
                    "joinConditions": [{leftColumn: "",rightColumn: ""}]
                }
            }
        },
        "sf_deduplication": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "Duplication Output",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "dup-output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "SelectArray",
                                "selectSource": "input",
                                "$name": "keyColumns",
                                "label": "keyColumns",
                                "tooltip": ["用于数据分组的列"]
                            }, {
                                "type": "Select",
                                "selectSource": "input",
                                "$name": "timeColumn",
                                "label": "timeColumn",
                                "tooltip": ["作为时间的列"]
                            }, {
                                "type": "Select",
                                "default": "",
                                "selectEnum": [
                                    "yyyy-MM-dd HH:mm:ss",
                                    "yyyyMMddHHmmss"
                                ],
                                "optional": true,
                                "$name": "timeFormat",
                                "label": "timeFormat",
                                "tooltip": ["事件时间格式"]
                            }, {
                                "type": "String",
                                "$name": "allowedLateness",
                                "label": "allowedLateness",
                                "tooltip": ["允许数据最迟到达时间，即新到达的数据如果晚于当前已到达数据的中最早时间与该值的差，将会被丢弃"]
                            }, {
                                "type": "String",
                                "$name": "sessionGap",
                                "label": "sessionGap",
                                "tooltip": ["两条记录之间的时间差小于该值时，被认为是同一条记录"]
                            }, {
                                "type": "String",
                                "$name": "parallelism",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["并发度"]
                            }
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    },
                    {
                        "id": "dup-output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "keyColumns": [],
                    "timeFormat": "yyyy-MM-dd HH:mm:ss",
                    "timeModule": "eventTime"
                }
            }
        },
        "spark_productjoin": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "left",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "left",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Input",
                        "title": "right",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "right"
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "left",
                        "fields": []
                    },
                    {
                        "id": "right",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                }
            }
        },
        "spark_starjoin": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "Select",
                                "selectSource": "sourceName",
                                "$name": "factTable",
                                "tooltip":["作为中心表的数据集名称。剩余的数据集都将和它进行join操作。"]
                            },
                            {
                                "type": "ObjectArray",
                                "$name": "joinConditions",
                                "tooltip":["校验规则。用于指明每个维表与factTable进行join操作时的规则。"]
                            },
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "factTable": "",
                    "joinConditions": []
                }
            }
        },
        "sf_starjoin": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "Select",
                                "selectSource": "sourceName",
                                "$name": "factTable",
                                "tooltip":["作为中心表的数据集名称。剩余的数据集都将和它进行join操作。"]
                            },
                            {
                                "type": "ObjectArray",
                                "$name": "joinConditions",
                                "tooltip":["校验规则。用于指明每个维表与factTable进行join操作时的规则。"]
                            },
                            {
                                "type": "String",
                                "$name": "parallelism",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["并发度"]
                            }
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "factTable": "",
                    "joinConditions": []
                }
            }
        },
        "spark_split": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "yes",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "yes"
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "no",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "no"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "String",
                                "$name": "condition",
                                "tooltip":["过滤条件，将满足条件的数据和不满足条件的数据分开存储，语法类似于sql。"]
                            },
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "yes",
                        "fields": []
                    },
                    {
                        "id": "no",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "condition": ""
                }
            }
        },
        "sf_split": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "yes",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "yes"
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "no",
                        "content": [
                            {
                                "type": "String",
                                "dataField": "fields",
                                "$name": "no"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "String",
                                "$name": "condition",
                                'label_length_class':'col-sm-2',
                                'input_length_class':'col-sm-10',
                                "tooltip":["过滤条件，将满足条件的数据和不满足条件的数据分开存储，语法类似于sql。"]
                            },
                            {
                                "type": "String",
                                "$name": "parallelism",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["并发度"]
                            }
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "yes",
                        "fields": []
                    },
                    {
                        "id": "no",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "condition": ""
                }
            }
        },
        "spark_sink": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "ResourceSelector",
                                "$name": "dataset",
                                "label": "数据集",
                                "keyword":"dataset",
                                "rootDir": "数据集",
                                "modelId": "id",
                                "selectMode": "single",
                                "popTitle": "数据集选择",
                                "popSource": "datasets",
                                "tooltip": ["数据集名称,从资源目录选择或编辑创建", "格式为字符串：字符/数字/下划线/-/的组合"]
                            },

                            {
                                "type": "ResourceSelector",
                                "$name": "schema",
                                "label": "Schema",
                                "keyword": "schema",
                                "rootDir": "Schemas",
                                "modelId": "id",
                                "selectMode": "single",
                                "popTitle": "Schema选择",
                                "popSource": "schemas",
                                "tooltip": ["Schema名称,从资源目录选择", "格式为字符串：字符/数字/下划线/-的组合"]
                            },
                            {
                                "type": "Select",
                                "selectEnum": [
                                    "HDFS",
                                    "HIVE",
                                    "JDBC",
                                    "KAFKA",
                                    "HBASE",
                                    "FTP",
                                    "ElasticSearch"
                                ],
                                "default": "HDFS",
                                "$name": "type",
                                "before_edit": function (d, self, parent) {self.onChange(d,self,parent)},
                                "onChange": function (d, self, parent) {
                                    var value = self.data[self.$name]
                                    auxo.forEachArray(parent, function (e, i) {
                                        switch (e.$name){
                                            case "sliceTimeColumn":
                                            case "sliceType":
                                            case "path":
                                            case "nullValue":
                                            case "format":
                                                e.hidden = value !== "HDFS";
                                                break;
                                            case "separator":
                                            case "quoteChar":
                                            case "escapeChar":
                                                e.hidden = value !== "HDFS" || (e.data.format&&e.data.format !== 'csv');
                                                break;
                                            case "partitionColumns":
                                                e.hidden = value !== "HIVE" && value !== "JDBC";
                                                break;
                                            case "sql":
                                                e.hidden = true;
                                                break;
                                            case "specifiedStringColumnTypes":
                                                e.hidden = value !== "JDBC";
                                                break;
                                            case "driver":
                                                e.hidden = value !== "JDBC";
                                                break;
                                            case "url":
                                            case "user":
                                            case "password":
                                                e.hidden = value !== "JDBC" && value != "FTP";
                                                break;
                                            case "table":
                                                e.hidden = value !== "JDBC" && value !== "HIVE" && value != "HBASE";
                                                break;
                                            case "brokers":
                                            case "topic":
                                            case "groupId":
                                                e.hidden = value !== "KAFKA";
                                                break;
                                            case "namespace":
                                            case "columns":
                                                e.hidden = value !== "HBASE";
                                                break;
                                        }
                                    })

                                },
                                "tooltip":["数据源格式，包括HDFS和HIVE"]
                            },
                            {"type": "Select",
                                "selectEnum": [
                                    "csv",
                                    "parquet"
                                ],
                                "default": "csv",
                                "$name": "format",
                                "before_edit": function (d, self, parent) {self.onChange(d,self,parent)},
                                "onChange": function (d, self, parent) {
                                    var value = self.data[self.$name]
                                    auxo.forEachArray(parent, function (e, i) {
                                        if(e.$name === 'type') {
                                            e.onChange(d, e, parent);
                                            return false;
                                        }
                                    })

                                },
                                "tooltip":["数据格式，包括CSV和Parquet"]
                            },
                            {
                                "type": "String",
                                "default": ",",
                                "$name": "separator",
                                "tooltip":["输出的文件中字段之间的分隔符"]
                            },
                            {
                                "type": "String",
                                "default": "\"",
                                "$name": "quoteChar",
                                "tooltip":["引号字符"]
                            },
                            {
                                "type": "String",
                                "default": "\\",
                                "$name": "escapeChar",
                                "tooltip":["转义字符"]
                            },
                            {
                                "type": "String",
                                "$name": "path",
                                "tooltip":["输出文件路径"]
                            },{
                                "type": "String",
                                "$name": "nullValue",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["当字段值为null时, 替换为指定字符串。默认值：空字符串"]
                            },{
                                "type": "Select",
                                "$name": "driver",
                                "selectEnum": auxo.jdbc.driverList,
                                "tooltip":["JDBC driver"],
                                "onChange" : function (d, self, parent) {
                                    var url = auxo.array.getItemByAttr(parent, "$name","url")
                                    if(d && url) {
                                        url.data.url = auxo.jdbc.getUrl(d);
                                    }
                                }
                            },
                            {
                                "type": "String",
                                "$name": "url",
                                "tooltip":["JDBC url"]
                            },
                            {
                                "type": "String",
                                "$name": "user",
                                "tooltip":["用户名"]
                            },
                            {
                                "type": "Password",
                                "$name": "password",
                                "tooltip":["密码"]
                            },
                            {
                                "type": "String",
                                "$name": "table",
                                "tooltip":["表名"],
                                "isOptional": function (self) {
                                    var d = self.data;
                                    if (d && (d["type"] === "HIVE" || d["type"] === "JDBC") && d.sql)
                                        return true;
                                }
                            },
                            {
                                "type": "String",
                                "$name": "sql",
                                "tooltip":["HIVE sql 表达式"],
                                "isOptional": function (self) {
                                    var d = self.data;
                                    if (d && (d["type"] === "HIVE" || d["type"] === "JDBC") && d.table)
                                        return true;
                                }
                            },
                            {
                                "type": "String",
                                "$name": "partitionColumns",
                                "tooltip":["HIVE 表分区"],
                                "optional": true
                            },
                            {
                                "type": "String",
                                "$name": "namespace",
                                "tooltip":["hbase namespace"]
                            },
                            {
                                "type": "String",
                                "$name": "columns",
                                "tooltip":["hbase columns"]
                            },
                            {
                                "type": "String",
                                "$name": "brokers",
                                "tooltip":["kafka brokers"]
                            },
                            {
                                "type": "String",
                                "$name": "topic",
                                "tooltip":["kafka topic"]
                            },
                            {
                                "type": "String",
                                "$name": "groupId",
                                "tooltip":["kafka groupId"]
                            },
                            {
                                "type": "ObjectArray",
                                "$name": "specifiedStringColumnTypes",
                                "selectSource": "input",
                                'dataTypes': ['char', 'varchar'],
                                "tooltip": ["指定任意字段在保存到数据库时所使用的数据类型。该参数仅在创建新表时生效。"]
                            },
                            {
                                "type": "String",
                                "optional": true,
                                "$name": "description",
                                "tooltip":["描述信息。"]
                            },
                            {
                                "type": "TimePeriod",
                                "default": 10000,
                                "min": 0,
                                "$name": "expiredTime",
                                "unit": "s",
                                "advanced": true,
                                "tooltip":["有效时间。"]
                            },
                            {
                                "type": "Select",
                                "selectSource": "input",
                                "$name": "sliceTimeColumn",
                                optional: true,
                                "advanced": true,
                                "tooltip":["sink-sliceTimeColumn"]
                            },
                            {
                                "type": "Select",
                                "selectEnum": [
                                    "1",
                                    "5",
                                    "Q",
                                    "F",
                                    "H",
                                    "D"
                                ],
                                "default": "H",
                                "$name": "sliceType",
                                "advanced": true,
                                "tooltip":["sink-sliceType"]
                            },
                            {
                                "type": "Select",
                                "selectObjEnum": [
                                    {value:"append",name:"追加"},
                                    {value:"overwrite",name:"覆盖"},
                                    {value:"error",name:"新建（存在则报错）"},
                                    {value:"ignore",name:"新建（存在则忽略）"},
                                ],
                                "default": "",
                                "$name": "mode",
                                "tooltip":["写入模式"]
                            },
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": null,
                "otherConfigurations": {
                    "dataset": "",
                    "schema": "",
                    "type":"HDFS",
                    "format":"csv",
                    "separator": ",",
                    "quoteChar": "\"",
                    "escapeChar": "\\",
                    "path": "",
                    "sql": "",
                    "table":"",
                    "specifiedStringColumnTypes": [{
                        "name": "",
                        "dataType": "",
                        "length": ""
                    }],
                    "driver" :"",
                    "url": "",
                    "user": "",
                    "password": "",
                    "brokers":"",
                    "topic":"",
                    "groupId":"",
                    "partitionColumns": "",
                    "namespace":"",
                    "columns": "",
                    "description": "",
                    "expiredTime": "0",
                    "sliceTimeColumn": "",
                    "sliceType": "H",
                    "mode": "",
                    "nullValue":""
                }
            }
        },
        "sf_sink": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "ResourceSelector",
                                "$name": "dataset",
                                "label": "数据集",
                                "keyword":"dataset",
                                "rootDir": "数据集",
                                "modelId": "id",
                                "selectMode": "single",
                                "popTitle": "数据集选择",
                                "popSource": "datasets",
                                "tooltip":["数据集名称,从资源目录选择", "格式为字符串：字符/数字/下划线/-的组合"]
                            },

                            {
                                "type": "ResourceSelector",
                                "$name": "schema",
                                "label": "Schema",
                                "keyword": "schema",
                                "rootDir": "Schemas",
                                "modelId": "id",
                                "selectMode": "single",
                                "popTitle": "Schema选择",
                                "popSource": "schemas",
                                "tooltip": ["Schema名称,从资源目录选择", "格式为字符串：字符/数字/下划线/-的组合"]
                            },
                            {
                                "type": "Select",
                                "selectEnum": [
                                    "HDFS",
                                    "JDBC",
                                    "KAFKA",
                                    "ElasticSearch"
                                ],
                                "default": "HDFS",
                                "$name": "type",
                                "before_edit": function (d, self, parent) {self.onChange(d,self,parent)},
                                "onChange": function (d, self, parent) {
                                    var value = self.data[self.$name]
                                    auxo.forEachArray(parent, function (e, i) {
                                        switch (e.$name){
                                            case "sliceTimeColumn":
                                            case "sliceType":
                                            case "path":
                                            case "format":
                                            case "nullValue":
                                            case "batchSize":
                                            case "maxFileAliveTime":
                                            case "maxFileInactiveTime":
                                            case "fileOutputheckInterval":
                                                e.hidden = value !== "HDFS";
                                                break;
                                            case "separator":

                                                e.hidden = value !== "HDFS" || (e.data.format&&e.data.format !== 'csv');
                                                break;
                                            case "partitionColumns":
                                            case "sql":
                                                e.hidden = true;
                                                break;
                                            case "driver":
                                                e.hidden = value !== "JDBC";
                                                break;
                                            case "url":
                                            case "user":
                                            case "password":
                                                e.hidden = value !== "JDBC";
                                                break;
                                            case "table":
                                                e.hidden = value !== "JDBC" && value !== "HIVE" && value != "HBASE";
                                                break;
                                            case "brokers":
                                            case "topic":
                                            case "producer.properties":
                                            case "partitioner":
                                                e.hidden = value !== "KAFKA";
                                                break;
                                        }
                                    })

                                },
                                "tooltip":["数据源格式，包括HDFS和HIVE"]
                            },
                            {"type": "Select",
                                "selectEnum": [
                                    "csv",
                                    "parquet"
                                ],
                                "default": "csv",
                                "$name": "format",
                                "before_edit": function (d, self, parent) {self.onChange(d,self,parent)},
                                "onChange": function (d, self, parent) {
                                    var value = self.data[self.$name]
                                    auxo.forEachArray(parent, function (e, i) {
                                        if(e.$name === 'type') {
                                            e.onChange(d, e, parent);
                                            return false;
                                        }
                                    })

                                },
                                "tooltip":["数据格式，包括CSV和Parquet"]
                            },
                            {
                                "type": "String",
                                "default": ",",
                                "$name": "separator",
                                "tooltip":["输出的文件中字段之间的分隔符"]
                            },
                            {
                                "type": "String",
                                "$name": "path",
                                "tooltip": ["输出文件路径"]
                            }, {
                                "type": "String",
                                "$name": "nullValue",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["当字段值为null时, 替换为指定字符串。默认值：空字符串"]
                            }, {
                                "type": "String",
                                "$name": "batchSize",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["设置文件达到多大时，关闭文件并输出，单位字节(bytes)，符合当前输出条件的数据将写入新文件。默认值： 402,653,184bytes(384M)"]
                            }, {
                                "type": "String",
                                "$name": "maxFileInactiveTime",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["正在输出的问题，超过多长时间不再有后续记录写入时，关闭并输出，单位毫秒(ms)，后续符合相同输出条件的数据将写入新文件。符合maxFileInactiveTime和maxFileAliveTime两种条件中的任何一种，文件即关闭并输出。默认值： 60000ms(1分钟)"]
                            }, {
                                "type": "String",
                                "$name": "maxFileAliveTime",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["正在输出的文件，超过多长时间时，强制关闭并输出，单位毫秒(ms)，后续符合相同输出条件的数据将写入新文件。符合maxFileInactiveTime和maxFileAliveTime两种条件中的任何一种，文件即关闭并输出。默认值： 300000ms(5分钟)"]
                            }, {
                                "type": "String",
                                "$name": "fileOutputheckInterval",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["检查maxFileInactiveTime和maxFileAliveTime是否已达到触发条件的间隔，单位毫秒(ms)。默认值： 60000ms(1分钟)"]
                            }, {
                                "type": "Select",
                                "$name": "driver",
                                "selectEnum": auxo.jdbc.driverList,
                                "tooltip":["JDBC driver"],
                                "onChange" : function (d, self, parent) {
                                    var url = auxo.array.getItemByAttr(parent, "$name","url")
                                    if(d && url) {
                                        url.data.url = auxo.jdbc.getUrl(d);
                                    }
                                }
                            },
                            {
                                "type": "String",
                                "$name": "url",
                                "tooltip":["JDBC url"]
                            },
                            {
                                "type": "String",
                                "$name": "user",
                                "tooltip":["用户名"]
                            },
                            {
                                "type": "Password",
                                "$name": "password",
                                "tooltip":["密码"]
                            },
                            {
                                "type": "String",
                                "$name": "table",
                                "tooltip":["表名"],
                                "isOptional": function (self) {
                                    var d = self.data;
                                    if (d && (d["type"] === "HIVE" || d["type"] === "JDBC") && d.sql) return true;
                                }
                            },
                            {
                                "type": "String",
                                "$name": "sql",
                                "tooltip":["HIVE sql 表达式"],
                                "isOptional": function (self) {
                                    var d = self.data;
                                    if (d && (d["type"] === "HIVE" || d["type"] === "JDBC") && d.table) return true;
                                }
                            },
                            {
                                "type": "String",
                                "$name": "brokers",
                                "tooltip":["kafka brokers"]
                            },
                            {
                                "type": "String",
                                "$name": "topic",
                                "tooltip":["kafka topic"]
                            },
                            {
                                "type": "String",
                                "$name": "partitioner",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["指定Kafka Partition的分配策略， 不指定时默认策略为所有可用Partition轮流写入"]
                            }, {
                                "type": "String",
                                "$name": "producer.properties",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["kafka producer配置文件的绝对路径"]
                            },
                            {
                                "type": "String",
                                "optional": true,
                                "$name": "description",
                                "tooltip":["描述信息。"]
                            },
                            {
                                "type": "TimePeriod",
                                "default": 10000,
                                "min": 0,
                                "$name": "expiredTime",
                                "unit": "s",
                                "advanced": true,
                                "tooltip":["有效时间。"]
                            },
                            {
                                "type": "Select",
                                "selectSource": "input",
                                "$name": "sliceTimeColumn",
                                optional: true,
                                "advanced": true,
                                "tooltip":["sink-sliceTimeColumn"]
                            },
                            {
                                "type": "Select",
                                "selectEnum": [
                                    "",
                                    "1",
                                    "5",
                                    "Q",
                                    "F",
                                    "H",
                                    "D"
                                ],
                                "default": "H",
                                "$name": "sliceType",
                                "advanced": true,
                                "tooltip":["sink-sliceType"]
                            },
                            {
                                "type": "String",
                                "$name": "parallelism",
                                "optional": true,
                                "advanced": true,
                                "tooltip": ["并发度"]
                            }
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": null,
                "otherConfigurations": {
                    "dataset": "",
                    "schema": "",
                    "type":"HDFS",
                    "format":"csv",
                    "separator": ",",
                    "path": "",
                    "sql": "",
                    "table":"",
                    "driver" :"",
                    "url": "",
                    "user": "",
                    "password": "",
                    "brokers":"",
                    "topic":"",

                    "description": "",
                    "expiredTime": "0",
                    "sliceTimeColumn": "",
                    "sliceType": "",
                    "nullValue": ""
                }
            }
        },
        "parallel": {
            "def": {
                "tabs": [
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "ObjectArray",
                                "$name": "conditions",
                            }
                        ]
                    }
                ]
            },
            "data": {
                "otherConfigurations": {
                    "conditions" : []  // {output: "", condition:""}
                }
            }
        },
        "exclusive": {
            "def": {
                "tabs": [
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "ObjectArray",
                                "$name": "conditions",
                            }
                        ]
                    }
                ]
            },
            "data": {
                "otherConfigurations": {
                    "conditions": [] // {output: "", condition:""}
                }
            }
        },
        "event": {
            "def": {
                "tabs": [
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "cron",
                                "$name": "cron",
                                "label": "周期",
                                "tooltip": ["cron 表达式"]
                            },
                            commons.buildFilterClass(),
                            {
                                "type": "TextArea",
                                "$name": "settings",
                                "label": "参数",
                                "tooltip": ["参数设置"],
                                "advanced": true
                            }
                        ]
                    }
                ]
            },
            "data": {
                "otherConfigurations": {
                    "cron": '',
                    "settings": ""
                }
            }
        },
        "dataflow": {
            "def": {
                "hasEndpoints": false,
                "tabs": [
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "$name": "dataflowId$",
                                "label": 'dataflowId',
                                "type": "SelectPop",
                                "selectSource": "flows",
                                "popTitle": "DataFlow",
                                "filter$": "flowType=dataflow&source=rhinos",
                                "keyword": "id",
                                'label_length_class':'col-sm-3',
                                'input_length_class':'col-sm-9',
                                'parameters': [],
                                "before_edit": function (data, self, parent) {
                                    commons.buildFlowParameters(data,self,parent);
                                }
                            },
                            commons.buildWFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "otherConfigurations": {
                    "dataflowId$" : ""
                }
            }
        },
        "streamflow": {
            "def": {
                "hasEndpoints": true,
                "tabs": [
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "$name": "dataflowId$",
                                "label": 'StreamFlowId',
                                "type": "SelectPop",
                                "selectSource": "flows",
                                "popTitle": "DataFlow",
                                "filter$": "flowType=streamflow",
                                "keyword": "id",
                                'label_length_class':'col-sm-3',
                                'input_length_class':'col-sm-9',
                                'parameters': [],
                                "before_edit": function (data, self, parent) {
                                    commons.buildFlowParameters(data,self,parent);
                                }
                            },
                            commons.buildWFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "otherConfigurations": {
                    "dataflowId$" : ""
                }
            }
        },
        "shell": {
            "def": {
                "tabs": [
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "$name": "dataflowId$",
                                "label": 'dataflowId',
                                "type": "Hide",
                                "selectSource": "flows",
                                "popTitle": "Shell",
                                "keyword": "id",
                                'label_length_class':'col-sm-3',
                                'input_length_class':'col-sm-9',
                                'parameters': [],
                                "before_edit": function (data, self, parent) {
                                    commons.buildFlowParameters(data,self, parent)
                                }
                            },
                            commons.buildWFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "otherConfigurations": {
                    "dataflowId$" : "shell"
                }
            }
        },
        "spark": {
            "def": {
                "tabs": [
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "$name": "dataflowId$",
                                "label": 'dataflowId',
                                "type": "Hide",
                                "selectSource": "flows",
                                "popTitle": "spark",
                                "keyword": "id",
                                'label_length_class':'col-sm-3',
                                'input_length_class':'col-sm-9',
                                'parameters': [],
                                "before_edit": function (data, self, parent) {
                                    commons.buildFlowParameters(data,self, parent)
                                }
                            },
                            commons.buildWFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "otherConfigurations": {
                    "dataflowId$" : "spark",
                }
            }
        },

        "hive": {
            "def": {
                "tabs": [
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "$name": "dataflowId$",
                                "label": 'dataflowId',
                                "type": "Hide",
                                "selectSource": "flows",
                                "popTitle": "Hive",
                                "keyword": "id",
                                'label_length_class':'col-sm-3',
                                'input_length_class':'col-sm-9',
                                'parameters': [],
                                "before_edit": function (data, self, parent) {
                                    commons.buildFlowParameters(data, self, parent, {"sql":"TextArea"})
                                }
                            },
                            commons.buildWFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "otherConfigurations": {
                    "dataflowId$" : "hive"
                }
            }
        },
        "hawq": {
            "def": {
                "tabs": [
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "$name": "dataflowId$",
                                "label": 'dataflowId',
                                "type": "Hide",
                                "selectSource": "flows",
                                "popTitle": "Hawq",
                                "keyword": "id",
                                'label_length_class':'col-sm-3',
                                'input_length_class':'col-sm-9',
                                'parameters': [],
                                "before_edit": function (data, self, parent) {
                                    commons.buildFlowParameters(data, self, parent, {"sql":"TextArea"})
                                }
                            },
                            commons.buildWFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "otherConfigurations": {
                    "dataflowId$" : "hawq"
                }
            }
        },
        "mapreduce": {
            "def": {
                "tabs": [
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "$name": "dataflowId$",
                                "label": 'dataflowId',
                                "type": "Hide",
                                "selectSource": "flows",
                                "popTitle": "MapReduce",
                                "keyword": "id",
                                'label_length_class':'col-sm-3',
                                'input_length_class':'col-sm-9',
                                'parameters': [],
                                "before_edit": function (data, self, parent) {
                                    commons.buildFlowParameters(data, self, parent, {"arguments":"TextArea"})
                                }
                            },
                            commons.buildWFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "otherConfigurations": {
                    "dataflowId$" : "mapreduce"
                }
            }
        },
        "spark_supplement": {
            "def": {
                "tabs": [
                    {
                        "category": "Input",
                        "title": "input",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "input",
                                "source": ""
                            }
                        ]
                    },
                    {
                        "category": "Output",
                        "title": "output",
                        "content": [
                            {
                                "type": "fields",
                                "dataField": "fields",
                                "$name": "output"
                            }
                        ]
                    },
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            {
                                "type": "SelectPop",
                                "selectSource": "schemas",
                                "$name": "supplementSchema",
                                "tooltip":["schema名称；必填项"]
                            },
                            {
                                "type" : "Hide",
                                "$name" : "additionalDatasets"
                            },
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": [
                    {
                        "id": "input",
                        "fields": []
                    }
                ],
                "outputConfigurations": [
                    {
                        "id": "output",
                        "fields": []
                    }
                ],
                "otherConfigurations": {
                    "supplementSchema": "",
                    "additionalDatasets" : ""
                }
            }
        },
        "clustering_kmeans_predict": {
            "def": {
                "tabs": [
                    commons.buildDefaultInputTab(),
                    commons.buildDefaultOutputTab(),
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFItem({$name:"modelPath"}),
                            commons.buildFeatureColumns(),
                            commons.buildDFItem({$name:"clusterIdColumn"}),
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": commons.buildDefaultInputConfiguration(),
                "outputConfigurations": commons.buildDefaultOutConfiguration(),
                "otherConfigurations": {
                    "modelPath" : "",
                    "runMode" : "predict",
                    "featureColumns" : [],
                    "clusterIdColumn" : "",
                    "interceptor":"string"
                }
            }
        },
        "clustering_kmeans_train": {
            "def": {
                "tabs": [
                    commons.buildDefaultInputTab(),
                    commons.buildDefaultOutputTab(),
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFItem({$name:"modelPath"}),
                            commons.buildDFItem({$name:"k"}),
                            commons.buildDFItem({$name:"maxIterations"}),
                            commons.buildDFItem({$name:"runs"}),
                            commons.buildDFItem({$name:"epsilon"}),
                            commons.buildDFItem({$name:"initializationMode", selectEnum: ["k-means||","random"]}),
                            commons.buildDFItem({$name:"initializationSteps"}),
                            commons.buildFeatureColumns(),
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": commons.buildDefaultInputConfiguration(),
                "outputConfigurations": commons.buildDefaultOutConfiguration(),
                "otherConfigurations": {
                    "modelPath": "",
                    "runMode" : "train",
                    "k": "2",
                    "maxIterations": "20",
                    "runs": "3",
                    "epsilon": "3.0",
                    "initializationMode": "k-means||",
                    "initializationSteps": "5",
                    "featureColumns": [],
                    "interceptor":"string"
                }
            }
        },
        "classification_gradientboostedtrees_predict": {
            "def": {
                "tabs": [
                    commons.buildDefaultInputTab(),
                    commons.buildDefaultOutputTab(),
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFItem({$name:"modelPath"}),
                            commons.buildFeatureColumns(),
                            commons.buildDFItem({$name:"labelColumn"}),
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": commons.buildDefaultInputConfiguration(),
                "outputConfigurations": commons.buildDefaultOutConfiguration(),
                "otherConfigurations": {
                    "modelPath" : "",
                    "runMode" : "predict",
                    "featureColumns" : [],
                    "labelColumn" : "",
                    "interceptor":"string"
                }
            }
        },
        "classification_gradientboostedtrees_train": {
            "def": {
                "tabs": [
                    commons.buildDefaultInputTab(),
                    commons.buildDefaultOutputTab(),
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFItem({$name:"numIterations"}),
                            commons.buildDFItem({$name:"learningRate"}),
                            commons.buildDFItem({$name:"loss"}),
                            commons.buildDFItem({$name:"impurity","selectEnum":["gini", "entropy"]}),
                            commons.buildDFItem({$name:"maxDepth"}),
                            commons.buildDFItem({$name:"maxBins"}),
                            commons.buildDFItem({$name:"modelPath"}),
                            commons.buildDFItem({$name:"trainPortion"}),
                            commons.buildFeatureColumns(),
                            commons.buildDFItem({$name:"labelColumn"}),
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": commons.buildDefaultInputConfiguration(),
                "outputConfigurations": commons.buildDefaultOutConfiguration(),
                "otherConfigurations": {
                    "runMode": "train",
                    "modelType": "classification",
                    "numIterations": "5",
                    "learningRate": "0.1",
                    "loss": "logLoss",
                    "impurity": "gini",
                    "maxDepth": "5",
                    "maxBins": "32",
                    "modelPath": "",
                    "trainPortion": "0.7",
                    "featureColumns": [],
                    "labelColumn": "label",
                    "interceptor":"string"
                }
            }
        },
        "classification_naivebayes_predict": {
            "def": {
                "tabs": [
                    commons.buildDefaultInputTab(),
                    commons.buildDefaultOutputTab(),
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFItem({$name:"modelPath"}),
                            commons.buildFeatureColumns(),
                            commons.buildDFItem({$name:"labelColumn"}),
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": commons.buildDefaultInputConfiguration(),
                "outputConfigurations": commons.buildDefaultOutConfiguration(),
                "otherConfigurations": {
                    "modelPath" : "",
                    "runMode" : "predict",
                    "featureColumns" : [],
                    "labelColumn" : "",
                    "interceptor":"string"
                }
            }
        },
        "classification_naivebayes_train": {
            "def": {
                "tabs": [
                    commons.buildDefaultInputTab(),
                    commons.buildDefaultOutputTab(),
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFItem({$name:"modelType", selectEnum: ["multinomial", "bernoulli"]}),
                            commons.buildDFItem({$name:"modelPath"}),
                            commons.buildDFItem({$name:"trainPortion"}),
                            commons.buildFeatureColumns(),
                            commons.buildDFItem({$name:"labelColumn"}),
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": commons.buildDefaultInputConfiguration(),
                "outputConfigurations": commons.buildDefaultOutConfiguration(),
                "otherConfigurations": {
                    "runMode": "train",
                    "modelType": "multinomial",
                    "modelPath": "",
                    "trainPortion": "0.6",
                    "featureColumns": [],
                    "labelColumn": "label",
                    "interceptor":"string"
                }
            }
        },
        "regression_linearleastsquares_predict": {
            "def": {
                "tabs": [
                    commons.buildDefaultInputTab(),
                    commons.buildDefaultOutputTab(),
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFItem({$name:"modelPath"}),
                            commons.buildFeatureColumns(),
                            commons.buildDFItem({$name:"labelColumn"}),
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": commons.buildDefaultInputConfiguration(),
                "outputConfigurations": commons.buildDefaultOutConfiguration(),
                "otherConfigurations": {
                    "modelPath" : "",
                    "runMode" : "predict",
                    "featureColumns" : [],
                    "labelColumn" : "",
                    "interceptor":"string"
                }
            }
        },
        "regression_linearleastsquares_train": {
            "def": {
                "tabs": [
                    commons.buildDefaultInputTab(),
                    commons.buildDefaultOutputTab(),
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFItem({$name:"stepSize"}),
                            commons.buildDFItem({$name:"trainIteration"}),
                            commons.buildDFItem({$name:"miniBatchFraction"}),
                            commons.buildDFItem({$name:"modelPath"}),
                            commons.buildDFItem({$name:"trainPortion"}),
                            commons.buildFeatureColumns(),
                            commons.buildDFItem({$name:"labelColumn"}),
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": commons.buildDefaultInputConfiguration(),
                "outputConfigurations": commons.buildDefaultOutConfiguration(),
                "otherConfigurations": {
                    "runMode": "train",
                    "stepSize": "1.0",
                    "trainIteration": "100",
                    "miniBatchFraction":"1.0",
                    "modelPath": "",
                    "trainPortion": "0.7",
                    "featureColumns": [],
                    "labelColumn": "score",
                    "interceptor":"string"
                }
            }
        },
        "classification_logisticregression_predict": {
            "def": {
                "tabs": [
                    commons.buildDefaultInputTab(),
                    commons.buildDefaultOutputTab(),
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFItem({$name: "modelPath"}),
                            commons.buildFeatureColumns(),
                            commons.buildDFItem({$name: "labelColumn"}),
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": commons.buildDefaultInputConfiguration(),
                "outputConfigurations": commons.buildDefaultOutConfiguration(),
                "otherConfigurations": {
                    "modelPath": "",
                    "runMode": "predict",
                    "featureColumns": [],
                    "labelColumn": "",
                    "interceptor": "string"
                }
            }
        },
        "classification_logisticregression_train": {
            "def": {
                "tabs": [
                    commons.buildDefaultInputTab(),
                    commons.buildDefaultOutputTab(),
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFItem({
                                $name: "numClasses",
                                illegal: "[^0-9]",
                                numType: 'i',
                                min: 2,
                                tooltip: ["值 > 1"]
                            }),
                            commons.buildDFItem({
                                $name: "trainIteration",
                                illegal: "[^0-9]",
                                numType: 'i',
                                min: 1,
                                tooltip: ["值 > 0"]
                            }),
                            commons.buildDFItem({$name: "regType", selectEnum: ["L1", "L2"]}),
                            commons.buildDFItem({
                                $name: "regParam",
                                illegal: "[^0-9.]",
                                numType: 'f',
                                min: 0.0,
                                tooltip: ["值 >= 0"]
                            }),
                            commons.buildDFItem({$name: "modelPath"}),
                            commons.buildDFItem({
                                $name: "trainPortion",
                                illegal: "[^0-9.]",
                                numType: 'f',
                                min: 0.0,
                                max: 1.0,
                                tooltip: ["0.0 < 值 < 1.0"]
                            }),
                            commons.buildFeatureColumns(),
                            commons.buildDFItem({$name: "labelColumn"}),
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": commons.buildDefaultInputConfiguration(),
                "outputConfigurations": commons.buildDefaultOutConfiguration(),
                "otherConfigurations": {
                    "runMode": "train",
                    "numClasses": 2,
                    "trainIteration": "1",
                    "regType": "",
                    "regParam": "",
                    "trainPortion": "0.7",
                    "modelPath": "",
                    "featureColumns": [],
                    "labelColumn": "score",
                    "interceptor": "string"
                }
            }
        },
        "classification_randomforest_predict": {
            "def": {
                "tabs": [
                    commons.buildDefaultInputTab(),
                    commons.buildDefaultOutputTab(),
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFItem({$name: "modelPath"}),
                            commons.buildFeatureColumns(),
                            commons.buildDFItem({$name: "labelColumn"}),
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": commons.buildDefaultInputConfiguration(),
                "outputConfigurations": commons.buildDefaultOutConfiguration(),
                "otherConfigurations": {
                    "modelPath": "",
                    "runMode": "predict",
                    "featureColumns": [],
                    "labelColumn": "",
                    "interceptor": "string"
                }
            }
        },
        "classification_randomforest_train": {
            "def": {
                "tabs": [
                    commons.buildDefaultInputTab(),
                    commons.buildDefaultOutputTab(),
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFItem({
                                $name: "modelType",
                                selectEnum: ["classification", "regression"],
                                onSelectChange: function (data, item, tab) {
                                    if (tab)
                                        tab.synchData(tab);
                                }
                            }),
                            commons.buildDFItem({
                                $name: "numClasses",
                                illegal: "[^0-9]",
                                numType: 'i',
                                min: 2,
                                tooltip: ["值 > 1"]
                            }),
                            commons.buildDFItem({
                                $name: "numTrees",
                                illegal: "[^0-9]",
                                numType: 'i',
                                min: 1,
                                tooltip: ["值 > 0"]
                            }),
                            commons.buildDFItem({
                                $name: "impurity",
                                selectEnum: ["gini", "entropy", "variance"],
                                tooltip: ["Criterion used for information gain calculation"]
                            }),
                            commons.buildDFItem({
                                $name: "maxDepth",
                                illegal: "[^0-9.]",
                                numType: 'i',
                                min: 1,
                                tooltip: ["树的最大深度", "值 > 0"]
                            }),
                            commons.buildDFItem({
                                $name: "maxBins",
                                illegal: "[^0-9.]",
                                numType: 'i',
                                min: 1,
                                tooltip: ["分割特征的最大桶数", "值 > 0"]
                            }),
                            commons.buildDFItem({$name: "modelPath", tooltip: ["存放模型的路径"]}),
                            commons.buildDFItem({
                                $name: "trainPortion",
                                illegal: "[^0-9.]",
                                numType: 'f',
                                min: 0.0,
                                max: 1.0,
                                tooltip: ["训练数据占输入数据的比例，剩余数据", "会用来对训练出来的模型进行评估", "0.0 < 值 < 1.0"]
                            }),
                            commons.buildFeatureColumns({
                                onValueChanged: function (item) {
                                    var tab = item.parentTab();
                                    tab.synchData(tab);
                                }
                            }),
                            commons.buildDFItem({$name: "labelColumn", tooltip: ["标记列"]}),
                            commons.buildDFItem({
                                $name: "featureSubsetStrategy",
                                selectEnum: ["auto", "all", "sqrt", "log2", "onethird"]
                            }),
                            {
                                $name: "categoricalFeaturesInfo",
                                type: "DataFrame",
                                default: [{featureColumn: "", categories: 1}],
                                content: [
                                    commons.buildDFItem({$name: "featureColumn", type: "Select", selectEnum: []}),
                                    commons.buildDFItem({$name: "categories", illegal: "[^0-9]", numType: 'i', min: 0})
                                ]
                            },
                            commons.buildDFInteceptor()
                        ],
                        "synchData": function (tab) {
                            var itemMap = {}
                            auxo.treeWalk(tab, function (key, value, path, parent) {
                                if (value && value.$name)
                                    itemMap[value.$name] = value;
                            })
                            var modelType = itemMap['modelType'];
                            var impurity = itemMap['impurity'];
                            if (impurity.selectEnum === undefined)
                                impurity.selectEnum = [];
                            if (modelType.data['modelType'] == 'classification') {
                                auxo.array.removeAll(impurity.selectEnum)
                                auxo.array.insertArray(impurity.selectEnum, ["gini", "entropy"])
                            } else {
                                auxo.array.removeAll(impurity.selectEnum)
                                auxo.array.insertArray(impurity.selectEnum, ["variance"])
                            }
                            var featureColumns = itemMap['featureColumns'];
                            var featureColumn = itemMap['featureColumn'];
                            if (featureColumn.selectEnum === undefined)
                                featureColumn.selectEnum = [];
                            auxo.array.removeAll(featureColumn.selectEnum)
                            auxo.array.insertArray(featureColumn.selectEnum, featureColumns.data['featureColumns'], 0)
                        },
                        "initialized": function (tab) {
                            tab.synchData(tab);
                        }
                    }
                ]
            },
            "data": {
                "inputConfigurations": commons.buildDefaultInputConfiguration(),
                "outputConfigurations": commons.buildDefaultOutConfiguration(),
                "otherConfigurations": {
                    "runMode": "train",
                    "modelType": "classification",
                    "numClasses": 2,
                    "numTrees": 1,
                    "featureSubsetStrategy": 'auto',
                    "categoricalFeaturesInfo": [{featureColumn: "", categories: '1'}],
                    "impurity": "",
                    "maxDepth": "1",
                    "maxBins": "1",
                    "trainPortion": "0.7",
                    "modelPath": "",
                    "featureColumns": [],
                    "labelColumn": "score",
                    "interceptor": "string"
                }
            }
        },
        "frequentpattern_fpgrowth": {
            "def": {
                "tabs": [
                    commons.buildDefaultInputTab(),
                    commons.buildDefaultOutputTab(),
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFItem({$name:"minSupport"}),
                            commons.buildDFItem({$name:"numPartitions"}),
                            commons.buildDFItem({$name:"patternColumn"}),
                            commons.buildDFItem({$name:"frequencyColumn"}),
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": commons.buildDefaultInputConfiguration(),
                "outputConfigurations": commons.buildDefaultOutConfiguration(),
                "otherConfigurations": {
                    "minSupport" : "0.3",
                    "numPartitions" : "1",
                    "patternColumn" : "",
                    "frequencyColumn" : "",
                    "interceptor":"string"
                }
            }
        },
        "sample": {
            "def": {
                "tabs": [
                    commons.buildDefaultInputTab(),
                    commons.buildDefaultOutputTab(),
                    {
                        "category": "Other",
                        "title": "Other",
                        "content": [
                            commons.buildDFItem({$name:"withReplacement"}),
                            commons.buildDFItem({$name:"fraction"}),
                            commons.buildDFInteceptor()
                        ]
                    }
                ]
            },
            "data": {
                "inputConfigurations": commons.buildDefaultInputConfiguration(),
                "outputConfigurations": commons.buildDefaultOutConfiguration(),
                "otherConfigurations": {
                    "withReplacement" : "false",
                    "fraction" : "0.2",
                    "interceptor":"string"
                }
            }
        },

    }
}

_StepData.prototype.initType = function (type) {
    var typeObj = this.types[type];
    if (typeof typeObj === 'string' && typeObj.indexOf("$$$") === 0) {
        typeObj = this.types[type] = this.types[typeObj.substr(3)];
    }
    var def = typeObj.def;
    if(!def.initialized) {
        var other = this.getOtherTab(def);
        if(def.hasEndpoints) {
            other.content.push(this.commons.buildEndPoints())
            typeObj.data.otherConfigurations.endpoints = this.commons.data.endpoints;
        }

        if(other) {
            var label_length_class, input_length_class, label_align;
            auxo.array.forEach(other.content, function (e) {
                if (e.$name === 'interceptor') {
                    label_length_class = e.label_length_class;
                    input_length_class = e.input_length_class;
                    label_align = e.label_align;
                }
                if (e.type === 'Boolean' && !e.selectEnum) {
                    e.selectEnum = [
                        true,
                        false
                    ];
                }
            })
            other.content.push(this.commons.buildSessionCache(label_length_class, input_length_class, label_align));
        }

        auxo.treeWalk(typeObj, function (key, value, path, parent) {
            if(key && typeof value === 'string' && value.indexOf("$$$") === 0) {
                var exp = value.substr(3);
                parent[key] = eval("typeObj" + exp);
                exp =  '';
            }
            if (value && value.$name && !value.label)
                value.label = value.$name;
            if (value && value.tooltip) {
                value.tooltip = auxo.tooltips(value.tooltip);
            }
            if (value && value.$name) {
                if (value.isOptional) {
                    var a = value.isOptional;
                    value.isOptional = function () {
                        return a(value)
                    }
                } else {
                    value.isOptional = function () {
                        return value.optional;
                    }
                }
            }
        });
        def.initialized = true;
    }
}

_StepData.prototype.getType = function (type) {
    return this.types[type];
}

_StepData.prototype.getSchema = function (type) {
    this.initType(type)
    return this.types[type].def;
}

_StepData.prototype.getData = function (type) {
    this.initType(type)
    return this.types[type].data;
}

/*
 * when source(inputs) changes, the input configuration should be cleared or set them as default values,
 * and take them as possible values when in editor. When inputconfiguration is cleared ,
 *  the output configuration should be cleared too, or set to default values (todo), this will cause the
 *  next input node's changes in the flow. One changes, all next nodes will be changed in this flow chain.
 * @param {string} step type, such as source, sink , union
 * @param {object} step data
 * @param {array} the default inputs data from the links source ends
 *
 */
_StepData.prototype.onInputsChange = function (type, data, inputs) {
    //todo
}

_StepData.prototype.allowMultipleInput = function (type) {
    return (auxo.isStepType(type, "union") || auxo.isStepType(type, "starjoin")
        || auxo.isStepType(type, "intersect") );
}

/*
 data: {
 "inputConfigurations":[
 {id: "input", fields: ""},
 ],
 "outputConfigurations":
 [
 {id: "output", fields:""}
 ],
 "otherConfigurations": {
 expression: "",
 "numMappings": "int",
 "ruleSettings": [{
 "ruleName": "",
 "cdoName": "",
 "dataFormat": "",
 "inputKeyColumn": "",
 "ruleValueColumn": "",
 "defaultValue": "",
 "nullDefaultValue": ""
 }]
 }
 }
 "def": {
 "tabs": [{
 "category": "Input",
 "title": "input",
 "content": [{"type": "String", "$condition": {"id": "input"}, "dataField": "fields", "$name": "input"}]
 },
 {
 "category": "Output",
 "title": "output",
 "content": [ { "type": "String", "$condition": {"id": "output"}, "dataField": "fields", "$name": "output" } ]
 },
 {
 "category": "Other",
 "title": "Other",
 "content": [
 { "type": "label", "$name": "ruleSettings", "value": "$groups.length" },
 [
 {"type": "String", "$name": "cdoName", "$groupFirst": true},
 { "type": "String", "$name": "dataFormat" },
 {"type": "String", "$name": "inputKeyColumn"},
 { "type": "String", "$name": "ruleValueColumn" },
 {"type": "String", "$name": "outputColumn"},
 { "type": "String", "$name": "defaultValue" },
 { "type": "Boolean", "default": false, "$name": "nullDefaultValue", "$groupLast": true, "enums": [true, false] }
 ]
 ]
 }]
 },
 *
 * @param {string} step type, such as source, sink , union
 * @param {object} step data
 *
 */
_StepData.prototype.toSchema = function (type, data) {
    var self = this;

    var def = this.getSchema(type);

    var prepareSchemaForSetData = function (type, def, data) {
        if(!data || !def)
            return;

        var inputData = data.inputConfigurations;
        if(inputData && inputData.length > 0) {
            var inputLength = inputData.length;
            if(self.allowMultipleInput(type)) {
                for(var i=1;i<inputLength;i++) {
                    var copy = auxo.clone (def.tabs[0]);
                    def.tabs.splice(0,0,copy);
                }
            }
        }
    }

    var getSchemaInputOrOutputArray = function (def, inputOrOutput) {
        inputOrOutput = inputOrOutput.toLowerCase();
        var inputs = [];
        for(i=0;i<def.tabs.length;i++) {
            var tab = def.tabs[i];
            if(tab.category.toLowerCase() == inputOrOutput) {
                for(k=0;k<tab.content.length;k++) {
                    inputs.push(tab.content[k]);
                }
            }
        }
        return inputs;
    }

    var setDataForInputOutputItem = function (data, def) {
        if(def.dataField && def.dataField != "") {
            //def.value = data[def.dataField];
            def.data = data;
        }
    }

    var setDataForInputOutput = function (data, def, inputOrOutput) {
        var dataPart = inputOrOutput=="input"? data.inputConfigurations: data.outputConfigurations;
        if(!dataPart || dataPart.length < 1)
            return;
        var defPart =  getSchemaInputOrOutputArray(def, inputOrOutput);
        if(dataPart.length != defPart.length)
            console.log("Error: different data and schema length; " + JSON.stringify(dataPart) + "; " + JSON.stringify(dataPart))
        else {
            for (i = 0; i < dataPart.length; i++) {
                setDataForInputOutputItem(dataPart[i], defPart[i]);
            }
        }
    }

    var setDataForOther = function ( data, def, type) {
        var dataPart = data.otherConfigurations;

        var getOtherDef = function () {
            for(i=0;i< def.tabs.length;i++) {
                if(def.tabs[i].category == "Other")
                    return def.tabs[i]
            }
        }

        var otherDef = getOtherDef();
        if (otherDef) {
            auxo.treeWalk(otherDef, function (key, value) {
                if (value && value.$name) {
                    value.parentTab = function () {
                        return otherDef;
                    };
                }
            })
        }
        // set group's data, currently only one case
        if(dataPart && dataPart.ruleSettings) {
            if(dataPart.ruleSettings.length > 0) {

                // append groups
                var group = self.getOtherGroup(otherDef.content);
                var groups = self.getOtherGroups(otherDef.content)

                for(var i=1;i<dataPart.ruleSettings.length;i++) {
                    var g = auxo.clone(group);
                    groups.content.push(g);
                }
// set values
                for(i=0;i<groups.content.length;i++) {
                    var g = groups.content[i]
                    var items = g.content;
                    for(k=0;k<items.length;k++) {
                        items[k].data = dataPart.ruleSettings[i];
                    }
                    self.advancedInit(g)
                }
            }
        }

        function setObjectArrayV(e) {
            if(e.type === "ObjectArrayV" && dataPart && dataPart[e.$name] && dataPart[e.$name].length>0) {
                auxo.array.forEach(dataPart[e.$name], function (a,i) {
                    var item = auxo.clone(e.group,true);
                    e.content.push(item);
                })
            }
        }

        if(otherDef && otherDef.content) {
            for (i = 0; i < otherDef.content.length; i++) {
                var e = otherDef.content[i]
                if (e.type !== 'tabs'  && e.type != "label") {
                    e.data = dataPart;
                    setObjectArrayV(e)
                }
            }
            self.advancedInit(otherDef)
        }
        if (otherDef && otherDef.initialized) {
            otherDef.initialized(otherDef);
        }
    }

    var setDataToSchema = function (def, data, type) {
        if(!data || !def)
            return;

        prepareSchemaForSetData(type,def,data);

        setDataForInputOutput (data, def, "input");
        setDataForInputOutput (data, def, "output");
        setDataForOther(data, def, type)

    }

    var def = auxo.clone(def, true);

    // reOrder tabs input, other, output
    def.tabs.sort(function (a,b) {
        var v1 = 0, v2 = 0;
        if(a.category === 'Input')
            v1 = -1;
        if(a.category === 'Output')
            v1 = 1;
        if(b.category === 'Input')
            v2 = -1;
        if(b.category === 'Output')
            v2 = 1;

        return v1-v2;
    })

    setDataToSchema(def, data, type);
    this.updateTabsTitle(def)

    // transform tooltip
    /*
    auxo.treeWalk(def, function (key, value) {
        if(value && value.tooltip) {
            value.tooltip = auxo.tooltips(value.tooltip);
        }
        if(value && value.$name) {
            if(value.isOptional) {
                var a = value.isOptional;
                value.isOptional = function () {
                    return a(value)
                }
            }else {
                value.isOptional = function () {
                    return value.optional;
                }
            }
        }
    })
     */

    //console.log("#############################Data: " + JSON.stringify(data,null, " "))
    //console.log("#############################Def: " + JSON.stringify(def,null, " "))

    this.updateGroupNum(data,def);

    return def;
}

_StepData.prototype.getOtherTab = function (def) {
    for(var k=0;k<def.tabs.length;k++) {
        if(def.tabs[k].category == "Other")
            return def.tabs[k]
    }
}

/*
 return the first "tabs" because it is supposed that only one tabs exist currently
 @parameter parent: one of tabs' parent
 */
_StepData.prototype.getOtherGroups = function (parent) {
    var tabs;
    auxo.treeWalk(parent, function (key,value,path,parent) {
        if(value && value.type === 'tabs') {
            tabs = value;
            return false
        }
    })
    return tabs;
}

_StepData.prototype.advancedInit = function (tab) {
    auxo.forEachArray(tab.content, function (e,i) {
        e.$index = i;
    })
    tab.content.sort( function (a,b) {
        if(!a.advanced && !b.advanced)
            return  a.$index - b.$index;
        if(a.advanced && b.advanced)
            return a.$index - b.$index;
        if(a.advanced)
            return 1;
        return -1;
    })

    var advancedSet = false;
    for (i = 0; i < tab.content.length; i++) {
        if (tab.content[i].advanced && !advancedSet) {
            tab.content[i].advancedHead = true;
            tab.content[i].style = function (self) {
                return {"margin-top": "20px"}
            }
            advancedSet = true;
        }
    }
}

/*
 return the first tab
 @parameter parent: one of tab's parent
 */
_StepData.prototype.getOtherGroup = function (parent) {
    var tab;
    auxo.treeWalk(parent, function (key,value,path,parent) {
        if(value && value.type === 'tab') {
            tab = value;
            return false
        }
    })
    return tab;
}


_StepData.prototype.getInputTabs = function (def) {
    var tabs = [];
    for(var k=0;k<def.tabs.length;k++) {
        if(def.tabs[k].category == "Input")
            tabs.push(def.tabs[k])
    }
    return tabs;
}
_StepData.prototype.getOutputTabs = function (def) {
    var tabs = [];
    for(var k=0;k<def.tabs.length;k++) {
        if(def.tabs[k].category == "Output")
            tabs.push(def.tabs[k])
    }
    return tabs;
}

_StepData.prototype.removeGroup = function (index, data, def) {
    data.otherConfigurations.ruleSettings.splice(index, 1);
    var other = this.getOtherTab(def)
    var groups = this.getOtherGroups(other.content)
    groups.content.splice(index,1)
}

_StepData.prototype.updateGroupNum = function (data, def) {
    if(data && data.otherConfigurations && data.otherConfigurations.ruleSettings) {
        data.otherConfigurations.numMappings = data.otherConfigurations.ruleSettings.length;
    }

    if(def) {
        var otherTab = this.getOtherTab(def);
        if(otherTab && otherTab.content) {
            var groupCount = 0;
            var ruleSettings ;
            for(var i=0;i<otherTab.content.length;i++) {
                var item = otherTab.content[i];
                if(item.$name == 'ruleSettings')
                    ruleSettings = item;
                if($.isArray(item))
                    groupCount++;
            }
            if(ruleSettings)
                ruleSettings.value = groupCount;
        }
    }
}


_StepData.prototype.updateTabsTitle = function (def) {

    var setTabTitle = function (tabs, inputOrOutput) {
        var titleCn = inputOrOutput.toLowerCase()== 'output'? "输出": "输入"

        if(tabs.length == 1) {
            tabs[0].title = titleCn;
        } else if(tabs.length > 1) {
            for(var k=0;k<tabs.length;k++) {
                var tab = tabs[k];
                var item = tabs[k].content[0];
                if(item.$name != inputOrOutput.toLowerCase()) {
                    tab.title =  item.$name;
                    if(tab.title == 'left')
                        tab.title = "左表"
                    if(tab.title == 'right')
                        tab.title = '右表'
                    if(item.data && item.data.$source) {
                        tab.title += " (" + auxo.ellipsisfy(item.data.$sourceNode.name,10) + ")";
                    }
                } else if(item.data && item.data.$source){
                    tab.title = titleCn +" (" + auxo.ellipsisfy(item.data.$sourceNode.name,10) + ")";
                } else
                    tab.title = titleCn +" (" + k + ")";
            }
        }
    }

    var tabs = this.getInputTabs(def);
    setTabTitle(tabs, "Input")
    tabs = this.getOutputTabs(def);
    setTabTitle(tabs, "Output")

    var tab = this.getOtherTab(def)
    if(tab ) {
        tab.title = "参数"
    }
}

/*
 data: model; def: step's def; sources: input flows' models; flow: flowJson
 */
_StepData.prototype.initWorkflowInputTabs = function(data, def, sources, flow) {
    if(!data.inputConfigurations)
        data.inputConfigurations = [];
    if(!data.outputConfigurations)
        data.outputConfigurations = [];


    if(!flow.inputs || flow.inputs.length === 0)
        auxo.array.removeAll(data.inputConfigurations)
    else {
        var inputs = []
        auxo.forEachArray(sources,function (e,i) {
            if (e.outputConfigurations && e.outputConfigurations.length) {
                auxo.forEachArray(e.outputConfigurations, function (e1, j) {
                    inputs.push(e.id + "." + e1.alias)
                })
            }
        })

        if (!flow.inputs || flow.inputs.length == 0) {
            auxo.array.removeAll(data.inputConfigurations)
        }

        auxo.forEachArrayReverse(data.inputConfigurations, function (e, i) {
            if(inputs.indexOf(e.source)<0) {
                data.inputConfigurations.splice(i, 1);
                return;
            }

            var a = auxo.array.getItemByAttr(flow.inputs, 'name', e.name);
            if(!a)
                data.inputConfigurations.splice(i, 1);
        })

        if(inputs && inputs.length>0 && flow.inputs && flow.inputs.length > 0) {
            var inputTabs = []
            inputTabs.push({
                "category": "WInput",
                "title": "Input",
                "data": data.inputConfigurations,
                "sources": sources,
                "rawInput": flow.inputs,
                "sourceOutputs": inputs
            })

            def.tabs = inputTabs.concat(def.tabs)
        }
    }

    if(flow && flow.outputs && flow.outputs.length) {
        var tab = {
            "category": "WOutput",
            "title": "Output",
            "data": data.outputConfigurations,
            "rawOutput": flow.outputs
        }
        def.tabs = def.tabs.concat(tab)
    } else {
        data.outputConfigurations = [];
    }
}



_StepData.prototype.setInputForWorkflow = function (data, source) {
    var sourceData = {sourceId: source.id, mapping: []}
    data.inputConfigurations.push(sourceData)
}

_StepData.prototype.cleanUpWorkflowInput = function (data, sourceId) {
    var d = data.inputConfigurations
    var index = auxo.array.getItemByAttr(d, 'sourceId', sourceId)
    auxo.removeObj(index, d)
}

/*
 @option left, right for join
 */
_StepData.prototype.setInput = function (target, source, fields, inputOption, outputOption, sourceNode) {
    var self = this;

    var done = false;
    var d = target.inputConfigurations
    var item ;

    if(inputOption) {
        var i = target.step.inputIds.indexOf(inputOption);
        item = d[i];
    }
    else if(self.allowMultipleInput(target.type)) {
        for(var k=0;k<d.length;k++) {
            if(d[k].$source == source) {
                item = d[k]
                break;
            }
        }
        if(!item) {
            for(var k=0;k<d.length;k++) {
                if(!d[k].$source || d[k].$source.length == 0) {
                    item = d[k]
                    break;
                }
            }
        }
    } else
        item = d[0];

    if(!item) {
        var item = auxo.clone(this.getData(target.$stepId).inputConfigurations[0]);
        d.push(item);
    }

    if(item) {
        item.$source = source;
        item.$sourceNode = sourceNode;
        item.$inputFields = fields;
        if(self.allowMultipleInput(target.type))
            item.id = source;
        item.$id = source;
        if(inputOption)
            item.$inputOption = inputOption;
        if(outputOption)
            item.$outputOption = outputOption;
        if (!item.fields || item.fields.length == 0)
            item.fields = auxo.clone(fields);
    }
}

_StepData.prototype.removeInput = function (data, source) {

    auxo.treeWalk(data, function (key, value,path, parent) {
        if(key && value && value.$source == source) {
            if(value.id === 'left' || value.id === 'right') {
                value.fields = [];
            }else
                parent.splice(key, 1);
        }
    })

}


var stepData = new _StepData();
