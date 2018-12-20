/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('gift', []);
app.controller('giftCtrl', function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0 ? true : false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.demand = $scope.imports = state;
    if (!state) {
        $scope.index = parents.authList('gift-index'); //查看列表权限
        $scope.read = parents.authList('gift-read'); //查看详情权限
        $scope.update = parents.authList('gift-update'); //编辑操作
        $scope.save = parents.authList('gift-save'); //添加操作
        $scope.delete = parents.authList('gift-delete'); //删除操作
        $scope.deletes = parents.authList('gift-deletes'); //批量删除操作
        $scope.enables = parents.authList('gift-enables'); //批量启用禁用操作
        $scope.imports = parents.authList('gift-import');//导出操作
    }
    $('#query').show();
    $scope.ispc = parents.IsPC();
    $scope.deleteState = false;
    $scope.editState = false;
    $scope.iconState = false;
    $scope.auditState = false;
    $scope.Id = '';
    self.is_used = ''; //地区-搜索
    self.code = ''; //地区-搜索
    $scope.getImg = '';
    $scope.select = {
        selectChannel: '', //选择项目的名字
        selectStatus: 'all'
    };
    $scope.Method = $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = 0;
    $scope.imageArr = $scope.copyimageArr = new Object();
    $scope.uploading = false;

    initTable();
    $scope.doQuery = function(params) {
        $('#demo-table').bootstrapTable('refresh'); //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    };
    $scope.search = function(params) {
        //搜索
        self.code = $scope.select.selectChannel;
        self.is_used = $scope.select.selectStatus;
        $('#demo-table')
            .bootstrapTable('refreshOptions', { pageNumber: 1 })
            .bootstrapTable('refresh'); //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    };

    // 检查导入文件格式
    $scope.checkFile = function(file) {
        var extName = file.name.slice(file.name.lastIndexOf('.'));
        var extNames = ['.xlc', '.xlm', '.xlt', '.xlw', '.xls', '.xlsx'];

        $scope.$apply(function() {
            if ($.inArray(extName, extNames) === -1) {
                $scope.usersError = '文件格式错误';
                $scope.iconFile = '';
            } else {
                $scope.usersError = '';
                $scope.iconFile = file;
            }
        });
    };
    $scope.import = function() {
        var fd = new FormData();
        fd.append('file', $scope.iconFile);
        $http
            .post(url + 'admin/gift/import', fd, {
                headers: { 'Content-Type': undefined, token: parents.token() },
                transformRequest: angular.identity
            })
            .then(function(data) {
                if (data.data.code === 200) {
                    console.log(data);
                    $scope.doQuery();
                    $('#icon').modal('hide');
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                }
                if (data.data.code === 400) {
                    $scope.usersError = data.data.error;
                }
                $scope.uploading = false;
            }, function(error) {
                $scope.usersError = error.statusText;
                $scope.uploading = false;
            });
        $scope.uploading = true;
    };
    $scope.dome = function(){//下载模板
        parents.OpenDemo('template/GiftTemplate.xls');
    }

    $scope.iconFun = function(v) {
        self.dome_val = v;
        $scope.usersError = '';
        $scope.iconFile = null;
        angular.element('#iconFile').val(null);
        $('#icon').modal('show');
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
            url: url + 'admin/gift',
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
            onLoadSuccess: function(data) {
                //成功的回调
                iosTable();
                if (data.total != 0) {
                    var timer = null;
                    var all_tr = $(
                        '#demo-table tbody tr,.fixed-table-body-columns tbody tr'
                    );
                    var table_tr = $('#demo-table tbody tr');
                    var columns_tr = $('.fixed-table-body-columns tbody tr');
                    var tap = function() {
                        var t_idx = $(this).index();
                        $scope.deleteState = $scope.editState = $scope.iconState = true;

                        table_tr.removeClass('bg-color');
                        columns_tr.removeClass('bg-color');
                        table_tr.eq(t_idx).addClass('bg-color');
                        columns_tr.eq(t_idx).addClass('bg-color');
                    };
                }
            },
            rowStyle: function(row, index) {
                var style = {};
                if (row.verify_status == 0) {
                    style = { css: { color: '#cacaca' } };
                } else if (row.verify_status == 2) {
                    style = { css: { color: 'red' } };
                }
                return style;
            },
            onExpandRow: function(index, row, $detail) {
                //InitSubTable(index, row, $detail);
            }
        });
        numData = function(value, row, index) {
            return index + 1;
        };
    }

    function queryParams(params) {
        var param = {
            page: this.pageNumber,
            limit: this.pageSize,
            code: self.code,
            is_used: self.is_used
        };
        return param;
    }

});
