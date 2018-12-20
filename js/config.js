    /**
 * Created by Administrator on 2017/9/12 0012.
 */
var menuObj = '',user = '';

   //var url = 'http://192.168.1.76:9091/index.php/';//本地调试1 %gitlab1%
   //var url_img = 'http://192.168.1.76:9091/';//img路径 %gitlab2%
var url = 'http://192.168.1.222/pro/index.php/';//本地调试2
var url_img = 'http://192.168.1.222/pro/';
//    var url = 'http://test.pailedi.com:8080/index.php/';//本地调试2
//    var url_img = 'http://test.pailedi.com:8080/';

var cookie_user = JSON.parse(sessionStorage.getItem('user'));
var cookie_auth = cookie_user && cookie_user.authList ? cookie_user.authList : null;

var random = Math.random().toString();

var page = {//分页配置
    Size : '15',
    List : [5, 15, 20, 50, 100]
};

var $login = {//缓存加载
    html : $('<div class="ibox-Mask"><i class="fa fa-spinner fa-spin"></i></div>'),
    state : function(){
        if($('.ibox-Mask',parent.document).length > 0){
            $('.ibox-Mask',parent.document).remove();
        }else{
            //$('.ibox-content').append(this.html);
            $('#OAlogin',parent.document).append(this.html);
        }

    }
};

function download(src) {//图片下载
    var $a = document.createElement('a');
    $a.setAttribute("href", src);
    $a.setAttribute("download", "");

    var evObj = document.createEvent('MouseEvents');
    evObj.initMouseEvent('click',false,false,window,0,0,0,0,0,false,true,false,false,0,null);
    $a.dispatchEvent(evObj);
};

var currentDate = {//时间初始化
    Data_y : new Date().getFullYear(),
    Data_m : new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1,
    Data_r : new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate(),
    MonthTime : function(v){//日期格式xxxx-yy v初始值为0 可选
        var month = parseInt(this.Data_m) - v;
        var year = this.Data_y;
        if (month < 1) {
            month += 12;
            year--;
        }
        return year + '-' + (month > 9 ? month : '0' + month);
    },
    dateTime : function(v){//日期格式 xxxx-yy-dd
        var date1 = this.Data_y + '-' + this.Data_m + '-' + this.Data_r;
        return date1;
    },
    neujahr: function() {//日期格式 xxxx-01-01
        return this.Data_y + '-01-01';
    },
    SameMonth : function(){//日期格式 xxxx-当月-01
        var date2 = this.Data_y + '-' + this.Data_m + '-01';
        return date2;
    },
    Yesterday : function(){//日期格式 昨日时间
        var day = (this.Data_r-1);
        var y_yest = this.Data_y, y_month = this.Data_m,y_day = 0;
        if(this.Data_m == '01' && this.Data_r == '01'){
            y_yest = this.Data_y-1;
            y_month = '12';
        }else if(this.Data_r == '01'){
            y_month = this.Data_m-1 < 10?'0' + (this.Data_m-1) : this.Data_m-1;
        }
        y_day = this.Data_r == '01'?new Date(this.Data_y ,y_month,0).getDate():day < 10 ? '0' + day : day;
        var date3 = y_yest + '-' + y_month + '-' + y_day;
        return date3;
    },
    Hours: function() {
        var hours = (new Date()).getHours();
        return hours < 10 ? '0' + hours : hours;
    }
};

$("#login").click(function(){
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('TishiNum');
    location.href = 'login.html';
});

function getCookie(cookie_name) {
    var allcookies = document.cookie;
    var cookie_pos = allcookies.indexOf(cookie_name);   //索引的长度

// 如果找到了索引，就代表cookie存在，
// 反之，就说明不存在。
    if (cookie_pos != -1) {
// 把cookie_pos放在值的开始，只要给值加1即可。
        cookie_pos += cookie_name.length + 1;
        var cookie_end = allcookies.indexOf(";", cookie_pos);
        if (cookie_end == -1)
        {
            cookie_end = allcookies.length;
        }
        var value = unescape(allcookies.substring(cookie_pos, cookie_end)); //这里就可以得到你想要的cookie的值了
    }
    return value;
}
function getUrlName(geturl,name){
    var state = false;
    if(geturl.split('?')[1] != undefined){
        var localarr = geturl.split('?')[1].split('&');
        for(var i=0;i<localarr.length;i++){
            var urlName = localarr[i].split('=');
            if(urlName[0] == name){
                state = urlName[1];
                break;
            }
        }
    }
    return state;
}

