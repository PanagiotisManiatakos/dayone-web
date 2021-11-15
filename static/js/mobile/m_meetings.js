$(document).ready(function () {
    /*Initialize table*/
    startload();
    $.ajax({
        url: "/D1ServicesIN",
        method: "POST",
        data: {
            service: "get",
            object: "meetings",
        },
        success: function (data) {
            window.meets = $("#meets").DataTable({
                info: false,
                deferRender: true,
                scrollY: "75vh",
                scrollX: true,
                scrollCollapse: true,
                scroller: true,
                pageResize: true,
                nowrap :true,
                data: data["data"],
                columns: [
                    { title: "Συνάντηση", data: "SOACTIONCODE", defaultContent: "" },
                    { title: "Απο", data: "FROMDATE", defaultContent: "" },
                    { title: "Έως", data: "FINALDATE", defaultContent: "" },
                    { title: "Πελάτης", data: "TRDRNAME", defaultContent: "" },
                    { title: "Θέμα", data: "COMMENTS", defaultContent: "" },
                    { title: "SOACTION", data: "SOACTION", defaultContent: "" },
                ],
                columnDefs: [
                    { className: "hide_column", targets: [5] }],
            });
            stopload();
            $("#meetsdiv").css("display", "block");
            meets.columns.adjust().draw();
        },
    });
    
    /*When Single click a meets row*/
    $("#meets").on("click", "tr", function () {
        startload();
        meets.rows().deselect();
        meets.rows($(this)).select();
        var d = meets.rows({ selected: true }).data().toArray();
        if ($('#fsoactionseries option').length>0){
            $.ajax({
                url: "/D1ServicesIN",
                method: "POST",
                data: {
                    service: "get",
                    object: "soaction",
                    id: d[0]["SOACTION"],
                },
                success: function (d) {
                    data = jQuery.parseJSON(JSON.stringify(d.data[0]));
                    var ddnn = new Date((data.FROMDATE).replace(/-/g, "/"));
                    var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
                    var localISOTimeFROM = new Date(ddnn - tzoffset)
                        .toISOString()
                        .slice(0, 16);
                    var prsname = data.PRSNAME != undefined ? data.PRSNAME : '' ;
                    var prsname2 = data.PRSNAME2 != undefined ? data.PRSNAME2 : '' ;
                    var finalname = (prsname=='')&&(prsname2=='') ? '' : ((prsname!='')&&(prsname2=='') ? prsname :((prsname=='')&&(prsname2!='')) ? prsname2 : prsname+ ' ' +prsname2);
                    $("[id='fsoaction']").val(data.SOACTION);
                    $("[id='fsoactioncode']").val(data.SOACTIONCODE);
                    $("[id='ffromdate']").val(localISOTimeFROM);
                    $("[id='fcomments']").val(data.COMMENTS);
                    $("[id='ftrdrname']").val(data.NAME != undefined ? data.NAME : '');
                    $("[id='ftrdrname']").attr("data-trdr",data.TRDR != undefined ? data.TRDR : '');
                    $("[id='fprsname']").val(finalname);
                    $("[id='fprsname']").attr("data-prsn",data.PRSN != undefined ? data.PRSN : '');
                    $("[id='fphone01']").val(data.PHONE01);
                    $("[id='fremarks']").val(data.REMARKS);
                    $("#screenform .modal-content .modal-body .tab-content")
                        .find("*")
                        .attr("disabled", true);
                    $("#editm1").css("display", "block");
                    $("#savem1").prop("disabled", true);
                    stopload();
                    $("#screenform").modal("toggle");
                }
            });
        }else{
            $.ajax({
                url: "/D1ServicesIN",
                method: "POST",
                data: {
                    service: "get",
                    object: "soactionfirst",
                    id: d[0]["SOACTION"],
                },
                success: function (d) {
                    soaction = jQuery.parseJSON(JSON.stringify(d.data.soaction[0]));
                    series = jQuery.parseJSON(JSON.stringify(d.data.series));
                    var ddnn = new Date((soaction.FROMDATE).replace(/-/g, "/"));
                    var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
                    var localISOTimeFROM = new Date(ddnn - tzoffset)
                        .toISOString()
                        .slice(0, 16);
                    var prsname = soaction.PRSNAME != undefined ? soaction.PRSNAME : '' ;
                    var prsname2 = soaction.PRSNAME2 != undefined ? soaction.PRSNAME2 : '' ;
                    var finalname = (prsname=='')&&(prsname2=='') ? '' : ((prsname!='')&&(prsname2=='') ? prsname :((prsname=='')&&(prsname2!='')) ? prsname2 : prsname+ ' ' +prsname2);
                    $("[id='fsoaction']").val(soaction.SOACTION);
                    $("[id='fsoactioncode']").val(soaction.SOACTIONCODE);
                    $("[id='ffromdate']").val(localISOTimeFROM);
                    $("[id='fcomments']").val(soaction.COMMENTS);
                    $("[id='ftrdrname']").val(soaction.NAME != undefined ? soaction.NAME : '');
                    $("[id='ftrdrname']").attr("data-trdr",soaction.TRDR != undefined ? soaction.TRDR : '');
                    $("[id='fprsname']").val(finalname);
                    $("[id='fprsname']").attr("data-prsn",soaction.PRSN != undefined ? soaction.PRSN : '');
                    $("[id='fphone01']").val(soaction.PHONE01);
                    $("[id='fremarks']").val(soaction.REMARKS);
                    $.each(series, function (index, value) {
                        data = jQuery.parseJSON(JSON.stringify(series[index]));
                        $("#fsoactionseries").append('<option data-series="'+data.SERIES+'">'+data.NAME+'</option>');
                    });
                    $("#fsoactionseries").val(soaction.SERIESNAME);
                    $("#screenform .modal-content .modal-body .tab-content")
                        .find("*")
                        .attr("disabled", true);
                    $("#editm1").css("display", "block");
                    $("#savem1").prop("disabled", true);
                    stopload();
                    $("#screenform").modal("toggle");
                }
            });
        }
    });
    
    /*When Screen Save Button is pressed*/
    $("#savem1").click(function () {
        window.check =false;
        $('.required').each(function (i, el) {
            var data = $(el).val();
            if(data==""){
                $(el).css("border", "2px solid #f00");
                $(el).focus();
                check =true;
                return false;
            }else{
                $(el).css("border", "");
            };
        });
        if (check) {
            return false;
        }else{
            $("[id=loader]").css("display", "block");
            if ($("#fsoaction").val() == "") {
                $.ajax({
                    url: "calls/insert",
                    type: "POST",
                    data: {
                        trdr: $("#ftrdrname").prop('data-trdr'),
                        prsn: $("#fprsname").prop('data-prsn'),
                        start: $("#ffromdate").val(),
                        comments: $("#fcomments").val(),
                        remarks: $("#fremarks").val(),
                        tsodtype:13,
                        actstatus:$("#fdone").prop('checked'),
                    },
                    success: function (d) {
                        var data = jQuery.parseJSON(d);
                        $("[id=loader]").css("display", "none");
                        if (data['success']) {
                            refreshthecalls();
                            $("#screenform").modal("toggle");
                            $("#insertID").text(data['id']);
                            $("#successmodal").modal("toggle");
                            setTimeout(function () {
                                $("#successmodal").modal("hide");
                            }, 2000);
                        }else{
                            $("#insertIDFail").text(data["error"]);
                            $("#failuremodal").modal("toggle");
                            setTimeout(function () {
                                $("#failuremodal").modal("hide");
                            }, 3000);
                        }
                    },
                });
            } else {
                $.ajax({
                    url: "calls/update",
                    type: "POST",
                    data: {
                        soaction: $("#fsoaction").val(),
                        trdr: $("#ftrdrname").prop('data-trdr'),
                        prsn: $("#fprsname").prop('data-prsn'),
                        start: $("#ffromdate").val(),
                        comments: $("#fcomments").val(),
                        remarks: $("#fremarks").val(),
                        tsodtype:13,
                        actstatus:$("#fdone").prop('checked'),
                    },
                    success: function (d) {
                        var data = jQuery.parseJSON(d);
                        $("[id=loader]").css("display", "none");
                        if (data["success"]) {
                            refreshthecalls();
                            $("#screenform").modal("toggle");
                            $("#insertID").text(data["id"]);
                            $("#successmodal").modal("toggle");
                            setTimeout(function () {
                                $("#successmodal").modal("hide");
                            }, 2000);
                        }else{
                            $("#insertIDFail").text(data["error"]);
                            $("#failuremodal").modal("toggle");
                            setTimeout(function () {
                                $("#failuremodal").modal("hide");
                            }, 3000);
                        }
                    },
                });
            }
        }
    });
    
    /*When Screen Edit Button is pressed*/
    $("#editm1").on("click", function () {
        $("#screenform .modal-content .modal-body .tab-content")
            .find("*")
            .not(".locked")
            .attr("disabled", false);
        if($("#ftrdrname").val().length > 0){
            $("#fprsnamesearch").attr("disabled", false);
        }
        document.querySelector("#savem1").disabled = false;
    });
    
    /*When New Button is pressed*/
    $("#btnew").on("click", function () {
        startload();
        var ddnn = new Date(Date.now());
        var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
        var localISOTimeFROM = new Date(ddnn - tzoffset)
            .toISOString()
            .slice(0, 16);
        
        $("[id='fsoaction']").val("");
        $("[id='fsoactioncode']").val("");
        $("[id='ffromdate']").val(localISOTimeFROM);
        $("[id='fcomments']").val("");
        $("[id='ftrdrname']").val("");
        $("[id='ftrdrname']").attr("data-trdr","");
        $("[id='fprsname']").val("");
        $("[id='fprsname']").attr("data-prsn","");
        $("[id='fprsname']").val();
        $("[id='fphone01']").val("");
        $("[id='fremarks']").val("");
        
        $("#screenform .modal-content .modal-body .tab-content")
            .find('.locked')
            .attr("disabled", true);

        $("#screenform .modal-content .modal-body .tab-content")
            .find("*")
            .not('.locked')
            .attr("disabled", false);
        $('#fprsname').attr("disabled", true);
        $("[id='ffromdate']").attr("disabled", false);
        $("#savem1").attr("disabled", false);
        $("#editm1").css('display',"none");
        
        if ($('#fsoactionseries option').length<1){
            $.ajax({
                url: "/D1ServicesIN",
                method: "POST",
                data: {
                  service: "get",
                  object: "soactionseries",
                },
                success: function (d) {
                    $.each(d.data, function (index, value) {
                        data = jQuery.parseJSON(JSON.stringify(d.data[index]));
                        $("#fsoactionseries").append('<option data-series="'+data.SERIES+'">'+data.NAME+'</option>');
                        stopload();
                        $("#screenform").modal("toggle");                        
                    });
                }
            });
        }else{
            stopload();
            $("#screenform").modal("toggle");
        }
    });
    
    /*When Screen Χ Button is pressed*/
    $("#cancelm1").on("click", function () {
        document.querySelector("#savem1").disabled = true;
        $("#screenform").modal("toggle");
    });
    
    /*When Info Χ Button is pressed*/
    $("#cancelminfo1").on("click", function () {
        $("#callinfoform").modal("toggle");
        $("#callinfoform .modal-content .modal-body input").val('');
    });
    
    /*When Screen cancel Button is pressed*/
    $("#cancelm12").on("click", function () {
        document.querySelector("#savem1").disabled = true;
        $("#screenform").modal("toggle");
    });
    
    /*When Info cancel Button is pressed*/
    $("#cancelminfo12").on("click", function () {
        $("#callinfoform").modal("toggle");
        $("#callinfoform .modal-content .modal-body input").val('');
    });
    
    /*When type on trdr name*/
    var timer;
    $("#ftrdrname").on('keyup',function(){
        $("#ftrdrname").prop('data-trdr','');
        if ($("#ftrdrname").val().length > 2) {
            clearTimeout(timer);
            timer = setTimeout(function validate() {
                var str = $("#ftrdrname").val().replace("*", "%");
    
                $.ajax({
                    url: "/D1ServicesIN",
                    method: "POST",
                    data: {
                        service: "get",
                        object: "trdrname",
                        name: str + "%",
                    },
                    success: function (d) {
                        $("#Selectortrdrname").empty();
                        var rect = document
                            .getElementById("ftrdrname")
                            .parentElement.getBoundingClientRect();
                        $.each(d.data, function (index, value) {
                            data = jQuery.parseJSON(JSON.stringify(d.data[index]));
                            $("#Selectortrdrname").append(
                                '<li class="dropdown-item disable-select" style="overflow-x: auto;">' +
                                    '<div class="container-fluid" style="padding: 0px">' +
                                        '<div data-slide="' + data.TRDR + '" class="row">' +
                                            '<a">' + data.NAME + "</a>" +
                                        "</div>" +
                                    "</div>" +
                                "</li>"
                            );
                        });
                        if ($( window ).width()<576){
                            $("#Selectortrdrname")
                                .parent()
                                .css({ "padding-top": rect.bottom - rect.top });
                        }
                        $("#Selectortrdrname").css({
                            'display': "block",
                            'left': rect.left,
                            "margin-top": rect.bottom - rect.top,
                            'width': rect.right - rect.left,
                            'overflow-y': 'auto',
                        });
                        $("#Selectortrdrname").css({"maxHeight": $("#Selectortrdrname").children().first().height()*8 +'px'}); 
                    }
                });
            }, 400);
        } else {
            if($("#Selectortrdrname").is(':visible')){
                clearTimeout(timer);
                timer = setTimeout(function validate() {
                    var str = $("#ftrdrname").val().replace("*", "%");
        
                    $.ajax({
                        url: "/D1ServicesIN",
                        method: "POST",
                        data: {
                            service: "get",
                            object: "trdrname",
                            name: str + "%",
                        },
                        success: function (d) {
                            $("#Selectortrdrname").empty();
                            var rect = document
                                .getElementById("ftrdrname")
                                .parentElement.getBoundingClientRect();
                            $.each(d.data, function (index, value) {
                                data = jQuery.parseJSON(JSON.stringify(d.data[index]));
                                $("#Selectortrdrname").append(
                                    '<li class="dropdown-item disable-select" style="overflow-x: auto;">' +
                                        '<div class="container-fluid" style="padding: 0px">' +
                                            '<div data-slide="' + data.TRDR + '" class="row">' +
                                                '<a">' + data.NAME + "</a>" +
                                            "</div>" +
                                        "</div>" +
                                    "</li>"
                                );
                            });
                            if ($( window ).width()<576){
                                $("#Selectortrdrname")
                                    .parent()
                                    .css({ "padding-top": rect.bottom - rect.top });
                            }
                            $("#Selectortrdrname").css({
                                'display': "block",
                                'left': rect.left,
                                "margin-top": rect.bottom - rect.top,
                                'width': rect.right - rect.left,
                                'overflow-y': 'auto',
                            });
                            $("#Selectortrdrname").css({
                                "maxHeight": $("#Selectortrdrname").children().first().height()*8 +'px'
                            }); 
                        }
                    });
                }, 400);
            }else{
                clearTimeout(timer);
                $("#Selectortrdrname").css("display", "none");
            }
        }
    });
    
    /*When focusout the trdrname*/
    $("#ftrdrname").on('focusout',function(){
        setTimeout(function(){ 
            if($("#ftrdrname").prop('data-trdr')==''){
                $("#ftrdrname").val('');
                $("#fprsname").val('').prop('data-prsn','').prop('disabled',true);
                $("#fprsnamesearch").prop('disabled',true);
            }
        }, 100)
    });
    
    /*When Search Trdr is pressed*/
    $("#ftrdrnamesearch").on("click", function () {
        $("[id=loader]").css("display", "block");
        if($("#ftrdrname").val().length < 1){
            $.ajax({
                url: "/D1ServicesIN",
                method: "POST",
                data: {
                    service: "get",
                    object: "toptrdr",
                    sodtype:13
                },
                success: function (d) {
                    $("#Selectortrdrname").empty();
                    var rect = document
                        .getElementById("ftrdrname")
                        .parentElement.getBoundingClientRect();
                    $.each(d.data, function (index, value) {
                        data = jQuery.parseJSON(JSON.stringify(d.data[index]));
                        $("#Selectortrdrname").append(
                            '<li class="dropdown-item disable-select" style="overflow-x: auto;">' +
                                '<div class="container-fluid" style="padding: 0px">' +
                                    '<div data-slide="' + data.TRDR + '" class="row">' +
                                        '<a>' + data.NAME + "</a>" +
                                    "</div>" +
                                "</div>" +
                            "</li>"
                        );
                    });
                    if ($( window ).width()<576){
                        $("#Selectortrdrname")
                            .parent()
                            .css({ "padding-top": rect.bottom - rect.top })
                    }
                    $("[id=loader]").css("display", "none");
                    $("#Selectortrdrname").css({
                        'display': "block",
                        'left': rect.left,
                        "margin-top": rect.bottom - rect.top,
                        'width': rect.right - rect.left,
                        'overflow-y': 'auto',
                    });
                    $("#Selectortrdrname").css({"maxHeight": $("#Selectortrdrname").children().first().height()*8 +'px'});                 
                }
            });
        }else{
            var str = $("#ftrdrname").val().replace("*", "%");

            $.ajax({
                url: "/D1ServicesIN",
                method: "POST",
                data: {
                    service: "get",
                    object: "trdrname",
                    name: str + "%",
                },
                success: function (d) {
                    $("#Selectortrdrname").empty();
                    var rect = document
                        .getElementById("ftrdrname")
                        .parentElement.getBoundingClientRect();
                    $.each(d.data, function (index, value) {
                        data = jQuery.parseJSON(JSON.stringify(d.data[index]));
                        $("#Selectortrdrname").append(
                            '<li class="dropdown-item disable-select" style="overflow-x: auto;">' +
                                '<div class="container-fluid" style="padding: 0px">' +
                                    '<div data-slide="' + data.TRDR + '" class="row">' +
                                        '<a">' + data.NAME + "</a>" +
                                    "</div>" +
                                "</div>" +
                            "</li>"
                        );
                    });
                    if ($( window ).width()<576){
                        $("#Selectortrdrname")
                            .parent()
                            .css({ "padding-top": rect.bottom - rect.top });
                    }
                    $("[id=loader]").css("display", "none");
                    $("#Selectortrdrname").css({
                        'display': "block",
                        'left': rect.left,
                        "margin-top": rect.bottom - rect.top,
                        'width': rect.right - rect.left,
                        'overflow-y': 'auto',
                    });
                    $("#Selectortrdrname").css({"maxHeight": $("#Selectortrdrname").children().first().height()*8 +'px'}); 
                }
            });
        }
    });
    
    /*When Search Prsn is pressed*/
    $("#fprsnamesearch").on("click", function () {
        $("[id=loader]").css("display", "block");
        $.ajax({
            url: "/D1ServicesIN",
            method: "POST",
            data: {
                service: "get",
                object: "trdrpeople",
                trdr:$("#ftrdrname").prop("data-trdr")
            },
            success: function (d) {
                $("#Selectorprsnname").empty();
                var rect = document
                    .getElementById("fprsname")
                    .parentElement.getBoundingClientRect();
                $.each(d.data, function (index, value) {
                    data = jQuery.parseJSON(JSON.stringify(d.data[index]));
                    var prsname = data.NAME != undefined ? data.NAME : '' ;
                    var prsname2 = data.NAME2 != undefined ? data.NAME2 : '' ;
                    var finalname = (prsname=='')&&(prsname2=='') ? '' : ((prsname!='')&&(prsname2=='') ? prsname :((prsname=='')&&(prsname2!='')) ? prsname2 : prsname+ ' ' +prsname2);
                    
                    $("#Selectorprsnname").append(
                        '<li class="dropdown-item disable-select" style="overflow-x: auto;">' +
                            '<div class="container-fluid" style="padding: 0px">' +
                                '<div data-slide="' + data.PRSN + '" class="row">' +
                                    '<a>' + finalname + "</a>" +
                                "</div>" +
                            "</div>" +
                        "</li>"
                    );
                });
                if ($( window ).width()<576){
                    $("#Selectorprsnname")
                        .parent()
                        .css({ "padding-top": rect.bottom - rect.top })
                }
                $("[id=loader]").css("display", "none");
                $("#Selectorprsnname").css({
                    'display': "block",
                    'left': rect.left,
                    "margin-top": rect.bottom - rect.top,
                    'width': rect.right - rect.left,
                    'overflow-y': 'auto',
                });
                $("#Selectorprsnname").css({"maxHeight": $("#Selectorprsnname").children().first().height()*8 +'px'});                 
            }
        });
    });
    
    /*When Click on Selector Name fill the inputs*/
    $("#Selectortrdrname").on("click", ".row", function () {
        $("#Selectortrdrname").css("display", "none");
        var id = $(this).data("slide");
        var name = $(this).children().text();
        $('#ftrdrname').val(name);
        $("#ftrdrname").prop("data-trdr",id);
        $('#fprsnamesearch').attr("disabled", false);
    });
    
    /*When Click on Selector Prsn fill the inputs*/
    $("#Selectorprsnname").on("click", ".row", function () {
        $("#Selectorprsnname").css("display", "none");
        var id = $(this).data("slide");
        var name = $(this).children().text();
        $('#fprsname').val(name);
        $("#fprsname").prop("data-prsn",id);
    });
    
    /*When Dcreen closes*/
    $('#screenform').on('hidden.bs.modal', function () {
        $("[id='fsoaction']").val('');
        $("[id='fsoactioncode']").val('');
        $("[id='ffromdate']").val('');
        $("[id='fcomments']").val('');
        $("[id='ftrdrname']").val('');
        $("[id='ftrdrname']").attr("data-trdr",'');
        $("[id='fprsname']").val('');
        $("[id='fprsname']").attr("data-prsn",'');
        $("[id='fphone01']").val('');
        $("[id='fremarks']").val('');
    });
    
    document.addEventListener("click", function (e) {
        if ($("#Selectortrdrname").css("display") == "block") {
            let insidedropdown = e.target.closest("#Selectortrdrname");
            let insideparent = e.target.closest("#ftrdrname");
            let insidedbutton = e.target.closest("#ftrdrnamesearch");
            if (!insidedropdown && !insideparent &&!insidedbutton) {
                $("#Selectortrdrname").hide();
            }
        }else if ($("#Selectorprsnname").css("display") == "block") {
            let insidedropdown = e.target.closest("#Selectorprsnname");
            let insidedbutton = e.target.closest("#fprsnamesearch");
            if (!insidedropdown && !insidedbutton) {
                $("#Selectorprsnname").hide();
            }
        }
    });
});

