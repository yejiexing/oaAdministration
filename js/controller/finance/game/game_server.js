/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('gameServer', []);
app.controller('gameServerCtrl', function($http, $scope, $q, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0 ? true : false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = $scope.updateinvoiceinfo = state;
    if (!state) {
        $scope.index = parents.authList('server-index'); //查看列表权限
        $scope.read = parents.authList('server-read'); //查看详情权限
        $scope.update = parents.authList('server-update'); //编辑操作
        $scope.save = parents.authList('server-save'); //添加操作
        $scope.delete = parents.authList('server-delete'); //删除操作
        $scope.deletes = parents.authList('server-deletes'); //批量删除操作
        $scope.enables = parents.authList('server-enables'); //批量启用禁用操作
        $scope.isexport = parents.authList('server-export');//导出操作
        $scope.imports = parents.authList('server-importdata');//导入操作
        $scope.updateinvoiceinfo = parents.authList('server-updateinvoiceinfo');//导入操作
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
    self.platform = ''; // 平台搜索
    $scope.select = {
        selectChannel: '',
        selectCompany: '',
        account: '',
        platform: ''
    };
    $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = 0;
    $scope.Newdate1 = self.startDate = parents.currentDate.MonthTime(3);
    $scope.Newdate2 = self.endDate = parents.currentDate.MonthTime(1);
    $scope.serverArr = $scope.copyserverArr = new Object();

    $scope.ChannelList = parents.select('server/getProjectList'); //获取单位list
    $scope.CompanyList = '';

    initTable();
    $scope.doQuery = function(params) {
        $('#demo-table').bootstrapTable('refresh'); //刷新表格
        $scope.ChannelList = parents.select('server/getProjectList'); //刷新渠道list
        $scope.CompanyList = $scope.copyserverArr = ''; //刷新单位list
        $scope.deleteState = $scope.editState = $scope.updateInfo = false;
    };
    $scope.search = function(params) {
        //搜索
        self.Channel_s = $scope.select.selectChannel;
        self.Company_s = $scope.select.selectCompany;
        self.Region_s = $scope.select.account;
        self.platform = $scope.select.platform;
        self.startDate = $scope.Newdate1;
        self.endDate = $scope.Newdate2;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = false;
    };
    $scope.export = function() {
        var ExpObj = {
            start_date: $scope.Newdate1,
            end_date: $scope.Newdate2,
            project: $scope.select.selectChannel,
            product: $scope.select.selectCompany,
            account: $scope.select.account,
            platform: $scope.select.platform
        };
        parents.Exports('server/export', ExpObj);
    };
    $scope.iconFun = function() {
        $scope.usersError = '';
        $scope.iconFile = null;
        angular.element('#iconFile').val(null);
        $('#icon').modal('show');
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
    // 导入文件
    $scope.import = function() {
        var fd = new FormData();
        fd.append('file', $scope.iconFile);
        $http
            .post(url + 'admin/server/importData', fd, {
                headers: { 'Content-Type': undefined, token: parents.token() },
                transformRequest: angular.identity
            })
            .then(
                function(data) {
                    if (data.data.code === 200) {
                        $scope.doQuery();
                        $('#icon').modal('hide');
                        $('#code').html(data.data.data);
                        $('#table_success').modal('show');
                    }
                    if (data.data.code === 400) {
                        $scope.usersError = data.data.error;
                    }
                    $scope.uploading = false;
                },
                function(error) {
                    $scope.usersError = error.statusText;
                    $scope.uploading = false;
                }
            );
        $scope.uploading = true;
    };
    $scope.dome = function() {
        //下载模板
        parents.Exports('server/downloadTemplate', '');
    };
    $scope.deleteFun = function(params) {
        //删除
        $('#table_delete').modal('show');
    };
    $scope.editFun = function(params) {
        //编辑
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/server/' + $scope.serverArr.id
        }).success(function(data) {
            if (data.code == 200) {
                $scope.copyserverArr = data.data;
                parents.forSome(
                    $scope.copyserverArr,
                    ['amount', 'total_money'],
                    Number
                );
                if (params == 1) {
                    $scope.dealList = data.data.dealList;
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show");
                } else {
                    $scope.method = 'put';
                    $scope.edit = true;
                    defaults();

                    parents.forSome(
                        $scope.copyserverArr,
                        ['project_id', 'product_id'],
                        String
                    );

                    $q
                        .all([
                            $http.get(
                                url + 'admin/project/getProjectNameAndId'
                            ),
                            $http.get(
                                url +
                                    'admin/product/getProductRelatedByProjectId',
                                {
                                    params: {
                                        project_id:
                                            $scope.copyserverArr.project_id
                                    }
                                }
                            )
                        ])
                        .then(function(data) {
                            $scope.Channel_s = data[0].data.data;
                            $scope.Region_s = data[1].data.data;

                            $('#preservaModal').modal('show');
                            $('#myModalLabel').html('[编辑]服务器支出');
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
            .map(function(item) {
                return item.id;
            });
        if(checks[checks.length-1] == undefined) {
            checks.pop();
        }

        if (checks.length) {
            $http
                .post(url + 'admin/server/deletes', {
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
                .delete(url + 'admin/server/' + $scope.serverArr.id)
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
    $scope.updateFun = function(){
        $scope.updateInfoArr = {
            is_invoice : '0',
            invoice_number : ''
        };
        if($scope.copyserverArr.id){
            $scope.updateInfoArr.is_invoice = $scope.copyserverArr.is_invoice == '是'?'1':'0';
            $scope.updateInfoArr.invoice_number = Number($scope.copyserverArr.invoice_number);
        }
        $scope.updateError = '';
        $scope.updateHead = '修改发票信息';
        $('#updateInvoiceInfo').modal('show');
    }
    $scope.updateInfoFun = function(){
        if($scope.updateInfoArr.is_invoice == 1 && ($scope.updateInfoArr.invoice_number == '' || $scope.updateInfoArr.invoice_number == null)){
            $scope.updateError = '请填写发票号';
            return false;
        }
        $http.defaults.headers.common = { token: parents.token() };
        var upchecks = $('#demo-table').bootstrapTable('getSelections').map(function(item) {
            return item.id;
        });
        if(upchecks[upchecks.length-1] == undefined) {
            upchecks.pop();
        }
        var up_id = '';
        if(upchecks.length){
            up_id = upchecks.join(',');
        }else{
            up_id = $scope.copyserverArr.id;
        }
        $http.post(url + 'admin/server/updateInvoiceInfo', {
            ids: up_id,
            is_invoice : $scope.updateInfoArr.is_invoice,
            invoice_number : $scope.updateInfoArr.invoice_number
        }).then(function(data) {
            $('#updateInvoiceInfo').modal('hide');
            $('#code').html(data.data.data);
            $('#table_success').modal('show');
            $scope.doQuery();
        });
    }

    $scope.preservaConfirm = function() {
        console.log($scope.copyserverArr);
        if (parents.forEachs($scope.copyserverArr) != 0) {
            $scope.usersError = '请完善必填内容';
            return false;
        }
        parents.screen.Delete($scope.copyserverArr)
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: $scope.method,
            url:
                url +
                'admin/server/' +
                ($scope.method === 'put' ? $scope.copyserverArr.id : ''),
            params: $scope.copyserverArr
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

    $scope.projectFun = function(v) {
        var identical =
            v === undefined
                ? $scope.select.selectChannel
                : $scope.copyserverArr.project_id;
        ProjectId(identical, v);
    };

    function ProjectId(identical, v) {
        var params = {},
            subUrl;

        if (v === undefined) {
            subUrl = 'admin/server/getProductList';
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
                    if (v !== undefined) {
                        $scope.Region_s = data.data; //获取渠道list
                        $scope.copyserverArr.product_id = '';
                    } else {
                        $scope.CompanyList = data.data; //获取渠道list
                        $scope.select.selectCompany = '';
                    }
                } else if (data.code == 400) {
                    if (index !== undefined) {
                        $scope.Region_s = '';
                        $scope.copyserverArr.product_id = '';
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
    $scope.NewlyAdded = function() {
        $scope.method = 'post';
        $scope.edit = false;
        $scope.copyserverArr = {
            month: '',
            project_id: '',
            product_id: '',
            account: '',
            platform: '',
            server_type: '',
            amount: '',
            cp_share: '',
            tax_rate: ''
        };

        defaults();

        $http.defaults.headers.common = { token: parents.token() };
        $http
            .get(url + 'admin/project/getProjectNameAndId')
            .then(function(data) {
                $scope.Channel_s = data.data.data;

                $('#myModalLabel').html('[新增]服务器支出');
                $('#preservaModal').modal('show');
            });
    };

    layDate(
        ['1', '2', '3'], //日期id
        ['month', 'month', 'month'], //日期type
        ['Newdate1', 'Newdate2', 'month'], //存储对象
        ['1', '1', '0'], //存储状态
        'copyserverArr',
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
            url: url + 'admin/server',
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
                        $scope.deleteState = $scope.editState = $scope.updateInfo = true;
                        $scope.serverArr = $scope.copyserverArr =
                            data.rows[t_idx];
                        parents.forSome(
                            $scope.copyserverArr,
                            ['amount', 'total_money'],
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
                            if(checks != 0) {
                                $scope.deleteState =$scope.updateInfo = checks > 0;
                            }else {
                                $scope.deleteState =$scope.updateInfo = $('.bg-color').length == 0 ? false : true;
                            }
                        });
                    });
                    // 单选事件，根据状态增减选中个数和是否禁用删除按钮
                    checkbox.change(function() {
                        this.checked ? checks++ : checks--;
                        $scope.$apply(function() {
                            if(checks != 0) {
                                $scope.deleteState =$scope.updateInfo = checks > 0;
                            }else {
                                $scope.deleteState =$scope.updateInfo = $('.bg-color').length == 0 ? false : true;
                            }
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
    }
    $scope.openImg = function() {
        $('.ibox-Mask').hide();
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
        $scope.serverArr.status = pop_che ? 1 : 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'put',
            url: url + 'admin/server/' + $scope.serverArr.id,
            params: $scope.serverArr
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
            account: self.Region_s,
            platform: self.platform
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
        $scope.Channel_s = [];
        $scope.Company_s = [];
        $scope.Region_s = [];
    }
});