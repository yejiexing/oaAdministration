/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('sysSdk',[]);
app.controller('sysSdkCtrl',function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = $scope.importStay = state;
    if(!state) {
        $scope.index = parents.authList('operate-index');//查看列表权限
        $scope.read = parents.authList('operate-read');//查看详情权限
        $scope.update = parents.authList('operate-update');//编辑操作
        $scope.save = parents.authList('operate-save');//添加操作
        $scope.delete = parents.authList('operate-delete');//删除操作
        $scope.deletes = parents.authList('operate-deletes');//批量删除操作
        $scope.enables = parents.authList('operate-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('operate-export');//导出操作
        $scope.imports = parents.authList('operate-importdata');//导入操作
        $scope.importStay = parents.authList('operate-importstaydata');//导入操作
    }
    $("#query").show();
    $scope.ispc = parents.IsPC();
    $scope.deleteState = $scope.editState = $scope.iconState = $scope.updateState = false;
    $scope.Id = self.platform = self.server = self.Region_s = self.startDate = self.endDate = '';//结束时间
    $scope.select = {
        platform: ''
    };
    $scope.thirdParty = '';
    $scope.Method = $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = 0;
    $scope.Newdate1 = $scope.Newdate2 = self.startDate = self.endDate = parents.currentDate.Yesterday();//昨天时间
    $scope.operateArr = $scope.copyoperateArr = new Object();
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
        self.platform = $scope.select.platform;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.operateArr.id;
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/sdk/' + $scope.Id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copyoperateArr = data.data;
                if(params == 1){
                    $scope.dealList = data.data.dealList;
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show");
                }else{
                    $scope.updateState = true;
                    console.log($scope.copyoperateArr)
                    //$scope.Channel_s = parents.select('project/getProjectNameAndId');//刷新渠道list
                    //$scope.Company_s = parents.select('channel/getChannelNameAndId');//刷新渠道list
                    //$scope.projectFun(1, true);
                    //$scope.getProductChannelInfo();
                    parents.forSome($scope.copyoperateArr, ['platform', 'server'], String);
                    $("#preservaModal").modal("show");
                    $("#myModalLabel").html('[编辑]SDK');
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
            $http.post(url + 'admin/sdk/deletes', {
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
                .delete(url + 'admin/sdk/' + $scope.operateArr.id)
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
        angular.forEach($scope.copyoperateArr,function(v,i){
            if(i == 'platform' || i == 'name' || i == 'version' || i == 'description' || i == 'download_url' || i == 'server') {
                if (v == '') {
                    channelNum++
                }
            }
        });
        if(channelNum != 0){
            $scope.usersError = '请完善必填内容';
            console.log(10);
            return false;
        }
        parents.screen.Delete($scope.copyoperateArr)
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : $scope.Method,
            url: url + 'admin/sdk/' + $scope.Id,
            params : $scope.copyoperateArr
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
            end_date : self.endDate
        }
        parents.Exports('operate/export',ExpObj)
    };

    // 检查导入文件格式
    $scope.checkFile = function(file) {
        var fd = new FormData();
        console.log(file)
        var extName = (file.name.slice(file.name.lastIndexOf('.'))).toLowerCase();
        var extNames = ['.rar', '.zip'];
        $scope.$apply(function() {
            if ($.inArray(extName, extNames) === -1) {
                $scope.usersError = '文件格式错误,仅可上传xlc等格式文件';
                $scope.copyoperateArr[dataKey] = '';
                angular.element('#iconFile').val(null);
                angular.element('#file').val(null);
                angular.element('#file1').val(null);
                //$scope.copyoperateArr.statement_file_path = '';
            } else {
                $scope.usersError = '';
                fd.append('file', file);
                $http
                    .post(url + 'admin/upload', fd, {
                        headers: {
                            'Content-Type': undefined,
                            token: parents.token()
                        },
                        transformRequest: angular.identity
                    })
                    .then(
                    function (data) {
                        if (data.data.code === 200) {
                            //$scope.copyoperateArr.statement_file_name =
                            //    file.name;
                            $scope.copyoperateArr.download_url = data.data.data;
                            $scope.copyoperateArr.filename = file.name;
                        } else {
                            $scope.usersError = data.data.error;
                        }
                    },
                    function (error) {
                        $scope.usersError = error;
                    }
                );
            }
        });
    };
    // 导入文件
    $scope.import = function() {
        var fd = new FormData();
        fd.append('file', $scope.iconFile);
        var operurl = self.dome_val == 2 ? 'admin/sdk/importData':'admin/sdk/importStayData';
        $http
            .post(url + operurl, fd, {
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
        if(self.dome_val == 2){
            parents.Exports('operate/downloadTemplate','')
        }else{
            parents.OpenDemo('template/OperateStayDataTemplate.xls');
        }
    }

    $scope.getProductChannelInfo = function() {
        if ($scope.copyoperateArr.product_id && $scope.copyoperateArr.channel_id) {
            $http
                .get(url + 'admin/product_channel/getProductChannelInfo', {
                    params: {
                        product_id: $scope.copyoperateArr.product_id,
                        channel_id: $scope.copyoperateArr.channel_id
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

    $scope.NewlyAdded = function(){
        $scope.usersError = '';
        $scope.Id = '';
        $scope.Method = 'post';
        $scope.copyoperateArr = {
            platform: "",
            name: "",
            release_time: "",
            version: "",
            description: "",
            filename: "",
            download_url: "",
            remark: ""
        };
        $scope.updateState = false;
        //$scope.Channel_s = parents.select('project/getProjectNameAndId');//刷新渠道list
        //$scope.Region_s = '';//获取渠道list
        //$scope.Company_s = parents.select('channel/getChannelNameAndId');//刷新渠道list
        //console.log($scope.Company_s);
        

        $("#preservaModal").modal("show");
        $("#myModalLabel").html('[新增]SDK');
    }

    layDate(
        ['1', '2', '3'], //日期id
        ['date', 'date', 'date'], //日期type
        ['Newdate1', 'Newdate2', 'release_time'], //存储对象
        ['1', '1', '0'], //存储状态
        'copyoperateArr',
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
            url:url + 'admin/sdk',
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
                        $scope.operateArr = $scope.copyoperateArr = data.rows[t_idx];
                        parents.forSome($scope.copyoperateArr, [
                            'second_day_stay',
                            'third_day_stay',
                            'seven_day_stay',
                            'fifteen_day_stay',
                            'thirty_day_stay',
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
            return "<a target='_blank' href='"+ parents.url_img + value +"'>点击下载</a>";
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
        $scope.operateArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/sdk/' + $scope.operateArr.id,
            params : $scope.operateArr
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
            platform : self.platform
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