function refreshthecalls() {
    $("#loader").css("display", "block");

    $.ajax({
        url: "/D1ServicesIN",
        method: "POST",
        data: {
            service: "get",
            object: "calls",
        },
        success: function (data) {
            calls.destroy();
            calls = undefined;
            delete calls;
            window.calls = $("#calls").DataTable({
                info: false,
                deferRender: true,
                scrollY: "75vh",
                scrollX: true,
                scrollCollapse: true,
                scroller: true,
                pageResize: true,
                nowrap :true,
                data: data["data"],
                columns: [
                    { title: "Κλήση", data: "SOACTIONCODE", defaultContent: "" },
                    { title: "Απο", data: "FROMDATE", defaultContent: "" },
                    { title: "Έως", data: "FINALDATE", defaultContent: "" },
                    { title: "Πελάτης", data: "TRDRNAME", defaultContent: "" },
                    { title: "Θέμα", data: "COMMENTS", defaultContent: "" },
                    { title: "SOACTION", data: "SOACTION", defaultContent: "" },
                ],
                columnDefs: [
                    { className: "hide_column", targets: [5] }],
            });
            calls.columns.adjust().draw();
            $("#loader").css("display", "none");
        },
    });
}

function gotoinfo() {
    
    if ($('#fsoaction').val()!=''){
        $("[id=loader]").css("display", "block");
        $.ajax({
            url: "/D1ServicesIN",
            method: "POST",
            data: {
                service: "get",
                object: "callinfo",
                soaction: $('#fsoaction').val()
            },
            success: function (d) {
                data=jQuery.parseJSON(JSON.stringify(d.data[0]));
                var prsname = data.PRSNAME != undefined ? data.PRSNAME : '' ;
                var prsname2 = data.PRSNAME2 != undefined ? data.PRSNAME2 : '' ;
                var finalname = (prsname=='')&&(prsname2=='') ? '' : ((prsname!='')&&(prsname2=='') ? prsname :((prsname=='')&&(prsname2!='')) ? prsname2 : prsname+ ' ' +prsname2);

                $("#infotrdrname").text(data.NAME);
                $("#fiphone01").val(data.PHONE01);
                $("#fiphone02").val(data.PHONE02);
                $("#infoprsname").text(finalname);
                $("#fiphone1").val(data.PHONE1);
                $("#fiphone2").val(data.PHONE2);
                $("#fimobilephone").val(data.MOBILEPHONE);
                $("#fiphoneext").val(data.PHONEEXT);
                if(finalname==''){
                    $('#infoprsnpanel').hide();
                }else{
                    $('#infoprsnpanel').show();
                }
                $("[id=loader]").css("display", "none");
                $("#callinfoform").modal("toggle");
            },
        });
    }
}

function makephonecall(id,phone){
    id.href = "tel:"+phone.value;
}

function startload(){
    $(".loaderr").css("display", "block");
    $("body").append('<div id="overlayyy"</div>');
}

function stopload(){
    $(".loaderr").css("display", "none");
    $("#overlayyy").remove();
}