function phone(v){ //手机号码校验

    return (/^1[34578]\d{9}$/.test(v));
}
function numLetter(v){ //数字字母校验
    //return /^(?=.*[a-zA-Z]+)(?=.*[0-9]+)[a-zA-Z0-9]+$/.test(v);
}
function token(v){ //token加密
    var cookie_val = JSON.parse(sessionStorage.getItem('user'));
    var currentTime = BASE64.encoder(String(Date.parse(new Date())));
    return cookie_val.token+"%"+currentTime;
}
function authList(v){//权限按钮展示
    var i = cookie_auth.length;

    while (i--) {
        if (cookie_auth[i] === v) {
            return true;
        }
    }
    return false;
}
function select(v){
    var s_data ='';
    $.ajax({
        url: url+'admin/'+v,
        beforeSend: function(request) {
            request.setRequestHeader("token", token());
        },
        dataType: 'JSON',
        async: false,//请求是否异步，默认为异步
        type: 'GET',
        success: function (data) {
            if(data.code == 200){
                s_data = data.data;
            }
        },
        error: function () {
        }
    });
    return s_data
}
function division(v,arr){//人员组数据查询
    var  division_s = '';
    $.ajax({
        url: url+'/admin/structures/getList?is_child_user='+v,
        beforeSend: function(request) {
            request.setRequestHeader("token", token());
        },
        dataType: 'JSON',
        async: false,//请求是否异步，默认为异步
        type: 'GET',
        success: function (data) {
            if(data.code == 200){
                division_s = data.data;
                if(v && arr != ''){
                    //var dArr = arr.split(',');
                    $.each(arr,function(v,i){
                        divisionParents(division_s, i);
                    })
                }
            }
        },
        error: function () {
        }
    });
    return division_s
}
function divisionParents(data,i){//人员选中递归
    $.each(data,function(v1,i1){
        if(i1.child != undefined){
            divisionParents(i1.child,i)
        }
        if(i1.users != ''){
            $.each(i1.users,function(uv2,ui2) {//菜单users
                if(ui2.id == i){
                    ui2.flag = true;
                }
            })
        }
    })
}
var screen = {
    Arr : [//筛选编辑非必选条件
        'dealList',
        'accessList',
        'verify_user_id',
        'verify_username',
        'verify_status',
        'verify_description',
        'create_user_id',
        'license',
        'remark',
        'create_user_name'
    ],
    Fun : function(obj) {
        var i = this.Arr.length;
        while (i--) {
            if (this.Arr[i] === obj) {
                return true;
            }
        }
        return false;
    },
    Delete : function(scope){
        delete scope['dealList'];
        delete scope['accessList'];
    }
}
function forEachs(obj){
    var channelNum = 0;
    $.each(obj,function(i,v){
        if(!screen.Fun(i) && v === ''){
            channelNum++
        }
    })
    return channelNum;
}

function Exports(v,data){//导出下载
    $login.state();
    setTimeout(function(){
        $.ajax({
            url: url+'admin/'+v,
            beforeSend: function(request) {
                request.setRequestHeader("token", token());
            },
            data : data,
            dataType: 'JSON',
            async: false,//请求是否异步，默认为异步
            type: 'GET',
            success: function (data) {
                if(data.code == 200){
                    window.open(url+data.data);
                } else if(data.code == 400) {
                    alert(data.error);
                } else {
                    alert('系统异常，请重试！');
                }
                $login.state();
            },
            error: function () {
                $login.state();
            }
        });
    },200)
}

function OpenDemo(v){//下载模板
    window.open(url_img+v);
}

function makeUrl(moduleId, id) {
    var modules = {
        10: 'admin/channel/',
        20: 'admin/content_provider/',
        30: 'admin/issue/',
        40: 'admin/payment/',
        50: 'admin/address/',
        60: 'admin/project/',
        70: 'admin/product/',
        80: 'admin/product_channel/',
        90: 'admin/operate/',
        100: 'admin/business/',
        210 : 'admin/fine_art/'
    };
    return url + modules[moduleId] + id;
}
function getModuleName(id,list) {
    for (var index = 0; index < list.length; index++) {
        if (list[index].id === id) {
            return list[index].name;
        }
    }
}

