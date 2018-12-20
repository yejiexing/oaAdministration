/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('vote', []);
app.controller('voteCtrl', function($http, $scope) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0 ? true : false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = state;
    if (!state) {
        $scope.index = parents.authList('getdaycount-index'); //查看列表权限
        $scope.read = parents.authList('getdaycount-read'); //查看详情权限
        $scope.update = parents.authList('getdaycount-update'); //编辑操作
        $scope.save = parents.authList('getdaycount-save'); //添加操作
        $scope.delete = parents.authList('getdaycount-delete'); //删除操作
        $scope.deletes = parents.authList('getdaycount-deletes'); //批量删除操作
        $scope.enables = parents.authList('getdaycount-enables'); //批量启用禁用操作
    }
    $('#query').show();
    $scope.ispc = parents.IsPC();
    $scope.iconState = false;
    $scope.Channel = '';
    self.Channel_s = '';
    $scope.Method = $scope.errorstate = '';
    $scope.stateIndex = 0;
    $scope.voteArr = $scope.copyvoteArr = new Object();

    // $scope.ChannelList = parents.select('project/getProjectList'); //获取单位list

    initTable();
    $scope.doQuery = function(params) {
        $('#demo-table').bootstrapTable('refresh'); //刷新表格
        // $scope.ChannelList = parents.select('project/getProjectList'); //刷新渠道list
        $scope.Channel = '';
        $scope.iconState = false;
    };
    $scope.search = function(params) {
        //搜索
        self.Channel_s = $scope.Channel;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');
        $scope.iconState = false;
    };
    $scope.export = function() {
        //导出
        var ExpObj = {
            name: self.Channel_s
        };
        parents.Exports('statistics/exportDayCount', ExpObj);
    };

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
            url: url + 'admin/vote',
            height: 670,
            showColumns: false,
            pagination: false,
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
            onLoadSuccess: function(data) {
                iosTable();
                //成功的回调
                if (data.rows.length != 0) {
                    var all_tr = $(
                        '#demo-table tbody tr,.fixed-table-body-columns tbody tr'
                    );
                    var table_tr = $('#demo-table tbody tr');
                    var columns_tr = $('.fixed-table-body-columns tbody tr');

                    all_tr.click(function() {
                        var t_idx = $(this).index();

                        $scope.iconState = true;
                        table_tr.removeClass('bg-color');
                        columns_tr.removeClass('bg-color');
                        table_tr.eq(t_idx).addClass('bg-color');
                        columns_tr.eq(t_idx).addClass('bg-color');
                    });
                }
            }
        });
        numData = function(value, row, index) {
            return "<div style='width:30px'>" + (index + 1) + '</div>';
        };
    }
    //解决窗口收缩，表头不变的问题
    $(window).resize(function() {
        $('#demo-table').bootstrapTable('resetView');
    });
    //popoverstate窗口关闭state
    $(document).click(function() {
        $('#popoverstate').hide();
    });
    $scope.statedelete = function() {
        $('#popoverstate').hide();
    };
    $('#popoverstate').click(function(e) {
        e.stopPropagation();
    });
    //popoverstate窗口关闭end
    $scope.stateedit = function(v) {
        var pop_che = $('#pop_che').is(':checked');
        $scope.voteArr.status = pop_che ? 1 : 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'put',
            url: url + 'admin/statistics/getDayCount/' + $scope.voteArr.id,
            params: $scope.voteArr
        })
            .success(function(data) {
                if (data.code == 200) {
                    if (pop_che) {
                        $('.fastatus')
                            .eq($scope.stateIndex)
                            .removeClass('fa-square-o')
                            .addClass('text-success fa-check-square-o');
                    } else {
                        $('.fastatus')
                            .eq($scope.stateIndex)
                            .removeClass('text-success', 'fa-check-square-o')
                            .addClass('fa-square-o');
                    }
                    $('#popoverstate').hide();
                } else {
                    alert(data.error);
                }
            })
            .error(function(r) {
                alert('服务器异常，请稍候重试');
            });
    };

    function queryParams(params) {
        var param = {
            page: this.pageNumber,
            limit: this.pageSize,
            name: self.Channel_s
        };
        return param;
    }
});
