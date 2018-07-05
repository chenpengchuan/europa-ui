
/* 
 * 用来遍历指定对象所有的属性名称和值
 * obj 需要遍历的对象
 */
function getAllProps(obj) {
    // 用来保存所有的属性名称和值
    var props = new Array;
    // 开始遍历
    for(var p in obj){
        // 方法
        if(typeof(obj[p])=="function"){
            obj[p]();
        }else{
            // p 为属性名称，obj[p]为对应属性的值
            props.push(p + "=" + obj[p]);
        }
    }
    // 最后显示所有的属性
    return props;
};

function getAllPropsKey(obj) {
    // 用来保存所有的属性名称和值
    var props = new Array;
    // 开始遍历
    for(var p in obj){
        // 方法
        if(typeof(obj[p])=="function"){
            obj[p]();
        }else{
            // p 为属性名称
            props.push(p);
        }
    }
    // 最后显示所有的属性
    return props;
};

/* 
 * 用来遍历指定对象所有的属性名称和值,返回指定分隔符的字符串
 * obj 需要遍历的对象
 */
function getAllPropsAsString(obj, seprate) {
    // 用来保存所有的属性名称和值
    var props = "";
    // 开始遍历
    for(var p in obj){
        // 方法
        if(typeof(obj[p])=="function"){
            obj[p]();
        }else{
            // p 为属性名称，obj[p]为对应属性的值
            props+= p + "=" + obj[p] + seprate;
        }
    }
    // 最后显示所有的属性
    return props;
};

function getAllPropsAsURLString(obj) {
    // 用来保存所有的属性名称和值
    var props = "";
    // 开始遍历
    for(var p in obj){
        // 方法
        if(typeof(obj[p])=="function"){
            obj[p]();
        }else{
            // p 为属性名称，obj[p]为对应属性的值
            props+= p + "=" + encodeURIComponent(obj[p]) + "&";
        }
    }
    // 最后显示所有的属性
    return props.substring(0, props.length -1);
};

function getDsRecordAsString(ds, record, seprate){
    var s = "";
    //alert(ds.fields.getLength());
    for(i=0; i < ds.getFieldNames().getLength(); i++){
        var field = ds.getField(ds.getFieldNames().get(i));
        //alert(field.title);
        if(field.displayField)
            s += field.title + "=" +ds.getDisplayValue(field.name, record[field.name]) + seprate;
        else
            s += field.title + "=" +record[field.name] + seprate;

    }
    return s.substring(0, s.length -1);
};


function setCookie(c_name,value,expiredays)
{
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name+ "=" +escape(value)+ ((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
};

function getCookie(c_name)
{
    if (document.cookie.length>0)
    {
        c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1)
        {
            c_start = c_start + c_name.length+1;
            c_end=document.cookie.indexOf(";",c_start);
            if (c_end == -1)
                c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end));
        }
    }
    return null;
};


var oStorage = null;
try{
    oStorage = window.localStorage ? window.localStorage : window.globalStorage[varDomin];//兼容
}catch(err) {
    alert(err.message ? err.message : err.toString());
}

function getStorageItem(key){
    if (oStorage)
        return oStorage.getItem(key); //storage的getItem()方法
    return null;
};

function setStorageItem(key, value){
    if (oStorage)
        oStorage.setItem(key, value);
};

// extend object o with properties of object n
function extendObject(o, n, override){
    for(var p in n)
        if(n.hasOwnProperty(p) && (!o.hasOwnProperty(p) || override))
            o[p]=n[p];
};



function getTreeData (resultData, root, fields, level) {
    var a = root.children;
    var curLevel = level == null? 0 : level;
    for (var i = 0; i < a.length; i++) {
        if (a[i] == null) continue;

        {
            var row = {};
            for (var j=0; j < fields.length; j++) {
                v = a[i][fields[j].name];
                if (j == 0 && v != null && curLevel > 0) {
                    var leading = "                                ".substring(0, curLevel * 4);
                    if (i == (a.length-1))
                        v = leading + "└─" + v;
                    else
                        v = leading + "├─" + v;
                }
                //else if (typeof(v) == 'number')
                //	v = isc.Format.toUSString(v,2);

                if (v == null)  row["C"+(j)+"_" + fields[j].title] = "";
                else
                    row["C"+(j)+"_" + fields[j].title] = v;

            }
            resultData.push(row);
        }

        if (a[i].isFolder && a[i].isFolder == true) {
            getTreeData(resultData, a[i], fields, curLevel + 1);
        }
    }

}
