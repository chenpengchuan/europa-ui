//数组对象排序
var by = function (prop) {
    return function (obj1, obj2) {
        var val1 = obj1[prop];
        var val2 = obj2[prop];if (val1 < val2) {
            return -1;
        } else if (val1 > val2) {
            return 1;
        } else {
            return 0;
        }
    }
}
var getHours=function(days){
 var hours=[];
 var k=0;
 for(var i=0;i<days.length;i++){
    for(var j=0;j<24;j++){
      (j<10) ? hours[k++]=days[i]+'0'+j : hours[k++]=days[i]+''+j;
    }
 }
  return hours;
}
//初始化数组值为0
var InitializeData=function(length){
    var dataArray=[];
    for(var i=0;i<length;i++){
      dataArray[i] =0;
    }
  //alert(dataArray.length);
    return dataArray;
}

var getTaskHistoryData=function(days,array,success){
     for(var i=0;i<days.length;i++){
       for(var j=0;j<array.length;j++){
         if(days[i] === array[j].facet){
           success[i]=array[j].count;
           break;
         }
       }
     }
     //alert(success[15]);
     return success;
}

//取过去一周的日期
var getWeek = function(){
//设置日期，当前日期的前七天
var myDate = new Date(); //获取今天日期
myDate.setDate(myDate.getDate() - 8);
var dateArray = [];
var dateTemp;
for (var i = 0; i <= 8; i++) {
    dateTemp = myDate.setDate(myDate.getDate() + 1);
    //格式化时间
    var date = new Date(dateTemp);
    dateArray[i]=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+'T16:00:00Z';
  //dateArray[i]=date.getFullYear()+""+(date.getMonth()+1)+""+date.getDate();
}
return dateArray;
}
Date.prototype.format=function (){
    var s='';
    s+=this.getFullYear()+'';          // 获取年份。
    if((this.getMonth()+1)>9){
     s+=(this.getMonth()+1)+"";         // 获取月份。
    }else{
      s+='0'+(this.getMonth()+1)+"";
    }
    if(this.getDate()>=10){
     s+= this.getDate();                 // 获取日。
   }else{
     s+='0'+this.getDate();
   }
    return(s);                          // 返回日期。
};
//取两个日期之间的所有日期
function getAll(begin,end){
var resultDate=[];
 if(begin.indexOf("T") > 0){
    begin = begin.split("T")[0];
    end = end.split("T")[0];
 }
    var ab = begin.split("-");
    var ae = end.split("-");
    var db = new Date();
    db.setUTCFullYear(ab[0], ab[1]-1, ab[2]);
    var de = new Date();
    de.setUTCFullYear(ae[0], ae[1]-1, ae[2]);
    var unixDb=db.getTime();
    var unixDe=de.getTime();
    var i=0;
    for(var k=unixDb;k<unixDe;){
    resultDate[i++]=(new Date(parseInt(k))).format();
    k=k+24*60*60*1000;
    }
    return resultDate;
}
//  画图前格式化X轴的日期格式
var Dataformate=function(dates){
  for(var i=0;i<dates.length;i++){
    var d=dates[i];
    if(d.length<=6){
     dates[i]=d.substring(0,4)+'/'+d.substring(4,6);
    }else if(d.length>6 && d.length<=8){
     dates[i]=d.substring(0,4)+'/'+d.substring(4,6)+'/'+d.substring(6,8);
    }else if(d.length>8 && d.length<=10){
     dates[i]=d.substring(4,6)+'/'+d.substring(6,8)+' '+d.substring(8,10);
    }else if(d.length>10 && d.length<=12){
     dates[i]=d.substring(4,6)+'/'+d.substring(6,8)+' '+d.substring(8,10)+':'+d.substring(10,12);
    }
  }
  return dates;
}