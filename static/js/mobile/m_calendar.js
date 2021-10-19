$(document).ready(function () {
    /*When Screen Edit Button is pressed*/
    document.querySelector("#editm1").addEventListener("click", function () {
        $("#screenform .modal-content .modal-body")
            .find("*")
            .not(".locked")
            .attr("disabled", false);
        document.querySelector("#savem1").disabled = false;
    });

    /*When Screen Cancel Button is pressed*/
    document.querySelector("#cancelm1").addEventListener("click", function () {
        document.querySelector("#savem1").disabled = true;
        $("#screenform").modal("toggle");
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
            $("#screenform").modal("toggle");
            startload()
            if ($("#fsoaction").val() == "") {
                $.ajax({
                    url: "meetings/insert",
                    type: "POST",
                    data: {
                        series:$("#fsoactionseries").prop('data-id'),
                        trndate: $("#ffromdate").val(),
                        trdr: $("#ftrdr").val(),
                        finaldate: $("#ffinaldate").val(),
                        fromdate: $("#ffromdate").val(),
                        comments: $("#fcomments").val(),
                        remarks: $("#fremarks").val(),
                    },
                    success: function (data) {
                        calendarl.refetchEvents();
                        calendar.refetchEvents();
                        stopload()
                        if (data["success"]) {
                            $("#insertID").text(data["id"]);
                            $("#successmodal").modal("toggle");
                            setTimeout(function () {
                                $("#successmodal").modal("hide");
                            }, 2000);
                        } else {
                            $("#screenform").modal("toggle");
                            $("#insertIDFail").text(data["error"]);
                            $("#failuremodal").modal("toggle");
                            setTimeout(function () {
                                $("#screenform").modal("toggle");
                                $("#failuremodal").modal("hide");
                            }, 2000);
                        }
                    },
                });
            } else {
                $.ajax({
                    url: "meetings/update",
                    type: "POST",
                    data: {
                        soaction: $("#fsoaction").val(),
                        series:$("#fsoactionseries").val(),
                        trndate: $("#ffromdate").val(),
                        trdr: $("#ftrdr").val(),
                        fromdate: $("#ffromdate").val(),
                        finaldate: $("#ffinaldate").val(),
                        comments: $("#fcomments").val(),
                        remarks: $("#fremarks").val(),
                    },
                    success: function (data) {
                        calendarl.refetchEvents();
                        calendar.refetchEvents();
                        stopload()
                        if (data["success"]) {
                            $("#insertID").text(data["id"]);
                            $("#successmodal").modal("toggle");
                            setTimeout(function () {
                                $("#successmodal").modal("hide");
                            }, 2000);
                        } else {
                            $("#insertIDFail").text(data["error"]);
                            $("#failuremodal").modal("toggle");
                            setTimeout(function () {
                                $("#screenform").modal("toggle");
                                $("#failuremodal").modal("hide");
                            }, 2000);
                        }
                    },
                });
            }
        }
    });

    /*When Screen X Button is pressed*/
    document.querySelector("#cancelm12").addEventListener("click", function () {
        document.querySelector("#savem1").disabled = true;
        $("#screenform").modal("toggle");
    });

    /*When Right Click on SideBar*/
    $("body").on("contextmenu", "#sidebar-wrapper", function (e) {
        $("#contextMenu").css({
            display: "block",
            left: e.pageX,
            top: e.pageY,
        });
        return false;
    });

    /*When Click on ContextMenu*/
    $("#contextMenu").on("click", "a", function () {
        $("#contextMenu").hide();
    });

    /*When Search for customer by code*/
    $("#fcode").keyup(function () {
        if ($("#fcode").val().length > 2) {
            $.ajax({
                url: "/D1ServicesIN",
                method: "POST",
                data: {
                    service: "get",
                    object: "trdrcode",
                    code: "%" + $("#fcode").val() + "%",
                },
                success: function (d) {
                    $("#Selectorcode").empty();
                    var rect = document
                        .getElementById("fcode")
                        .parentElement.getBoundingClientRect();
                    var i = 0;
                    $.each(d.data, function (index, value) {
                        i++;
                        data = jQuery.parseJSON(JSON.stringify(d.data[index]));
                        $("#Selectorcode").append(
                            '<li class="dropdown-item disable-select" style="overflow-x: auto;">' +
                            '<div class="container-fluid" style="padding: 0px">' +
                            '<div data-slide="' +
                            data.TRDR +
                            '" class="row">' +
                            '<div class="col-3" style="overflow-x: hidden;">' +
                            '<a id="SelectorCode"">' +
                            data.CODE +
                            "</a>" +
                            "</div>" +
                            '<div class="col-9">' +
                            '<a id="SelectorName">' +
                            data.NAME +
                            "</a>" +
                            "</div>" +
                            "</div>" +
                            "</div>" +
                            "</li>"
                        );
                        if (i == 10) {return false;}
                    });
                    $("#Selectorcode")
                        .parent()
                        .css({ "padding-top": rect.bottom - rect.top });
                    $("#Selectorcode").css({
                        display: "block",
                        left: rect.left,
                        "margin-top": rect.bottom - rect.top,
                        width: rect.right - rect.left,
                    });
                },
            });
        } else {
            $("#Selectorcode").css("display", "none");
        }
    });

    /*When Click on series*/
    $("#fsoactionseries").on("click", function () {
        $("#fsoactionseries").css("border", "");
        if ($("Selectorseries").children().length==0){
            startload()
            $.ajax({
                url: "/D1ServicesIN",
                method: "POST",
                data: {
                  service: "get",
                  object: "soactionseries",
                },
                success: function (d) {
                    $("#Selectorseries").empty();
                    var rect = document
                        .getElementById("fsoactionseries")
                        .parentElement.getBoundingClientRect();
                    var i = 0;
                    $.each(d.data, function (index, value) {
                        data = jQuery.parseJSON(JSON.stringify(d.data[index]));
                        $("#Selectorseries").append(
                            '<li class="dropdown-item disable-select" style="overflow-x: auto;">' +
                                '<div class="container-fluid" style="padding: 0px">' +
                                    '<div data-slide="' + data.SERIES + '" data-name="'+ data.NAME +'" class="row">' +
                                        '<div class="col-2" style="overflow-x: hidden;">' +
                                            '<a id="SelectorSeriesCode">' + data.SERIES + '</a>' +
                                        '</div>' +
                                        '<div class="col-2" style="overflow-x: hidden;">' +
                                            '<a id="SelectorSeriesCode">' + data.CODE + '</a>' +
                                        '</div>' +
                                        '<div class="col-8">' +
                                            '<a id="SelectorSeriesName">' + data.NAME + "</a>" +
                                        '</div>' +
                                    "</div>" +
                                "</div>" +
                            "</li>"
                        );
                    });
                    if ($( window ).width()<576){
                        $("#Selectorseries")
                            .parent()
                            .css({ "margin-top": rect.bottom - rect.top });
                        $("#Selectorseries").css({
                            display: "block",
                            left: rect.left,
                            "margin-top": rect.bottom - rect.top,
                            width: rect.right - rect.left,
                        });
                    }else{
                        $("#Selectorseries").css({
                            display: "block",
                            left: rect.left,
                            "margin-top": rect.bottom - rect.top,
                            width: rect.right - rect.left,
                        });
                    }
                    stopload()
                    $("#Selectorseries").css("display", "block");
                }
            })
        }else{
            $("#Selectorseries").css("display", "block");
        }
    });

    /*When Click on ftrdr*/
    $("#fname").on("click", function () {
        $("#fname").css("border", "");
    });

    /*When Click on Selector Code fill the inputs*/
    $("#Selectorcode").on("click", ".row", function () {
        freezeClic = true;
        startload()
        $("#Selectorcode").css("display", "none");
        var id = $(this).data("slide");
        $.ajax({
            url: "/D1ServicesIN",
            method: "POST",
            data: {
                service: "get",
                object: "trdr",
                id: id,
            },
            success: function (d) {
                data = jQuery.parseJSON(JSON.stringify(d.data[0]));
                $("[id='ftrdr']").val(data.TRDR);
                $("[id='fcode']").val(data.CODE);
                $("[id='fname']").val(data.NAME);
                $("[id='faddress']").val(data.ADDRESS);
                $("[id='fphone01']").val(data.PHONE01);
            },
            complete: function () {
                stopload()
                freezeClic = false;
            },
        });
    });

    /*When Click on Selector Name fill the inputs*/
    $("#Selectorname").on("click", ".row", function () {
        freezeClic = true;
        startload()
        $("#Selectorname").css("display", "none");
        var id = $(this).data("slide");
        $.ajax({
            url: "/D1ServicesIN",
            method: "POST",
            data: {
                service: "get",
                object: "trdr",
                id: id,
            },
            success: function (d) {
                data = jQuery.parseJSON(JSON.stringify(d.data[0]));
                $("[id='ftrdr']").val(data.TRDR);
                $("[id='fcode']").val(data.CODE);
                $("[id='fname']").val(data.NAME);
                $("[id='faddress']").val(data.ADDRESS);
                $("[id='fphone01']").val(data.PHONE01);
            },
            complete: function () {
                stopload()
                freezeClic = false;
            },
        });
    });

    /*When Click on Selector Series fill the inputs*/
    $("#Selectorseries").on("click", ".row", function () {
        $("#Selectorseries").css("display", "none");
        var id = $(this).data("slide");
        var name = $(this).data("name")
        $('#fsoactionseries').prop('data-id',id);
        $('#fsoactionseries').val(name);
    });

    /*When Modal opens*/
    $("#screenform").on("hidden.bs.modal", function (e) {
        $('.required').each(function (i, el) {
            $(el).css("border", "");
        });
        $(".nav-link").removeClass("active");
        $(".tab-pane").removeClass("active show");
        $("#generalscreen-tab").addClass("active");
        $("#generalscreen").addClass("active show");
        var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
        var localISOTime = new Date(Date.now() - tzoffset)
            .toISOString()
            .slice(0, -1);
    });

    /*When focusout fromdate*/
    $("#ffromdate").on("focusout", function () {
        var ddnn = new Date($("#ffromdate").val());
        var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
        var localISOTimeFINAL = new Date(ddnn.setHours(ddnn.getHours() + 1) - tzoffset)
            .toISOString()
            .slice(0, 16);
        $("#ffinaldate").val(localISOTimeFINAL);
    });
});

