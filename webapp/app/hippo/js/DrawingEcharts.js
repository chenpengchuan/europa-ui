 var data=[1, 7.3, 5, 3, 6, 4, 2];
 var date=['周一','周二','周三','周四','周五','周六','周日'];

//概览页任务完成情况图
 var task_finished_option = {
     title: {
         text: '',
         subtext: ''
     },
     tooltip: {
         trigger: 'axis'
     },
     legend: {
         data:['今天','昨天']
     },
     toolbox: {
         show: true,
         right:'2%',
         feature: {
             dataView: {readOnly: true},
             magicType: {type: ['line', 'bar']},
             saveAsImage: {}
         }
     },
     xAxis:  {
         type: 'category',
         boundaryGap: false,
         data: ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23']
     },
     yAxis: {
         type: 'value',
         axisLabel: {
             formatter: '{value} '
         }
     },
     series: [
         {
             name:'今天',
             type:'line',
             data:[],
             markPoint: {
                 data: [
                     {type: 'max', name: '最大值'},
                     {type: 'min', name: '最小值'}
                 ]
             },
//             markLine: {
//                 data: [
//                     {type: 'average', name: '平均值'}
//                 ]
//             }
         },{
             name:'昨天',
             type:'line',
             data:[],
             markPoint: {
                 data: [
                     {type: 'max', name: '最大值'},
                     {type: 'min', name: '最小值'}
                 ]
             },
             markLine: {
                 data: [
//                     {type: 'average', name: '平均值'}
                 ]
             }
         }
     ]
 };

// 概览页任务告警情况图
var  alarm_option = {
             title: {
            text: '告警信息'
        },
        color: ['#3398DB'],
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '5%',
            right: '5%',
            bottom: '1%',
            containLabel: true
        },toolbox: {
            show: true,
            right:'3%',
            feature: {
                dataView: {readOnly: true},
                saveAsImage: {}
            }
        },
        xAxis : [
            {
                type : 'category',
                data : ['致命', '严重', '警告'],
                axisTick: {
                    alignWithLabel: true
                }
            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
            itemStyle: {
                    normal: {
            　　　　　//好，这里就是重头戏了，定义一个list，然后根据所以取得不同的值，这样就实现了，
                      color: function(params) {
                       // build a color map as your need.
                        var colorList = [
                           '#C1232B','#FFE42A','#29AAE3'
                        ];
                        return colorList[params.dataIndex]
                      },
            　　　　　//以下为是否显示，显示位置和显示格式的设置了
                      label: {
                             show: true,
                             position: 'top',
                          // formatter: '{b}\n{c}'
                             formatter: '{c}'
                      }
                   }
                },
                name:'告警信息量(条)',
                type:'bar',
                barWidth: '60%',
                data:[]
            }
        ]
    };
//概览页执行分析趋势图
var indexSchudule_option = {
    title: {
        text: '调度趋势',
        //subtext: '测试'
    },
    color: ['#00CD32'],
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data:['执行']
    },
    toolbox: {
        show: true,
        right:'3%',
        feature: {
            dataView: {readOnly: true},
            magicType: {type: ['line', 'bar']},
//            restore: {},
            saveAsImage: {}
        }
    },
    xAxis:  {
        type: 'category',
        boundaryGap: false,
        data: ['5月1日','5月2日','5月3日','5月4日','5月5日','5月6日','5月7日']
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: '{value} '
        }
    },
    series: [
        {
            name:'执行',
            type:'line',
            areaStyle: {normal: {}},
            data:[10, 9, 10, 13,16, 14,12],
            markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            },
            markLine: {
                data: [
                    {type: 'average', name: '平均值'}
                ]
            }
        }
    ]
};

