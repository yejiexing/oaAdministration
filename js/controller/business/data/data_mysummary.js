/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('datamySummary', []);
app.controller('datamySummaryCtrl', function($http, $scope) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0 ? true : false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = state;
    if (!state) {
        $scope.index = parents.authList('mysummary-index'); //查看列表权限
        $scope.read = parents.authList('mysummary-read'); //查看详情权限
        $scope.update = parents.authList('mysummary-update'); //编辑操作
        $scope.save = parents.authList('mysummary-save'); //添加操作
        $scope.delete = parents.authList('mysummary-delete'); //删除操作
        $scope.deletes = parents.authList('mysummary-deletes'); //批量删除操作
        $scope.enables = parents.authList('mysummary-enables'); //批量启用禁用操作
        $scope.isexport = parents.authList('mysummary-exportsummary');//导出操作
    }
    $('#query').show();
    $scope.ispc = parents.IsPC();
    $scope.deleteState = false;
    $scope.iconState = false;
    self.Channel_s = ''; //地区-搜索
    self.Company_s = ''; //地区-搜索
    self.Region_s = ''; //地区-搜索
    self.startDate = ''; //开始时间
    self.endDate = ''; //结束时间
    $scope.select = {
        selectChannel: '', //选择项目的名字
        selectCompany: '', //选择产品的名字
        selectRegion: '', //选择渠道的名字
        C_status: true
    };
    $scope.Method = $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = 0;
    $scope.Newdate1 = self.startDate = parents.currentDate.neujahr(); //今年1月1日
    $scope.Newdate2 = self.endDate = parents.currentDate.dateTime(); //当前年月日
    $scope.summaryArr = $scope.copysummaryArr = new Object();

    $scope.ChannelList = parents.select('project/getProjectList'); //获取单位list
    $scope.RegionList = parents.select('channel/getChannelList'); //获取单位list

    initTable();
    $scope.doQuery = function(params) {
        $('#demo-table').bootstrapTable('refresh'); //刷新表格
        $scope.ChannelList = parents.select('project/getProjectList'); //刷新渠道list
        $scope.CompanyList = ''; //刷新单位list
        $scope.RegionList = parents.select('channel/getChannelList'); //获取单位list
        $scope.deleteState = $scope.iconState = false;
    };
    $scope.search = function(params) {
        //搜索
        self.Channel_s = $scope.select.selectChannel;
        self.Company_s = $scope.select.selectCompany;
        self.Region_s = $scope.select.selectRegion;
        self.startDate = $scope.Newdate1;
        self.endDate = $scope.Newdate2;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.iconState = false;
    };
    $scope.deleteFun = function(params) {
        //删除
        $('#table_delete').modal('show');
    };
    $scope.export = function() {
        //导出
        var ExpObj = {
            project_id: self.Channel_s,
            product_id: self.Company_s,
            channel_id: self.Region_s,
            start_date: self.startDate,
            end_date: self.endDate,
            my_data: true
        };
        parents.Exports('summary/exportSummary', ExpObj);
    };

    self.inputTime = null;
    $scope.searchFun = function(v) {
        clearTimeout(self.inputTime);
        $('.select_input').removeClass('open');
        $('#' + v).addClass('open');
        $('#' + v + ' input').focus();
        $scope.select.C_status = false;
    };
    $('.select_input input').on({
        blur: function() {
            var thisId = $(this).attr('data-id');
            self.inputTime = setTimeout(function() {
                $('#' + thisId).removeClass('open');
            }, 200);
        },
        focus: function(v) {
            $scope.select.C_status = true;
            var thisId = $(this).attr('data-id');
            $('#' + thisId).addClass('open');
            //$scope.$apply()
        },
        'input propertychange': function() {
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
            $http
                .post(url + 'admin/summary/deletes', {
                    ids: checks
                })
                .then(function(data) {
                    $('#table_delete').modal('hide');
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                    $scope.doQuery();
                });
        } else {
            $http
                .delete(url + 'admin/summary/' + $scope.summaryArr.id)
                .then(function(data) {
                    $('#table_delete').modal('hide');
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                    $scope.doQuery();
                });
        }
    };

    $scope.projectFun = function() {
        ProjectId($scope.select.selectChannel);
    };

    $scope.setChannel = function(item) {
        $scope.select.selectChannel = item;
    };

    $scope.setCompany = function(item) {
        $scope.select.selectCompany = item;
    };

    $scope.setRegion = function(item) {
        $scope.select.selectRegion = item;
    };

    function ProjectId(name) {
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/product/getProductByProjectId',
            params: { project_name: name }
        })
            .success(function(data) {
                if (data.code == 200) {
                    $scope.CompanyList = data.data;
                } else if (data.code == 400) {
                    $scope.CompanyList = '';
                }
            })
            .error(function(r) {
                alert('服务器异常，请稍候重试');
            });

        $scope.select.selectCompany = '';
    }

    layDate(
        ['1', '2'], //日期id
        ['date', 'date'], //日期type
        ['Newdate1', 'Newdate2'], //存储对象
        ['1', '1'], //存储状态
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
            url: url + 'admin/summary',
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
            fixedColumns: !$scope.ispc,
            fixedNumber: 3,
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
        $scope.summaryArr.status = pop_che ? 1 : 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'put',
            url: url + 'admin/summary/' + $scope.summaryArr.id,
            params: $scope.summaryArr
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
            start_date: self.startDate,
            my_data: true,
            end_date: self.endDate,
            project_id: self.Channel_s,
            product_id: self.Company_s,
            channel_id: self.Region_s
        };
        return param;
    }
});
