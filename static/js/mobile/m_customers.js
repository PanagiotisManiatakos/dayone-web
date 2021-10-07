window.addEventListener("contextmenu", e => e.preventDefault());
$(document).ready(function () {
    window.peopletable = $("#peopletable").DataTable({
        info: false,
        deferRender: true,
        scrollY: "75vh",
        scrollX: true,
        scrollCollapse: true,
        scroller: true,
        pageResize: true,
        nowrap :true,
        columns: [
            { title: "Κωδικός" },
            { title: "Όνομα" },
            { title: "Επωνυμία" },
            { title: "Τηλ. 1"},
            { title: "Τηλ. 2"},
            { title: "Email"},
            { title: "Εσωτερικό"},
            { title: "PRSN",className : "hide_column"},
        ]
    });
    window.openorderstable = $("#openorderstable").DataTable({
        info: false,
        deferRender: true,
        scrollY: "75vh",
        scrollX: true,
        scrollCollapse: true,
        scroller: true,
        pageResize: true,
        nowrap :true,
        columns: [
            { title: "FINDOC",className : "hide_column" },
            { title: "SOSOURCE",className : "hide_column" },
            { title: "Ημ/νία" },
            { title: "Παραστατικό"},
            { title: "TRDR",className : "hide_column"},
            { title: "Επωνυμία"},
            { title: "Μετασχ/μός"},
            { title: "Συνολική αξία"},
        ]
    });
    window.mtrltable = $("#mtrltable").DataTable({
        info: false,
        deferRender: true,
        scrollY: "75vh",
        scrollX: true,
        scrollCollapse: true,
        scroller: true,
        pageResize: true,
        nowrap :true,
        columns: [
            { data: 'MTRL', title: "MTRL",className : "hide_column" },
            { data: 'SENDBACK', title: "Προς Αποστολή", className : "hide_column"},
            { data: 'CODE', title: "Κωδικός."},
            { data: 'NAME', title: "Περιγραφή"},
            { data: 'QTY1', title: "Ποσ."},
            { data: 'DISC1PRC', title: "Εκπτ."},
            { data: 'PRICE',title: "Τιμή" },
            { data: 'LINEVAL',title: "Αξία" },
        ]
    });
    window.table = $("#example").DataTable({
        info: false,
        order: [[0, "desc"]],
        deferRender: true,
        scrollY: "100vh",
        scrollX: true,
        scrollCollapse: true,
        scroller: true,
        pageResize: true,
        select: true,
        columns: [
            { title: "Κωδικός" },
            { title: "Επωνυμία" },
            { title: "ΑΦΜ" },
            { title: "Διεύθυνση" },
            { title: "Τηλ. 1" },
            { title: "Email" },
            { title: "Υπόλοιπο" },
            { title: "TRDR" },
        ],
        columnDefs: [
            { className: "hide_column", targets: [7] }
        ],
    });

    $("#SearchPanel").on("keyup", function () {
        table.search(this.value).draw();
    });

    /*When Browse Button is pressed*/
    document.querySelector("#Load").addEventListener("click", function () {
        $("#loader").css("display", "block");
        var qname = document.getElementById("qname").value.replace("*", "%") + "%";
        var qcode = document.getElementById("qcode").value.replace("*", "%") + "%";

        $.ajax({
            url: "/D1ServicesIN",
            method: "POST",
            data: {
                service: "get",
                object: "customer",
                qname: qname,
                qcode: qcode,
            },
            success: function (data) {
                table.destroy();
                table = undefined;
                delete table;
                window.table = $("#example").DataTable({
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
                        { title: "Κωδικός", data: "CODE", defaultContent: "" },
                        { title: "Επωνυμία", data: "NAME", defaultContent: "" },
                        { title: "ΑΦΜ", data: "AFM", defaultContent: "" },
                        { title: "Διεύθυνση", data: "ADDRESS", defaultContent: "" },
                        { title: "Τηλ. 1", data: "PHONE01", defaultContent: "" },
                        { title: "Email", data: "EMAIL", defaultContent: "" },
                        { title: "Υπόλοιπο", data: "YPOL", defaultContent: "" },
                        { title: "TRDR", data: "TRDR", defaultContent: "" },
                    ],
                    columnDefs: [
                        { className: "hide_column", targets: [7] }],
                });
                $("#questionsdiv").css("display", "none");
                $("#tablediv").css("display", "block");
                table.columns.adjust().draw();
                $("#SearchPanel").prop("disabled", false);
                $("#btnrefresh").prop("disabled", false);
                $("#btnfilters").prop("disabled", false);
                $("#loader").css("display", "none");
            },
        });
    });

    /*When Filters Button is pressed*/
    document.querySelector("#btnfilters").addEventListener("click", function () {
        $("#btnfilters").prop("disabled", true);
        $("#btnrefresh").prop("disabled", true);
        $("#SearchPanel").prop("disabled", true);
        table.rows({ selected: true }).deselect();
        document.querySelector("#btndelete").disabled = true;
        $("#Load").css("display", "inline");
        $("#tablediv").css("display", "none");
        table.clear();
        table.draw();
        $("#questionsdiv").css("display", "block");
    });

    /*When Filters at kartela is pressed*/
    $("#kartelabtnfilters").on("click", function () {
        $("#kartelabtnfilters").prop("disabled", true);
        $("#kartelaquestions").css("display", "block");
        $("#kartelabody").css("display", "none");
    });

    /*When Refresh Button is pressed*/
    document.querySelector("#btnrefresh").addEventListener("click", function () {
        $("#loader").css("display", "block");
        var table1 = $(".display tbody");
        var qname = document.getElementById("qname").value.replace("*", "%") + "%";
        var qcode = document.getElementById("qcode").value.replace("*", "%") + "%";

        $.ajax({
            url: "/D1ServicesIN",
            method: "POST",
            data: {
                service: "get",
                object: "customer",
                qname: qname,
                qcode: qcode,
            },
            success: function (data) {
                table.destroy();
                table = undefined;
                delete table;
                window.table = $("#example").DataTable({
                    info: false,
                    deferRender: true,
                    scrollY: "75vh",
                    scrollX: true,
                    scrollCollapse: true,
                    scroller: true,
                    select: true,
                    nowrap :true,
                    data: data["data"],
                    columns: [
                        { title: "Κωδικός", data: "CODE", defaultContent: "" },
                        { title: "Επωνυμία", data: "NAME", defaultContent: "" },
                        { title: "ΑΦΜ", data: "AFM", defaultContent: "" },
                        { title: "Διεύθυνση", data: "ADDRESS", defaultContent: "" },
                        { title: "Τηλ. 1", data: "PHONE01", defaultContent: "" },
                        { title: "Email", data: "EMAIL", defaultContent: "" },
                        { title: "Υπόλοιπο", data: "YPOL", defaultContent: "" },
                        { title: "TRDR", data: "TRDR", defaultContent: "" },
                    ],
                    columnDefs: [{ className: "hide_column", targets: [7] }],
                });
                $("#loader").css("display", "none");
            },
        });
    });

    /*Refresh People*/
    function RefreshThePeople() {
        $("[id=loader]").css("display", "block");
        var trdr =$("#ftrdr").val();
        $.ajax({
            url: "/D1ServicesIN",
            method: "POST",
            data: {
                service: "get",
                object: "trdrpeople",
                trdr : trdr,
            },
            success: function (data) {
                peopletable.destroy();
                peopletable = undefined;
                delete peopletable;
                window.peopletable = $("#peopletable").DataTable({
                    info: false,
                    deferRender: true,
                    scrollX: true,
                    scrollCollapse: true,
                    scroller: true,
                    pageResize: true,
                    nowrap :true,
                    data: data["data"],
                    columns: [
                        { title: "Κωδικός", data: "CODE", defaultContent: "" },
                        { title: "Όνομα", data: "NAME", defaultContent: "" },
                        { title: "Επώνυμο", data: "NAME2", defaultContent: "" },
                        { title: "Τηλ. 1", data: "PHONE1", defaultContent: "" },
                        { title: "Τηλ. 2", data: "PHONE2", defaultContent: "" },
                        { title: "Email", data: "EMAIL", defaultContent: "" },
                        { title: "Εσωτερικό", data: "PHONEEXT", defaultContent: "" },
                        { title: "PRSN", data: "PRSN", defaultContent: "", className : "hide_column"},
                    ]
                });
                peopletable.columns.adjust();
                peopletable.draw();
                $("[id=loader]").css("display", "none");
            },
        });
    };

    /*When Single click a row*/
    /*$("#example").on("mouseup", "tr", function () {
        setTimeout(function () {
            if (counts()) {
                document.querySelector("#btndelete").disabled = false;
            } else {
                document.querySelector("#btndelete").disabled = true;
            }
        }, 1);

        function counts() {
            if (table.rows({ selected: true }).count() > 0) {
                return true;
            } else {
                return false;
            }
        }
    });*/

    /*When people modal opens adjust the columns to fit screen*/
    $('#peoplemodal').on('shown.bs.modal', function (e) {
        peopletable.columns.adjust().draw();
    })

    /*When OpenOrders modal opens adjust the columns to fit screen*/
    $('#openordersmodal').on('shown.bs.modal', function (e) {
        openorderstable.columns.adjust().draw();
    })

    /*When OpenOrdersScreenForm opens adjust the columns to fit screen*/
    $('#openordersscreenform').on('shown.bs.modal', function (e) {
        mtrltable.columns.adjust().draw();
    })

    $("#example").on("contextmenu", "tr", function (e) {
        table.rows().deselect();
        table.rows($(this)).select();
        $("#rowcontextMenu").css({
            display: "block",
            left: e.pageX,
            top: e.pageY,
        });
        return false;
    });

    /*When Single click a row*/
    $("#example").on("click", "tr", function () {
        $("#loader").css("display", "block");
        table.rows().deselect();
        table.rows($(this)).select();
        var d = table.rows({ selected: true }).data().toArray();
        $.ajax({
            url: "/D1ServicesIN",
            method: "POST",
            data: {
                service: "get",
                object: "trdr",
                id: d[0]["TRDR"],
            },
            success: function (d) {
                data = jQuery.parseJSON(JSON.stringify(d.data[0]));
                $("[id='ftrdr']").val(data.TRDR);
                $("[id='fcode']").val(data.CODE);
                $("[id='fname']").val(data.NAME);
                $("[id='fafm']").val(data.AFM);
                $("[id='faddress']").val(data.ADDRESS);
                $("[id='femail']").val(data.EMAIL);
                $("[id='fphone01']").val(data.PHONE01);
                $("[id='fphone02']").val(data.PHONE02);
                $("[id='ftown']").val(data.CITY);
                $("[id='fdistrict']").val(data.DISTRICT);
                $("[id='fzip']").val(data.ZIP);
                $("[id='fremarks']").val(data.REMARKS);
                $("#screenform .modal-content .modal-body .tab-content")
                    .find("*")
                    .attr("disabled", true);
                $("#editm1").css("display", "block");
                $("#savem1").prop("disabled", true);
                $("#loader").css("display", "none");
                $("#screenform").modal("toggle");
            },
        });
    });

    /*When Single click a people row*/
    $("#peopletable").on("click", "tr", function () {
        peopletable.rows().deselect();
        peopletable.rows($(this)).select();
        var d = peopletable.rows({ selected: true }).data().toArray();
        if(d.length>0){
            $("[id=loader]").css("display", "block");
            $.ajax({
                url: "/D1ServicesIN",
                method: "POST",
                data: {
                    service: "get",
                    object: "prsn",
                    prsn: d[0]["PRSN"],
                },
                success: function (d) {
                    data = jQuery.parseJSON(JSON.stringify(d.data[0]));
                    $("[id='fprsn']").val(data.PRSN);
                    $("[id='fpeoplecode']").val(data.CODE);
                    $("[id='fpeoplename']").val(data.NAME);
                    $("[id='fpeoplename2']").val(data.NAME2);
                    $("[id='fpeoplemobilephone']").val(data.MOBILEPHONE);
                    $("[id='fpeoplefax']").val(data.FAX);
                    $("[id='fpeopleemail']").val(data.EMAIL);
                    $("[id='fpeoplephone01']").val(data.PHONE1);
                    $("[id='fpeoplephone02']").val(data.PHONE2);
                    $("#peoplescreenform .modal-content .modal-body")
                        .find("*")
                        .attr("disabled", true);
                    $("#editmpeoplescreen1").css("display", "block");
                    $("#savempeoplescreen1").prop("disabled", true);
                    $("[id=loader]").css("display", "none");
                    $("#peoplescreenform").modal("toggle");
                },
            });
        }
    });

    /*When Single click a openorders row*/
    $("#openorderstable").on("click", "tr", function () {
        openorderstable.rows().deselect();
        openorderstable.rows($(this)).select();
        var d = openorderstable.rows({ selected: true }).data().toArray();
        if(d.length>0){
            $("[id=loader]").css("display", "block");
            $.ajax({
                url: "/D1ServicesIN",
                method: "POST",
                data: {
                    service: "get",
                    object: "findoc",
                    id:d[0]["FINDOC"]
                },
                success: function (d) {
                    mtrltable.clear().draw().destroy();
                    mtrltable = undefined;
                    delete mtrltable;
                    header = d['data']['header'];
                    details = d['data']['details']
                    $("[id='fopenordersfindoc']").val(header[0]['FINDOC']);
                    $("[id='fopenordersfincode']").val(header[0]['FINCODE']);
                    $("[id='fopenordersseries']").val(header[0]['SERIES']);
                    $("[id='fopenorderstrndate']").val(header[0]['TRNDATE'].substring(0,10));
                    $("[id='fopenorderstrdr']").val(header[0]['TRDR']);
                    $("[id='fopenorderstrdrname']").val(header[0]['TRDRNAME']);
                    $("[id='fopenorderstrdrcode']").val(header[0]['TRDRCODE']);

                    window.mtrltable = $("#mtrltable").DataTable({
                        info: false,
                        deferRender: true,
                        scrollY: "75vh",
                        scrollX: true,
                        scrollCollapse: true,
                        scroller: true,
                        pageResize: true,
                        nowrap :true,
                        columns: [
                            { data: 'MTRL', title: "MTRL",className : "hide_column" },
                            { data: 'SENDBACK' , title: "SENDBACK",className : "hide_column" },
                            { data: 'CODE', title: "Κωδικός."},
                            { data: 'NAME', title: "Περιγραφή"},
                            { data: 'QTY1', title: "Ποσ."},
                            { data: 'DISC1PRC',title: "Εκπτ." },
                            { data: 'PRICE',title: "Τιμή" },
                            { data: 'LINEVAL',title: "Αξία" },
                        ]
                    });
                    $.each(details, function (index, value) {
                        mtrltable.row.add( {
                            "MTRL"      : this['MTRL'],
                            "SENDBACK"  : 0,
                            "CODE"      : this['CODE'],
                            "NAME"      : this['NAME'],
                            "QTY1"      : this['QTY1'],
                            "DISC1PRC"  : this['DISC1PRC'],
                            "PRICE"     : this['PRICE'],
                            "LINEVAL"   : this['LINEVAL']
                        } ).draw();
                    });
                    $("[id=loader]").css("display", "none");
                    $("#openordersscreenform").modal("toggle");
                },
            });
        }
    });

    /*When Single click a itelines row*/
    $("#mtrltable").on("click", "tr", function () {
        mtrltable.rows().deselect();
        mtrltable.rows($(this)).select();
        var data = mtrltable.rows({ selected: true }).data().toArray();
        if(data.length>0){
            $("[id=loader]").css("display", "block");
            $("[id='fitelinesupdate']").val(1);
            $("[id='fitelinesmtrl']").val(data[0]['MTRL']);
            $("[id='fitelinescode']").val(data[0]['CODE']);
            $("[id='fitelinesname']").val(data[0]['NAME']);
            $("[id='fitelinesdprice']").val(data[0]['PRICE']);
            $("[id='fitelinesqty1']").val(data[0]['QTY1']);
            $("[id='fitelinesdisc1prsc']").val(data[0]['DISC1PRC']);

            $("[id=loader]").css("display", "none");
            $("#itelinesmodal").modal("toggle");
        }
    });

    /*When New Button is pressed*/
    document.querySelector("#btnew").addEventListener("click", function () {
        $("[id='fcode']").val("");
        $("[id='fname']").val("");
        $("[id='fafm']").val("");
        $("[id='faddress']").val("");
        $("[id='fphone01']").val("");
        $("[id='fphone02']").val("");
        $("[id='femail']").val("");
        $("[id='fremarks']").val("");
        $("[id='fzip']").val("");
        $("[id='fdistrict']").val("");
        $("[id='ftown']").val("");
        $("#screenform .modal-content .modal-body .tab-content")
            .find("*")
            .attr("disabled", false);
        document.querySelector("#savem1").disabled = false;
        document.querySelector("#editm1").style.display = "none";
        $("#screenform").modal("toggle");
    });

    /*When People New Button is pressed*/
    document.querySelector("#btnewpeople").addEventListener("click", function () {
        $("[id='fprsn']").val("");
        $("[id='fpeoplecode']").val("*");
        $("[id='fpeoplename']").val("");
        $("[id='fpeoplename2']").val("");
        $("[id='fpeoplephone01']").val("");
        $("[id='fpeoplephone02']").val("");
        $("[id='fpeopleemail']").val("");
        $("[id='fpeoplemobilephone']").val("");
        $("[id='fpeoplefax']").val("");
        $("#peoplescreenform .modal-content .modal-body")
            .find("*")
            .attr("disabled", false);
        document.querySelector("#savempeoplescreen1").disabled = false;
        document.querySelector("#editmpeoplescreen1").style.display = "none";
        $("#peoplescreenform").modal("toggle");
    });

    /*When New Itelines Button is pressed*/
    document.querySelector("#additelines").addEventListener("click", function () {
        $("[id='fitelinesmtrl']").val("");
        $("[id='fitelinesupdate']").val(0);
        $("[id='fitelinescode']").val("");
        $("[id='fitelinesname']").val("");
        $("[id='fitelinesdprice']").val("");
        $("[id='fitelinesdisc1prsc']").val("");
        $("[id='fitelinesqty1']").val("");
        $("#itelinesmodal").modal("toggle");
    });

    /*When Delete Button is pressed*/
    document.querySelector("#btndelete").addEventListener("click", function () {
        $("#deleteform").modal("toggle");
    });

    /*When Screen Save Button is pressed*/
    $("#savem1").click(function () {
        $("#screenform").modal("toggle");
        $("#loader").css("display", "block");
        var trdr = $("#ftrdr").val();
        var code = $("#fcode").val();
        var name = $("#fname").val();
        var afm = $("#fafm").val();
        var address = $("#faddress").val();
        var phone01 = $("#fphone01").val();
        var phone02 = $("#fphone02").val();
        var email = $("#femail").val();
        var remarks = $("#fremarks").val();
        var town = $("#ftown").val();
        var zip = $("#fzip").val();
        var district = $("#fdistrict").val();
        if (trdr == "") {
            $.ajax({
                url: "customers/insert",
                type: "POST",
                data: {
                    code: code,
                    name: name,
                    afm: afm,
                    address: address,
                    phone01: phone01,
                    phone02: phone02,
                    email: email,
                    remarks: remarks,
                    town: town,
                    zip: zip,
                    district: district,
                },
                success: function (data) {
                    $("#loader").css("display", "none");
                    if (data["success"]) {
                        if (!$("#btnrefresh").prop("disabled")) {
                            $("#btnrefresh").click();
                        }
                        $("#insertID").text(data["id"]);
                        $("#successmodal").modal("toggle");
                        setTimeout(function () {
                            $("#successmodal").modal("hide");
                        }, 2000);
                    } else {
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
                url: "customers/update",
                type: "POST",
                data: {
                    trdr: trdr,
                    code: code,
                    name: name,
                    afm: afm,
                    address: address,
                    phone01: phone01,
                    phone02: phone02,
                    email: email,
                    remarks: remarks,
                    town: town,
                    zip: zip,
                    district: district,
                },
                success: function (data) {
                    if (data["success"]) {
                        $("#loader").css("display", "none");
                        $("#btnrefresh").click();
                        $("#insertID").text(data["id"]);
                        $("#successmodal").modal("toggle");
                        setTimeout(function () {
                            $("#successmodal").modal("hide");
                        }, 2000);
                    } else {
                        $("#insertIDFail").text(data["error"]);
                        $("#failuremodal").modal("toggle");
                        setTimeout(function () {
                            $("#failuremodal").modal("hide");
                        }, 3000);
                    }
                },
            });
        }
    });

    /*When PeopleScreen Save Button is pressed*/
    $("#savempeoplescreen1").click(function () {
        $("[id=loader]").css("display", "block");
        var prsn = $("#fprsn").val();
        var code = $("#fpeoplecode").val();
        var name = $("#fpeoplename").val();
        var name2 = $("#fpeoplename2").val();
        var phone1 = $("#fpeoplephone01").val();
        var phone2 = $("#fpeoplephone02").val();
        var email = $("#fpeopleemail").val();
        var fax = $("#fpeoplefax").val();
        if (prsn == "") {
            $.ajax({
                url: "trdprsn/insert",
                type: "POST",
                data: {
                    code: code,
                    name: name,
                    name2: name2,
                    phone1: phone1,
                    phone2: phone2,
                    email: email,
                    fax:fax,
                    trdr:$("#ftrdr").val()
                },
                success: function (data) {
                    $("[id=loader]").css("display", "none");
                    if (data["success"]) {
                        $("#peoplescreenform").modal("toggle");
                        RefreshThePeople();
                        $("#insertID").text(data["id"]);
                        $("#successmodal").modal("toggle");
                        setTimeout(function () {
                            $("#successmodal").modal("hide");
                        }, 2000);
                    } else {
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
                url: "prsn/update",
                type: "POST",
                data: {
                    prsn:prsn,
                    code: code,
                    name: name,
                    name2: name2,
                    phone1: phone1,
                    phone2: phone2,
                    email: email,
                    fax:fax,
                },
                success: function (data) {
                    $("[id=loader]").css("display", "none");
                    if (data["success"]) {
                        $("#peoplescreenform").modal("toggle");
                        RefreshThePeople();
                        $("#insertID").text(data["id"]);
                        $("#successmodal").modal("toggle");
                        setTimeout(function () {
                            $("#successmodal").modal("hide");
                        }, 2000);
                    } else {
                        $("#insertIDFail").text(data["error"]);
                        $("#failuremodal").modal("toggle");
                        setTimeout(function () {
                            $("#failuremodal").modal("hide");
                        }, 3000);
                    }
                },
            });
        }
    });

    /*When ItelinesScreen Save Button is pressed*/
    $("#savemitelinesscreen1").click(function () {
        $("[id='loader']").css("display", "block");
        if ($("[id='fitelinesupdate']").val()==1){
            upd = mtrltable.rows({ selected: true }).data();
            upd['MTRL'] = $("[id='fitelinesmtrl']").val();
            upd['SENDBACK'] = 1
            upd['CODE'] =  $("[id='fitelinescode']").val();
            upd['NAME'] =  $("[id='fitelinesname']").val();
            upd['QTY1'] = $("[id='fitelinesqty1']").val();
            upd['DISC1PRC'] = $("[id='fitelinesdisc1prsc']").val();
            upd['PRICE'] = $("[id='fitelinesdprice']").val();
            upd['LINEVAL'] = $("[id='fitelinesdprice']").val();
            mtrltable.row({ selected: true }).data(upd).draw();
            $("#itelinesmodal").modal("toggle");
        }else if ($("[id='fitelinesupdate']").val()==0){
            mtrltable.row.add({
                'MTRL'      : $("[id='fitelinesmtrl']").val(),
                'SENDBACK'  : 1,
                'CODE'      : $("[id='fitelinescode']").val(),
                'NAME'      : $("[id='fitelinesname']").val(),
                'QTY1'      : $("[id='fitelinesqty1']").val(),
                'DISC1PRC'  : $("[id='fitelinesdisc1prsc']").val(),
                'PRICE'     : $("[id='fitelinesdprice']").val(),
                'LINEVAL'   : $("[id='fitelinesdprice']").val(),
            }).draw();
            $("#itelinesmodal").modal("toggle");
        }
        $("[id='loader']").css("display", "none");
    });

    /*When PronOrdersPrintoutForm Button is pressed*/
    $("#openordersprintoutform").click(function () {
        $("[id=loader]").css("display", "block");
        $.ajax({
            url: "getPrintOutForms",
            type: "POST",
            data: {
                sosource : 1351
            },
            success: function (d) {
                $.each(d.data, function (index, value) {
                    data = jQuery.parseJSON(JSON.stringify(d.data[index]));
                    $("#printoutformselection").append(
                        '<option value="' + data.TEMPLATES + '">'+
                            '<div class="row" style="padding: 0px">' +
                                '<div class="col-3">' +
                                    '<a">' + data.TEMPLATES + '</a>' +
                                '</div>' +
                                '<div class="col-9" style="overflow-x: hidden;">' +
                                    '<a">' + data.NAME + '</a>' +
                                '</div>' +
                            "</div>" +
                        '</option>'
                    );
                });
                $("[id=loader]").css("display", "none");
                $("#printmodal").modal("toggle");
            }
        });
    });

    /*When Select printoutform and press print Button is pressed*/
    $("#savemprintscreen1").click(function () {
        id = $("#fopenordersfindoc").val();
        select = document.getElementById('printoutformselection');
        $.ajax({
            url: "/D1ServicesIN",
            method: "POST",
            data: {
                service     : "get",
                object      : "printoutform",
                ObjectName  : 'SALDOC',
                FormName    : "",
                id          : id,
                TemplateCode: select.options[select.selectedIndex].value
            },
            success: function (data) {
                window.open(data['data'],'_blank');
            }
        });
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

    /*When Click out of ContextMenu*/
    document.addEventListener("click", function (e) {
        if ($("#contextMenu").css("display") == "block") {
            let inside = e.target.closest("#contextMenu");
            if (!inside) {
                $("#contextMenu").hide();
            }
        }
    });

    /*When Click on RowContextMenu*/
    $("#rowcontextMenu").on("click", "a", function () {
        $("#rowcontextMenu").hide();
    });

    /*When Click out of RowContextMenu*/
    document.addEventListener("click", function (e) {
        if ($("#rowcontextMenu").css("display") == "block") {
            let inside = e.target.closest("#rowcontextMenu");
            if (!inside) {
                $("#rowcontextMenu").hide();
            }
        }
    });

    /*When Screen Edit Button is pressed*/
    document.querySelector("#editm1").addEventListener("click", function () {
        $("#screenform .modal-content .modal-body .tab-content")
            .find("*")
            .attr("disabled", false);
        document.querySelector("#savem1").disabled = false;
    });

    /*When PeopleScreen Edit Button is pressed*/
    document.querySelector("#editmpeoplescreen1").addEventListener("click", function () {
        $("#peoplescreenform .modal-content .modal-body")
            .find("*")
            .attr("disabled", false);
        document.querySelector("#savempeoplescreen1").disabled = false;
    });

    /*When Screen Cancel Button is pressed*/
    document.querySelector("#cancelm1").addEventListener("click", function () {
        document.querySelector("#savem1").disabled = true;
        $("#screenform").modal("toggle");
    });

    /*When PeopleScreen X Button is pressed*/
    document.querySelector("#cancelmpeoplescreen1").addEventListener("click", function () {
        document.querySelector("#savempeoplescreen1").disabled = true;
        $("#peoplescreenform").modal("toggle");
    });

    /*When People List X Button is pressed*/
    document.querySelector("#cancelmpeople1").addEventListener("click", function () {
        $("#peoplemodal").modal("toggle");
    });

    /*When Kartela X Button is pressed*/
    document.querySelector("#cancelmkartela1").addEventListener("click", function () {
        $("#kartelamodal").modal("toggle");
    });

    /*When Screen cancel Button is pressed*/
    document.querySelector("#cancelm12").addEventListener("click", function () {
        document.querySelector("#savem1").disabled = true;
        $("#screenform").modal("toggle");
    });

    /*When PeopleScreen cancel Button is pressed*/
    document.querySelector("#cancelmpeoplescreen12").addEventListener("click", function () {
        $("#peoplescreenform").modal("toggle");
    });

    /*When ItelinesScreen cancel Button is pressed*/
    document.querySelector("#cancelmitelinescreen12").addEventListener("click", function () {
        $("#itelinesmodal").modal("toggle");
    });

    /*When OpenOrdersModal X Button is pressed*/
    document.querySelector("#cancelmopenorders1").addEventListener("click", function () {
        $("#openordersmodal").modal("toggle");
    });

    /*When Delete Cancel Button is pressed*/
    document.querySelector("#cancelm2").addEventListener("click", function () {
        $("#deleteform").modal("toggle");
    });

    /*When OpenOrdersScreen X Button is pressed*/
    document.querySelector("#cancelmopenordersscreen1").addEventListener("click", function () {
        $("#openordersscreenform").modal("toggle");
    });

    /*When Itelines X Button is pressed*/
    document.querySelector("#cancelmitelines1").addEventListener("click", function () {
        $("#itelinesmodal").modal("toggle");
    });

    /*When Itelines Cancel Button is pressed*/
    document.querySelector("#cancelmitelinescreen12").addEventListener("click", function () {
        $("#itelinesmodal").modal("toggle");
    });

    /*When Delete X Button is pressed*/
    document.querySelector("#cancelm22").addEventListener("click", function () {
        $("#deleteform").modal("toggle");
    });

    /*When Delete Save Button is pressed*/
    document.querySelector("#savem2").addEventListener("click", function () {
        $("#deleteform").modal("toggle");
        $("#loader").css("display", "block");
        var d = table.rows({ selected: true }).data().toArray();
        var count = 0;
        var err = [];
        for (let i = 0; i < d.length; i++) {
            if (d.length == 1) {
                $.ajax({
                    url: "customers/delete",
                    type: "POST",
                    data: { id: d[i]["TRDR"] },
                    success: function (data) {
                        $("#loader").css("display", "none");
                        if (data["success"]) {
                            $("#btnrefresh").click();
                            $("#deletesuccessmodal").modal("toggle");
                            setTimeout(function () {
                                $("#deletesuccessmodal").modal("hide");
                            }, 2000);
                        } else {
                            $("#deleteIDFail").text(data["error"]);
                            $("#deletefailuremodal").modal("toggle");
                            setTimeout(function () {
                                $("#deletefailuremodal").modal("hide");
                            }, 3000);
                        }
                    },
                });
            } else {
                $.ajax({
                    url: "customers/delete",
                    type: "POST",
                    data: { id: d[i]["TRDR"] },
                    success: function (data) {
                        if (!data["success"]) {
                            err[count] = d[i]["NAME"];
                            count = count + 1;
                        }
                    },
                    complete: function () {
                        if (i + 1 == d.length) {
                            if (count > 0) {
                                if (count != d.length) {
                                    var countSuccess = d.length - count;
                                    let textSuccess = "Επιτυχής διαγραφή : " + countSuccess;
                                    let textFail = "Πρόβλημα σε " + count + " εγγραφές.<br>";
                                    err.forEach(mfun);
                                    function mfun(item, index) {
                                        textFail += index + 1 + ": " + item + "<br>";
                                    }
                                    $("#btnrefresh").click();
                                    document.getElementById("multipledeleteID").innerHTML = textSuccess;
                                    document.getElementById("multipledeleteIDFail").innerHTML = textFail;
                                    $("#loader").css("display", "none");
                                    $("#deletemultiplefailuremodal").modal("toggle");
                                    setTimeout(function () {
                                        $("#deletemultiplefailuremodal").modal("hide");
                                    }, 4000);
                                } else {
                                    $("#loader").css("display", "none");
                                    $("#deleteIDFail").text("Δεν μπόρεσε να γίνει καμία διαγραφή");
                                    $("#deletefailuremodal").modal("toggle");
                                    setTimeout(function () {
                                        $("#deletefailuremodal").modal("hide");
                                    }, 3000);
                                }
                            } else {
                                $("#btnrefresh").click();
                                $("#loader").css("display", "none");
                                $("#deletesuccessmodal").modal("toggle");
                                setTimeout(function () {
                                    $("#deletesuccessmodal").modal("hide");
                                }, 2000);
                            }
                        }
                    },
                });
            }
        }
        table.rows().deselect();
        document.querySelector("#btndelete").disabled = true;
    });

    const sidebarToggle = document.body.querySelector("#sidebarToggle");

    sidebarToggle.addEventListener("click", (event) => {
        event.preventDefault();
        document.body.classList.toggle("sb-sidenav-toggled");
        localStorage.setItem("sb|sidebar-toggle",document.body.classList.contains("sb-sidenav-toggled"));
        setTimeout(function () {
            table.columns.adjust();
            table.draw();
        }, 250);
    });

    $("#screenform").on("hidden.bs.modal", function (e) {
        $(".nav-link").removeClass("active");
        $(".tab-pane").removeClass("active show");
        $("#generalscreen-tab").addClass("active");
        $("#generalscreen").addClass("active show");
        var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
        var localISOTime = new Date(Date.now() - tzoffset)
            .toISOString()
            .slice(0, -1);
    });

    /*When Click on SelectorMtrlName fill the inputs*/
    $("#Selectormtrlname").on("click", ".row", function () {
        $("[id='loader']").css("display", "block");
        $("#Selectormtrlname").css("display", "none");
        var id = $(this).data("slide");
        $.ajax({
            url: "/D1ServicesIN",
            method: "POST",
            data: {
                service: "get",
                object: "mtrl",
                id: id,
            },
            success: function (d) {
                data = jQuery.parseJSON(JSON.stringify(d.data[0]));
                $("[id='fitelinesmtrl']").val(data.MTRL);
                $("[id='fitelinescode']").val(data.CODE);
                $("[id='fitelinesname']").val(data.NAME);
                $("[id='fitelinesdisc1prsc']").val(data.SODISCOUNT);
                $("[id='fitelinesdprice']").val(data.PRICEW);
                $("[id='fitelinesqty1']").val(1);
            },
            complete: function () {
                $("[id='loader']").css("display", "none");
            },
        });
    });

    /*When Click on SelectorMtrlName fill the inputs*/
    $("#Selectormtrlcode").on("click", ".row", function () {
        $("[id='loader']").css("display", "block");
        $("#Selectormtrlcode").css("display", "none");
        var id = $(this).data("slide");
        $.ajax({
            url: "/D1ServicesIN",
            method: "POST",
            data: {
                service: "get",
                object: "mtrl",
                id: id,
            },
            success: function (d) {
                data = jQuery.parseJSON(JSON.stringify(d.data[0]));
                $("[id='fitelinesmtrl']").val(data.MTRL);
                $("[id='fitelinescode']").val(data.CODE);
                $("[id='fitelinesname']").val(data.NAME);
                $("[id='fitelinesdisc1prsc']").val(data.SODISCOUNT);
                $("[id='fitelinesdprice']").val(data.PRICEW);
                $("[id='fitelinesqty1']").val(1);
            },
            complete: function () {
                $("[id='loader']").css("display", "none");
            },
        });
    });

    document.addEventListener("click", function (e) {
        if ($("#Selectormtrlname").css("display") == "block") {
            let inside = e.target.closest("#Selectormtrlname");
            if (!inside) {
                $("#Selectormtrlname").hide();
            }
        }else if ($("#Selectormtrlcode").css("display") == "block") {
            let inside = e.target.closest("#Selectormtrlcode");
            if (!inside) {
                $("#Selectormtrlcode").hide();
            }
        }
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

function gotomaps(){
    $("[id='loader']").css("display", "block");
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
            var address = address +' '+ city +' '+ zip +' '+ district;
            $("[id='loader']").css("display", "none");
            if ((navigator.platform.indexOf('iPhone') != -1) || (navigator.platform.indexOf('iPad') != -1) || (navigator.platform.indexOf('iPod') != -1)){/* if we're on iOS, open in Apple Maps */
                window.open('http://maps.apple.com/?q=' + address);
            } else { /* else use Google */
                window.open('https://maps.google.com/maps?q=' + address);
            }
        }
    });
}

function makephonecall(id,phone){
    id.href = "tel:"+phone.value;
}

function emailcall(id,email){
    id.href = "mailto:"+email.value;
}

function gotopeople(){
    $("[id=loader]").css("display", "block");
    var trdr =$("#ftrdr").val();
    $.ajax({
        url: "/D1ServicesIN",
        method: "POST",
        data: {
            service: "get",
            object: "trdrpeople",
            trdr : trdr,
        },
        success: function (data) {
            if(data['data']!=undefined){
                peopletable.destroy();
                peopletable = undefined;
                delete peopletable;
                window.peopletable = $("#peopletable").DataTable({
                    info: false,
                    deferRender: true,
                    scrollY: "100vh",
                    scrollX: true,
                    scrollCollapse: true,
                    scroller: true,
                    pageResize: true,
                    nowrap :true,
                    data: data["data"],
                    columns: [
                        { title: "Κωδικός", data: "CODE", defaultContent: "" },
                        { title: "Όνομα", data: "NAME", defaultContent: "" },
                        { title: "Επώνυμο", data: "NAME2", defaultContent: "" },
                        { title: "Τηλ. 1", data: "PHONE1", defaultContent: "" },
                        { title: "Τηλ. 2", data: "PHONE2", defaultContent: "" },
                        { title: "Email", data: "EMAIL", defaultContent: "" },
                        { title: "Εσωτερικό", data: "PHONEEXT", defaultContent: "" },
                        { title: "PRSN", data: "PRSN", defaultContent: "", className : "hide_column"},
                    ]
                });
            }else{
                peopletable.destroy();
                peopletable = undefined;
                delete peopletable;
                window.peopletable = $("#peopletable").DataTable({
                    info: false,
                    deferRender: true,
                    scrollY: "100vh",
                    scrollX: true,
                    scrollCollapse: true,
                    scroller: true,
                    pageResize: true,
                    nowrap :true,
                });
                peopletable.clear().draw();
            }

            $("[id=loader]").css("display", "none");

            $("#peoplemodal").modal("toggle");
        },
    });
}

function gotokartela(){
    $("[id='kartelabody']").empty();
    $("[id='kartelaquestions']").css("display", "block");
    $("#kartelabtnfilters").prop("disabled", true);
    $("#kartelamodal").modal("toggle");
}

function gotoopenorders(){
    $("[id=loader]").css("display", "block");
    var trdr =$("#ftrdr").val();
    $.ajax({
        url: "/D1ServicesIN",
        method: "POST",
        data: {
            service: "get",
            object: "trdropenorders",
            trdr : trdr,
        },
        success: function (data) {
            if(data['data']!=undefined){
                openorderstable.destroy();
                openorderstable = undefined;
                delete openorderstable;
                window.openorderstable = $("#openorderstable").DataTable({
                    info: false,
                    deferRender: true,
                    scrollY: "100vh",
                    scrollX: true,
                    scrollCollapse: true,
                    scroller: true,
                    pageResize: true,
                    nowrap :true,
                    data: data["data"],
                    columns: [
                        { title: "FINDOC", data: "FINDOC" , className : "hide_column" },
                        { title: "SOSOURCE", data: "SOSOURCE", className : "hide_column" },
                        { title: "Ημ/νία", data: "TRNDATE" },
                        { title: "Παραστατικό", data: "FINCODE"},
                        { title: "TRDR", data: "TRDR", className : "hide_column"},
                        { title: "Επωνυμία", data: "TRDRNAME"},
                        { title: "Μετασχ/μός", data: "FULLYTRANSF"},
                        { title: "Συνολική αξία", data: "SUMAMNT"},
                    ]
                });
            }else{
                openorderstable.destroy();
                openorderstable = undefined;
                delete openorderstable;
                window.openorderstable = $("#openorderstable").DataTable({
                    info: false,
                    deferRender: true,
                    scrollY: "100vh",
                    scrollX: true,
                    scrollCollapse: true,
                    scroller: true,
                    pageResize: true,
                    nowrap :true,
                });
                openorderstable.clear().draw();
            }

            $("[id=loader]").css("display", "none");

            $("#openordersmodal").modal("toggle");
        },
    });
}

function loadkartela(){
    $("[id='kartelabody']").empty();
    $("[id='loader']").css("display", "block");
    $("[id='kartelaquestions']").css("display", "none");
    $("[id='kartelabody']").css("display", "block");
    event.preventDefault();
    var trdrname = $('#fname').val();
    var fdate = $('#karteladate').val();
    $.ajax({
        url: "/getKartela",
        method: "POST",
        data: {
            trdrname:trdrname,
            fdate:fdate
        },
        success: function(data){
            var scriptaki = '<script>'+
                                '$(".s1-report-container").click(function () {'+
                                    'alert("patisa");'+
                                '})'+
                            '</script>';
            $("#kartelabody").append(data['css']);
            $("#kartelabody").append(data['script']);
            $("#kartelabody").append(scriptaki);
            $("#kartelabody").append(data['body'].substring(0, data['body'].length - 1).substring(1));

            $("#kartelabtnfilters").prop("disabled", false);
            $("[id='loader']").css("display", "none");
        }
    });
}

var timer;
function mtrlSelectorByName() {
    if ($("#fitelinesname").val().length > 2) {
        clearTimeout(timer);
        timer = setTimeout(function validate() {
            var str = $("#fitelinesname").val().replace("*", "%");

            $.ajax({
                url: "/D1ServicesIN",
                method: "POST",
                data: {
                    service     :   "get",
                    object      :   "mtrlname",
                    sodtype     :   51,
                    name        :   str + "%",
                },
                success: function (d) {
                    $("#Selectormtrlname").empty();
                    var rect = document
                        .getElementById("fitelinesname")
                        .parentElement.getBoundingClientRect();
                    var i = 0;
                    $.each(d.data, function (index, value) {
                        i++;
                        data = jQuery.parseJSON(JSON.stringify(d.data[index]));
                        $("#Selectormtrlname").append(
                            '<li class="dropdown-item disable-select" style="overflow-x: auto;">' +
                                '<div class="container-fluid" style="padding: 0px">' +
                                    '<div data-slide="' + data.MTRL + '" class="row">' +
                                        '<div class="col-3" style="overflow-x: hidden;">' +
                                            '<a id="SelectorCode">' + data.CODE + '</a>' +
                                        '</div>' +
                                        '<div class="col-9">' +
                                            '<a id="SelectorName">' + data.NAME + '</a>' +
                                        '</div>' +
                                    "</div>" +
                                "</div>" +
                            "</li>"
                        );
                        if (i == 10) {return false;}
                    });
                    $("#Selectormtrlname").css({
                        display     : "block",
                        width       : rect.right - rect.left,
                    });
                },
            });
        }, 400);
    } else {
        clearTimeout(timer);
        $("#Selectormtrlname").css("display", "none");
    }
}

function mtrlSelectorByCode() {
    if ($("#fitelinescode").val().length > 2) {
        clearTimeout(timer);
        timer = setTimeout(function validate() {
            var str = $("#fitelinescode").val().replace("*", "%");

            $.ajax({
                url: "/D1ServicesIN",
                method: "POST",
                data: {
                    service     :   "get",
                    object      :   "mtrlcode",
                    sodtype     :   51,
                    code        :   str + "%",
                },
                success: function (d) {
                    $("#Selectormtrlcode").empty();
                    var rect = document
                        .getElementById("fitelinescode")
                        .parentElement.getBoundingClientRect();
                    var i = 0;
                    $.each(d.data, function (index, value) {
                        i++;
                        data = jQuery.parseJSON(JSON.stringify(d.data[index]));
                        $("#Selectormtrlcode").append(
                            '<li class="dropdown-item disable-select" style="overflow-x: auto;">' +
                                '<div class="container-fluid" style="padding: 0px">' +
                                    '<div data-slide="' + data.MTRL + '" class="row">' +
                                        '<div class="col-3" style="overflow-x: hidden;">' +
                                            '<a id="SelectorCode">' + data.CODE + '</a>' +
                                        '</div>' +
                                        '<div class="col-9">' +
                                            '<a id="SelectorName">' + data.NAME + '</a>' +
                                        '</div>' +
                                    "</div>" +
                                "</div>" +
                            "</li>"
                        );
                        if (i == 10) {return false;}
                    });
                    $("#Selectormtrlcode").css({
                        display     : "block",
                        width       : rect.right - rect.left,
                    });
                },
            });
        }, 400);
    } else {
        clearTimeout(timer);
        $("#Selectormtrlcode").css("display", "none");
    }
}
