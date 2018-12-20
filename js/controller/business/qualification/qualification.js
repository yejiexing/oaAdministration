/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('qualification',[]);
app.controller('qualificationCtrl',function($http, $scope, $timeout,$q) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = parents.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = state;
    if(!state) {
        $scope.index = parents.authList('qualificationmanager-index');//查看列表权限
        $scope.read = parents.authList('qualificationmanager-read');//查看详情权限
        $scope.update = parents.authList('qualificationmanager-update');//编辑操作
        $scope.save = parents.authList('qualificationmanager-save');//添加操作
        $scope.delete = parents.authList('qualificationmanager-delete');//删除操作
        $scope.deletes = parents.authList('qualificationmanager-deletes');//批量删除操作
        $scope.enables = parents.authList('qualificationmanager-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('qualificationmanager-export');//导出操作
        $scope.imports = parents.authList('qualificationmanager-import');//导入操作
    }
    $("#query").show();
    $scope.deleteState = false;
    $scope.editState = false;
    $scope.iconState = false;
    $scope.Id = '';
    self.project_name = '';//地区-搜索
    self.product_name = '';
    self.platform = '';
    $scope.Newdate1 = self.start_date = '';
    $scope.Newdate2 = self.end_date = '';
    $scope.select = {//下拉框选中
        project: '',
        product: '',
        //closing_unit: '',
        //company_name: '',
        //issue_name: '',
        C_status: true
    };
    $scope.Method = '';
    $scope.errorstate = '';
    $scope.stateIndex = 0;
    $scope.qualificationArr = $scope.copyqualificationArr = new Object();

    //$scope.ChannelList = parents.select('server_manager/getProjectList');//获取渠道list
    $scope.ChannelList = parents.select('project/getProjectList'); //获取单位list
    console.log($scope.ChannelList);
    $scope.TypeList = [];
    $scope.getTypeList = parents.select('server_manager/getServerTypeList');
    $.each($scope.getTypeList,function(v,i){
        var obj = {
            id : v,
            name : i
        };
        $scope.TypeList.push(obj);
    })
    //$scope.CompanyList = parents.select('channel/getCompanyList');//获取单位list
    //layDate(
    //    ['1', '2', '3', '4'], //日期id
    //    ['date', 'date','date', 'date'], //日期type
    //    ['Newdate1', 'Newdate2', 'start_date', 'end_date'], //存储对象
    //    ['1', '1', '0', '0'], //存储状态
    //    'copyqualificationArr',
    //    $scope
    //);
    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.ChannelList = parents.select('project/getProjectList');//刷新渠道list
        //$scope.CompanyList = parents.select('channel/getCompanyList');//刷新单位list
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.search = function(params){ //搜索
        self.project_name = $scope.select.project;
        self.product_name = $scope.select.product;
        //self.start_date = $scope.Newdate1;
        //self.end_date = $scope.Newdate2;
        //self.type = $scope.select.type;
        //self.Region_s = $scope.select.selectRegion;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1},'refresh').bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.qualificationArr.id;
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/qualification_manager/' + $scope.Id
        }).success(function (data) {
            if(data.code == 200) {
                console.log(data);
                $scope.copyqualificationArr = data.data;
                //parents.forSome($scope.copyqualificationArr, ['tax_registration'], Number);
                if(params == 1){
                    console.log($scope.copyqualificationArr);

                    $scope.dealList = $scope.copyqualificationArr.dealList;
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show");
                }else if(params == 2){
                    angular.element('#contFile').val(null);
                    $("#contTitle").html('上传文件');
                    $('#contAlert').modal('show');
                }else{
                    console.log($scope.copyqualificationArr);
                    parents.forSome($scope.copyqualificationArr, ['project_id', 'product_id', 'cp_id', 'issue_id'], String);
                    $('input[type="file"]').val(null);
                    $q.all([
                        $http.get(url + 'admin/project/getProjectNameAndId'),
                        $http.get(url + 'admin/product/getProductRelatedByProjectId', {params: {project_id: $scope.copyqualificationArr.project_id}}),
                        $http.get(url + 'admin/content_provider/getProviderNameAndId'),
                        $http.get(url + 'admin/issue/getIssueNameAndId')
                    ]).then(function(data) {
                        console.log(data);
                            $scope.project_new = data[0].data.data;
                            $scope.product_new = data[1].data.data;
                            $scope.cp_new = data[2].data.data;
                            $scope.issue_new = data[3].data.data;
                            $("#preservaModal").modal("show");
                            $("#myModalLabel").html('[编辑]资质管理');
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
            $http.post(url + 'admin/qualification_manager/deletes', {
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
                .delete(url + 'admin/qualification_manager/' + $scope.qualificationArr.id)
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
            project_name : self.project_name,
            product_name : self.product_name
        }
        parents.Exports('qualification_manager/export',ExpObj)
    };
    $scope.projectFun = function(index, callback) {
        var name = $scope.copyqualificationArr.project_id;
        console.log(name);
        ProjectId(name, index, callback);
    };

    function ProjectId(name, index, callback) {
        var params = {
                project_id : name
            },
            subUrl = 'admin/product/getProductRelatedByProjectId';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + subUrl,
            params: params
        })
            .success(function(data) {
                console.log(data);
                if (data.code == 200) {
                    $scope.copyqualificationArr.product_id = '';
                    $scope.product_new = data.data;
                } else if (data.code == 400) {
                    $scope.product_new = '';
                }
            })
            .error(function(r) {
                alert('服务器异常，请稍候重试');
            });
    }
    $scope.checkFile = function(file,e) {
        var fd = new FormData();
        var key = e== undefined?$scope.fileSotr:e.attr('id');
        console.log(key)
        var extName = (file.name.slice(file.name.lastIndexOf('.'))).toLowerCase();
        var extNames = key == 'iconFile'?['.xlc', '.xlm', '.xlt', '.xlw', '.xls', '.xlsx']:['.jpg','.jpeg', '.png', '.pdf', '.doc', '.docx'];
        $scope.$apply(function() {
            if ($.inArray(extName, extNames) === -1) {
                $scope.usersError = '请输入正确格式的文件';
                $scope.copyqualificationArr[key] = '';
                angular.element('#'+key).val(null);
                //angular.element('#file').val(null);
                //$scope.copyqualificationArr.statement_file_path = '';
            } else {
                $scope.usersError = '';
                if(key == 'iconFile'){
                    $scope.usersError = '';
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
                                //$scope.copyqualificationArr.statement_file_name = file.name;
                                $scope.copyqualificationArr[key] = data.data.data;
                            } else {
                                $scope.copyqualificationArr[key] = '';
                                angular.element('#'+key).val(null);
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
        parents.Exports('qualification_manager/downloadTemplate', '');
    };
    // 导入文件
    $scope.import = function() {
        var fd = new FormData();
        fd.append('file', $scope.iconFile);
        $http
            .post(url + 'admin/qualification_manager/import', fd, {
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
    $scope.setSelect = function(name, value){
        $scope.select[name] = value;
        if(name == 'project'){
            projectFun(value);
        }
    }

    function projectFun(i) {
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/product/getProductByProjectId',
            params: { project_name: i }
        }).success(function(data) {
            if (data.code == 200) {
                $scope.CompanyList = data.data; //获取渠道list
                $scope.select.product = ''; //获取渠道list
            }
        }).error(function(r) {
            alert('服务器异常，请稍候重试');
        });
    };

    $scope.preservaConfirm = function(v){//新增弹出框
        var channelNum = 0;
        angular.forEach($scope.copyqualificationArr,function(v,i){
            if((i == 'server_name' ||i == 'project_id' ||i == 'type' ||i == 'platform' ||i == 'account_name' ||i == 'start_date'||i == 'server_id'||i == 'payment') && v == ''){
                channelNum++;
            }
        })
        if(channelNum != 0){
            $scope.usersError = '请完善必填内容';
            return false;
        }
        parents.screen.Delete($scope.copyqualificationArr)
        $.ajax({
            url: url + 'admin/qualification_manager/' + $scope.Id,
            beforeSend: function(request) {
                request.setRequestHeader('token', parents.token());
            },
            data: $scope.copyqualificationArr,
            dataType: 'JSON',
            async: false, //请求是否异步，默认为异步
            type: $scope.Method,
            success: function(data) {
                if(data.code == 200){
                    $scope.doQuery();
                    if(v == 1) {
                        $("#contAlert").modal("hide");
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
        $scope.copyqualificationArr = {
            project_id: "",
            product_id: "",
            //cp_id: "",
            issue_id: "",
            software_copyright: "",
            plate_number: "",
            record: "",
            contract: ""
        };
        $scope.project_new = parents.select('project/getProjectNameAndId');//获取产品list
        //$scope.product_new = parents.select('server_manager/getProjectList');//获取产品list
        $scope.cp_new = parents.select('content_provider/getProviderNameAndId');//获取产品list
        $scope.issue_new = parents.select('issue/getIssueNameAndId');//获取产品list
        console.log($scope.Channel_new);
        $('input[type="file"]').val(null);
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('[新增]资质管理');
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
            $scope.copyp_name = angular.copy($scope.copyqualificationArr.finance_incharge_id);
        }else if(v == 4) {
            $scope.copyp_name = angular.copy($scope.copyqualificationArr.data_view_users);
        }else {
            $scope.copyp_name = angular.copy($scope.copyqualificationArr.business_incharge_id);
        }
        $scope.copyId = v;
        $scope.structuresList(coptState);
    };

    $scope.readclick = function(v){
        window.open(parents.url_img + v)
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
            url:url + 'admin/qualification_manager',
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
                console.log(data);
                var timer = null;
                var all_tr = $('#demo-table tbody tr,.fixed-table-body-columns tbody tr');
                var table_tr = $('#demo-table tbody tr');
                var columns_tr = $(".fixed-table-body-columns tbody tr");
                var tap = function() {
                    var t_idx = $(this).index();
                    $scope.editState = $scope.iconState = true;
                    $scope.deleteState = !data.rows[t_idx].no_delete;
                    $scope.qualificationArr = $scope.copyqualificationArr = data.rows[t_idx];
                    parents.forSome($scope.copyqualificationArr, ['tax_registration'], Number);
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
        licenseData = function(value, row, index) {
            var lice = $(this)[0].field;
            return  '<div class="licenseclick text-success text-cursor" data-key="'+lice+'">'+value+'</div>';
        };
        fileData = function(value, row, index) {
            var sotr = $(this)[0].field;
            return  value=='点击添加' ? '<div class="pathclick text-danger text-cursor" data-key="'+sotr+'">点击添加</div>':'<div class="fileclick text-success" style="cursor: pointer;">点击查看</div>'
        };
        window.fileEvents = {
            //弹窗显示
            'click .fileclick': function(e, value, row, index) {
                window.open(parents.url_img + value)
            },
            'click .pathclick': function(e, value, row, index) {
                $scope.fileSotr = e.currentTarget.dataset.key;
                $timeout(function(){$scope.editFun(2);},180)
            },
            'click .licenseclick': function(e, value, row, index) {
                var licStatus = e.currentTarget.dataset.key;
                $http.defaults.headers.common = { token: parents.token() };
                $http({
                    method: 'post',
                    url: url + 'admin/qualification_manager/getLicenseUrl',
                    params: {
                        id: licStatus == 'cp'?row.cp_id:row.issue_id,
                        type : licStatus == 'cp'?10:20
                    }
                }).success(function(data) {
                    if (data.code == 200) {
                        parents.download(parents.url_img + data.data);
                    }else{
                        alert(data.error)
                    }
                }).error(function(r) {
                    alert('服务器异常，请稍候重试');
                });
            }
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
        $scope.qualificationArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/users/' + $scope.qualificationArr.id,
            params : $scope.qualificationArr
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
            project_name : self.project_name,
            product_name : self.product_name
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