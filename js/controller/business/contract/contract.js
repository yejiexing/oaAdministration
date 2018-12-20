/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('contract',[]);
app.controller('contractCtrl',function($http, $scope, $timeout,$q) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = state;
    if(!state) {
        $scope.index = parents.authList('contract-index');//查看列表权限
        $scope.read = parents.authList('contract-read');//查看详情权限
        $scope.update = parents.authList('contract-update');//编辑操作
        $scope.save = parents.authList('contract-save');//添加操作
        $scope.delete = parents.authList('contract-delete');//删除操作
        $scope.deletes = parents.authList('contract-deletes');//批量删除操作
        $scope.enables = parents.authList('contract-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('contract-export');//导出操作
        $scope.imports = parents.authList('contract-import');//导入操作
    }
    $("#query").show();
    $scope.deleteState = false;
    $scope.editState = false;
    $scope.iconState = false;
    $scope.Id = '';
    self.Channel_s = '';
    self.project_s = '';
    //self.start_date = '';
    //self.end_date = '';
    self.type = '';
    self.number = '';
    self.company = '';
    self.issue = '';
    //$scope.Newdate1 = self.startDate = parents.currentDate.MonthTime(3);
    //$scope.Newdate2 = self.endDate = parents.currentDate.MonthTime(1);
    $scope.select = {
        selectChannel: '',//选择渠道的名字
        selectCompany: '',//选择渠道的名字
        number: '',
        company: '',
        issue: '',
        type: ''
    }
    $scope.Method = '';
    $scope.errorstate = '';
    $scope.stateIndex = 0;
    $scope.contractArr = $scope.copycontractArr = new Object();

    $scope.ChannelList = parents.select('product/getProjectList');//获取渠道list
    $scope.issueList = parents.select('issue/getIssueNameAndId');
    $scope.TypeList = [];
    $scope.getTypeList = parents.select('contract/getTypeList?mydata=0');
    $.each($scope.getTypeList,function(v,i){
        var obj = {
            id : v,
            name : i
        };
        $scope.TypeList.push(obj);
    })
    //$scope.CompanyList = parents.select('channel/getCompanyList');//获取单位list
    layDate(
        ['1', '2','3', '4','5'], //日期id
        ['date', 'date','date', 'date','date'], //日期type
        ['Newdate1', 'Newdate2', 'sign_date', 'start_date', 'end_date'], //存储对象
        ['1', '1', '0', '0', '0'], //存储状态
        'copycontractArr',
        $scope
    );
    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.ChannelList = parents.select('project/getProjectList');//刷新渠道list
        //$scope.CompanyList = parents.select('channel/getCompanyList');//刷新单位list
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.search = function(params){ //搜索
        self.Channel_s = $scope.select.selectCompany;
        self.project_s = $scope.select.selectChannel;
        self.type = $scope.select.type;
        self.number = $scope.select.number;
        self.issue = $scope.select.issue;
        self.company = $scope.select.company;
        //self.Region_s = $scope.select.selectRegion;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1},'refresh').bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.contractArr.id;
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/contract/' + $scope.Id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copycontractArr = data.data;
                parents.forSome($scope.copycontractArr, ['tax_registration'], Number);
                if(params == 1){
                    $scope.dealList = $scope.copycontractArr.dealList;
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    if($scope.copycontractArr.file_path == null){
                        $scope.copycontractArr.file_path = '';
                    }
                    $("#details").modal("show");
                }else if(params == 2){
                    angular.element('#contFile').val(null);
                    $('#20180417').modal('show');
                }else{
                    parents.forSome($scope.copycontractArr, ['type', 'project_id', 'product_id', 'issue_id'], String);
                    angular.element('#file').val(null);
                    $q.all([
                        $http.get(url + 'admin/project/getProjectNameAndId'),
                        $http.get(url + 'admin/product/getProductRelatedByProjectId', {params: {project_id: $scope.copycontractArr.project_id}}),
                        $http.get(url + 'admin/issue/getIssueNameAndId'),
                    ])
                        .then(function(data) {
                            $scope.Channel = data[0].data.data;
                            $scope.Region_s = data[1].data.data;
                            $scope.issueList = data[2].data.data;
                            $("#preservaModal").modal("show");
                            $("#myModalLabel").html('[编辑]合同管理');
                        });

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
            $http.post(url + 'admin/contract/deletes', {
                ids: checks
            }).then(
                function(data) {
                    $('#table_delete').modal('hide');
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                    $scope.doQuery();
                }
            );
        } else {
            $http
                .delete(url + 'admin/contract/' + $scope.contractArr.id)
                .then(
                    function(data) {
                        $('#table_delete').modal('hide');
                        $('#code').html(data.data.data);
                        $('#table_success').modal('show');
                        $scope.doQuery();
                    },
                    function() {
                    }
                );
        }
    };
    $scope.export = function(){//导出
        var ExpObj = {
            product : self.Channel_s,
            project : self.project_s,
            type : self.type,
            number : self.number,
            company : self.company,
            issue : self.issue,
            start_date : '',
            end_date :''
        }
        parents.Exports('contract/export',ExpObj)
    };
    $scope.projectFun = function(index, callback) {
        var name =
            index === undefined
                ? $scope.select.selectChannel
                : $scope.copycontractArr.project_id;

        ProjectId(name, index, callback);
    };

    function ProjectId(name, index, callback) {
        var params = {},
            subUrl;

        if (index === undefined) {
            subUrl = 'admin/product/getProductByProjectId';
            params.project_name = name;
        } else {
            subUrl = 'admin/product/getProductRelatedByProjectId';
            params.project_id = name;
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
                        $scope.copycontractArr.product_id = '';

                        //if (callback) {
                        //    callback();
                        //}
                    } else {
                        $scope.CompanyList = data.data; //获取渠道list
                        $scope.select.selectCompany = '';
                    }
                } else if (data.code == 400) {
                    if (index !== undefined) {
                        $scope.Region_s[index] = [];
                        $scope.copycontractArr.product_id[index] = '';
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
    $scope.checkFile = function(file,e) {
        var fd = new FormData();
        var extName = (file.name.slice(file.name.lastIndexOf('.'))).toLowerCase();
        var dataKey = '';
        if(e != undefined){
            dataKey = e.attr('data-key');
        }else{
            dataKey = $scope.fileSotr;
        }
        var extNames = dataKey != undefined?['.pdf', '.png', '.jpg','.doc','.docx']:['.xlc', '.xlm', '.xlt', '.xlw', '.xls', '.xlsx'];
        $scope.$apply(function() {
            if ($.inArray(extName, extNames) === -1) {
                $scope.usersError = dataKey != undefined?'文件格式错误,仅可上传pdf,png,jpg,doc,docx格式文件':'文件格式错误,仅可上传xlc等格式文件';
                $scope.copycontractArr[dataKey] = '';
                angular.element('#iconFile').val(null);
                angular.element('#file').val(null);
                angular.element('#file1').val(null);
                //$scope.copycontractArr.statement_file_path = '';
            } else {
                $scope.usersError = '';
                if(dataKey == undefined){
                    $scope.iconFile = file;
                }else {
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
                                //$scope.copycontractArr.statement_file_name =
                                //    file.name;
                                $scope.copycontractArr[dataKey] = data.data.data;
                            } else {
                                $scope.usersError = data.data.error;
                            }
                        },
                        function (error) {
                            $scope.usersError = error;
                        }
                    );
                }
            }
        });
    };
    $scope.iconFun = function() {
        $scope.usersError = '';
        $scope.iconFile = null;
        angular.element('#iconFile').val(null);
        $('#icon').modal('show');
    };
    $scope.dome = function() {
        //下载模板
        parents.OpenDemo('Template/合同模板.xlsx');
    };
    // 导入文件
    $scope.import = function() {
        var fd = new FormData();
        fd.append('file', $scope.iconFile);
        $http
            .post(url + 'admin/contract/import', fd, {
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

    $scope.preservaConfirm = function(v){//新增弹出框
        if(v == 1){
            if($scope.copycontractArr[$scope.fileSotr] == '' || $scope.copycontractArr[$scope.fileSotr] == null){
                $scope.usersError = '请选择文件';
                return false;
            }
            $scope.Id = $scope.contractArr.id;
            $scope.Method = 'put';
        }else {
            var channelNum = 0;
            angular.forEach($scope.copycontractArr, function (v, i) {
                if ((i == 'number' || i == 'type' || i == 'sign_date' || i == 'start_date' || i == 'end_date' || i == 'issue_id'|| i == 'company_name') && v == '') {
                    channelNum++;
                }
            })
            if (channelNum != 0) {
                $scope.usersError = '请完善必填内容';
                return false;
            }
        }
        parents.screen.Delete($scope.copycontractArr)
        $.ajax({
            url: url + 'admin/contract/' + $scope.Id,
            beforeSend: function(request) {
                request.setRequestHeader('token', parents.token());
            },
            data: $scope.copycontractArr,
            dataType: 'JSON',
            async: false, //请求是否异步，默认为异步
            type: $scope.Method,
            success: function(data) {
                if(data.code == 200){
                    $scope.doQuery();
                    if(v == 1) {
                        $("#20180417").modal("hide");
                    }else {
                        $("#preservaModal").modal("hide");
                    }
                    $("#code").html(data.data);
                    $("#table_success").modal("show");
                }else{
                    $scope.usersError = data.error;
                }
            },
            error: function() {
                alert('服务器异常，请稍候重试')
            }
        });
    }
    $scope.NewlyAdded = function(){
        $scope.usersError = '';
        $scope.Id = '';
        $scope.Method = 'post';
        $scope.copycontractArr = {
            number: "",
            type: "",
            project_id: "",
            product_id: "",
            sign_date: "",
            start_date: "",
            end_date: "",
            company_name: "",
            issue_id: "",
            detail: "",
            file_path: ""
        };
        angular.element('#file').val(null);
        $scope.Channel = parents.select('project/getProjectNameAndId');
        $scope.issueList = parents.select('issue/getIssueNameAndId');
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('[新增]合同管理');
    }
    $scope.charges = function(v){
        var coptState = false;
        if(v == 4) {
            $("#charge").modal("show");
            $("#chargeTitle_che").html("请选择...");
            coptState = true;
        }else {
            $("#charge_radioModal").modal("show");
            $("#chargeTitle").html("请选择...");
        }
        if(v == 1){
            $scope.copyp_name = angular.copy($scope.copycontractArr.finance_incharge_id);
        }else if(v == 4) {
            $scope.copyp_name = angular.copy($scope.copycontractArr.data_view_users);
        }else {
            $scope.copyp_name = angular.copy($scope.copycontractArr.business_incharge_id);
        }
        $scope.copyId = v;
        $scope.structuresList(coptState);
    };

    $scope.structuresList = function(v){//部门管理数据查询
        if(v){
            $scope.chargeList =  parents.division(true,$scope.copyp_name);
        }else{
            $scope.chargeList =  parents.division(false);
        }
    }
    $scope.delp_name = function(v){//负责人清空
        if(v == 1){
            $scope.copycontractArr.finance_incharge = '';
            $scope.copycontractArr.finance_incharge_id = '';
        }else if(v == 4) {
            $scope.copycontractArr.data_view = '';
            $scope.copycontractArr.data_view_users = '';
        }else {
            $scope.copycontractArr.business_incharge_id = '';
            $scope.copycontractArr.business_incharge = '';
        }
    };
    $scope.chargesKeep = function(){
        var che_value = [];
        var che_num = [];
        var depar = $("input[name='charge']:checked");
        depar.each(function(){
            if($scope.copyId == 4) {
                che_value.push(Number($(this).attr('data-num')));
            }else{
                che_value.push($(this).attr('data-num'));
            }
            che_num.push($(this).val());
        });
        if(che_value.join(",") == ''){
            alert('请选择...');
        }else{
            if($scope.copyId == 1){
                $scope.copycontractArr.finance_incharge = che_value.join(",");
                $scope.copycontractArr.finance_incharge_id = che_num.join(",");
            }else if($scope.copyId == 4) {
                $scope.copycontractArr.data_view = che_num.join(",");
                $scope.copycontractArr.data_view_users = che_value;
            }else {
                $scope.copycontractArr.business_incharge_id = che_num.join(",");
                $scope.copycontractArr.business_incharge = che_value.join(",");
            }
            $("#charge").modal("hide");
            $("#charge_radioModal").modal("hide");
        }
    }
    $scope.clickPath = function(v){
        window.open(parents.url_img + v);
    }
    $scope.setChannel = function(item) {
        $scope.select.selectChannel = item;
    };

    $scope.setCompany = function(item) {
        $scope.select.selectCompany = item;
    };
    $scope.channelType = function(type) {
        if (type == 10) {
            return '渠道';
        }
        if (type == 20) {
            return '支付通道';
        }
        if (type == 30) {
            return 'CPS';
        }
    };
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
            url:url + 'admin/contract',
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
            fixedColumns: !parents.IsPC(),
            fixedNumber: 3,
            onLoadSuccess:function(data){ //成功的回调
                iosTable();
                var timer = null;
                var all_tr = $('#demo-table tbody tr,.fixed-table-body-columns tbody tr');
                var table_tr = $('#demo-table tbody tr');
                var columns_tr = $(".fixed-table-body-columns tbody tr");
                var tap = function() {
                    var t_idx = $(this).index();
                    $scope.editState = $scope.iconState = true;
                    $scope.deleteState = !data.rows[t_idx].no_delete;
                    $scope.contractArr = $scope.copycontractArr = data.rows[t_idx];
                    parents.forSome($scope.copycontractArr, ['tax_registration'], Number);
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

                data.rows.forEach(function(item, index) {
                    checkbox.eq(index).prop('disabled', item.no_delete);
                    fixedCheckbox.eq(index).prop('disabled', item.no_delete);
                });
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
        detailData = function(value, row, index) {
            return  (value == null || value == '')?'':'<div class="detailstyle" title="'+value+'">'+value+'</div>';
        };
        fileData = function(value, row, index) {
            var sotr = $(this)[0].field;
            return  (row[sotr] == null || row[sotr] == '') ? '<div class="pathclick text-danger text-cursor" data-key="'+sotr+'">点击上传</div>':'<div class="fileclick text-success" style="cursor: pointer;">点击查看</div>'
        };
        window.fileEvents = {
            //弹窗显示
            'click .fileclick': function(e, value, row, index) {
                window.open(parents.url_img + value)
                //window.location.href = parents.url_img + value;
            },
            'click .pathclick': function(e, value, row, index) {
                $scope.fileSotr = e.currentTarget.dataset.key;
                $timeout(function(){$scope.editFun(2);},180)
            }
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
    };
    $("#popoverstate").click(function(e){
        e.stopPropagation();
    });
    //popoverstate窗口关闭end
    $scope.stateedit = function(v){
        var pop_che = $("#pop_che").is(':checked');
        $scope.contractArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/users/' + $scope.contractArr.id,
            params : $scope.contractArr
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
            product : self.Channel_s,
            project : self.project_s,
            number : self.number,
            company : self.company,
            issue : self.issue,
            //start_date : self.start_date,
            //end_date : self.end_date,
            my_data : 0,
            type :self.type
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