//概览页系统资源监控
var indexResources_option = {
    tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    legend: {
        orient: 'vertical',
        x: 'left',
        data:['占用内核','空闲内核','剩余内存(G)','使用内存(G)']
    },
    series: [
        {
            name:'访问来源',
            type:'pie',
            radius: [0, '50%'],
            label: {
                normal: {
                    position: 'inner',
                      formatter : function (params){
                      if(params.value > 0){
                        return params.name+":"+params.value;
                        } else{
                                return  '';
                         }
                      },
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data:[
                {value:12, name:'占用内核'},
                {value:52, name:'空闲内核'}
            ]
        },
        {
            name:'访问来源',
            type:'pie',
            radius: ['60%', '85%'],
            label: {
                 normal: {
                     formatter: '{b|{b}:}{c}({per|{d}%})',
                     backgroundColor: '#eee',
                     borderColor: '#aaa',
                     rich: {
//                       a: {
//                         color: '#999',
//                         lineHeight: 20,
//                         align: 'center'
//                       },
//                       abg: {
//                         backgroundColor: '#333',
//                         width: '100%',
//                         align: 'right',
//                         height: 22,
//                         borderRadius: [4, 4, 0, 0]
//                       },
//                       hr: {
//                           borderColor: '#aaa',
//                           width: '100%',
//                           borderWidth: 0.5,
//                           height: 0
//                       },
//                       b: {
//                           fontSize: 10,
//                           lineHeight: 25
//                       },
//                       per: {
//                           color: '#eee',
//                           backgroundColor: '#334455',
//                           padding: [2, 4],
//                           borderRadius: 2
//                       }
                     }
                }
          },
          data:[
              {value:54, name:'剩余内存(G)'},
              {value:74, name:'使用内存(G)'}
          ]
        }
    ]
};

//taskhistory任务趋势分析图
 var taskhistory_option = {
    title: {
        text: '',
        subtext: ''
    },
    color: ['#00CD32','#BB0000'],
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data:['成功','失败']
    },
    toolbox: {
        show: true,
        right:'2%',
        feature: {
            dataView: {readOnly: true},
            magicType: {type: ['line', 'bar']},
//            restore: {},
            saveAsImage: {}
        }
    },
    xAxis:  {
        type: 'category',
        boundaryGap: false,
        data: ['周一','周二','周三','周四','周五','周六','周日']
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: '{value} '
        }
    },
     dataZoom: [
            {
                type: 'slider',
                xAxisIndex: 0,
                filterMode: 'empty'
            },
            {
                type: 'inside',
                xAxisIndex: 0,
                filterMode: 'empty'
            }
        ],
    series: [
        {
            name:'成功',
            type:'line',
            data:[11, 11, 15, 13, 12, 13, 10],
            markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            },
            markLine: {
                data: [
                    {type: 'average', name: '平均值'}
                ]
            }
        },
        {
            name:'失败',
            type:'line',
            data:[1, 7.3, 5, 3, 6, 4, 2],
            markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            },
            markLine: {
                data: [
                    {type: 'average', name: '平均值'}
                ]
            }
        }
    ]
};

