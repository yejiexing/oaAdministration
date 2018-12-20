/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('biPayment', []);
app.controller('biPaymentCtrl', function($http, $scope) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0 ? true : false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = state;
    if (!state) {
        $scope.index = parents.authList('bipayment-index'); //查看列表权限
        $scope.isexport = parents.authList('bipayment-export');//导出操作
        $scope.read = parents.authList('idfa-index'); //查看列表权限
        $scope.state = parents.authList('idfa-export');//导出操作
    }
    $('#query').show();
    $scope.ispc = parents.IsPC();
    $scope.deleteState = false;
    $scope.iconState = false;
    self.game_id = ''; //
    self.game_id1 = ''; //
    self.channel_id = ''; //
    self.channel_id1 = ''; //
    self.startDate = ''; //开始时间
    self.endDate = ''; //结束时间
    self.startDate1 = ''; //开始时间
    self.endDate1 = ''; //结束时间
    self.UserName = ''; //账号名
    $scope.select = {
        Game: '',
        Game1: '',
        Channel: '',
        Channel1: '',
        user: ''
    };
    $scope.stateIndex = 0;
    $scope.Newdate1 = self.startDate = parents.currentDate.SameMonth(); //当前月1日
    $scope.Newdate2 = self.endDate = parents.currentDate.dateTime(); //当前年月日
    $scope.Newdate3 = self.startDate1 = parents.currentDate.SameMonth(); //当前月1日
    $scope.Newdate4 = self.endDate1 = parents.currentDate.dateTime(); //当前年月日
    $scope.GameList = parents.select('b_i_payment/getGameList'); //获取游戏list
    $scope.ChannelList = parents.select('b_i_payment/getChannelList'); //获取渠道list
    console.log($scope.GameList)
    console.log($scope.ChannelList)
    initTable();
    $scope.doQuery = function(params) {
        $scope.GameList = parents.select('b_i_payment/getGameList'); //获取游戏list
        $scope.ChannelList = parents.select('b_i_payment/getChannelList'); //获取渠道list
        $('#demo-table'+params).bootstrapTable('refresh'); //刷新表格
    };
    $scope.search = function(params) {
        //搜索
        if(params == 1){
            self.startDate1 = $scope.Newdate3;
            self.endDate1 = $scope.Newdate4;
            self.game_id1 = $scope.select.Game1;
            self.channel_id1 = $scope.select.Channel1;
            $('#demo-table1').bootstrapTable('refreshOptions', {pageNumber: 1}).bootstrapTable('refresh');    //刷新表格
            $scope.deleteState = $scope.iconState = false;
        }else {
            self.startDate = $scope.Newdate1;
            self.endDate = $scope.Newdate2;
            self.UserName = $scope.select.user;
            self.game_id = $scope.select.Game;
            self.channel_id = $scope.select.Channel;
            $('#demo-table').bootstrapTable('refreshOptions', {pageNumber: 1}).bootstrapTable('refresh');    //刷新表格
            $scope.deleteState = $scope.iconState = false;
        }
    };
    $scope.export = function(v) {
        //导出
        if(v == 1) {
            var ExpObj = {
                start_date: self.startDate1,
                end_date: self.endDate1,
                game_id: self.game_id1,
                channel_id: self.channel_id1
            };
            parents.Exports('idfa/export', ExpObj);
        }else{
            var ExpObj1 = {
                start_date: self.startDate,
                end_date: self.endDate,
                game_id: self.game_id,
                channel_id: self.channel_id,
                user: self.UserName
            };
            parents.Exports('b_i_payment/export', ExpObj1);
        }
    };

    layDate(
        ['1', '2', '3', '4'], //日期id
        ['date', 'date', 'date', 'date'], //日期type
        ['Newdate1', 'Newdate2', 'Newdate3', 'Newdate4'], //存储对象
        ['1', '1', '1', '1'], //存储状态
        'copysummaryArr',
        $scope
    );
    function iosTable() {
        if (/iPhone/i.test(navigator.userAgent)) {
            document.querySelector('.bootstrap-table').style.width =
                window.screen.availWidth - 25 + 'px';
        }
    }
    function initTable() {
        $('#demo-table').bootstrapTable({
            method: 'get',
            dataType: 'json',
            contentType: 'application/x-www-form-urlencoded',
            cache: false,
            striped: true, //是否显示行间隔色
            sidePagination: 'server', //分页方式：client客户端分页，server服务端分页（*）
            url: url + 'admin/b_i_payment',
            height: 670,
            showColumns: false,
            pagination: true,
            showRefresh: false,
            queryParams: queryParams,
            ajaxOptions: {
                headers: {
                    token: parents.token()
                }
            },
            minimumCountColumns: 2,
            pageNumber: 1, //初始化加载第一页，默认第一页
            pageSize: parents.page.Size, //每页的记录行数（*）
            pageList: parents.page.List, //可供选择的每页的行数（*）
            uniqueId: 'id', //每一行的唯一标识，一般为主键列
            showExport: true,
            exportDataType: 'all',
            responseHandler: parents.responseHandlers,
            //fixedColumns: !$scope.ispc,
            //fixedNumber: 3,
            onLoadSuccess: function(data) {
                iosTable();
                //成功的回调
                if (data.total != 0) {
                    var all_tr = $(
                        '#demo-table tbody tr,.fixed-table-body-columns tbody tr'
                    );
                    var table_tr = $('#demo-table tbody tr');
                    var columns_tr = $('.fixed-table-body-columns tbody tr');
                    all_tr.click(function() {
                        var t_idx = $(this).index();
                        $scope.$apply(function() {
                            $scope.deleteState = $scope.iconState = true;
                        });
                        $scope.summaryArr = $scope.copysummaryArr =
                            data.rows[t_idx];
                        parents.forSome(
                            $scope.copysummaryArr,
                            ['tax_registration'],
                            Number
                        );
                        table_tr.removeClass('bg-color');
                        columns_tr.removeClass('bg-color');
                        table_tr.eq(t_idx).addClass('bg-color');
                        columns_tr.eq(t_idx).addClass('bg-color');
                    });
                }
            }
        });
        $('#demo-table1').bootstrapTable({
            method: 'get',
            dataType: 'json',
            contentType: 'application/x-www-form-urlencoded',
            cache: false,
            striped: true, //是否显示行间隔色
            sidePagination: 'server', //分页方式：client客户端分页，server服务端分页（*）
            url: url + 'admin/idfa',
            height: 670,
            showColumns: false,
            pagination: true,
            showRefresh: false,
            queryParams: queryParams1,
            ajaxOptions: {
                headers: {
                    token: parents.token()
                }
            },
            minimumCountColumns: 2,
            pageNumber: 1, //初始化加载第一页，默认第一页
            pageSize: parents.page.Size, //每页的记录行数（*）
            pageList: parents.page.List, //可供选择的每页的行数（*）
            uniqueId: 'id', //每一行的唯一标识，一般为主键列
            showExport: true,
            exportDataType: 'all',
            responseHandler: parents.responseHandlers,
            //fixedColumns: !$scope.ispc,
            //fixedNumber: 3,
            onLoadSuccess: function(data) {
                console.log(data)
                iosTable();
                //成功的回调
                if (data.total != 0) {
                    var all_tr = $(
                        '#demo-table tbody tr,.fixed-table-body-columns tbody tr'
                    );
                    var table_tr = $('#demo-table tbody tr');
                    var columns_tr = $('.fixed-table-body-columns tbody tr');
                    all_tr.click(function() {
                        var t_idx = $(this).index();
                        $scope.$apply(function() {
                            $scope.deleteState = $scope.iconState = true;
                        });
                        $scope.summaryArr = $scope.copysummaryArr =
                            data.rows[t_idx];
                        parents.forSome(
                            $scope.copysummaryArr,
                            ['tax_registration'],
                            Number
                        );
                        table_tr.removeClass('bg-color');
                        columns_tr.removeClass('bg-color');
                        table_tr.eq(t_idx).addClass('bg-color');
                        columns_tr.eq(t_idx).addClass('bg-color');
                    });
                }
            }
        });

        numData = function(value, row, index) {
            return index + 1;
        };
        smaller = function(value, row, index) {
            return "<div style='width:70px'>" + value + '</div>';
        };
        small = function(value, row, index) {
            return "<div style='width:130px'>" + value + '</div>';
        };
        normal = function(value, row, index) {
            return "<div style='width:170px'>" + value + '</div>';
        };
        large = function(value, row, index) {
            return "<div style='width:230px'>" + value + '</div>';
        };
    }
    //解决窗口收缩，表头不变的问题
    $(window).resize(function() {
        $('#demo-table').bootstrapTable('resetView');
    });

    function queryParams(params) {
        var param = {
            page: this.pageNumber,
            limit: this.pageSize,
            start_date: self.startDate,
            end_date: self.endDate,
            game_id: self.game_id,
            channel_id: self.channel_id,
            user: self.UserName
        };
        return param;
    }
    function queryParams1(params) {
        var param1 = {
            page: this.pageNumber,
            limit: this.pageSize,
            start_date: self.startDate1,
            end_date: self.endDate1,
            game_id: self.game_id1,
            channel_id: self.channel_id1
        };
        return param1;
    }
});
