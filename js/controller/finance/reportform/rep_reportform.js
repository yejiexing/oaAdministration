/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('manSettlement', []);
app.controller('manSettlementCtrl', function($http, $scope, $q, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0 ? true : false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = $scope.checkre = state;
    if (!state) {
        $scope.index = parents.authList('financereport-index'); //查看列表权限
        $scope.read = parents.authList('financereport-read'); //查看详情权限
        $scope.update = parents.authList('financereport-update'); //编辑操作
        $scope.save = parents.authList('financereport-save'); //添加操作
        $scope.delete = parents.authList('financereport-delete'); //删除操作
        $scope.deletes = parents.authList('financereport-deletes'); //批量删除操作
        $scope.enables = parents.authList('financereport-enables'); //批量启用禁用操作
        $scope.isexport = parents.authList('financereport-export');//导出操作
        $scope.imports = parents.authList('financereport-import');//导入操作
        $scope.checkre = parents.authList('financereport-checkreportintime');//导入操作
    }
    $('#query').show();
    $scope.ispc = parents.IsPC();
    $scope.deleteState = false;
    $scope.editState = false;
    self.Channel_s = ''; //地区-搜索
    self.Company_s = ''; //地区-搜索
    self.Region_s = ''; //地区-搜索
    self.cp = '';
    self.startDate = ''; //开始时间
    self.endDate = ''; //结束时间
    $scope.select = {
        selectChannel: '',
        selectCompany: '',
        selectRegion: '',
        selectCP: '',
        is_back: '',
        C_status: true
    };
    self.SearchList = [{val:'Channel_s',name:'project_id'},{val:'Region_s',name:'product_id'}];
    $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = 0;
    $scope.report = 1;
    $scope.Newdate1 = self.startDate = parents.currentDate.MonthTime(3) + '-01';
    $scope.Newdate2 = self.endDate = parents.currentDate.dateTime();
    $scope.settlementArr = $scope.copysettlementArr = new Object();

    $scope.ChannelList = parents.select('project/getProjectList'); //获取单位list
    $scope.UnitList = parents.select('finance_report/getIssue');
    //$scope.CPList = parents.select('cp_closing/getCP');

    initTable();
    $scope.doQuery = function(params) {
        $('#demo-table').bootstrapTable('refresh'); //刷新表格
        $scope.ChannelList = parents.select('project/getProjectList'); //刷新渠道list
        $scope.UnitList = parents.select('cp_closing/getClosingUnit');
        //$scope.CPList = parents.select('cp_closing/getCP');
        $scope.CompanyList = ''; //刷新单位list
        $scope.deleteState = $scope.editState = false;
    };
    $scope.search = function(params) {
        //搜索
        self.Channel_s = $scope.select.selectChannel;
        self.Company_s = $scope.select.selectCompany;
        self.Region_s = $scope.select.selectRegion;
        self.cp = $scope.select.selectCP;
        self.startDate = $scope.Newdate1;
        self.endDate = $scope.Newdate2;
        $('#demo-table')
            .bootstrapTable('refreshOptions', { pageNumber: 1 })
            .bootstrapTable('refresh');
        $scope.deleteState = $scope.editState = false;
    };
    $scope.modalSearch = function() {
        $scope.usersError = '';
        $http.get(url + 'admin/finance_report/getFinanceStatement', {
                headers: {
                    token: parents.token()
                },
                params: {
                    start_date: $scope.copysettlementArr.start_date,
                    end_date: $scope.copysettlementArr.end_date,
                    project_id: $scope.copysettlementArr.project_id,
                    product_id: $scope.copysettlementArr.product_id,
                    issue_id: $scope.copysettlementArr.issue_id
                    //is_back: $scope.select.is_back
                }
            })
            .then(
                function(data) {
                    if (data.data.code === 200) {
                        angular.forEach(self.SearchList,function(v,i){
                            angular.forEach($scope[v.val],function(v1,i1){
                                if(v1.id == $scope.copysettlementArr[v.name]){
                                    $scope.copysettlementArr[v.val] = v1.name
                                }
                            })
                        })
                        $('#modal-table').bootstrapTable('load', data.data.data.list).bootstrapTable('checkAll');
                    } else {
                        $scope.usersError = data.data.error;
                    }
                },
                function(error) {
                    $scope.usersError = error;
                }
            );
    };
    $scope.export = function() {
        var ExpObj = {
            start_date: $scope.Newdate1,
            end_date: $scope.Newdate2,
            project: $scope.select.selectChannel,
            product: $scope.select.selectCompany,
            issue: $scope.select.selectRegion
            //closing_cp: $scope.select.selectCP
        };
        parents.Exports('finance_report/export', ExpObj);
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

    $scope.deleteFun = function(params) {
        //删除
        $('#table_delete').modal('show');
    };
    $scope.editFun = function(params) {
        //编辑
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/finance_report/' + $scope.settlementArr.id
        }).success(function(data) {
            if (data.code == 200) {
                $scope.copysettlementArr = data.data;
                parents.forSome(
                    $scope.copysettlementArr,
                    [
                        'channel_rate',
                        'tax_rate',
                        'divide_amount',
                        'expense_pay_amount'
                    ],
                    Number
                );
                if (params == 1) {
                    $scope.dealList = data.data.dealList;
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show");
                } else {
                    $scope.usersError = '';

                    parents.forSome(
                        $scope.copysettlementArr,
                        ['project_id', 'product_id', 'cp_id', 'closing_id'],
                        String
                    );

                    $q
                        .all([
                            $http.get(
                                url + 'admin/cp_closing/getClosingUnitNameAndId'
                            ),
                            $http.get(
                                url + 'admin/project/getProjectNameAndId'
                            ),
                            $http.get(
                                url +
                                    'admin/product/getProductRelatedByProjectId',
                                {
                                    params: {
                                        project_id:
                                            $scope.copysettlementArr.project_id
                                    }
                                }
                            ),
                            $http.get(url + 'admin/cp_closing/getCPNameAndId')
                        ])
                        .then(function(data) {
                            $scope.Unit_s = data[0].data.data;
                            $scope.Channel_s = data[1].data.data;
                            $scope.Region_s = data[2].data.data;
                            $scope.CP_s = data[3].data.data;
                            $('#editModal').modal('show');
                            $('#editModalLabel').html('[编辑]财务报表');
                        });
                }
            }
        });
    };

    $scope.deleteConfirm = function() {
        //删除弹出框
        $http.defaults.headers.common = { token: parents.token() };
        var checks = $('#demo-table')
            .bootstrapTable('getSelections')
            .filter(function(item) {
                return item.id;
            })
            .map(function(item) {
                return item.id;
            });

        if (checks.length) {
            $http
                .post(url + 'admin/finance_report/deletes', {
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
                .delete(url + 'admin/finance_report/' + $scope.settlementArr.id)
                .then(function(data) {
                    if (data.data.code === 200) {
                        $('#table_delete').modal('hide');
                        $('#code').html(data.data.data);
                        $('#table_success').modal('show');
                        $scope.doQuery();
                    }
                });
        }
    };

    $scope.collectConfirm = function() {
        $http.defaults.headers.common = { token: parents.token() };
        $http
            .put(url + $scope.collectUrl, $scope.collectData)
            .then(function(data) {
                if (data.data.code === 200) {
                    $('#collectModal').modal('hide');
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                    $scope.doQuery();
                }
            });
    };

    $scope.preservaConfirm = function() {
        //新增弹出框
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'post',
            url: url + 'admin/finance_report',
            params: {
                start_date: $scope.copysettlementArr.start_date,
                end_date: $scope.copysettlementArr.end_date,
                project_id: $scope.copysettlementArr.project_id,
                product_id: $scope.copysettlementArr.product_id,
                issue_id: $scope.copysettlementArr.issue_id,
                //cp_id: $scope.copysettlementArr.cp_id,
                finance_id: $('#modal-table')
                    .bootstrapTable('getSelections')
                    .map(function(item) {
                        return item.id;
                    })
                    .join(',')
            }
        }).then(
            function(data) {
                if (data.data.code == 200) {
                    self.Channel_s = $scope.select.selectChannel = $scope.copysettlementArr['Channel_s'];
                    self.Company_s = $scope.select.selectCompany = $scope.copysettlementArr['Region_s'];
                    self.startDate = $scope.Newdate1 = $scope.copysettlementArr.start_date;
                    self.endDate = $scope.Newdate2 = $scope.copysettlementArr.end_date;
                    $scope.doQuery();
                    $('#preservaModal').modal('hide');
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                } else {
                    $scope.usersError = data.data.error;
                }
            },
            function() {
                alert('服务器异常，请稍候重试');
            }
        );
    };

    $scope.projectFun = function(index, callback) {
        var identical =
            index === undefined
                ? $scope.select.selectChannel
                : $scope.copysettlementArr.project_id;
        ProjectId(identical, index, callback);

    };
    $scope.select_change = function(){
        $('#modal-table').bootstrapTable({ striped: true }).bootstrapTable('removeAll');
    }

    $scope.setChannel = function(item) {
        $scope.select.selectChannel = item;
    };

    $scope.setCompany = function(item) {
        $scope.select.selectCompany = item;
    };

    $scope.setRegion = function(item) {
        $scope.select.selectRegion = item;
    };

    $scope.setCP = function(item) {
        $scope.select.selectCP = item;
    };

    function ProjectId(identical, index, callback) {
        var params = {},
            subUrl;

        if (index === undefined) {
            subUrl = 'admin/product/getProductByProjectId';
            params.project_name = identical;
        } else {
            subUrl = 'admin/product/getProductRelatedByProjectId';
            params.project_id = identical;
        }
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + subUrl,
            params: params
        })
            .success(function(data) {
                if (data.code == 200) {
                    if (index !== undefined) {
                        $scope.Region_s = data.data; //获取渠道list
                        $scope.copysettlementArr.product_id = '';
                        $scope.Region_s1 = data.data;
                        $scope.setalertArr.product_id = '';

                        if (callback) {
                            callback();
                        }
                    } else {
                        $scope.CompanyList = data.data; //获取渠道list
                        $scope.select.selectCompany = '';
                    }
                } else if (data.code == 400) {
                    if (index !== undefined) {
                        $scope.Region_s = '';
                        $scope.copysettlementArr.product_id = '';
                    } else {
                        $scope.CompanyList = '';
                        $scope.select.selectCompany = '';
                    }
                }
            })
            .error(function(r) {
                alert('服务器异常，请稍候重试');
            });
    }
    $scope.NewlyAdded = function(callback) {
        $scope.copysettlementArr = {
            start_date: parents.currentDate.MonthTime(3) + '-01',
            end_date: parents.currentDate.dateTime(),
            cp_id: '',
            project_id: '',
            product_id: '',
            closing_id: '',
            finance_id: []
        };
        $scope.usersError = '';
        $scope.select.is_back = '';

        $http.defaults.headers.common = { token: parents.token() };
        $q
            .all([
                $http.get(url + 'admin/cp_closing/getCPNameAndId'),
                $http.get(url + 'admin/project/getProjectNameAndId'),
                $http.get(url + 'admin/cp_closing/getClosingUnitNameAndId')
            ])
            .then(function(data) {
                $scope.CP_s = data[0].data.data;
                $scope.Channel_s = data[1].data.data;
                $scope.Unit_s = data[2].data.data;
                $scope.Region_s = '';

                if (callback) {
                    callback();
                }
                $('#myModalLabel').html('[添加]财务报表');
                $('#preservaModal').modal('show');
            });
    };

    layDates(
        ['1', '2'], //日期id
        ['date', 'date'], //日期type
        ['Newdate1', 'Newdate2'], //存储对象
        ['1', '1'] //存储状态
    );
    function layDates(name, type, props, state) {
        $.each(name, function(i) {
            lay('#Newdate_' + name[i]).on('click', function(e) {
                laydate.render({
                    elem: '#Newdate' + name[i],
                    type: type[i],
                    show: true, //直接显示
                    closeStop: '#Newdate_' + name[i], //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
                    done: function(value, date, endDate) {
                        if (state[i] == 0) {
                            $scope.copysettlementArr[props[i]] = value;
                        } else {
                            $scope[props[i]] = value;
                        }
                    }
                });
            });
        });
    }
    $scope.ToBusiness1 = function(){
        $scope.setalertArr = {
            start_date: parents.currentDate.Yesterday(),
            end_date: parents.currentDate.Yesterday(),
            project_id: '',
            product_id: '',
            issue_id: ''
        };
        $scope.usersError = '';
        $scope.select.is_back = '';

        $http.defaults.headers.common = { token: parents.token() };
        $q.all([
            $http.get(url + 'admin/project/getProjectNameAndId'),
            $http.get(url + 'admin/cp_closing/getClosingUnitNameAndId')
            //$http.get(url + 'admin/cp_closing/getClosingUnitNameAndId')
        ])
            .then(function(data) {
                $scope.Channel_s1= data[0].data.data;
                $scope.Company_s1 = data[1].data.data;
                $scope.Region_s1 = '';
                $('#myModalLabels').html('[查看]实时数据');
                $('#BusinessModal').modal('show');
            });
    }
    $scope.ProjFun = function(v, edit){
        var identical1 = $scope.setalertArr.project_id;
        $scope.setalertArr.product_id = '';
        ProjectId(identical1, v, edit);

    }
    $scope.modalSearch1 = function() {
        $scope.usersError = '';
        $scope.searchState = true;
        $http.get(url + 'admin/finance_report/checkReportInTime', {
            headers: {
                token: parents.token()
            },
            params: $scope.setalertArr
        })
            .then(
            function(data) {
                if (data.data.code === 200) {
                    var dataArr = [data.data.data]
                    $('#modal-table1').bootstrapTable('load', dataArr).bootstrapTable('checkAll');
                    $scope.searchState = false;
                } else {
                    $scope.usersError = data.data.error;
                    $scope.table_num = 0;
                    $scope.searchState = false;
                }
            },
            function(error) {
                $scope.usersError = error;
                $scope.searchState = false;
            }
        );
    };
    $scope.select_change1 = function(val,name){
        $('#modal-table1').bootstrapTable({ striped: true }).bootstrapTable('removeAll');
        $scope.table_num = 0;
    }
    $('#BusinessModal').on('show.bs.modal', function() {
        $scope.select_change1();
    });

    $('#BusinessModal').on('shown.bs.modal', function() {
        lay('#Start_date1').on('click', function(e) {
            laydate.render({
                elem: '#Startdate1',
                type: 'date',
                show: true, //直接显示
                closeStop: '#Start_date1', //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
                done: function(value, date, endDate) {
                    $scope.setalertArr.start_date = value;
                    $('#modal-table1').bootstrapTable({ striped: true }).bootstrapTable('removeAll');
                }
            });
        });

        lay('#End_date1').on('click', function(e) {
            laydate.render({
                elem: '#Enddate1',
                type: 'date',
                show: true, //直接显示
                closeStop: '#End_date1', //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
                done: function(value, date, endDate) {
                    $scope.setalertArr.end_date = value;
                    $('#modal-table1').bootstrapTable({ striped: true }).bootstrapTable('removeAll');
                }
            });
        });
    });

    $('#preservaModal').on('show.bs.modal', function() {
        $('#modal-table')
            .bootstrapTable({ striped: true })
            .bootstrapTable('removeAll');
    });

    $('#preservaModal').on('shown.bs.modal', function() {
        lay('#Start_date').on('click', function(e) {
            laydate.render({
                elem: '#Startdate',
                show: true, //直接显示
                closeStop: '#Start_date', //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
                done: function(value, date, endDate) {
                    $scope.copysettlementArr.start_date = value;
                    $('#modal-table').bootstrapTable({ striped: true }).bootstrapTable('removeAll');
                }
            });
        });

        lay('#End_date').on('click', function(e) {
            laydate.render({
                elem: '#Enddate',
                show: true, //直接显示
                closeStop: '#End_date', //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
                done: function(value, date, endDate) {
                    $scope.copysettlementArr.end_date = value;
                    $('#modal-table').bootstrapTable({ striped: true }).bootstrapTable('removeAll');
                }
            });
        });
    });

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
            url: url + 'admin/finance_report',
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
                    var timer = null;
                    var all_tr = $(
                        '#demo-table tbody tr,.fixed-table-body-columns tbody tr'
                    );
                    var table_tr = $('#demo-table tbody tr');
                    var columns_tr = $('.fixed-table-body-columns tbody tr');
                    var tap = function(t_idx) {
                        $scope.deleteState = $scope.editState = true;
                        $scope.settlementArr = $scope.copysettlementArr =
                            data.rows[t_idx];

                        parents.forSome(
                            $scope.copysettlementArr,
                            [
                                'channel_rate',
                                'tax_rate',
                                'divide_amount',
                                'expense_pay_amount'
                            ],
                            Number
                        );
                        table_tr.removeClass('bg-color');
                        columns_tr.removeClass('bg-color');
                        table_tr.eq(t_idx).addClass('bg-color');
                        columns_tr.eq(t_idx).addClass('bg-color');
                    };
                    all_tr.on({
                        click: function() {
                            //单击事件
                            var index = $(this).index();
                            if (
                                index == parents.page.Size ||
                                index === data.total
                            )
                                return;
                            $timeout.cancel(timer);
                            timer = $timeout(tap.bind(this, index), 170);
                        },
                        dblclick: function() {
                            //双击事件
                            var index = $(this).index();
                            if (
                                index == parents.page.Size ||
                                index === data.total
                            )
                                return;
                            $timeout.cancel(timer);
                            tap.call(this, index);
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
                }
                $('#demo-table tbody tr:last')
                    .children('td:first')
                    .html('<div style="width:30px">汇总</div>');
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
        //invoiceNumber = function(value, row, index) {
        //    return value === '点击添加'
        //        ? '<div class="text-success center-block invoiceNumber finaceclick">' +
        //              value +
        //              '</div>'
        //        : value;
        //};
        //actualCollectTime = function(value, row, index) {
        //    return value === '点击添加'
        //        ? '<div class="text-success center-block actualCollectTime finaceclick">' +
        //              value +
        //              '</div>'
        //        : value;
        //};
        //actualBackTime = function(value, row, index) {
        //    return value === '点击添加'
        //        ? '<div class="text-success center-block actualBackTime finaceclick">' +
        //              value +
        //              '</div>'
        //        : value;
        //};
        closing = function(value, row, index) {
            return value === '点击添加'
                ? '<div class="text-success center-block closing finaceclick">点击选择</div>'
                : value;
        };
        //download = function(value, row, index) {
        //    return row.id === '' ? '' : '<a class="download">下载</a>';
        //};
        //detail = function(value, row, index) {
        //    return row.id === '' ? '' : '<a class="detail">查看明细</a>';
        //};
        window.billFun = {
            //'click .invoiceNumber': function(event, value, row, index) {
            //    $scope.collectTitle = '发票编号';
            //    $scope.collectUrl =
            //        'admin/finance_report/updateIssue/' + row.id;
            //    $scope.collectData = {};
            //    $scope.collect = 'invoice_number';
            //    $('#collectModal').modal('show');
            //},
            //'click .actualCollectTime': function(event, value, row, index) {
            //    $scope.collectTitle = '实际收票时间';
            //    $scope.collectUrl =
            //        'admin/cp_closing/updateActualCollectTime/' + row.id;
            //    $scope.collectData = {};
            //    $scope.collect = 'actual_collect_time';
            //    $('#collectModal').modal('show');
            //},
            //'click .actualBackTime': function(event, value, row, index) {
            //    $scope.collectTitle = '实际打款时间';
            //    $scope.collectUrl =
            //        'admin/cp_closing/updateActualBackTime/' + row.id;
            //    $scope.collectData = {};
            //    $scope.collect = 'actual_back_time';
            //    $('#collectModal').modal('show');
            //},
            'click .closing': function(event, value, row, index) {
                $http.defaults.headers.common = { token: parents.token() };
                $http
                    .get(url + 'admin/finance_report/getIssueNameAndId')
                    .then(function(data) {
                        $scope.modalUnit = data.data.data;
                        $scope.collectTitle = '发行主体';
                        $scope.collectUrl = 'admin/finance_report/updateIssue/' + row.id;
                        $scope.collectData = {};
                        $scope.collect = 'issue_id';
                        $('#collectModal').modal('show');
                    });
            }
        };
        //window.downloadFun = {
        //    'click .download': function(event, value, row, index) {
        //        parents.Exports('cp_closing/exportCP/' + row.id);
        //    }
        //};
        //window.detailFun = {
        //    'click .detail': function(event, value, row, index) {
        //        $('#detailModal').modal('show');
        //        $.ajax({
        //            url:
        //                url +
        //                'admin/cp_closing/getFinanceInfo/' +
        //                row.finance_id,
        //            beforeSend: function(request) {
        //                request.setRequestHeader('token', parents.token());
        //            },
        //            success: function(data) {
        //                if (data.code === 200) {
        //                    $('#detail-table').bootstrapTable(
        //                        'load',
        //                        data.data.list
        //                    );
        //                }
        //            }
        //        });
        //    }
        //};
    }
    $scope.openImg = function() {
        $('.ibox-Masks').hide();
    };
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
        $scope.settlementArr.status = pop_che ? 1 : 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'put',
            url: url + 'admin/cp_closing/' + $scope.settlementArr.id,
            params: $scope.settlementArr
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
            end_date: self.endDate,
            project: self.Channel_s,
            product: self.Company_s,
            issue: self.Region_s
            //closing_cp: self.cp
        };
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
