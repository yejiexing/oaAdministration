/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('comAddress',[]);
app.controller('comAddressCtrl',function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.isexport = $scope.imports = $scope.state = state;
    if(!state) {
        $scope.index = parents.authList('address-index');//查看列表权限
        $scope.read = parents.authList('address-read');//查看详情权限
        $scope.update = parents.authList('address-update');//编辑操作
        $scope.save = parents.authList('address-save');//添加操作
        $scope.delete = parents.authList('address-delete');//删除操作
        $scope.deletes = parents.authList('address-deletes');//批量删除操作
        $scope.enables = parents.authList('address-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('address-export');//导出操作
        $scope.imports = parents.authList('address-import');//导入操作
    }
    $("#query").show();
    $scope.deleteState = false;
    $scope.editState = false;
    $scope.iconState = false;
    $scope.Id = '';
    self.Channel_s = '';//选择通道-搜索
    self.Company_s = '';//选择单位名称-搜索
    self.Region_s = '';//选择渠道地区-搜索
    $scope.select = {
        selectChannel: '',//选择渠道的名字
        selectCompany: '',//选择单位的名字
        selectRegion: '',//选择地区的名字
        C_status: true
    }
    $scope.Method = '';
    $scope.errorstate = '';
    $scope.stateIndex = 0;
    $scope.addressArr = $scope.copyaddressArr = new Object();

    $scope.ChannelList = parents.select('address/getChannelList');//获取渠道list
    $scope.CompanyList = parents.select('address/getNameList');//获取单位list
    $scope.RegionList = parents.select('address/getPositionList');//获取单位list

    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.ChannelList = parents.select('address/getChannelList');//获取渠道list
        $scope.CompanyList = parents.select('address/getNameList');//获取单位list
        $scope.RegionList = parents.select('address/getPositionList');//获取单位list
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.search = function(params){ //搜索
        self.Channel_s = $scope.select.selectChannel;
        self.Company_s = $scope.select.selectCompany;
        self.Region_s = $scope.select.selectRegion;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.addressArr.id;
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/address/' + $scope.Id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copyaddressArr = data.data;
                if(params == 1){
                    $scope.dealList = $scope.copyaddressArr.dealList;
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show");
                }else{
                    $scope.newChannelList = parents.select('channel/getChannelNameAndId');//获取全部渠道list
                    parents.forSome($scope.copyaddressArr, ['channel_id', 'sex'], String);
                    $("#preservaModal").modal("show");
                    $("#myModalLabel").html('[编辑]渠道通讯录');
                }
            }
        }).error(function(){
        });
    }
    $scope.export = function(){//导出
        var ExpObj = {
            channel_name : self.Channel_s,
            name : self.Company_s,
            position :self.Region_s
        }
        parents.Exports('address/export',ExpObj)
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

    $scope.deleteConfirm = function() {
        //删除弹出框
        $http.defaults.headers.common = { token: parents.token() };
        var checks = $('#demo-table')
            .bootstrapTable('getSelections')
            .map(function(item) {
                return item.id;
            });

        if (checks.length) {
            $http.post(url + 'admin/address/deletes', {
                ids: checks
            }).then(
                function(data) {
                    $('#table_delete').modal('hide');
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                    $scope.doQuery();
                }
            );
        } else {
            $http
                .delete(url + 'admin/address/' + $scope.addressArr.id)
                .then(
                    function(data) {
                        $('#table_delete').modal('hide');
                        $('#code').html(data.data.data);
                        $('#table_success').modal('show');
                        $scope.doQuery();
                    },
                    function() {
                    }
                );
        }
    };

    $scope.preservaConfirm = function(){//新增弹出框
        if($scope.copyaddressArr['channel_id'] == '' || $scope.copyaddressArr['channel_name'] == '' || $scope.copyaddressArr['name'] == '' || $scope.copyaddressArr['position'] == '' || $scope.copyaddressArr['sex'] == '' || $scope.copyaddressArr['telephone'] == '') {
            $scope.usersError = '请完善必填内容';
            return false;
        }
        parents.screen.Delete($scope.copyaddressArr)
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : $scope.Method,
            url: url + 'admin/address/' + $scope.Id,
            params : $scope.copyaddressArr
        }).success(function(data){
            if(data.code == 200){
                $scope.doQuery();
                $("#preservaModal").modal("hide");
                $("#code").html(data.data);
                $("#table_success").modal("show");
            }else{
                $scope.usersError = data.error;
            }
        }).error(function(r){
            alert('服务器异常，请稍候重试')
        })
    }
    $scope.NewlyAdded = function(){
        $scope.usersError = '';
        $scope.Id = '';
        $scope.Method = 'post';
        $scope.copyaddressArr = {
            channel_name: "",
            channel_id: "",
            position: "",
            name: "",
            sex: "",
            telephone: "",
            wechat_num: "",
            qq_num: "",
            email: "",
            birthday: "",
            address: "",
            remark: ""
        };
        $scope.newChannelList = parents.select('channel/getChannelNameAndId');//获取全部渠道list
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('[新增]渠道通讯录');
    }

    $scope.setChannel = function(item) {
        $scope.select.selectChannel = item;
    };

    $scope.checkChannel = function() {
        $scope.newChannelList.forEach(function(item) {
            if (item.id = $scope.copyaddressArr.channel_id) {
                $scope.copyaddressArr.channel_name = item.name;
            }
        });
    };

    $scope.setCompany = function(item) {
        $scope.select.selectCompany = item;
    };

    $scope.setRegion = function(item) {
        $scope.select.selectRegion = item;
    };

    lay('#date_1').on('click', function(e) {
        //date_1 是一个按钮
        laydate.render({
            elem: '#date1',
            show: true, //直接显示
            closeStop: '#date_1', //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
            done: function(value, date, endDate) {
                //监听日期选择完毕
                $scope.copyaddressArr.birthday = value;
            }
        });
    });

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
            url:url + 'admin/address',
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
            fixedColumns: !parents.IsPC(),
            fixedNumber: 4,
            onLoadSuccess:function(data){ //成功的回调
                iosTable();
                var timer = null;
                var tap = function() {
                    $scope.deleteState = $scope.editState = $scope.iconState = true;
                    $scope.addressArr = $scope.copyaddressArr = data.rows[$(this).index()];
                    $(this)
                        .addClass('bg-color')
                        .siblings()
                        .removeClass('bg-color');
                };
                $('#demo-table tbody tr').on({
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
                var checks = 0; // 选中的个数
                var checkAll = $('#demo-table input[name="btSelectAll"]'); // 全选
                var checkbox = $('#demo-table input[name="btSelectItem"]'); // 单选
                var fixedCheckAll = $(
                    '.fixed-table-header-columns input[name="btSelectAll"]' // 冻结全选
                );
                var fixedCheckbox = $(
                    '.fixed-table-body-columns input[name="btSelectItem"]' // 冻结单选
                );

                // 全选事件，根据状态设置选中个数和是否禁用删除按钮
                checkAll.change(function() {
                    checks = this.checked ? checkbox.length : 0;
                    $scope.$apply(function() {
                        $scope.deleteState = checks > 0;
                    });
                });
                // 单选事件，根据状态增减选中个数和是否禁用删除按钮
                checkbox.change(function() {
                    this.checked ? checks++ : checks--;
                    $scope.$apply(function() {
                        $scope.deleteState = checks > 0;
                    });
                });
                // 冻结全选事件，根据状态切换冻结单选状态和触发全选事件
                fixedCheckAll.change(function() {
                    fixedCheckbox.prop('checked', this.checked);
                    checkAll.change();
                });
                // 冻结单选事件，触发单选事件
                fixedCheckbox.change(function() {
                    checkbox.eq(this.dataset.index).click();
                });
            },
            rowStyle: function (row, index) {
                var style = {};
                if (row.verify_status==0) {
                    style={css:{'color':'#cacaca'}};
                }else if(row.verify_status==2){
                    style={css:{'color':'red'}};
                }
                return style;
            }
        });
        numData = function(value, row, index) {
            return  index+1;
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
        $scope.addressArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/users/' + $scope.addressArr.id,
            params : $scope.addressArr
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

    function queryParams(params) {//表格参数配置
        var param = {
            page : this.pageNumber,
            limit : this.pageSize,
            channel : self.Channel_s,
            name : self.Company_s,
            position :self.Region_s
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