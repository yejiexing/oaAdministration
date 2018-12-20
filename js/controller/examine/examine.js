/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('Examine',[]);
app.controller('ExamineCtrl',function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = state;
    if(!state) {
        $scope.index = parents.authList('verifys-index');//查看列表权限
        $scope.read = parents.authList('verifys-read');//查看详情权限
        $scope.update = parents.authList('verifys-update');//编辑操作
        $scope.save = parents.authList('verifys-save');//添加操作
        $scope.delete = parents.authList('verifys-delete');//删除操作
        $scope.deletes = parents.authList('verifys-deletes');//批量删除操作
        $scope.enables = parents.authList('verifys-enables');//批量启用禁用操作
    }
    $("#query").show();
    self.id = '';
    $scope.deleteState = false;
    $scope.editState = false;
    $scope.iconState = false;
    $scope.Id = '';
    self.Channel_s = '';//地区-搜索
    self.startDate = '';//开始时间
    self.Status_s = '';
    $scope.select = {
        selectChannel: '',//选择渠道的名字
        input: '',//
        C_status: true
    }
    $scope.button = {
        all: true,
        undetermined: false,
        success : false,
        error:false
    }
    $scope.Method = $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = 0;
    $scope.Newdate1 = '';
    $scope.examineArr = $scope.copyexamineArr = new Object();
    $scope.moduleName = '';

    $scope.ChannelList = parents.select('base/getModule');

    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.ChannelList = parents.select('base/getModule');
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.search = function(params){ //搜索
        self.Channel_s = $scope.select.selectChannel;
        self.Input_s = $scope.select.input;
        self.startDate = $scope.Newdate1;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.examineArr.id;
        $scope.moduleName = parents.getModuleName($scope.examineArr.module,$scope.ChannelList);
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: parents.makeUrl($scope.examineArr.module, $scope.examineArr.source_id)
        }).success(function (data) {
            console.log(data);
            if(data.code == 200) {
                $scope.copyexamineArr = data.data;
                if(params == 1){
                    $("#deal-table").bootstrapTable({
                        data: $scope.copyexamineArr.dealList,
                        pagination: true
                    });
                    self.dealA_state = true;
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show");
                }
            }else{
                alert(data.error)
            }
        }).error(function(){
        });
    }
    $scope.examine = function(){
        if($scope.examineArr.status != '未审核') {
            $http.defaults.headers.common = { token: parents.token() };
            $http({
                method: $scope.Method,
                url: url + 'admin/check/' + $scope.Id,
                params: $scope.examineArr
            }).success(function (data) {
                if (data.code == 200) {
                    $scope.doQuery();
                    $("#details").modal("hide");
                    $("#code").html(data.data);
                    $("#table_success").modal("show");
                } else {
                    $scope.usersError = data.error;
                }
            }).error(function (r) {
                alert('服务器异常，请稍候重试')
            })
        }else{
            alert('审核状态不能为空')
        }
    }
    $scope.buttonFun = function(val,num){
        angular.forEach($scope.button,function(v,i){
            $scope.button[i] = false;
        })
        $scope.button[val] = true;
        self.Status_s = num == undefined?'':num;
        $('#demo-table').bootstrapTable('refresh');
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }

    $scope.audit = function(status) {
        $scope.examineArr.status = status;
        $http.defaults.headers.common = { token: parents.token() };
        if ($scope.checks.length) {
            $scope.checks = $scope.checks.filter(function(item) {
                return item;
            });
            $scope.checks.length = 0;
            $('input.multiple:checked').prop('checked', false);
        } else {
            $http
                .put(
                    url + 'admin/check/' + $scope.examineArr.id,
                    $scope.examineArr
                )
                .then(
                    function(data) {
                        if (data.data.code == 200) {
                            $scope.doQuery();
                            $('#audit').modal('hide');
                            $('#code').html(data.data.data);
                            $('#table_success').modal('show');
                        } else {
                            $scope.usersError = data.data.error;
                        }
                    },
                    function(r) {
                        alert('服务器异常，请稍候重试');
                    }
                );
        }
    };

    self.inputTime = null;
    $scope.searchFun = function(v){
        clearTimeout(self.inputTime);
        $(".select_input").removeClass('open');
        $("#"+v).addClass('open');
        $("#"+v+" input").focus();
        $scope.select.C_status = false;
    };
    $(".select_input input").on({
        'blur' : function(){
            var thisId = $(this).attr('data-id');
            self.inputTime = setTimeout(function(){
                $("#"+thisId).removeClass('open');
            },200)
        },
        'focus':function(v){
            $scope.select.C_status = true;
            var thisId = $(this).attr('data-id');
            $("#"+thisId).addClass('open');
            //$scope.$apply()
        },
        'input propertychange' : function(){
            $scope.select.C_status = true;
        }
    });

    $scope.setChannel = function(item) {
        $scope.select.selectChannel = item.name;
    };

    lay('#date_1').on('click', function(e){ //date_1 是一个按钮
        laydate.render({
            elem: '#date1'
            ,show: true //直接显示
            ,closeStop: '#date_1' //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
            ,done: function(value, date, endDate){ //监听日期选择完毕
                $scope.Newdate1 = value;
            }
        });
    });

    $scope.dealA = function(){
        var deal_cont = $("#deal-list .ibox-content");
        var collapse_link = $("#deal-list .collapse-link i");
        if(self.dealA_state){
            deal_cont.show();
            collapse_link.removeClass('fa-chevron-down').addClass('fa-chevron-up');
            self.dealA_state = false;
        }else{
            deal_cont.hide();
            collapse_link.removeClass('fa-chevron-up').addClass('fa-chevron-down');
            self.dealA_state = true;
        }
    }
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
            url:url + 'admin/check',
            height: 670,
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
            pageList: parents.page.List,        //可供选择的每页的行数（*）
            uniqueId: "id",                     //每一行的唯一标识，一般为主键列
            showExport: true,
            exportDataType: 'all',
            responseHandler: parents.responseHandlers,
            onLoadSuccess:function(data){ //成功的回调
                iosTable();
                if(data.total != 0) {
                    var timer = null;
                    var tap = function() {
                        $scope.deleteState = $scope.editState = $scope.iconState = true;
                        $scope.examineArr = $scope.copyexamineArr = data.rows[$(this).index()];
                        $(this)
                            .addClass('bg-color')
                            .siblings()
                            .removeClass('bg-color');
                    };
                    $("#demo-table tbody tr").on({
                        'click' : function(){//单击事件
                            $timeout.cancel(timer);
                            timer = $timeout(tap.bind(this), 170);
                        },
                        'dblclick' : function(){//双击事件
                            $timeout.cancel(timer);
                            tap.call(this);
                            $scope.editFun(1);
                        }
                    });
                }
            }
        });
        numData = function(value, row, index) {
            return  index+1;
        };
        modules = function(value, row, index) {
            return parents.getModuleName(value,$scope.ChannelList);
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
        $scope.examineArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/check/' + $scope.examineArr.id,
            params : $scope.examineArr
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
            create_date : self.startDate,
            module : self.Channel_s,
            name : self.Input_s,
            status :self.Status_s
        }
        return param;
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