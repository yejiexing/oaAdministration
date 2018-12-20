/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('biConfig',[]);
app.controller('biConfigCtrl',function($http, $scope, $q, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = $scope.importStay = state;
    if(!state) {
        $scope.index = parents.authList('quick-index');//查看列表权限
        $scope.read = parents.authList('quick-read');//查看详情权限
        $scope.update = parents.authList('quick-update');//编辑操作
        $scope.save = parents.authList('quick-save');//添加操作
        $scope.delete = parents.authList('quick-delete');//删除操作
        $scope.deletes = parents.authList('quick-deletes');//批量删除操作
        $scope.enables = parents.authList('quick-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('quick-export');//导出操作
        $scope.imports = parents.authList('quick-import');//导入操作
        $scope.importStay = parents.authList('quick-getchannelcode');//导入操作
    }
    $("#query").show();
    $scope.ispc = parents.IsPC();
    $scope.deleteState = $scope.editState = $scope.iconState = $scope.updateState = false;
    $scope.Id = self.Channel_s = self.Company_s = self.Region_s = self.startDate = self.endDate = '';//结束时间
    $scope.select = {
        project_id: '', //选择项目的名字
        product_id: '', //选择产品的名字
        channel_id: '', //选择渠道的名字
        C_status: true
    };
    $scope.thirdParty = '';
    $scope.Method = $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = 0;
    $scope.Newdate1 = $scope.Newdate2 = self.startDate = self.endDate = parents.currentDate.Yesterday();//昨天时间
    $scope.quickArr = $scope.copyquickArr = new Object();
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
    $scope.search = function(params){ //搜索
        self.Channel_s = $scope.select.project_id;
        self.Company_s = $scope.select.product_id;
        self.Region_s = $scope.select.channel_id;
        // self.startDate = $scope.Newdate1;
        // self.endDate = $scope.Newdate2;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }

    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.copyquickArr.id;
        $scope.Channel_s = '';
        $scope.Region_s = '';
        $scope.Company_s = '';
        $scope.Method = 'put';
        $scope.edit = true;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/bi/' + $scope.Id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copyquickArr = data.data;
                $scope.updateState = true;
                parents.forSome(
                    $scope.copyquickArr,
                    ['project_id', 'product_id', 'channel_id'],
                    String
                );
                $q.all([
                    $http.get(url + 'admin/project/getProjectNameAndId'),
                    $http.get(url + 'admin/product/getProductRelatedByProjectId', {params: {project_id: $scope.copyquickArr.project_id}}),
                    $http.get(url + 'admin/channel/getChannelNameAndId')
                    ])
                    .then(function(data) {
                        $scope.Channel_s = data[0].data.data;
                        $scope.Region_s = data[1].data.data;
                        $scope.Company_s = data[2].data.data;
                        $("#preservaModal").modal("show");
                        $("#myModalLabel").html('[编辑]bi数据配置');
                       
                });
               
            }
        }).error(function(){
        });
    }
    //获取配置state
    $scope.getCode = function(){
        $scope.getCodeObj = {
            appid:'',
            appkey:'',
            product_code:''
        };
        $scope.usersError = '';
        $("#details").modal("show");
    };
    $scope.getExcl = function(){
        var getExclNum = parents.forEachs($scope.getCodeObj);
        if(getExclNum != 0){
            $scope.usersError = '请完善必填内容';
            return false;
        }
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'POST',
            url: url + 'admin/quick/get_channel_code',
            params : $scope.getCodeObj
        }).success(function (data) {
            if(data.code == 200){
                $scope.doQuery();
                $("#details").modal("hide");
                $("#code").html('成功生成Excl');
                $("#table_success").modal("show");
                parents.OpenDemo(data.data)
            }else{
                $scope.usersError = data.error;
            }
        }).error(function(){
        });
    }
    //获取配置end

    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
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
            // $http.delete(url + 'admin/bi', {
            //     id: checks
            // }).then(
            //     function(data) {
            //         var dataVal = data.data.code == 200?data.data.data:data.data.error;
            //         $('#table_delete').modal('hide');
            //         $('#code').html(dataVal);
            //         $('#table_success').modal('show');
            //         $scope.doQuery();
            //     }
            // );
            $http({
                method: 'DELETE',
                url: url + 'admin/bi',
                data: {id: checks}
            }).then(
                function(data) {
                    var dataVal = data.data.code == 200?data.data.data:data.data.error;
                    $('#table_delete').modal('hide');
                    $('#code').html(dataVal);
                    $('#table_success').modal('show');
                    $scope.doQuery();
                });
        } else {
            $http
                .delete(url + 'admin/bi/' + $scope.copyquickArr.id)
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
        angular.forEach($scope.copyquickArr,function(v,i){
            if(i == 'appid' || i == 'appkey' || i == 'product_code' || i == 'channel_code') {
                if (v == '') {
                    channelNum++
                }
            }
        });
        if(channelNum != 0){
            $scope.usersError = '请完善必填内容';
            return false;
        }
        parents.screen.Delete($scope.copyquickArr)
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : 'PUT',
            url: url + 'admin/bi/'+$scope.copyquickArr.id,
            params : {
                id : $scope.copyquickArr.id,
                bi_channel_id : $scope.copyquickArr.bi_channel_id
            }
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

    $scope.iconFun = function(v) {
        self.dome_val = v;
        $scope.usersError = '';
        $scope.iconFile = null;
        angular.element('#iconFile').val(null);
        $('#icon').modal('show');
    };
    $scope.dome = function() {
        //下载模板
        parents.OpenDemo('/template/TEMPLATE_BI_CONFIG.xlsx');
        //parents.Exports('game_pay/downloadTemplate', '');
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
            .post(url + 'admin/bi/import', fd, {
                headers: { 'Content-Type': undefined, token: parents.token() },
                transformRequest: angular.identity
            })
            .then(function(data) {
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
                }, function(error) {
                    $scope.usersError = error.statusText;
                    $scope.uploading = false;
                });
        $scope.uploading = true;
    };
    $scope.projectFun = function(v, edit) {
        var identical = v == 1 ? $scope.copyquickArr.project_id : $scope.select.project_id;
        ProjectId(identical, v, edit);
    };

    $scope.getProductChannelInfo = function() {
        if ($scope.copyquickArr.product_id && $scope.copyquickArr.channel_id) {
            $http
                .get(url + 'admin/product_channel/getProductChannelInfo', {
                    params: {
                        product_id: $scope.copyquickArr.product_id,
                        channel_id: $scope.copyquickArr.channel_id
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

        //if (v === undefined) {
        //    subUrl = 'admin/product/getProductByProjectId';
        //    params.project_name = identical;
        //} else {
            subUrl = 'admin/product/getProductRelatedByProjectId';
            params.project_id = identical;
        //}
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + subUrl,
            params: params
        })
            .success(function(data) {
                if (data.code == 200) {
                    //if (v == 1) {
                        $scope.Region_s = data.data; //获取渠道list

                        if (!edit) {
                            $scope.copyquickArr.product_id = '';
                        }
                    //} else {
                    //    $scope.CompanyList = data.data; //获取渠道list
                    //    $scope.select.selectCompany = '';
                    //}
                } else if (data.code == 400) {
                    //if (v == 1) {
                        $scope.Region_s = ''; //获取渠道list

                        if (!edit) {
                            $scope.copyquickArr.product_id = '';
                        }
                    //} else {
                    //    $scope.CompanyList = ''; //获取渠道list
                    //    $scope.select.selectCompany = '';
                    //}
                }
            })
            .error(function(r) {
                alert('服务器异常，请稍候重试');
            });
    }
    // 获取搜索的列表项
 
    
    $scope.Channel_s = parents.select('project/getProjectNameAndId');//刷新渠道list
    $scope.Region_s = '';//获取渠道list
    $scope.Company_s = parents.select('channel/getChannelNameAndId');//刷新渠道list
    // $scope.NewlyAdded = function(){
    //     $scope.usersError = '';
    //     $scope.Id = '';
    //     $scope.Method = 'post';
    //     $scope.copyquickArr = {
    //         date: "",
    //         project_id: "",
    //         product_id: "",
    //         channel_id: "",
    //         new_arrivals: "",
    //         active_users: "",
    //         second_day_stay: "",
    //         third_day_stay: "",
    //         seven_day_stay: "",
    //         fifteen_day_stay: "",
    //         thirty_day_stay: ""
    //     };
    //     $scope.updateState = false;
    //     $scope.Channel_s = parents.select('project/getProjectNameAndId');//刷新渠道list
    //     $scope.Region_s = '';//获取渠道list
    //     $scope.Company_s = parents.select('channel/getChannelNameAndId');//刷新渠道list

    //     $("#preservaModal").modal("show");
    //     $("#myModalLabel").html('[新增]运营数据');
    // }

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
            url:url + 'admin/bi',
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
                        $scope.quickArr = $scope.copyquickArr = data.rows[t_idx];
                        //parents.forSome($scope.copyquickArr, [
                        //    'second_day_stay',
                        //    'third_day_stay',
                        //    'seven_day_stay',
                        //    'fifteen_day_stay',
                        //    'thirty_day_stay',
                        //    'third_party_amount',
                        //    'mm_amount',
                        //    'migu_amount',
                        //    'unicom_amount',
                        //    'telecom_amount'
                        //], Number);
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
    $scope.stateedit = function(v){
        var pop_che = $("#pop_che").is(':checked');
        $scope.quickArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/quick/' + $scope.quickArr.id,
            params : $scope.quickArr
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
            is_verify : true,
            // start_date : self.startDate,
            // end_date : self.endDate,
            project_id : self.Channel_s,
            product_id : self.Company_s,
            channel_id :self.Region_s
        }
        return param;
    }
});