function updAll(event) {
    $('[id="' + this.id + '"]').val($(this).val());
}

function expandAll() {
    $("#sidebar-wrapper .accordion-collapse").collapse("show");
}

function closeAll() {
    $("#sidebar-wrapper .accordion-collapse").collapse("hide");
}

let freezeClic = false;

document.addEventListener("click", function (e) {
    if ($("#Selectorname").css("display") == "block") {
        let inside = e.target.closest("#Selectorname");
        if (!inside) {
            $("#Selectorname").hide();
        }
    }

    if ($("#Selectorseries").css("display") == "block") {
        let inside = e.target.closest("#Selectorseries");
        if (!inside) {
            $("#Selectorseries").hide();
        }
    }
});

function gotomaps(){
    startload()
    var trdr =$("#ftrdr").val();
    $.ajax({
        url: "/D1ServicesIN",
        method: "POST",
        data: {
            service: "get",
            object: "trdraddress",
            trdr:trdr
        },
        success: function (d) {
            data = jQuery.parseJSON(JSON.stringify(d.data[0]));
            var address = data.ADDRESS == undefined ? "" : data.ADDRESS;
            var city = data.CITY == undefined ? "" : data.CITY;
            var zip = data.ZIP == undefined ? "" : data.ZIP;
            var district = data.DISTRICT == undefined ? "" : data.DISTRICT;
            var address = address +','+ city +','+ zip +','+ district;
            address = encodeURIComponent(address);
            stopload()
            if ((navigator.platform.indexOf('iPhone') != -1) || (navigator.platform.indexOf('iPad') != -1) || (navigator.platform.indexOf('iPod') != -1)){/* if we're on iOS, open in Apple Maps */
                window.open('http://maps.apple.com/?q=' + address);
            } else { /* else use Google */
                window.open('https://maps.google.com/maps?q=' + address);
            }
        }
    });
}