// taskprobability任务概率分析图
 var taskprobability_option = {
    title : {
        text: '任务执行情况统计',
        subtext: '测试',
        x:'center'
    },
     color: ['#32CD32','#BB0000','#641152'],
    tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
        orient: 'vertical',
        left: 'left',
        data: ['成功','失败','杀死']
    },
    series : [
        {
            name: '运行情况',
            type: 'pie',
            radius : '55%',
            center: ['50%', '60%'],
            data:[],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};

//jobanalysis执行计划分析趋势图
 var jobanalysis_option = {
    title: {
        text: '',
        //subtext: '测试'
    },
    color: ['#00CD32'],
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data:['执行']
    },
    toolbox: {
        show: true,
        right:'2%',
        feature: {
            dataView: {readOnly: true},
            magicType: {type: ['line', 'bar']},
//            restore: {},
            saveAsImage: {}
        }
    },
    xAxis:  {
        type: 'category',
        boundaryGap: false,
        data: ['5月1日','5月2日','5月3日','5月4日','5月5日','5月6日','5月7日']
    },
    yAxis: {
        type: 'value',
        name:'',
        axisLabel: {
            formatter: '{value} '
        }
    },
  dataZoom: [
              {
                  type: 'slider',
                  xAxisIndex: 0,
                  filterMode: 'empty'
              },
              {
                  type: 'inside',
                  xAxisIndex: 0,
                  filterMode: 'empty'
              }
          ],
    series: [
        {
            name:'执行',
            type:'line',
            areaStyle: {normal: {}},
            data:[10, 9, 10, 13,16, 14,12],
            markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            },
            markLine: {
                data: [
                    {type: 'average', name: '平均值'}
                ]
            }
        }
    ]
};
//jobanalysis执行计划分析趋势图
 var resource_option = {
    title: {
        text: '',
        //subtext: '测试'
    },
    color: ['#00CD32','#BB0000'],
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data:['执行','最大内存']
    },
    toolbox: {
        show: true,
        right:'3%',
        feature: {
            dataView: {readOnly: true},
            magicType: {type: ['line', 'bar']},
//            restore: {},
            saveAsImage: {}
        }
    },
    xAxis:  {
        type: 'category',
        boundaryGap: false,
        data: ['5月1日','5月2日','5月3日','5月4日','5月5日','5月6日','5月7日']
    },
    yAxis: {
        type: 'value',
        name:'',
        max:'',
        axisLabel: {
            formatter: '{value} '
        }
    },
  dataZoom: [
              {
                  type: 'slider',
                  xAxisIndex: 0,
                  filterMode: 'empty'
              },
              {
                  type: 'inside',
                  xAxisIndex: 0,
                  filterMode: 'empty'
              }
          ],
    series: [
        {
            name:'执行',
            type:'line',
            areaStyle: {normal: {}},
            data:[10, 9, 10, 13,16, 14,12],
            markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            },
            markLine: {
                data: [
                    {type: 'average', name: '平均值'}
                ]
            }
        },
        {
           name:'最大内存',
           type:'line',
           data:[1, 7.3, 5, 3, 6, 4, 2],
           markLine: {
             data: [
               {type: 'average', name: '平均值'}
             ]
         }
       }
    ]
};
//TaskHistory按系统类别画堆叠条形统计图
  var taskhistorySystem_option = {
    tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
    },
    legend: {
        data:['rhinos(成功)','zebra(成功)','rhinos(失败)','zebra(失败)']
    }, toolbox: {
        show: true,
        right:'2%',
        feature: {
            dataView: {readOnly: true},
            magicType: {type: [ 'tiled','line']},
             restore: {},
            saveAsImage: {}
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis : [
        {
            type : 'category',
            data : ['周一','周二','周三','周四','周五','周六','周日']
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
  dataZoom: [
             {
                 type: 'slider',
                 xAxisIndex: 0,
                 filterMode: 'empty'
             },
             {
                 type: 'inside',
                 xAxisIndex: 0,
                 filterMode: 'empty'
             }
         ],
    series : [

        {
            name:'rhinos(成功)',
            type:'bar',
            stack: '成功',
            data:[]
        },
        {
            name:'zebra(成功)',
            type:'bar',
            stack: '成功',
            data:[]
        },
        {
            name:'rhinos(失败)',
            type:'bar',
            stack: '失败',
            data:[]
        },
        {
            name:'zebra(失败)',
            type:'bar',
            stack: '失败',
            data:[]
        }
    ]
};

//Jobanalysis-Pag 按系统类别画堆叠条形统计图
  var jobanalysisSystem_option = {
    title: {
          text: '执行概览',
          //subtext: '测试'
      },
    color: ['#316a99','#990033'],
    tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
    },
    legend: {
        data:['europa','rhinos','zebra']
    }, toolbox: {
        show: true,
        right:'2%',
        feature: {
            dataView: {readOnly: true},
            magicType: {type: ['stack', 'tiled', 'line']},
             restore: {},
            saveAsImage: {}
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis : [
        {
            type : 'category',
            data : ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23']
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
     dataZoom: [
                {
                    type: 'slider',
                    xAxisIndex: 0,
                    filterMode: 'empty'
                },
                {
                    type: 'inside',
                    xAxisIndex: 0,
                    filterMode: 'empty'
                }
            ],
   series : [

                   {
                       name:'rhinos',
                       type:'bar',
                       stack: '执行',
                       data:[60, 72, 71, 74, 190, 130, 110,111,222,66,77,88,99,90,98,87,76,79,97,22,112,221,68,86]
                   },
                   {
                       name:'zebra',
                       type:'bar',
                       stack: '执行',
                       data:[12, 22, 21, 14, 29, 20, 20,11,22,33,23,32,45,44,54,56,65,27,75,68,90,22,23,24]
                   }
               ]
};

//// 数据资源目录画图
// var datadirectory_option = {
//         title: {
//        text: '数据分布统计'
//    },
//    color: ['#3398DB'],
//    tooltip : {
//        trigger: 'axis',
//        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
//            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
//        }
//    },
//    toolbox: {
//              feature: {
//               dataView: {readOnly: true},
//                  magicType: {type: ['line', 'bar']},
//                  saveAsImage: {}
//              }
//          },
//    grid: {
//        left: '5%',
//        right: '10%',
//        bottom: '10%',
//        containLabel: true
//    },
//    xAxis : [
//        {
//            type : 'category',
//            data : ['mysql1', 'mysql2', 'mysql3', 'mysql4', 'oracle1', 'oracle2', 'oracle3'],
//            axisTick: {
//                alignWithLabel: true
//            }
//        }
//    ],
//    yAxis : [
//        {
//            type : 'value'
//        }
//    ],
//    series : [
//        {
//            name:'数据量(行)',
//            type:'bar',
//            barWidth: '60%',
//            data:[10, 52, 200, 334, 390, 330, 220]
//        }
//    ]
//};

var lineage_option = {
    title: {
        text: '血缘分析图'
     },
    tooltip: {
         trigger: 'item',
         confine:'false',
         enterable:'true',
         formatter: function (params) {
         var res='<div>'+params.name+'</div>'
            if(params.data.valuetype==='Database'||params.data.tablename){
                 if(params.data.storage==='JDBC'){
                   res='<div>DB: '+params.name.substring(5,params.name.length)+'</div>'
                   res+=params.data.tablename ? '<div>Table: '+params.data.tablename+'</div>':"";
                 }
            }else if( params.data.valuetype==='Flow'){
                 res=params.data.fullname ? '<div>'+params.data.fullname+'</div>':"";
                 res+=params.data.storage ? '<div>type : '+params.data.storage+'</div>' : '';
            }else if(params.data.storage){
                 res+='<div>type : '+params.data.storage+'</div>';
            }
            if(params.data.path)
                res+='<div>path : '+params.data.path+'</div>'
            return res;
         }
    },
    series:[{
         type: 'tree',
         edgeLabel: {
            normal: {
                textStyle: {
                fontSize: 2
              }
            }
         },
         data: [{
         	"name": "spc/ceshi(name)",
         	"children": [{
         		"name": "spc/student(id)",
         		"children": [{
         			"name": "spc/test_out(id)",
         			"children": [{
         				"name": "spc/testsp(age)",
         				"children": []
         			},{
         				"name": "spc/testsp(id)",
         				"children": []
         			}]
         		}]
         	},{
         		"name": "spc/testsp(id)",
         		"children": []
         	}]
         }],
         left: '10%',
         right: '10%',
         top: '0%',
         bottom: '0%',
         symbol: 'emptycircle',
          symbolSize: 15,
//          orient: 'vertical',
          expandAndCollapse: true,
          itemStyle:{
               normal:{
                     color:'#6e7074',
                   }
          },
          label: {
               normal: {
                     position: 'left',
                     rotate: 0,
                     verticalAlign: 'middle',
                     align: 'right',
                     fontSize: 15
                }
           },
          leaves: {
                label: {
                      normal: {
                            position: 'right',
                            rotate: -0,
                            verticalAlign: 'middle',
                            align: 'left'
                        }
                 }
          },
          lineStyle: {
                  normal: {
                       opacity: 0.5,
                       width: 4,
                       curveness: 0.5
                   }
          },
          initialTreeDepth: 1,
          animationDurationUpdate: 750
    }]
 }
//画折线图
var drawing_line = function(option,id,xAxis,legend,schedule,execute){
　　var myChart = echarts.init(document.getElementById(id));
     option.legend.data =legend;
     xAxis=Dataformate(xAxis);
     option.xAxis.data=xAxis;
     option.series[0].name= legend[0];
     option.series[0].data= schedule;
     option.series[1].name= legend[1];
     option.series[1].data= execute;
    //使用刚指定的配置项和数据显示图表。
     myChart.setOption(option);
     window.onresize = myChart.resize;
}

//任务趋势分析画图
var drawing_jobanalysis = function(option,id,xAxis,legend,datas,yName){
	   // alert('drawing_taskhistory');
    　　var myChart = echarts.init(document.getElementById(id));
        option.legend.data =legend;
        option.xAxis.data=Dataformate(xAxis);
        option.yAxis.name=yName;
        option.series[0].name= legend[0];
        option.series[0].data= datas;
        myChart.setOption(option);
        window.onresize = myChart.resize;
    }
 