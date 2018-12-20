/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('expenseStatistics', []);
app.controller('expenseStatisticsCtrl', function($http, $scope) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0 ? true : false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = state;
    if (!state) {
        $scope.index = parents.authList('getactivitydaycount-index'); //查看列表权限
        $scope.read = parents.authList('getactivitydaycount-read'); //查看详情权限
        $scope.update = parents.authList('getactivitydaycount-update'); //编辑操作
        $scope.save = parents.authList('getactivitydaycount-save'); //添加操作
        $scope.delete = parents.authList('getactivitydaycount-delete'); //删除操作
        $scope.deletes = parents.authList('getactivitydaycount-deletes'); //批量删除操作
        $scope.enables = parents.authList('getactivitydaycount-enables'); //批量启用禁用操
        $scope.isexport = parents.authList('expensestatistics-exportactivitydaycount');//导出操作
    }
    $('#query').show();
    $scope.ispc = parents.IsPC();
    $scope.iconState = false;
    $scope.Channel = 'all';
    $scope.Company = 'all';
    $scope.Region = 'all';
    self.Channel_s = 'all';
    self.Company_s = 'all';
    self.Region_s = 'all';
    self.startDate = ''; //开始时间
    self.endDate = ''; //结束时间
    $scope.select = {
        selectChannel: '所有项目', //选择项目的名字
        selectCompany: '产品汇总', //选择产品的名字
        selectRegion: '渠道汇总', //选择渠道的名字
        comprehensive: ''
    };
    $scope.Method = $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = 0;
    $scope.Newdate1 = self.startDate = parents.currentDate.SameMonth();
    $scope.Newdate2 = self.endDate = parents.currentDate.dateTime();
    $scope.statisticsArr = $scope.copystatisticsArr = new Object();

    $scope.ChannelList = parents.select('project/getProjectList'); //获取单位list
    $scope.RegionList = parents.select('channel/getChannelList'); //获取单位list

    initTable();
    $scope.doQuery = function(params) {
        $('#demo-table').bootstrapTable('refresh'); //刷新表格
        $scope.ChannelList = parents.select('project/getProjectList'); //刷新渠道list
        $scope.CompanyList = ''; //刷新单位list
        $scope.RegionList = parents.select('channel/getChannelList'); //获取单位list
        $scope.Company = $scope.Region = 'detail';
        $scope.select.selectCompany = '产品明细';
        $scope.select.selectRegion = '渠道明细';
        $scope.iconState = false;
    };
    $scope.search = function(params) {
        //搜索
        self.Channel_s = $scope.Channel;
        self.Company_s = $scope.Company;
        self.Region_s = $scope.Region;
        self.startDate = $scope.Newdate1;
        self.endDate = $scope.Newdate2;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');
        $scope.iconState = false;
    };
    $scope.export = function() {
        //导出
        var ExpObj = {
            start_date: self.startDate,
            end_date: self.endDate,
            project: self.Channel_s,
            product: self.Company_s,
            channel: self.Region_s
        };
        parents.Exports(
            'expense_statistics/exportActivityDayCount',
            ExpObj
        );
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

    $scope.projectFun = function() {
        ProjectId($scope.Channel);
    };

    $scope.setChannel = function(item) {
        $scope.select.selectChannel = item;
        $scope.Channel = item === '所有项目' ? 'all' : item;
    };

    $scope.showChannel = function(item) {
        return (
        $scope.select.selectChannel === '' ||
        '所有项目'.startsWith($scope.select.selectChannel) ||
        item.includes($scope.select.selectChannel)
        );
    };

    $scope.setCompany = function(item) {
        $scope.select.selectCompany = item;
        $scope.Company =
            item === '产品明细' ? 'detail' : item === '产品汇总' ? 'all' : item;
    };

    $scope.showCompany = function(item) {
        return (
        $scope.select.selectCompany === '' ||
        '产品明细'.startsWith($scope.select.selectCompany) ||
        '产品汇总'.startsWith($scope.select.selectCompany) ||
        item.includes($scope.select.selectCompany)
        );
    };

    $scope.setRegion = function(item) {
        $scope.select.selectRegion = item;
        $scope.Region =
            item === '渠道明细' ? 'detail' : item === '渠道汇总' ? 'all' : item;
    };

    $scope.showRegion = function(item) {
        return (
        $scope.select.selectRegion === '' ||
        '渠道明细'.startsWith($scope.select.selectRegion) ||
        '渠道汇总'.startsWith($scope.select.selectRegion) ||
        item.includes($scope.select.selectRegion)
        );
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

        $scope.select.selectCompany = '产品明细';
        $scope.Company = 'detail';
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
            url: url + 'admin/expense_statistics/getActivityDayCount',
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
            undefinedText: '',
            fixedColumns: !$scope.ispc,
            fixedNumber: 3,
            onLoadSuccess: function(data) {
                iosTable();
                console.log(data);
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
                        $scope.statisticsArr = $scope.copystatisticsArr =
                            data.rows[t_idx];
                        parents.forSome(
                            $scope.copystatisticsArr,
                            ['tax_registration'],
                            Number
                        );
                        table_tr.removeClass('bg-color');
                        columns_tr.removeClass('bg-color');
                        table_tr.eq(t_idx).addClass('bg-color');
                        columns_tr.eq(t_idx).addClass('bg-color');
                    });
                    table_tr
                        .last()
                        .children('td')
                        .eq(0)
                        .text('汇总');
                }
            }
        });
        numData = function(value, row, index) {
            return "<div style='width:30px'>" + (index + 1) + '</div>';
        };
        smaller = function(value, row, index) {
            return "<div style='width:70px'>" + value + '</div>';
        };
        small = function(value, row, index) {
            return "<div style='width:130px'>" + value + '</div>';
        };
        normal = function(value, row, index) {
            return "<div style='width:90px'>" + value + '</div>';
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
    function queryParams(params) {
        var param = {
            page: this.pageNumber,
            limit: this.pageSize,
            start_date: self.startDate,
            end_date: self.endDate,
            project: self.Channel_s,
            product: self.Company_s,
            channel: self.Region_s
        };
        return param;
    }
});
