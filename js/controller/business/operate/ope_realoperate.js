/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('realOperate',[]);
app.controller('realOperateCtrl',function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = state;
    if(!state) {
        $scope.index = parents.authList('myoperate-index');//查看列表权限
        $scope.read = parents.authList('myoperate-read');//查看详情权限
        $scope.update = parents.authList('myoperate-update');//编辑操作
        $scope.save = parents.authList('myoperate-save');//添加操作
        $scope.delete = parents.authList('myoperate-delete');//删除操作
        $scope.deletes = parents.authList('myoperate-deletes');//批量删除操作
        $scope.enables = parents.authList('myoperate-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('myoperate-export');//导出操作
        $scope.imports = parents.authList('myoperate-importdata');//导入操作
        $scope.retained = parents.authList('myoperate-retained');//留存操作
    }
    $("#query").show();
    $scope.ispc = parents.IsPC();
    $scope.deleteState = false;
    $scope.editState = false;
    $scope.iconState = false;
    $scope.Id = '';
    self.Channel_s = '';//地区-搜索
    self.Company_s = '';//地区-搜索
    self.Region_s = '';//地区-搜索
    self.startDate = '';//开始时间
    self.endDate = '';//结束时间
    $scope.select = {
        selectChannel: '', //选择项目的名字
        selectCompany: '', //选择产品的名字
        selectRegion: '', //选择渠道的名字
        C_status: true
    };
    $scope.thirdParty = '';
    $scope.Method = $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = 0;
    $scope.Newdate1 = $scope.Newdate2 = self.startDate = self.endDate = parents.currentDate.dateTime();//当前年月日
    $scope.operateArr = $scope.copyoperateArr = new Object();
    $scope.checks = [];
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
        self.Channel_s = $scope.select.selectChannel;
        self.Company_s = $scope.select.selectCompany;
        self.Region_s = $scope.select.selectRegion;
        self.startDate = $scope.Newdate1;
        self.endDate = $scope.Newdate2;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
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

    self.inputTime = null;
    $scope.searchFun = function(v){
        clearTimeout(self.inputTime);
        $(".select_input").removeClass('open');
        $("#"+v).addClass('open');
        $("#"+v+" input").focus();
        $scope.select.C_status = false;
    };
    $(".select_input input").on({
        'blur' : function(){
            var thisId = $(this).attr('data-id');
            self.inputTime = setTimeout(function(){
                $("#"+thisId).removeClass('open');
            },200)
        },
        'focus':function(v){
            $scope.select.C_status = true;
            var thisId = $(this).attr('data-id');
            $("#"+thisId).addClass('open');
            //$scope.$apply()
        },
        'input propertychange' : function(){
            $scope.select.C_status = true;
        }
    });

    $scope.projectFun = function(v, edit) {
        var identical = v == 1 ? $scope.copyoperateArr.project_id : $scope.select.selectChannel;
        ProjectId(identical, v, edit);
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
                            $scope.copyoperateArr.product_id = '';
                        }
                    } else {
                        $scope.CompanyList = data.data; //获取渠道list
                        $scope.select.selectCompany = '';
                    }
                } else if (data.code == 400) {
                    if (v == 1) {
                        $scope.Region_s = ''; //获取渠道list

                        if (!edit) {
                            $scope.copyoperateArr.product_id = '';
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
            url:url + 'admin/operate',
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
            fixedNumber: 2,
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
                        table_tr.removeClass('bg-color');
                        columns_tr.removeClass('bg-color');
                        table_tr.eq(t_idx).addClass("bg-color");
                        columns_tr.eq(t_idx).addClass("bg-color");
                    };
                    all_tr.on({
                        'click' : function(){//单击事件
                            $timeout.cancel(timer);
                            timer = $timeout(tap.bind(this), 170);
                        }
                    });
                    $('.multiple').change(function() {
                        if (this.checked) {
                            $scope.checks[this.dataset.index] = data.rows[this.dataset.index].id;
                        } else {
                            $scope.checks.splice(this.dataset.index, 1);
                        }
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
        checks = function(value, row, index) {
            return '<input type="checkbox" class="multiple" data-index="' + index + '">';
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
        $scope.operateArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/operate/' + $scope.operateArr.id,
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
            is_verify : true,
            start_date : self.startDate,
            end_date : self.endDate,
            project : self.Channel_s,
            product : self.Company_s,
            channel :self.Region_s,
            my_data : true
        }
        return param;
    }
});