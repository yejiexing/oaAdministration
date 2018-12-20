/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('sysJournal',[]);
app.controller('sysJournalCtrl',function($http,$scope) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = state;
    if(!state) {
        $scope.index = parents.authList('users-index');//查看列表权限
        $scope.read = parents.authList('users-read');//查看详情权限
        $scope.update = parents.authList('users-update');//编辑操作
        $scope.save = parents.authList('users-save');//添加操作
        $scope.delete = parents.authList('users-delete');//删除操作
        $scope.deletes = parents.authList('users-deletes');//批量删除操作
        $scope.enables = parents.authList('users-enables');//批量启用禁用操作
    }
    $("#query").show();
    self.id = '';
    self.Username = '';
    $scope.deleteState = $scope.editState = $scope.iconState = false;
    $scope.usersId = $scope.usersMethod = $scope.errorstate = '';
    $scope.Newdate1 = $scope.Newdate2 = '';
    $scope.search = {
        name : '',
        ip : ''
    };
    self.login = {
        start_date : $scope.Newdate1, //开始时间
        end_date : $scope.Newdate2, //结束时间
        name : '',
        ip : ''
    }
    $scope.stateIndex = 0;
    $scope.journalArr = $scope.copyjournalArr = new Object();
    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.searchFun = function(){//用户名搜索
        self.login.name = $scope.search.name;
        self.login.ip = $scope.search.ip;
        self.login.start_date = $scope.Newdate1;
        self.login.end_date = $scope.Newdate2;
        $scope.doQuery();
    }
    layDate(
        ['1', '2'], //日期id
        ['date', 'date'], //日期type
        ['Newdate1', 'Newdate2'], //存储对象
        ['1', '1'], //存储状态
        '',
        $scope
    );
    function iosTable() {
        if (/iPhone/i.test(navigator.userAgent)) {
            document.querySelector('.bootstrap-table').style.width = (window.screen.availWidth - 25) + 'px';
        }
    }
    function initTable(){
        $('#demo-table').bootstrapTable({
            method:'get',
            dataType:'json',
            contentType: "application/x-www-form-urlencoded",
            cache: false,
            striped: true,                              //是否显示行间隔色
            sidePagination: "server",           //分页方式：client客户端分页，server服务端分页（*）
            url:url + 'admin/login_log',
            height:700,
            width:$(window).width(),
            showColumns:false,
            pagination:true,
            showRefresh:false,
            queryParams : queryParams,
            ajaxOptions : {
                headers : {
                    "token": parents.token()
                }
            },
            minimumCountColumns:2,
            pageNumber:1,                       //初始化加载第一页，默认第一页
            pageSize: parents.page.Size,                       //每页的记录行数（*）
            pageList: [5,10, 25, 50, 100],        //可供选择的每页的行数（*）
            uniqueId: "id",                     //每一行的唯一标识，一般为主键列
            showExport: true,
            exportDataType: 'all',
            responseHandler: parents.responseHandlers,
            onLoadSuccess:function(data){ //成功的回调
                iosTable();
            }
        });
    }
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

    function queryParams(params) {
        var param = {
            page : this.pageNumber,
            limit : this.pageSize,
            name : self.login.name,
            ip : self.login.ip,
            start_date : self.login.start_date,
            end_date : self.login.end_date
        }
        return param;
    }
});