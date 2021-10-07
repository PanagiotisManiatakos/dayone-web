$(document).ready(function () {
    $("#loader").css("display", "none");

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
        columnDefs: [{ className: "hide_column", targets: [7] }],
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
                    select: true,
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
                $("#questionsdiv").css("display", "none");
                $("#tablediv").css("display", "block");
                table.columns.adjust();
                table.draw();
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

    /*When Single click a row*/
    $("#example").on("mouseup", "tr", function () {
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
    });

    /*When Double click a row*/
    $("#example").on("dblclick", "tr", function () {
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

    /*When Screen Edit Button is pressed*/
    document.querySelector("#editm1").addEventListener("click", function () {
        $("#screenform .modal-content .modal-body .tab-content")
            .find("*")
            .attr("disabled", false);
        document.querySelector("#savem1").disabled = false;
    });

    /*When Screen Cancel Button is pressed*/
    document.querySelector("#cancelm1").addEventListener("click", function () {
        document.querySelector("#savem1").disabled = true;
        $("#screenform").modal("toggle");
    });



    /*When Screen X Button is pressed*/
    document.querySelector("#cancelm12").addEventListener("click", function () {
        document.querySelector("#savem1").disabled = true;
        $("#screenform").modal("toggle");
    });

    /*When Delete Cancel Button is pressed*/
    document.querySelector("#cancelm2").addEventListener("click", function () {
        $("#deleteform").modal("toggle");
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
