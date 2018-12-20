/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('busExamine',[]);
app.controller('busExamineCtrl',function($http,$scope) {
    var self = this;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = state;
    if(!state) {
        $scope.index = authList('address-index');//查看列表权限
        $scope.read = authList('address-read');//查看详情权限
        $scope.update = authList('address-update');//编辑操作
        $scope.save = authList('address-save');//添加操作
        $scope.delete = authList('address-delete');//删除操作
        $scope.deletes = authList('address-deletes');//批量删除操作
        $scope.enables = authList('address-enables');//批量启用禁用操作
    }
    $("#query").show();
    self.id = '';
    $scope.deleteState = false;
    $scope.editState = false;
    $scope.iconState = false;
    $scope.Id = '';
    $scope.Channel = '';//渠道-初始化
    $scope.Company = '';//单位-初始化
    $scope.Region = '';//地区-初始化
    self.Channel_s = '';//地区-搜索
    self.Company_s = '';//地区-搜索
    self.Region_s = '';//地区-搜索
    self.startDate = '';//开始时间
    self.endDate = '';//结束时间
    $scope.select = {
        selectChannel: '', //选择项目的名字
        selectCompany: '', //选择产品的名字
        selectRegion: '' //选择渠道的名字
    };
    $scope.Method = $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = 0;
    var Data = new Date();
    var Data_y = Data.getFullYear();
    var Data_m = Data.getMonth()+1 < 10?'0'+(Data.getMonth()+1):Data.getMonth()+1;
    var Data_r = Data.getDate() < 10?'0'+Data.getDate():Data.getDate();
    $scope.Newdate1 = self.startDate = Data_y+'-01-01';
    $scope.Newdate2 = self.endDate = Data_y+'-'+Data_m+'-'+Data_r;//当前年月日
    $scope.businessArr = $scope.copybusinessArr = new Object();

    $scope.ChannelList = select('project/getProjectList');//获取单位list
    $scope.RegionList = select('channel/getChannelList');//获取单位list

    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.ChannelList = select('product/getProductList');//刷新渠道list
        $scope.CompanyList = '';//刷新单位list
        $scope.RegionList = select('content_provider/getContentProviderList');//获取单位list
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.search = function(params){ //搜索
        self.Channel_s = $scope.select.selectChannel;
        self.Company_s = $scope.select.selectCompany;
        self.Region_s = $scope.select.selectRegion;
        self.startDate = $scope.Newdate1;
        self.endDate = $scope.Newdate2;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    //$scope.deleteFun = function(params){//删除
    //    $("#table_delete").modal("show");
    //}
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.businessArr.id;
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: token() };
        $http({
            method: 'get',
            url: url + 'admin/business/'+$scope.businessArr.id,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copybusinessArr = data.data;
                if(params == 1){
                    $("#deal-table").bootstrapTable({
                        data: $scope.copybusinessArr.dealList,
                        pagination: true
                    });
                    $scope.examineArr = {
                        id : data.data.id,
                        status : 1,
                        description : ''
                    }
                    $("#details").modal("show");
                }
            }
        }).error(function(){
        });
    }
    $scope.examine = function(){
    }

    $scope.projectFun = function(v) {
        var pid = v == 1 ? $scope.copybusinessArr.project_id : $scope.Channel;
        ProjectId(pid, v);
        $scope.select.selectCompany = $scope.Company = '';
    };

    $scope.setChannel = function(item) {
        $scope.select.selectChannel = item.project_name;
        $scope.Channel = item.id;
    };

    $scope.setCompany = function(item) {
        $scope.select.selectCompany = item.product_name;
        $scope.Company = item.id;
    };

    $scope.setRegion = function(item) {
        $scope.select.selectRegion = item.channel_name;
        $scope.Region = item.id;
    };

    function ProjectId(id,v){
        $http.defaults.headers.common = { token: token() };
        $http({
            method : 'get',
            url: url + 'admin/product/getProductByProjectId',
            params : {project_id:id},
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function(data){
            if(data.code == 200){
                if(v == 1){
                    $scope.Region_s = data.data;//获取渠道list
                }else {
                    $scope.CompanyList = data.data;//获取渠道list
                    $scope.Company = '';
                }
            }else if(data.code == 400){
                if(v==1) {
                    $scope.Region_s = '';//获取渠道list
                    $scope.copybusinessArr.product_id = '';//获取渠道list
                }else{
                    $scope.CompanyList = '';//获取渠道list
                    $scope.Company = '';
                }
            }
        }).error(function(r){
            alert('服务器异常，请稍候重试')
        })
    }

    lay('#date_1').on('click', function(e) {
        //date_1 是一个按钮
        laydate.render({
            elem: '#date1',
            show: true, //直接显示
            closeStop: '#date_1', //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
            done: function(value, date, endDate) {
                //监听日期选择完毕
                $scope.Newdate1 = value;
            }
        });
    });

    lay('#date_2').on('click', function(e) {
        //date_1 是一个按钮
        laydate.render({
            elem: '#date2',
            show: true, //直接显示
            closeStop: '#date_2', //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
            done: function(value, date, endDate) {
                //监听日期选择完毕
                $scope.Newdate2 = value;
            }
        });
    });
    function iosTable() {
        if (/iPhone/i.test(navigator.userAgent)) {
            document.querySelector('.bootstrap-table').style.width = (window.screen.availWidth - 25) + 'px';
        }
    }
    function initTable(){
//        var url = "../../json/sys_menu.json";
        $('#demo-table').bootstrapTable({
            method:'get',
            dataType:'json',
            contentType: "application/x-www-form-urlencoded",
            cache: false,
            striped: true,                              //是否显示行间隔色
            sidePagination: "server",           //分页方式：client客户端分页，server服务端分页（*）
            url:url + 'admin/business',
            showColumns:false,
            pagination:true,
            showRefresh:false,
            queryParams : queryParams,
            ajaxOptions : {
                headers : {
                    "token": token()
                }
            },
            minimumCountColumns:2,
            pageNumber:1,                       //初始化加载第一页，默认第一页
            pageSize: parents.page.Size,                       //每页的记录行数（*）
            pageList: parents.page.List,        //可供选择的每页的行数（*）
            uniqueId: "id",                     //每一行的唯一标识，一般为主键列
            showExport: true,
            exportDataType: 'all',
            responseHandler: responseHandler,
            onLoadSuccess:function(data){ //成功的回调
                if(data.total != 0) {
                    $("#demo-table tbody tr").click(function () {
                        $scope.deleteState = $scope.editState = $scope.iconState = true;
                        $scope.businessArr = $scope.copybusinessArr = data.rows[$(this).index()];
                        $scope.copybusinessArr.tax_registration = Number($scope.copybusinessArr.tax_registration);
                        $("#demo-table tbody tr").siblings().removeClass("bg-color").eq($(this).index()).addClass("bg-color");
                    })
                }
            }
        });
        numData = function(value, row, index) {
            return  index+1;
        };
        share = function(value, row, index) {
            //var c_value = '<div>'+value+'%</div>';
            //if(value == null){
            //    c_value = '无'
            //}
            //return c_value;
        };
    }
    //解决窗口收缩，表头不变的问题
    $(window).resize(function() {
        $('#demo-table').bootstrapTable('resetView');
    });
    //popoverstate窗口关闭state
    $(document).click(function(){
        $("#popoverstate").hide();
    });
    $scope.statedelete = function(){
        $("#popoverstate").hide();
    }
    $("#popoverstate").click(function(e){
        e.stopPropagation();
    });
    //popoverstate窗口关闭end
    $scope.stateedit = function(v){
        var pop_che = $("#pop_che").is(':checked');
        $scope.businessArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: token() };
        $http({
            method : "put",
            url: url + 'admin/business/'+$scope.businessArr.id,
            params : $scope.businessArr,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function(data){
            if(data.code == 200){
                if(pop_che){
                    $('.fastatus').eq($scope.stateIndex).removeClass('fa-square-o').addClass('text-success fa-check-square-o');
                }else{
                    $('.fastatus').eq($scope.stateIndex).removeClass('text-success','fa-check-square-o').addClass('fa-square-o');
                }
                $("#popoverstate").hide();
            }else{
                alert( data.error);
            }
        }).error(function(r){
            alert('服务器异常，请稍候重试');
        })
    }

    function queryParams(params) {
        var param = {
            page : this.pageNumber,
            limit : this.pageSize,
            is_verify : false,
            start_date : self.startDate,
            end_date : self.endDate,
            project : self.Channel_s,
            product : self.Company_s,
            channel :self.Region_s
        }
        return param;
    }

    // 用于server 分页，表格数据量太大的话 不想一次查询所有数据，可以使用server分页查询，数据量小的话可以直接把sidePagination: "server"  改为 sidePagination: "client" ，同时去掉responseHandler: responseHandler就可以了，
    function responseHandler(res) {
        if (res.code == 200) {
            return {
                "rows" : res.data.list,
                "total" : res.data.dataCount
            };
        } else if(res.code == 101) {
            location.href = "../../overtime.html"
        }
    }

    $scope.printAll = function() {
        showIbox('deal-list');
        $('<div></div>')
            .append($('#detail').clone())
            .append($('#deal-list').clone())
            .append($('#access-list').clone())
            .print();
    };

    $scope.printContent = function() {
        $('#detail').print();
    };

    $scope.wordExport = function() {
        $('<div></div>')
            .append($('#detail').clone())
            .append($('#deal-list').clone())
            .wordExport();
    };

    $scope.hideModal = function() {
        $('#details').modal('hide');
    };

    function showIbox(iboxId) {
        var ibox = $('#' + iboxId);

        ibox
            .find('a.collapse-link')
            .find('i')
            .removeClass('fa-chevron-down')
            .addClass('fa-chevron-up');

        ibox.find('div.ibox-content').show();
    }
});