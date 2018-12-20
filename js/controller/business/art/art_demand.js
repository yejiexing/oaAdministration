/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('artDemand', []);
app.controller('artDemandCtrl', function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0 ? true : false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.demand = $scope.isexport = state;
    if (!state) {
        $scope.index = parents.authList('fineart-index'); //查看列表权限
        $scope.read = parents.authList('fineart-read'); //查看详情权限
        $scope.update = parents.authList('fineart-update'); //编辑操作
        $scope.save = parents.authList('fineart-save'); //添加操作
        $scope.delete = parents.authList('fineart-delete'); //删除操作
        $scope.deletes = parents.authList('fineart-deletes'); //批量删除操作
        $scope.enables = parents.authList('fineart-enables'); //批量启用禁用操作
        $scope.demand = parents.authList('fineart-verifydemand'); //审核操作
        $scope.isexport = parents.authList('fineart-export');//导出操作
    }
    $('#query').show();
    $scope.ispc = parents.IsPC();
    $scope.deleteState = false;
    $scope.editState = false;
    $scope.iconState = false;
    $scope.auditState = false;
    $scope.Id = '';
    self.Channel_s = ''; //地区-搜索
    //self.Company_s = ''; //地区-搜索
    //self.Region_s = ''; //地区-搜索
    self.Status_s = '';
    self.startDate = ''; //开始时间
    self.endDate = ''; //结束时间
    $scope.getImg = '';
    $scope.select = {
        selectChannel: '', //选择项目的名字
        //selectCompany: '', //选择产品的名字
        //selectRegion: '', //选择渠道的名字
        selectStatus: '',
        C_status: true
    };
    $scope.Method = $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = 0;
    $scope.textareaNum = 300;
    $scope.Newdate1 = self.startDate =
        parents.currentDate.MonthTime(1) + '-01-00';
    $scope.Newdate2 = self.endDate =
        parents.currentDate.dateTime() + '-' + parents.currentDate.Hours();
    $scope.imageArr = $scope.copyimageArr = new Object();
    $scope.uploading = false;

    $scope.ChannelList = parents.select('project/getProjectList'); //获取单位list
    $scope.RegionList = parents.select('channel/getChannelList'); //获取单位list

    initTable();
    $scope.doQuery = function(params) {
        $('#demo-table').bootstrapTable('refresh'); //刷新表格
        $scope.ChannelList = parents.select('project/getProjectList'); //刷新渠道list
        $scope.CompanyList = ''; //刷新单位list
        $scope.RegionList = parents.select('channel/getChannelList'); //获取单位list
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    };
    $scope.search = function(params) {
        //搜索
        self.Channel_s = $scope.select.selectChannel;
        self.Status_s = $scope.select.selectStatus;
        self.startDate = $scope.Newdate1;
        self.endDate = $scope.Newdate2;
        $('#demo-table').bootstrapTable('destroy');
        initTable();
    };
    $scope.deleteFun = function(params) {
        //删除
        $('#table_delete').modal('show');
    };
    $scope.editFun = function(params) {
        //编辑
        $scope.usersError = '';
        $scope.Id = $scope.copyimageArr.id;
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/fine_art/' + $scope.Id
        })
            .success(function(data) {
                if (data.code == 200) {
                    $scope.copyimageArr = data.data;

                    if (params == 1) {
                        $scope.dealList = $scope.copyimageArr.dealList;
                        $("#deal-list").removeClass('border-bottom');
                        $("#deal-list .ibox-content").hide();
                        $("#details").modal("show");
                    }else if(params == 3){
                        var usernameStr = $scope.copyimageArr.exce_username.split(',');
                        var userIdStr = $scope.copyimageArr.exce_user_id.split(',');
                        var userStr = []
                        for(var i=0;i<usernameStr.length;i++){
                            userStr.push(userIdStr[i]+'-'+usernameStr[i])
                        }
                        $scope.Channel_s = parents.select('structures/getArtStructure');
                        setTimeout(function(){
                            $scope.refreshMulti(userStr.join(','),'SelectBox','read')
                        })
                        $('#commentTitle').html('设计美术');
                        $('#icon').modal('show');
                    }else if(params == 4){
                        $('#commentTitle').html('计划完成时间');
                        $('#icon').modal('show');
                    } else {
                        var verify_status = {
                            审核中: '10',
                            审核通过: '20',
                            审核未通过: '30',
                            已完成: '40'
                        };
                        parents.forSome(
                            $scope.copyimageArr,
                            ['is_demand', 'demand_level', 'demand_type', 'demand_property'],
                            String
                        );
                        $scope.copyimageArr.verify_status =
                            verify_status[$scope.copyimageArr.verify_status];
                        $('#preservaModal').modal('show');
                        $('#myModalLabel').html('[编辑]美术需求');
                    }
                }
            })
            .error(function() {});
    };
    $scope.deleteConfirm = function() {
        //删除弹出框
        $http.defaults.headers.common = { token: parents.token() };
        var checks = $('#demo-table')
            .bootstrapTable('getSelections')
            .map(function(item) {
                return item.id;
            });

        if (checks.length) {
            $http
                .post(url + 'admin/fine_art/deletes', {
                    ids: checks
                })
                .then(function(data) {
                    $('#table_delete').modal('hide');
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                    $scope.doQuery();
                });
        } else {
            $http.delete(url + 'admin/fine_art/' + $scope.imageArr.id).then(
                function(data) {
                    $('#table_delete').modal('hide');
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                    $scope.doQuery();
                },
                function() {}
            );
        }
    };
    $scope.charges = function(id, name) {
        var coptState = false;
        $('#charge_radioModal').modal('show');
        $('#chargeTitle').html('请选择...');
        $scope.copyp_name = angular.copy($scope.copyimageArr[id]);
        $scope.copyId = id;
        $scope.copyName = name;
        $scope.structuresList(coptState);
    };
    $scope.structuresList = function(v) {
        //部门管理数据查询
        $scope.chargeList = parents.division(false);
    };
    $scope.delp_name = function(id, name) {
        //负责人清空
        $scope.copyimageArr[name] = '';
        $scope.copyimageArr[id] = '';
    };
    $scope.chargesKeep = function() {
        var che_value = [];
        var che_num = [];
        var depar = $("input[name='charge']:checked");
        depar.each(function() {
            che_value.push($(this).attr('data-num'));
            che_num.push($(this).val());
        });
        if (che_value.join(',') == '') {
            alert('请选择...');
        } else {
            $scope.copyimageArr[$scope.copyId] = che_num.join(',');
            $scope.copyimageArr[$scope.copyName] = che_value.join(',');
            $('#charge_radioModal').modal('hide');
        }
    };

    $scope.audit = function(status) {
        $scope.copyimageArr.verify_status = status;
        if($scope.copyimageArr.exce_user_id == ''){
            alert('请选择美术');
            return false;
        }
        $http.defaults.headers.common = { token: parents.token() };

        $http
            .post(url + 'admin/fine_art/verifyDemand/', {
                id: $scope.copyimageArr.id,
                demand_level: $scope.copyimageArr.demand_level,
                exce_user_id: $scope.copyimageArr.exce_user_id,
                exce_username: $scope.copyimageArr.exce_username,
                verify_status: $scope.copyimageArr.verify_status,
                comment: $scope.copyimageArr.comment,
                status: $scope.copyimageArr.status
            })
            .then(
                function(data) {
                    if (data.data.code == 200) {
                        $scope.doQuery();
                        $('#audit').modal('hide');
                        $('#code').html(data.data.data);
                        $('#table_success').modal('show');
                    } else {
                        alert(data.error);
                        //$scope.usersError = data.error;
                    }
                },
                function(r) {
                    alert('服务器异常，请稍候重试');
                }
            );
    };
    $scope.ArtAudit = function(v){
        var ArtAuditList = {id:$scope.copyimageArr.id},ArtAuditUrl = '';
        if(v == 1){
            ArtAuditList.exce_user_id = $scope.copyimageArr.exce_user_id;
            ArtAuditList.exce_username = $scope.copyimageArr.exce_username;
            ArtAuditList.comment = $scope.copyimageArr.comment;
            ArtAuditUrl = 'admin/fine_art/updateExceUser/'
        }else{
            ArtAuditList.plan_finish_time = $scope.copyimageArr.plan_finish_time;
            ArtAuditUrl = 'admin/fine_art/updatePlanFinishTime/'
        }
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'put',
            url: url + ArtAuditUrl,
            params: ArtAuditList
        }).success(function(data) {
            if (data.code == 200) {
                $scope.doQuery();
                $('#icon').modal('hide');
                $('#code').html(data.data);
                $('#table_success').modal('show');
            } else {
                alert(data.error);
            }
            })
            .error(function(r) {
                alert('服务器异常，请稍候重试');
            });
        console.log(ArtAuditList)
    }
    var multiState = {
        demand : true,
        read : true
    };
    $scope.demand1 = function(params) {
        if($scope.copyimageArr.status == 1) {
            alert('当前需求已完成');
        }else{
            $scope.Channel_s = parents.select('structures/getArtStructure');
            $scope.copyimageArr.exce_user_id = $scope.copyimageArr.comment = '';
            $scope.copyimageArr.demand_level = String($scope.copyimageArr.demand_level);
            setTimeout(function(){
                $scope.refreshMulti('','sceneIdSelectBox','demand')
            })
            $('#audit').modal('show');
        }
    };
    $scope.refreshMulti = function(list,id,state){
        if(multiState[state]) {
            $('#'+id).change(function () {
                //console.log($(this).val());
                var idArr =[], nameArr = [];
                //console.log($(this).val().length);
                if($(this).val() != null){
                    $.each($(this).val(),function(i,v){
                        var valSplit = v.split('-');
                        idArr.push(valSplit[0])
                        nameArr.push(valSplit[1])
                    })
                    $scope.copyimageArr.exce_user_id = idArr.join(',');
                    $scope.copyimageArr.exce_username = nameArr.join(',')
                }else{
                    $scope.copyimageArr.exce_user_id = '';
                    $scope.copyimageArr.exce_username = ''
                }
                //$scope.copyimageArr.exce_user_id = $(this).val().join(',')
            }).multiselect({
                buttonClass: 'btn btn-white text-left',
                allSelectedText: '所有美术',
                nSelectedText: '当前美术',
                buttonWidth: '232',
                maxHeight: '120',
                numberDisplayed: 4,
                nonSelectedText: '选择美术'
            });
            multiState[state] = false;
        }
        //var sceneIdList = data;
        var sceneIdArr = list.split(",");
        $('#'+id+' option').each(function(i,content){
            //alert(i+"***"+content.value);
            if($.inArray($.trim(content.value),sceneIdArr)>=0){
                this.selected=true;
            }else{
                this.selected=false;
            }
        });
        $("#"+id).multiselect('refresh');
    }

    $scope.setProject = function() {
        $scope.Channel_s.forEach(function(item) {
            if (item.id == $scope.copyimageArr.exce_user_id) {
                $scope.copyimageArr.exce_username = item.realname;
            }
        });
    };

    $scope.preservaConfirm = function() {
        //新增弹出框
        var channelNum = 0;
        angular.forEach($scope.copyimageArr, function(v,i){
            if((i== 'project_name' || i == 'plan_finish_time' || i == 'demand_type' || i == 'demand_property'|| i == 'demand_level' || i == 'is_demand' || i == 'demand_detail') && v == ''){
                channelNum++;
            }
        })
        if (channelNum != 0) {
            $scope.usersError = '请完善必填内容';
            return false;
        }
        parents.screen.Delete($scope.copyimageArr)
        $.ajax({
            url: url + 'admin/fine_art/' + $scope.Id,
            beforeSend: function(request) {
                request.setRequestHeader('token', parents.token());
            },
            dataType: 'JSON',
            async: false, //请求是否异步，默认为异步
            type: $scope.Method,
            data: $scope.copyimageArr,
            success: function(data) {
                if (data.code == 200) {
                    $scope.doQuery();
                    $('#preservaModal').modal('hide');
                    $('#code').html(data.data);
                    $('#table_success').modal('show');
                } else {
                    $scope.usersError = data.error;
                }
            },
            error: function() {}
        });
    };
    $scope.export = function() {
        var ExpObj = {
            start_date: self.startDate,
            end_date: self.endDate,
            keywords: self.Channel_s,
            status: self.Status_s,
            my_data: false
        };
        parents.Exports('fine_art/export', ExpObj);
    };

    $scope.addImage = function() {
        var feil = $scope.copyimageArr.reference_picture;
        if (feil.length < 5) {
            if(feil[feil.length-1] == undefined || feil[feil.length-1].url != '') {
                feil.push({title: '', url: ''});
            }
            setTimeout(function(){
                $('#file'+ Number(feil.length-1)).click();
            },100)
        }else{
            alert('参考图最多可添加五个')
        }
    };
    $scope.file_name = function(index){
        var file = $scope.copyimageArr.reference_picture;
        var str  = file[index];
        var index1 = file.indexOf(str);
        file = file.splice(index1, 1)[0];
        //$scope.copyimageArr.reference_picture.remove(index);
    }
    $scope.file_div = function(index){
        var file = $scope.copyimageArr.reference_picture;
        if(file[index].url == ''){
            $('#file'+ index).click();
        }else{
            $scope.getImg = parents.url_img + file[index].url;
            $('.zhezhao').show();
        }
    }
    $('.zhezhao_clear').click(function(){
        $('.zhezhao').hide();
    })

    $scope.removeImage = function(index) {
        $scope.copyimageArr.reference_picture.splice(index, 1);
    };

    $scope.pageClick = function(){
        $("#file_path").click()
    }
    $scope.checkFile = function(file, index,e) {
        var path_key = e.attr('data-key');
        var fd = new FormData();
        var extName = file.name.slice(file.name.lastIndexOf('.'));
        var extNames = path_key == 'file_path'?['.xlc', '.xlm', '.xlt', '.xlw', '.xls', '.xlsx']:['.png', '.jpg', '.jpeg'];
        $scope.$apply(function() {
            if ($.inArray(extName, extNames) === -1) {
                $scope.usersError = '文件格式错误';
                if(path_key == 'file_path'){
                    $scope.copyimageArr.reference_picture[index].url = '';
                }else{
                    $scope.copyimageArr[path_key] = ''
                }
            } else {
                $scope.usersError = '';
                fd.append('file', file);
                $http.post(url + 'admin/upload', fd, {
                        headers: {
                            'Content-Type': undefined,
                            token: parents.token()
                        },
                        transformRequest: angular.identity
                    }).then(
                        function(data) {
                            if (data.data.code === 200) {
                                if(path_key != 'file_path') {
                                    $scope.copyimageArr.reference_picture[index].title = file.name;
                                    $scope.copyimageArr.reference_picture[index].url = data.data.data;
                                }else{
                                    $scope.copyimageArr[path_key] = data.data.data;
                                }
                            } else {
                                $scope.usersError = data.data.error;
                            }
                        },
                        function(error) {
                            $scope.usersError = error;
                        }
                    );
            }
        });
    };

    $('.text_demand').bind('input',function(){
        var t_num = $('.text_demand').val().length;
        $scope.textareaNum = 300 - t_num;
    });
    $scope.NewlyAdded = function() {
        $scope.usersError = '';
        $scope.Id = '';
        $scope.Method = 'post';
        $scope.copyimageArr = {
            //project_id: '',
            project_name: '',
            demand_type: '',
            demand_detail: '',
            plan_finish_time: '',
            demand_level: '',
            is_demand: '',
            demand_property: '',
            file_path: '',
            reference_picture: []
        };
        $scope.Region_s = ''; //获取渠道list
        $scope.Company_s = parents.select('channel/getChannelNameAndId'); //刷新渠道list

        $('#preservaModal').modal('show');
        $('#myModalLabel').html('[新增]美术需求');
    };

    lay('#date_1').on('click', function(e) {
        laydate.render({
            elem: '#date1',
            type: 'datetime',
            format: 'yyyy-MM-dd-HH',
            show: true,
            closeStop: '#date_1',
            done: function(value, date, endDate) {
                $scope.Newdate1 = value;
            }
        });
    });
    lay('#date_2').on('click', function(e) {
        laydate.render({
            elem: '#date2',
            type: 'datetime',
            format: 'yyyy-MM-dd-HH',
            show: true,
            closeStop: '#date_2',
            done: function(value, date, endDate) {
                $scope.Newdate2 = value;
            }
        });
    });
    lay('#date_3').on('click', function(e) {
        laydate.render({
            elem: '#date3',
            type: 'datetime',
            format: 'yyyy-MM-dd-HH',
            show: true,
            closeStop: '#date_3',
            done: function(value, date, endDate) {
                $scope.copyimageArr.plan_finish_time = value;
            }
        });
    });
    lay('#date_4').on('click', function(e) {
        laydate.render({
            elem: '#date4',
            type: 'datetime',
            format: 'yyyy-MM-dd-HH',
            show: true,
            closeStop: '#date_4',
            done: function(value, date, endDate) {
                $scope.copyimageArr.plan_finish_time = value;
            }
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
            sortable: true,
            sortOrder: "",
            striped: true, //是否显示行间隔色
            sidePagination: 'server', //分页方式：client客户端分页，server服务端分页（*）
            url: url + 'admin/fine_art',
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
            // fixedColumns: !$scope.ispc,
            // fixedNumber: 3,
            onLoadSuccess: function(data) {
                //成功的回调
                iosTable();
                if (data.total != 0) {
                    var timer = null;
                    var all_tr = $(
                        '#demo-table tbody tr,.fixed-table-body-columns tbody tr'
                    );
                    var table_tr = $('#demo-table tbody tr');
                    var columns_tr = $('.fixed-table-body-columns tbody tr');
                    var tap = function() {
                        var t_idx = $(this).index();
                        $scope.deleteState = $scope.editState = $scope.iconState = true;
                        $scope.imageArr = $scope.copyimageArr =
                            data.rows[t_idx];
                        $scope.auditState = !!(
                            $scope.copyimageArr.verify_status == '审核中' ||
                            $scope.copyimageArr.verify_status == '已完成'
                        );

                        table_tr.removeClass('bg-color');
                        columns_tr.removeClass('bg-color');
                        table_tr.eq(t_idx).addClass('bg-color');
                        columns_tr.eq(t_idx).addClass('bg-color');
                    };
                    all_tr.on({
                        click: function() {
                            //单击事件
                            $timeout.cancel(timer);
                            timer = $timeout(tap.bind(this), 170);
                        },
                        dblclick: function() {
                            //双击事件
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
            rowStyle: function(row, index) {
                var style = {};
                if (row.verify_status == 0) {
                    style = { css: { color: '#cacaca' } };
                } else if (row.verify_status == 2) {
                    style = { css: { color: 'red' } };
                }
                return style;
            },
            onExpandRow: function(index, row, $detail) {
                //InitSubTable(index, row, $detail);
            }
        });
        numData = function(value, row, index) {
            return index + 1;
        };
        smaller = function(value, row, index) {
            return "<div style='width:70px'>" + value + '</div>';
        };
        demand_detail = function(value, row, index) {
            return "<div style='max-width:400px;word-wrap:break-word'>" + value + '</div>';
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
        images = function(value, row, index) {
            return value.length ? '<a class="images">参考图</a>' : '无';
        };
        verify_status = function(value, row, index) {
            var v = '';
            if(value == '审核中'){
                v = '<span class="text-success">'+value+'</span>'
            }else if(value == '审核未通过'){
                v = '<span class="text-danger">'+value+'</span>'
            }else{
                v = value
            }
            return v;
        };
        pathData = function(value, row, index){
            var pathUrl = value == null || value == ''?'无':'<div class="pathClick text-cursor text-success">点击下载</div>';
            return pathUrl;
        };
        levelData = function(value, row, index){
            return row.demand_level_string;
        };
        detailData = function(value, row, index){
            return '<div class="text-left">'+value.replace(/\n/g,'<br/>')+'</div>';
        }
        exceData = function(value, row, index){
            var exceVal = ''
            if($scope.demand && row.verify_status == '审核通过'){
                exceVal = '<div class="text-success text-cursor '+$(this)[0].field+'">'+value+'</div>'
            }else{
                exceVal = value
            }
            return exceVal;
        }
        window.imagesFun = {
            'click .images': function(event, value, row, index) {
                value.forEach(function(item) {
                    if(item.flag != 1) {
                        item.url = parents.url_img + item.url;
                        item.flag = 1;
                    }
                    item.active = 1
                });
                value[0].active = 2;
                $scope.imageURL = value[0];
                $scope.images = value;
                $('#images').modal('show');
            }
        };
        window.fileFun = {
            'click .pathClick' : function(e, value, row, index){
                window.open(parents.url_img+row.file_path)
            },
            'click .plan_finish_time' : function(e, value, row, index){
                //$('#icon').modal('show');
                $scope.ArtUpdate = 2;
                $scope.copyimageArr = angular.copy(row);
                $scope.editFun(4)

            },
            'click .exce_username' : function(e, value, row, index){
                $scope.ArtUpdate = 1;
                $scope.copyimageArr = angular.copy(row);
                $scope.editFun(3)

            }
        }
    }
    $scope.carouselInner = function(row,idx){
        $scope.imageURL = row;
        angular.forEach($scope.images,function(v,i){
            if(i == idx){
                v.active = 2;
            }else{
                v.active = 1;
            }
        })
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
    //popoverstate窗口关闭end
    $scope.stateedit = function(v) {
        var pop_che = $('#pop_che').is(':checked');
        $scope.imageArr.status = pop_che ? 1 : 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'put',
            url: url + 'admin/fine_art/' + $scope.imageArr.id,
            params: $scope.imageArr
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
            keywords: self.Channel_s,
            //user_name: self.Company_s,
            //structure: self.Region_s,
            status: self.Status_s
        };
        if(params.order != ''){
            param.order = (params.sort == undefined?'':params.sort)+' '+params.order
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
