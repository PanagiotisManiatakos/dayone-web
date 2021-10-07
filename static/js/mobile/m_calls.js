$(document).ready(function () {
    $("#loader").css("display", "block");
    $.ajax({
        url: "/D1ServicesIN",
        method: "POST",
        data: {
            service: "get",
            object: "calls",
        },
        success: function (data) {
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
                    { title: "Ημερομηνία", data: "FROMDATE", defaultContent: "" },
                    { title: "Πελάτης", data: "TRDRNAME", defaultContent: "" },
                    { title: "Θέμα", data: "COMMENTS", defaultContent: "" },
                    { title: "SOACTION", data: "SOACTION", defaultContent: "" },
                ],
                columnDefs: [
                    { className: "hide_column", targets: [4] }],
            });
            $("#loader").css("display", "none");
            $("#callsdiv").css("display", "block");
            calls.columns.adjust().draw();
        },
    });
    
    /*When Single click a calls row*/
    $("#calls").on("click", "tr", function () {
        $("#loader").css("display", "block");
        calls.rows().deselect();
        calls.rows($(this)).select();
        var d = calls.rows({ selected: true }).data().toArray();
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
                var ddnn = new Date(data.FROMDATE);
                var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
                var localISOTimeFROM = new Date(ddnn - tzoffset)
                    .toISOString()
                    .slice(0, 16);
                var prsname = data.PRSNAME != undefined ? data.PRSNAME : '' ;
                var prsname2 = data.PRSNAME2 != undefined ? data.PRSNAME2 : '' ;
                var finalname = (prsname=='')&&(prsname2=='') ? '' : ((prsname!='')&&(prsname2=='') ? prsname :((prsname=='')&&(prsname2!='')) ? prsname2 : prsname+ ' ' +prsname2)
                $("[id='fsoaction']").val(data.SOACTION);
                $("[id='fsoactioncode']").val(data.SOACTIONCODE);
                $("[id='ffromdate']").val(localISOTimeFROM);
                $("[id='fcomments']").val(data.COMMENTS);
                $("[id='ftrdrname']").val(data.NAME != undefined ? data.NAME : '');
                $("[id='ftrdrname']").prop("data-trdr",data.TRDR != undefined ? data.TRDR : '');
                $("[id='fprsname']").val(finalname);
                $("[id='fprsname']").prop("data-trdr",data.PRSN != undefined ? data.PRSN : '');
                $("[id='fphone01']").val(data.PHONE01);
                $("[id='fremarks']").val(data.REMARKS);
                
                $("#screenform .modal-content .modal-body")
                    .find("*")
                    .attr("disabled", true);
                $("#editm1").css("display", "block");
                $("#savem1").prop("disabled", true);
                $("#loader").css("display", "none");
                $("#screenform").modal("toggle");
            }
        });
    });
    
    /*When Screen Edit Button is pressed*/
    document.querySelector("#editm1").addEventListener("click", function () {
        $("#screenform .modal-content .modal-body")
            .find("*")
            .not(".locked")
            .attr("disabled", false);
        if($("#ftrdrname").val().length > 0){
            $('#fprsname').attr("disabled", false);
            $("#fprsnamesearch").attr("disabled", false);
        }
        document.querySelector("#savem1").disabled = false;
    });
    
    /*When New Button is pressed*/
    document.querySelector("#btnew").addEventListener("click", function () {
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
        $("[id='ftrdrname']").prop("data-trdr","");
        $("[id='fprsname']").val("");
        $("[id='fprsname']").prop("data-prsn","");
        $("[id='fprsname']").val();
        $("[id='fphone01']").val("");
        $("[id='fremarks']").val("");
        
        $("#screenform .modal-content .modal-body")
            .find('.locked')
            .attr("disabled", true);

        $("#screenform .modal-content .modal-body")
            .find("*")
            .not('.locked')
            .attr("disabled", false);
        $("[id='ffromdate']").attr("disabled", false);
        document.querySelector("#savem1").disabled = false;
        document.querySelector("#editm1").style.display = "none";
        $("#screenform").modal("toggle");
    });
    
    /*When Screen Χ Button is pressed*/
    document.querySelector("#cancelm1").addEventListener("click", function () {
        document.querySelector("#savem1").disabled = true;
        $("#screenform").modal("toggle");
    });
    
    /*When Screen cancel Button is pressed*/
    document.querySelector("#cancelm12").addEventListener("click", function () {
        document.querySelector("#savem1").disabled = true;
        $("#screenform").modal("toggle");
    });
    
    /*When Search Trdr is pressed*/
    document.querySelector("#ftrdrnamesearch").addEventListener("click", function () {
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
    
    /*When Click on Selector Name fill the inputs*/
    $("#Selectortrdrname").on("click", ".row", function () {
        $("#Selectortrdrname").css("display", "none");
        var id = $(this).data("slide");
        var name = $(this).children().text();
        $('#ftrdrname').val(name);
        $("#ftrdrname").prop("data-trdr",id);
        $('#fprsname').attr("disabled", false);
        $('#fprsnamesearch').attr("disabled", false);
    });
    
    document.addEventListener("click", function (e) {
        if ($("#Selectortrdrname").css("display") == "block") {
            let insidedropdown = e.target.closest("#Selectortrdrname");
            let insideparent = e.target.closest("#ftrdrname");
            let insidedbutton = e.target.closest("#ftrdrnamesearch");
            if (!insidedropdown && !insideparent &&!insidedbutton) {
                $("#Selectortrdrname").hide();
            }
        }
    });
});


var timer;
function trdrSelectorByName() {
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
                        $("#Selectortrdrname").css({"maxHeight": $("#Selectortrdrname").children().first().height()*8 +'px'}); 
                    }
                });
            }, 400);
        }else{
            clearTimeout(timer);
            $("#Selectortrdrname").css("display", "none");
        }
    }
}