/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('opemyBusiness',[]);
app.controller('opemyBusinessCtrl',function($http, $scope, $timeout,$q) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = $scope.tobusiness = state;
    if(!state) {
        $scope.index = parents.authList('mybusiness-index');//查看列表权限
        $scope.read = parents.authList('mybusiness-read');//查看详情权限
        $scope.update = parents.authList('mybusiness-update');//编辑操作
        $scope.save = parents.authList('mybusiness-save');//添加操作
        $scope.delete = parents.authList('mybusiness-delete');//删除操作
        $scope.deletes = parents.authList('mybusiness-deletes');//批量删除操作
        $scope.enables = parents.authList('mybusiness-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('mybusiness-exportdata');//导出操作
        $scope.imports = parents.authList('mybusiness-importdata');//导入操作
        $scope.tobusiness = parents.authList('mybusiness-copyoperatetobusiness');//导入操作
    }
    $("#query").show();
    $scope.ispc = parents.IsPC();
    $scope.deleteState = $scope.editState = $scope.iconState = $scope.updateState= $scope.searchState = false;
    $scope.Id = self.Channel_s = self.Company_s = self.Region_s = self.startDate = self.endDate = '';//结束时间
    $scope.select = {
        selectChannel: '', //选择项目的名字
        selectCompany: '', //选择产品的名字
        selectRegion: '', //选择渠道的名字
        C_status: true
    };
    self.SearchList = [{val:'Channel_s',name:'project_id'},{val:'Region_s',name:'product_id'},{val:'Company_s',name:'channel_id'}];
    $scope.thirdParty = '';
    $scope.Method = $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = $scope.table_num = 0;
    $scope.Newdate1 = $scope.Newdate2 = self.startDate = self.endDate = parents.currentDate.Yesterday();//昨天时间
    $scope.businessArr = $scope.copybusinessArr = new Object();
    $scope.uploading = false;

    $scope.ChannelList = parents.select('project/getProjectList');//获取单位list
    $scope.RegionList = parents.select('channel/getChannelList');//获取单位list

    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.ChannelList = parents.select('project/getProjectList');//刷新渠道list
        $scope.CompanyList = '';//刷新单位list
        $scope.RegionList = parents.select('channel/getChannelList');//获取单位list
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    //填充商务数据
    $scope.ToBusiness1 = function(){
        $scope.copysettlementArr = {
            start_date: parents.currentDate.Yesterday(),
            end_date: parents.currentDate.Yesterday(),
            cp_id: '',
            project_id: '',
            product_id: '',
            channel: '',
            channel_id: '',
            finance_id: []
        };
        $scope.usersError = '';
        $scope.select.is_back = '';

        $http.defaults.headers.common = { token: parents.token() };
        $q.all([
            $http.get(url + 'admin/project/getProjectNameAndId'),
            $http.get(url + 'admin/channel/getChannelNameAndId')
            //$http.get(url + 'admin/cp_closing/getClosingUnitNameAndId')
        ])
            .then(function(data) {
                $scope.Channel_s= data[0].data.data;
                $scope.Company_s = data[1].data.data;
                //$scope.Unit_s = data[2].data.data;
                //
                //if (callback) {
                //    callback();
                //}
                $('#myModalLabels').html('[填充]商务数据');
                $('#BusinessModal').modal('show');
            });
    }
    $scope.modalSearch = function() {
        $scope.usersError = '';
        $scope.searchState = true;
        $http.get(url + 'admin/business/getOperateData', {
            headers: {
                token: parents.token()
            },
            params: {
                start_date: $scope.copysettlementArr.start_date,
                end_date: $scope.copysettlementArr.end_date,
                project_id: $scope.copysettlementArr.project_id,
                product_id: $scope.copysettlementArr.product_id,
                channel_id: $scope.copysettlementArr.channel_id
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
                    $scope.table_num = data.data.data.length;
                    $('#modal-table').bootstrapTable('load', data.data.data).bootstrapTable('checkAll');
                    $scope.searchState = false;
                } else {
                    $scope.usersError = data.data.error;
                    $scope.table_num = 0;
                    $scope.searchState = false;
                }
            },
            function(error) {
                $scope.searchState = false;
                $scope.usersError = error;
            }
        );
    };
    $scope.BusinessConfirm = function() {
        parents.$login.state();
        $.ajax({
            url: url + 'admin/business/copyOperateToBusiness',
            data : {
                operate_ids : $('#modal-table').bootstrapTable('getSelections').map(function(item) {return item.id;})
            },
            type : 'POST',
            beforeSend: function(request) {
                request.setRequestHeader('token', parents.token());
            },
            success: function(data) {
                if (data.code === 200) {
                    self.Channel_s = $scope.select.selectChannel = $scope.copysettlementArr['Channel_s'];
                    self.Company_s = $scope.select.selectCompany = $scope.copysettlementArr['Region_s'];
                    self.Region_s = $scope.select.selectRegion = $scope.copysettlementArr.channel_id;
                    self.startDate = $scope.Newdate1 = $scope.copysettlementArr.start_date;
                    self.endDate = $scope.Newdate2 = $scope.copysettlementArr.end_date;
                    $scope.$apply()
                    $scope.doQuery();
                    parents.$login.state();
                    $('#BusinessModal').modal('hide');
                    $('#code').html(data.data);
                    $('#table_success').modal('show');
                } else {
                    parents.$login.state();
                    $scope.usersError = data.data.error;
                }
            }
        });
    };


    $scope.select_change = function(val,name){
        $('#modal-table').bootstrapTable({ striped: true }).bootstrapTable('removeAll');
        $scope.table_num = 0;
    }
    $('#BusinessModal').on('show.bs.modal', function() {
        $scope.select_change();
    });

    $('#BusinessModal').on('shown.bs.modal', function() {
        lay('#Start_date').on('click', function(e) {
            laydate.render({
                elem: '#Startdate',
                type: 'date',
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
                type: 'date',
                show: true, //直接显示
                closeStop: '#End_date', //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
                done: function(value, date, endDate) {
                    $scope.copysettlementArr.end_date = value;
                    $('#modal-table').bootstrapTable({ striped: true }).bootstrapTable('removeAll');
                }
            });
        });
    });
    $scope.search = function(params){ //搜索
        self.Channel_s = $scope.select.selectChannel;
        self.Company_s = $scope.select.selectCompany;
        self.Region_s = $scope.select.selectRegion;
        self.startDate = $scope.Newdate1;
        self.endDate = $scope.Newdate2;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.businessArr.id;
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/business/' + $scope.Id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copybusinessArr = data.data;
                parents.forSome($scope.copybusinessArr, [
                    'second_day_stay',
                    'third_day_stay',
                    'seven_day_stay',
                    'third_party_amount',
                    'mm_amount',
                    'migu_amount',
                    'unicom_amount',
                    'telecom_amount'
                ], Number);
                if(params == 1){
                    $scope.dealList = data.data.dealList;
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show");
                }else{
                    $scope.updateState = true;
                    $scope.Channel_s = parents.select('project/getProjectNameAndId');//刷新渠道list
                    $scope.Company_s = parents.select('channel/getChannelNameAndId');//刷新渠道list
                    $scope.projectFun(1, true);
                    $scope.getProductChannelInfo();
                    parents.forSome($scope.copybusinessArr, ['project_id', 'product_id', 'channel_id'], String);
                    $("#preservaModal").modal("show");
                    $("#myModalLabel").html('[编辑]我的商务数据');
                }
            }
        }).error(function(){
        });
    }
    $scope.deleteConfirm = function() {
        //删除弹出框
        $http.defaults.headers.common = { token: parents.token() };
        var checks = $('#demo-table')
            .bootstrapTable('getSelections')
            .map(function(item) {
                return item.id;
            });

        if (checks.length) {
            $http.post(url + 'admin/business/deletes', {
                ids: checks
            }).then(
                function(data) {
                    var dataVal = data.data.code == 200?data.data.data:data.data.error;
                    $('#table_delete').modal('hide');
                    $('#code').html(dataVal);
                    $('#table_success').modal('show');
                    $scope.doQuery();
                }
            );
        } else {
            $http
                .delete(url + 'admin/business/' + $scope.businessArr.id)
                .then(
                    function(data) {
                        var dataVal1 = data.data.code == 200?data.data.data:data.data.error;
                        $('#table_delete').modal('hide');
                        $('#code').html(dataVal1);
                        $('#table_success').modal('show');
                        $scope.doQuery();
                    },
                    function() {
                    }
                );
        }
    };

    $scope.preservaConfirm = function(){//新增弹出框
        var channelNum = 0;
        angular.forEach($scope.copybusinessArr,function(v,i){
            if(i == 'date' || i == 'project_name' || i == 'product_name' || i == 'channel_name' || i == 'download_count') {
                if (v == '') {
                    channelNum++
                }
            }
        });
        if(channelNum != 0){
            $scope.usersError = '请完善必填内容';
            return false;
        }
        parents.screen.Delete($scope.copybusinessArr)
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : $scope.Method,
            url: url + 'admin/business/' + $scope.Id,
            params : $scope.copybusinessArr
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
    };
    $scope.export = function(){//导出
        var ExpObj = {
            project_id : self.Channel_s,
            product_id : self.Company_s,
            channel_id :self.Region_s,
            start_date : self.startDate,
            end_date : self.endDate,
            my_data : true
        }
        parents.Exports('business/exportData', ExpObj);
    };

    self.inputTime = null;
    $scope.searchFun = function(v){
        clearTimeout(self.inputTime);
        $(".select_input").removeClass('open');
        $("#"+v).addClass('open');
        $("#"+v+" input").focus();
        $scope.select.C_status = false;
    };
    setTimeout(function(){
        $(".select_input input").on({
            'blur' : function(){
                var thisId = $(this).attr('data-id');
                self.inputTime = setTimeout(function(){
                    $("#"+thisId).removeClass('open');
                    if(thisId == 'business-region'){
                        var thisVal = $("#"+thisId+" input").val()
                        if(thisVal == ''){
                            //$scope.copysettlementArr.channel = '';
                            $scope.copysettlementArr.channel_id = '';
                        }else{
                            for(var i = 0;i<$scope.Company_s.length;i++){
                                if($scope.Company_s[i].name === thisVal){
                                    //$scope.copysettlementArr.channel = $scope.Company_s[i].name;
                                    $scope.copysettlementArr.channel_id = $scope.Company_s[i].name;
                                    $scope.usersError = '';
                                    break;
                                }else{
                                    //$scope.copysettlementArr.channel = '';
                                    $scope.copysettlementArr.channel_id = '';
                                    $scope.usersError = '当前渠道不存在';
                                }
                            }
                        }
                        $scope.select_change();
                        $scope.$apply()
                    }
                },200)

            },
            'focus':function(v){
                $scope.select.C_status = true;
                var thisId = $(this).attr('data-id');
                $("#"+thisId).addClass('open');
                $scope.usersError = '';
                $scope.$apply()
            },
            'input propertychange' : function(){
                $scope.select.C_status = true;
            }
        });
    },30)

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
            .post(url + 'admin/business/importData', fd, {
                headers: { 'Content-Type': undefined, token: parents.token() },
                transformRequest: angular.identity
            })
            .then(function(data) {
                    if (data.data.code === 200) {
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
        parents.Exports('business/downloadTemplate','')
    }

    $scope.projectFun = function(v, edit) {
        var identical = v == 1 ? $scope.copybusinessArr.project_id : $scope.select.selectChannel;
        ProjectId(identical, v, edit);
    };
    $scope.ProjFun = function(v, edit){
        var identical1 = $scope.copysettlementArr.project_id;
        $scope.copysettlementArr.product_id = '';
        ProjectId(identical1, v, edit);

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
    $scope.setBusRegion = function(item) {
        //$scope.copysettlementArr.channel = item.name;
        $scope.copysettlementArr.channel_id = item.name;
    };

    $scope.getProductChannelInfo = function() {
        if ($scope.copybusinessArr.product_id && $scope.copybusinessArr.channel_id) {
            $http
                .get(url + 'admin/product_channel/getProductChannelInfo', {
                    params: {
                        product_id: $scope.copybusinessArr.product_id,
                        channel_id: $scope.copybusinessArr.channel_id
                    }
                })
                .then(function(data) {
                        if (data.data.code === 200) {
                            $scope.productChannel = data.data.data;
                        }

                        if (data.data.code === 400) {
                        }
                    }, function(error) {});
        }
    };

    function ProjectId(identical, v, edit) {
        var params = {},
            subUrl;

        if (v === undefined) {
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
                    if (v == 1) {
                        $scope.Region_s = data.data; //获取渠道list

                        if (!edit) {
                            $scope.copybusinessArr.product_id = '';
                        }
                    } else {
                        $scope.CompanyList = data.data; //获取渠道list
                        $scope.select.selectCompany = '';
                    }
                } else if (data.code == 400) {
                    if (v == 1) {
                        $scope.Region_s = ''; //获取渠道list

                        if (!edit) {
                            $scope.copybusinessArr.product_id = '';
                        }
                    } else {
                        $scope.CompanyList = ''; //获取渠道list
                        $scope.select.selectCompany = '';
                    }
                }
            })
            .error(function(r) {
                alert('服务器异常，请稍候重试');
            });
    }
    $scope.NewlyAdded = function(){
        $scope.usersError = '';
        $scope.Id = '';
        $scope.Method = 'post';
        $scope.copybusinessArr = {
            date: "",
            project_id: "",
            product_id: "",
            channel_id: "",
            download_count: ""
        };
        $scope.updateState = false;
        $scope.Channel_s = parents.select('project/getProjectNameAndId');//刷新渠道list
        $scope.Region_s = '';//获取渠道list
        $scope.Company_s = parents.select('channel/getChannelNameAndId');//刷新渠道list

        $("#preservaModal").modal("show");
        $("#myModalLabel").html('[新增]我的商务数据');
    }

    layDate(
        ['1', '2', '3'], //日期id
        ['date', 'date', 'date'], //日期type
        ['Newdate1', 'Newdate2', 'date'], //存储对象
        ['1', '1', '0'], //存储状态
        'copybusinessArr',
        $scope
    );
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
            url:url + 'admin/business',
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
            fixedColumns: !$scope.ispc,
            fixedNumber: 3,
            onLoadSuccess:function(data){ //成功的回调
                iosTable();
                if (data.total != 0) {
                    var timer = null;
                    var all_tr = $('#demo-table tbody tr,.fixed-table-body-columns tbody tr');
                    var table_tr = $('#demo-table tbody tr');
                    var columns_tr = $(".fixed-table-body-columns tbody tr");
                    var tap = function() {
                        var t_idx = $(this).index();
                        $scope.deleteState = $scope.editState = $scope.iconState = true;
                        $scope.businessArr = $scope.copybusinessArr = data.rows[t_idx];
                        parents.forSome($scope.copybusinessArr, [
                            'second_day_stay',
                            'third_day_stay',
                            'seven_day_stay',
                            'third_party_amount',
                            'mm_amount',
                            'migu_amount',
                            'unicom_amount',
                            'telecom_amount'
                        ], Number);
                        table_tr.removeClass('bg-color');
                        columns_tr.removeClass('bg-color');
                        table_tr.eq(t_idx).addClass("bg-color");
                        columns_tr.eq(t_idx).addClass("bg-color");
                    };
                    all_tr.on({
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
                }
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
        smaller = function(value, row, index) {
            return "<div style='width:70px'>"+value+"</div>";
        };
        small = function(value, row, index) {
            return "<div style='width:130px'>"+value+"</div>";
        };
        normal = function(value, row, index) {
            return "<div style='width:170px'>"+value+"</div>";
        };
        large = function(value, row, index) {
            return "<div style='width:230px'>"+value+"</div>";
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
        $scope.businessArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/business/' + $scope.businessArr.id,
            params : $scope.businessArr
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
            start_date : self.startDate,
            my_data : true,
            end_date : self.endDate,
            project : self.Channel_s,
            product : self.Company_s,
            channel :self.Region_s
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