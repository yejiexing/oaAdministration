/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('manBill', []);
app.controller('manBillCtrl', function($http, $scope, $q, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0 ? true : false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = state;
    if (!state) {
        $scope.index = parents.authList('financebill-index'); //查看列表权限
        $scope.read = parents.authList('financebill-read'); //查看详情权限
        $scope.update = parents.authList('financebill-update'); //编辑操作
        $scope.save = parents.authList('financebill-save'); //添加操作
        $scope.delete = parents.authList('financebill-delete'); //删除操作
        $scope.deletes = parents.authList('financebill-deletes'); //批量删除操作
        $scope.enables = parents.authList('financebill-enables'); //批量启用禁用操作
        $scope.isexport = parents.authList('financebill-export');//导出操作
    }
    $('#query').show();
    $scope.ispc = parents.IsPC();
    $scope.deleteState = false;
    $scope.editState = false;
    self.Channel_s = ''; //地区-搜索
    self.Company_s = ''; //地区-搜索
    self.Region_s = ''; //地区-搜索
    self.startDate = ''; //开始时间
    self.endDate = ''; //结束时间
    $scope.select = {
        selectChannel: '',
        selectCompany: '',
        selectRegion: '',
        selectNumber: '',
        C_status: true
    };
    $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = 0;
    $scope.Newdate1 = self.startDate = parents.currentDate.MonthTime(3);
    $scope.Newdate2 = self.endDate = parents.currentDate.MonthTime(1);
    $scope.billArr = $scope.copybillArr = new Object();

    $scope.ChannelList = parents.select('project/getProjectList'); //获取单位list
    $scope.UnitList = parents.select('finance_bill/getClosingUnit');

    initTable();
    $scope.doQuery = function(params) {
        $('#demo-table').bootstrapTable('refresh'); //刷新表格
        $scope.ChannelList = parents.select('project/getProjectList'); //刷新渠道list
        $scope.UnitList = parents.select('finance_bill/getClosingUnit');
        $scope.CompanyList = ''; //刷新单位list
        $scope.deleteState = $scope.editState = false;
    };
    $scope.search = function(params) {
        //搜索
        self.Channel_s = $scope.select.selectChannel;
        self.Company_s = $scope.select.selectCompany;
        self.Region_s = $scope.select.selectRegion;
        self.startDate = $scope.Newdate1;
        self.endDate = $scope.Newdate2;
        $('#demo-table')
            .bootstrapTable('refreshOptions', { pageNumber: 1 })
            .bootstrapTable('refresh');
        $scope.deleteState = $scope.editState = false;
    };
    $scope.export = function() {
        var ExpObj = {
            start_date: $scope.Newdate1,
            end_date: $scope.Newdate2,
            project: $scope.select.selectChannel,
            product: $scope.select.selectCompany,
            closing_unit: $scope.select.selectRegion
        };
        parents.Exports('finance_bill/export', ExpObj);
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
            url: url + 'admin/finance_bill/' + $scope.billArr.id
        }).success(function(data) {
            if (data.code == 200) {
                $scope.copybillArr = data.data;
                if (params == 1) {
                    $scope.dealList = data.data.dealList;
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show");
                } else {
                    $scope.method = 'put';
                    defaults();
                    $scope.addProduct();

                    parents.forSome(
                        $scope.copybillArr,
                        ['project_id', 'product_id', 'income_type'],
                        String
                    );

                    $scope.copybillArr.start_date = [
                        $scope.copybillArr.start_date
                    ];
                    $scope.copybillArr.end_date = [$scope.copybillArr.end_date];
                    $scope.copybillArr.project_id = [
                        $scope.copybillArr.project_id
                    ];
                    $scope.copybillArr.product_id = [
                        $scope.copybillArr.product_id
                    ];

                    $q
                        .all([
                            $http.get(url + 'admin/base/getIncomeType'),
                            $http.get(url + 'admin/base/getClosingUnit', {
                                params: {
                                    income_type: $scope.copybillArr.income_type
                                }
                            }),
                            $http.get(
                                url + 'admin/project/getProjectNameAndId'
                            ),
                            $http.get(
                                url +
                                    'admin/product/getProductRelatedByProjectId',
                                {
                                    params: {
                                        project_id:
                                            $scope.copybillArr.project_id[0]
                                    }
                                }
                            )
                        ])
                        .then(function(data) {
                            $scope.Income_s = data[0].data.data;
                            $scope.Unit_s = data[1].data.data;
                            $scope.Channel_s = data[2].data.data;
                            $scope.Region_s.push(data[3].data.data);
                            $('#preservaModal').modal('show');
                            $('#myModalLabel').html('[编辑]2.0财务开票');
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
                .post(url + 'admin/finance_bill/deletes', {
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
                .delete(url + 'admin/finance_bill/' + $scope.billArr.id)
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
            .put(
                url + 'admin/finance_bill/updateReceiveMoneyDate/',
                $scope.updateReceiveMoneyDate
            )
            .then(function(data) {
                if (data.data.code === 200) {
                    $('#collectModal').modal('hide');
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                    $scope.doQuery();
                }
            });
    };

    $scope.addProduct = function() {
        if ($scope.indexes.length < 10) {
            $scope.select.selectChannels.push('');
            $scope.indexes.push($scope.indexes.length);
        }
    };

    $scope.includeDate = function(index) {
        var interval = setInterval(function() {
            if (
                lay('#start_date_' + index).length &&
                lay('#end_date_' + index).length
            ) {
                clearInterval(interval);
                lay('#start_date_' + index).on('click', function() {
                    laydate.render({
                        elem: '#start_date' + index,
                        max: $scope.copybillArr.end_date[index] || '2099-12-31',
                        show: $scope.method == 'post',
                        closeStop: '#start_date_' + index,
                        done: function(value, date, endDate) {
                            $scope.copybillArr.start_date[index] = value;
                        }
                    });
                });
                lay('#end_date_' + index).on('click', function() {
                    laydate.render({
                        elem: '#end_date' + index,
                        min: $scope.copybillArr.start_date[index] || '1900-1-1',
                        show: $scope.method == 'post',
                        closeStop: '#end_date_' + index,
                        done: function(value, date, endDate) {
                            $scope.copybillArr.end_date[index] = value;
                        }
                    });
                });
            }
        }, 300);
    };

    $scope.preservaConfirm = function() {
        //新增弹出框
        var channelNum = 0;
        angular.forEach($scope.copybillArr, function(v, i) {
            if (
                i == 'start_date' ||
                i == 'end_date' ||
                i == 'income_type' ||
                i == 'invoice_number' ||
                i == 'courier_company' ||
                i == 'track_number' ||
                i == 'project_id' ||
                i == 'product_id' ||
                i == 'closing_unit'
            ) {
                if (v == '') {
                    channelNum++;
                }
            }
        });
        if (channelNum != 0) {
            $scope.usersError = '请完善必填内容';
            return false;
        }

        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: $scope.method,
            url:
                url +
                'admin/finance_bill/' +
                ($scope.method === 'put' ? $scope.copybillArr.id : ''),
            params: {
                income_type: $scope.copybillArr.income_type,
                closing_unit: $scope.copybillArr.closing_unit,
                invoice_number: $scope.copybillArr.invoice_number,
                courier_company: $scope.copybillArr.courier_company,
                track_number: $scope.copybillArr.track_number,
                start_date: $scope.copybillArr.start_date.join(','),
                end_date: $scope.copybillArr.end_date.join(','),
                project_id: $scope.copybillArr.project_id.join(','),
                product_id: $scope.copybillArr.product_id.join(','),
                invioce_file_name: $scope.copybillArr.invioce_file_name,
                invioce_file_path: $scope.copybillArr.invioce_file_path
            }
        }).then(
            function(data) {
                if (data.data.code == 200) {
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
                : $scope.copybillArr.project_id[index];
        ProjectId(identical, index, callback);
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

    $scope.IncomeId = function(callback) {
        $http.defaults.headers.common = { token: parents.token() };
        $http
            .get(url + 'admin/base/getClosingUnit', {
                params: {
                    income_type: $scope.copybillArr.income_type
                }
            })
            .then(function(data) {
                if (data.data.code === 200) {
                    $scope.Unit_s = data.data.data;

                    if (callback) {
                        callback();
                    }
                }
            });

        $scope.copybillArr.closing_unit = '';
    };

    $scope.changeFile = function(file) {
        var fd = new FormData();
        fd.append('file', file);

        $http
            .post(url + 'admin/upload', fd, {
                headers: { 'Content-Type': undefined, token: parents.token() },
                transformRequest: angular.identity
            })
            .then(
                function(data) {
                    if (data.data.code === 200) {
                        $scope.copybillArr.invioce_file_name = file.name;
                        $scope.copybillArr.invioce_file_path = data.data.data;
                    } else {
                        $scope.usersError = data.data.error;
                    }
                },
                function(error) {
                    $scope.usersError = error;
                }
            );
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
                        $scope.Region_s[index] = data.data; //获取渠道list
                        $scope.copybillArr.product_id[index] = '';

                        if (callback) {
                            callback();
                        }
                    } else {
                        $scope.CompanyList = data.data; //获取渠道list
                        $scope.select.selectCompany = '';
                    }
                } else if (data.code == 400) {
                    if (index !== undefined) {
                        $scope.Region_s[index] = [];
                        $scope.copybillArr.product_id[index] = '';
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
        $scope.method = 'post';
        $scope.copybillArr = {
            start_date: [],
            end_date: [],
            project_id: [],
            product_id: [],
            closing_unit: '',
            track_number: '',
            income_type: '',
            invoice_number: '',
            courier_company: ''
        };
        defaults();
        $scope.addProduct();

        $http.defaults.headers.common = { token: parents.token() };
        $q
            .all([
                $http.get(url + 'admin/base/getIncomeType'),
                $http.get(url + 'admin/project/getProjectNameAndId')
            ])
            .then(function(data) {
                $scope.Income_s = data[0].data.data;
                $scope.Channel_s = data[1].data.data;

                if (callback) {
                    callback();
                }
                $('#myModalLabel').html('[新增]2.0财务开票');
                $('#preservaModal').modal('show');
            });
    };

    $("button[ng-click='NewlyAdded()']").on('finance', function(event, data) {
        function setProduct() {
            $scope.copybillArr.product_id[0] = data.product_id.toString();
        }

        function setUnit() {
            $scope.copybillArr.closing_unit = data.closing_unit;
        }

        $scope.NewlyAdded(function() {
            $scope.copybillArr.income_type = data.income_type.toString();
            $scope.IncomeId(setUnit);

            $scope.copybillArr.project_id[0] = data.project_id.toString();
            $scope.projectFun(0, setProduct);
        });

        $scope.copybillArr.start_date[0] = data.start_date;
        $scope.copybillArr.end_date[0] = data.end_date;
    });

    $("button[ng-click='NewlyAdded()']").on('statement', function(event, data) {
        function setProduct() {
            $scope.copybillArr.product_id[0] = data.product_id.toString();
        }

        function setUnit() {
            $scope.copybillArr.closing_unit = data.closing_unit;
        }

        $scope.NewlyAdded(function() {
            $scope.copybillArr.income_type = data.income_type;
            $scope.IncomeId(setUnit);
            $scope.copybillArr.project_id[0] = data.project_id.toString();
            $scope.projectFun(0, setProduct);
        });

        $scope.copybillArr.start_date[0] = data.start_date;
        $scope.copybillArr.end_date[0] = data.end_date;
    });

    layDates(
        ['1', '2'], //日期id
        ['month', 'month'], //日期type
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
                            $scope.copybillArr[props[i]] = value;
                        } else {
                            $scope[props[i]] = value;
                        }
                    }
                });
            });
        });
    }

    $('#collectModal').on('shown.bs.modal', function() {
        lay('#collect_time').on('click', function(e) {
            laydate.render({
                elem: '#collectTime',
                show: true, //直接显示
                closeStop: '#collect_time', //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
                done: function(value, date, endDate) {
                    $scope.updateReceiveMoneyDate.date = value;
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
            url: url + 'admin/finance_bill',
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
                        $scope.billArr = $scope.copybillArr = data.rows[t_idx];
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
        actualCollectTime = function(value, row, index) {
            return value === '点击添加'
                ? '<div class="text-success collectFun finaceclick">' +
                      value +
                      '</div>'
                : value;
        };
        receiptData = function(value, row, index) {
            return value === '已收款'
                ? value
                : '<div class="text-success receiptFun finaceclick">' +
                      value +
                      '</div>';
        };
        window.billFun = {
            'click .collectFun': function(event, value, row, index) {
                $scope.updateReceiveMoneyDate = { id: row.id, date: '' };
                $('#collectModal').modal('show');
            },
            'click .receiptFun': function(event, value, row, index) {
                jump(event, value, row, index, 'receipt');
            }
        };
        invioceFun = function(value, row, index) {
            if (value == null || value == '') {
                return value;
            }
            var invicoce = value.split('.');
            if (
                invicoce[1] == 'png' ||
                invicoce[1] == 'jpg' ||
                invicoce[1] == 'gif'
            ) {
                return '<div class="invicoce-icon text-success finaceclick">点击打开</div>';
            } else {
                return '<div class="invicoce-href text-success finaceclick">点击下载</div>';
            }
        };
        window.invicoce = {
            'click .invicoce-icon': function(event, value, row, index) {
                $('.ibox-Masks').show();
                $scope.iconInv = url_img + row.invioce_file_path;
            },
            'click .invicoce-href': function(event, value, row, index) {
                window.open(url_img + row.invioce_file_path);
            }
        };
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
        $scope.billArr.status = pop_che ? 1 : 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'put',
            url: url + 'admin/finance_bill/' + $scope.billArr.id,
            params: $scope.billArr
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
            closing_unit: self.Region_s
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

    function defaults() {
        $scope.usersError = '';
        $scope.indexes = [];
        $scope.Income_s = [];
        $scope.Unit_s = [];
        $scope.Channel_s = [];
        $scope.Region_s = [];
        $scope.select.selectChannels = [];
        angular.element('#file').val(null);
    }

    function jump(event, value, row, index, name) {
        var navButton = 'span.title1[data-title="财务结算"]',
            jumpButton = 'a.J_menuItem[href*="man_' + name + '"]', // 跳转按钮选择器
            jumpIframe = 'iframe.J_iframe[src*="man_' + name + '"]', // 跳转iframe选择器
            addButton = 'button[ng-click="NewlyAdded()"]', // 新增按钮选择器
            jumpWindow; // 跳转iframe的window对象

        if (!parent.$(navButton, parent.document).hasClass('meadio')) {
            parent.$(navButton, parent.document).click();
        }
        parent.$(jumpButton, parent.document).click(); // 触发跳转按钮click事件
        jumpWindow = parent.$(jumpIframe)[0].contentWindow;

        $http.defaults.headers.common = { token: parents.token() };
        $http.get(url + 'admin/finance_bill/' + row.id).then(function(data) {
            if (data.data.code === 200) {
                // 判断iframe是否已经存在
                if (jumpWindow.$) {
                    jumpWindow.$(addButton).trigger('bill', [data.data.data]); // 触发自定义事件并传递数据
                } else {
                    // 监听iframe加载完成事件
                    parent.$(jumpIframe).one('load', function() {
                        this.contentWindow
                            .$(addButton)
                            .trigger('bill', [data.data.data]); // 触发自定义事件并传递数据
                    });
                }
            }
        });
    }
});