function hideTishi(){
    sessionStorage.setItem('TishiNum', 1);
    $("#tishidivshow").hide();
}

// 对对象里的指定属性调用传入的回调函数
function forSome(obj, props, callback) {
    props.forEach(function(prop) {
        if (obj.hasOwnProperty(prop)) {
            obj[prop] = callback(obj[prop]);
        }
    });
}

function IsPC() {//判断cp端移动端
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
        "SymbianOS", "Windows Phone",
        "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}
var rules = {//权限规则展示
    Parents : function(node,v) {
        $.each(node,function(ri,rv) {
            if (v == rv.id) {
                rv.check = true;
            }
            if(rv.child != undefined){
                rules.Parents(rv.child,v)
            }
        })
    },
    Fun : function(v1,val,status) {//权限规则展示
        var rules_data = '';
        var rules_url = status == 1?'/admin/users/getRuleList':'/admin/rules/getList';
        $.ajax({
            url: url + rules_url,
            beforeSend: function(request) {
                request.setRequestHeader("token", token());
            },
            dataType: 'JSON',
            async: false,//请求是否异步，默认为异步
            type: 'GET'
        }).success(function (data) {
            rules_data = data.data;
            if(v1 == 1){
                var rulesList = val.split(',');
                $.each(rulesList,function(i,v){
                    rules.Parents(rules_data,v);
                })
            }
        }).error(function (r) {
            alert('服务器异常，请稍候重试')
        });
        return rules_data;
    }
}

var cherow = {//权限规则单选 -- 递归筛选
    list : '',
    Flag : function(v,flag,data,state) {
        this.Parent(v.child,flag);
        if(flag && state!=1) {
            data.check = true;
            this.list = data.child;
            this.Superior(data.child,v);
        }
    },
    Parent : function(node,flag,num) {//当前子级选中
        if(node != undefined) {
            $.each(node, function (i1, v1) {
                v1.check = flag;
                if (v1.child != undefined) {
                    cherow.Parent(v1.child, flag);
                }
            })
        }
    },
    Superior : function(node,v,idx,supnode){//当前父级选中
        if(node != undefined) {
            $.each(node, function (di, dv) {
                if (dv.id != v.id) {
                    cherow.Superior(dv.child,v,di,node);
                }else{
                    dv = v;
                    if(supnode != undefined){
                        supnode[idx].check = true;
                        cherow.Superior(cherow.list,supnode[idx]);
                    }
                    return false;
                }
            })
        }
    }
}
function responseHandlers(res) {// 用于server 分页，表格数据量太大的话 不想一次查询所有数据，可以使用server分页查询，数据量小的话可以直接把sidePagination: "server"  改为 sidePagination: "client" ，同时去掉responseHandler: responseHandler就可以了，
    if (res.code == 200) {
        return {
            "rows" : res.data.list,
            "total" : res.data.dataCount
        };
    }else if(res.code == 102){
        alert(res.error);
        return false;
    } else if(res.code == 101) {
        location.href = "../../overtime.html"
    }
}

function ScreenSaver(settings){
    var pThis = this;
    this.settings = settings;
    this.nTimeout = this.settings.timeout;
    var f = function(){pThis.timeout();}
    this.timerID = window.setTimeout(f, this.nTimeout);
    document.onmousedown= function(event){
        pThis.signal();
    };
    document.onkeydown = function(event){
        pThis.signal();
    };

}
ScreenSaver.prototype.timeout = function(){
    if ( !this.saver ){
        //alert("您的登录已超时, 请点确定后重新登录!");
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('TishiNum');
        //location.href = 'login.html';
        window.location = 'page/overtime.html';
    }
}
ScreenSaver.prototype.signal = function(){
    var pThis = this;
    window.clearTimeout(this.timerID);
    var f = function(){pThis.timeout();};
    this.timerID = window.setTimeout(f, this.nTimeout);
}

var saver;
function initScreenSaver(e){
    var timeNumber = 60*60*1000*2;
    saver = new ScreenSaver({timeout:timeNumber});
}