var timer;
function trdrSelectorByName() {
    if ($("#fname").val().length > 2) {
        clearTimeout(timer);
        timer = setTimeout(function validate() {
            var str = $("#fname").val().replace("*", "%");

            $.ajax({
                url: "/D1ServicesIN",
                method: "POST",
                data: {
                    service: "get",
                    object: "trdrname",
                    name: str + "%",
                },
                success: function (d) {
                    $("#Selectorname").empty();
                    var rect = document
                        .getElementById("fname")
                        .parentElement.getBoundingClientRect();
                    var i = 0;
                    $.each(d.data, function (index, value) {
                        i++;
                        data = jQuery.parseJSON(JSON.stringify(d.data[index]));
                        $("#Selectorname").append(
                            '<li class="dropdown-item disable-select" style="overflow-x: auto;">' +
                                '<div class="container-fluid" style="padding: 0px">' +
                                    '<div data-slide="' + data.TRDR + '" class="row">' +
                                        '<div class="col-3" style="overflow-x: hidden;">' +
                                            '<a id="SelectorCode">' + data.CODE + '</a>' +
                                        '</div>' +
                                        '<div class="col-9">' +
                                            '<a id="SelectorName">' + data.NAME + "</a>" +
                                        '</div>' +
                                    "</div>" +
                                "</div>" +
                            "</li>"
                        );
                        if (i == 10) {return false;}
                    });
                    $("#Selectorname")
                        .parent()
                        .css({ "padding-top": rect.bottom - rect.top });
                    $("#Selectorname").css({
                        display: "block",
                        left: rect.left,
                        "margin-top": rect.bottom - rect.top,
                        width: rect.right - rect.left,
                    });
                },
            });
        }, 400);
    } else {
        clearTimeout(timer);
        $("#Selectorname").css("display", "none");
    }
}

function startload(){
    $(".loaderr").css("display", "block");
    $("body").append('<div id="overlayyy"</div>');
}

function stopload(){
    $(".loaderr").css("display", "none");
    $("#overlayyy").remove();
}
