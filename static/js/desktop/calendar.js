document.addEventListener("DOMContentLoaded", function () {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  window.today = yyyy + "-" + mm + "/" + dd;

  var calendarEl = document.getElementById("calendar");
  window.calendar = new FullCalendar.Calendar(calendarEl, {
    selectable: true,
    initialView: "timeGridWeek",
    height: $("#calendar").parent().height() - 50,
    initialDate: today,
    locale: "gr",
    editable: true,
    buttonText: {
      today: "Σήμερα",
      month: "Μήνας",
      week: "Εβομάδα",
      day: "Μέρα",
      list: "Λίστα",
    },
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
    },
    events: function (fetchInfo, successCallback, failureCallback) {
      $("#loader").css("display", "block");
      $.ajax({
        url: "/D1ServicesIN",
        type: "POST",
        data: {
          service: "get",
          object: "calendar",
        },
        success: function (data) {
          var events = [];
          $.each(data["data"], function (key, val) {
            d = JSON.parse(JSON.stringify(this));
            var allDay;
            if (d.FINALDATE) {
              allDay = false;
            } else {
              allDay = true;
            }
            if (allDay) {
              events.push({
                id: d.SOACTION,
                start: d.FROMDATE,
                allDay: true,
                title: d.TRDRNAME,
                extendedProps: {
                  comments: d.COMMENTS,
                  prjc: d.PRJC,
                },
              });
            } else {
              events.push({
                id: d.SOACTION,
                start: d.FROMDATE,
                end: d.FINALDATE,
                title: d.TRDRNAME,
                extendedProps: {
                  comments: d.COMMENTS,
                  prjc: d.PRJC,
                },
              });
            }
          });
          successCallback(events);
        },
        error: function () {
          alert("Failed!");
        },
        complete: function () {
          $("#loader").css("display", "none");
        },
      });
    },
    select: function (info) {
      var title = prompt("Enter Event Title");
      if (title) {
        $("#loader").css("display", "block");
        $.ajax({
          url: "calendar/insert",
          type: "POST",
          data: { title: title, start: info.startStr, end: info.endStr },
          success: function (data) {
            calendar.refetchEvents();
          },
          complete: function () {
            $("#loader").css("display", "none");
          },
        });
      }
    },
    eventResize: function (info) {
      var start = info.event.startStr;
      var end = info.event.endStr;
      var id = info.oldEvent.id;
      $("#loader").css("display", "block");
      $.ajax({
        url: "calendar/update",
        type: "POST",
        data: { start: start, end: end, id: id },
        success: function () {
          calendar.refetchEvents();
        },
        complete: function () {
          $("#loader").css("display", "none");
        },
      });
    },
    eventDrop: function (info) {
      var start = info.event.startStr;
      var end = info.event.endStr;
      var id = info.event.id;
      $("#loader").css("display", "block");
      $.ajax({
        url: "calendar/update",
        type: "POST",
        data: { start: start, end: end, id: id },
        success: function () {
          calendar.refetchEvents();
        },
        complete: function () {
          $("#loader").css("display", "none");
        },
      });
    },
    eventClick: function (info) {
      $("#loader").css("display", "block");
      $.ajax({
        url: "/D1ServicesIN",
        method: "POST",
        data: {
          service: "get",
          object: "soaction",
          id: info.event.id,
        },
        success: function (d) {
          data = jQuery.parseJSON(JSON.stringify(d.data[0]));
          $("[id='fsoaction']").val(data.SOACTION);
          $("[id='fsoactioncode']").val(data.SOACTIONCODE);
          $("[id='ffromdate']").val(data.FROMDATE.replace(" ", "T"));
          $("[id='ffinaldate']").val(
            info.event.endStr.replace(" ", "T").slice(0, 16)
          );
          $("[id='ftrdr']").val(data.TRDR);
          $("[id='fcode']").val(data.CODE);
          $("[id='fname']").val(data.NAME);
          $("[id='faddress']").val(data.ADDRESS);
          $("[id='fphone01']").val(data.PHONE01);
          $("[id='fremarks']").val(data.REMARKS);
          $("[id='fcomments']").val(data.COMMENTS);
          $("#editm1").css("display", "block");
          $("#savem1").prop("disabled", true);
          $("#loader").css("display", "none");
          $("#screenform .modal-content .modal-body .tab-content")
            .find("*")
            .not('#mapp')
            .attr("disabled", true);
          $("#screenform").modal("toggle");
        },
      });
      //if (confirm("Are you sure you want to remove?")){
      //    var id = info.event.id;
      //    $("#loader").css("display", "block");
      //    $.ajax({
      //        url:"calendar/delete",
      //        type:"POST",
      //        data:{id:id},
      //        success : function(){
      //            calendar.refetchEvents();
      //            calendarl.refetchEvents();
      //        },
      //        complete : function(){$("#loader").css("display", "block");}
      //    })
      //}
    },
  });
  calendar.render();
});

function updatethesize() {
  calendar.updateSize();
}
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
    $("#screenform").modal("toggle");
    $("#loader").css("display", "block");
    if ($("#fsoaction").val() == "") {
      $.ajax({
        url: "meetings/insert",
        type: "POST",
        data: {
          trndate: $("#ffromdate").val(),
          trdr: $("#ftrdr").val(),
          finaldate: $("#ffinaldate").val(),
          fromdate: $("#ffromdate").val(),
          comments: $("#fcomments").val(),
          remarks: $("#fremarks").val(),
        },
        success: function (data) {
          calendar.refetchEvents();
          $("#loader").css("display", "none");
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
          trndate: $("#ffromdate").val(),
          trdr: $("#ftrdr").val(),
          fromdate: $("#ffromdate").val(),
          finaldate: $("#ffinaldate").val(),
          comments: $("#fcomments").val(),
          remarks: $("#fremarks").val(),
        },
        success: function (data) {
          calendar.refetchEvents();
          $("#loader").css("display", "none");
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
            if (i == 10) {
              return false;
            }
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

  /*When Click on Selector Code fill the inputs*/
  $("#Selectorcode").on("click", ".row", function () {
    freezeClic = true;
    $("[id='loader']").css("display", "block");
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
        $("[id='loader']").css("display", "none");
        freezeClic = false;
      },
    });
  });

  /*When Click on Selector Name fill the inputs*/
  $("#Selectorname").on("click", ".row", function () {
    freezeClic = true;
    $("[id='loader']").css("display", "block");
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
        $("[id='loader']").css("display", "none");
        freezeClic = false;
      },
    });
  });

  /*When Modal opens*/
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

  /*When focusout fromdate*/
  $("#ffromdate").on("focusout", function () {
    var ddnn = new Date($("#ffromdate").val());
    var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTimeFINAL = new Date(
      ddnn.setHours(ddnn.getHours() + 1) - tzoffset
    )
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
});

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
            var address = address +','+ city +','+ zip +','+ district;
            address = encodeURIComponent(address);
            $("[id='loader']").css("display", "none");
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
            if (i == 10) {
              return false;
            }
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

