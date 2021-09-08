document.addEventListener('DOMContentLoaded', function() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    window.today = yyyy + '-' + mm + '/' + dd;


    var calendarEl = document.getElementById('calendar');
    var calendarEll = document.getElementById('calendarlist');
    window.calendar = new FullCalendar.Calendar(calendarEl, {
        selectable: true,
        initialView: 'dayGridMonth',
        initialDate: today,
        locale: 'gr',
        displayEventTime: false,
        views: {
            dayGridMonth: { // name of view
                titleFormat: { year: 'numeric', month: 'short' }
                // other view-specific options here
            }
        },
        customButtons: {
            cNext : {
                text : '>',
                click: function() {
                    var date = calendar.getDate()
                    calendarl.gotoDate(date);
                    calendarl.changeView('listMonth');
                    calendar.next();
                    calendarl.next();
                }
            },
            cPrev : {
                text : '<',
                click: function() {
                    var date = calendar.getDate()
                    calendarl.gotoDate(date);
                    calendarl.changeView('listMonth');
                    calendar.prev();
                    calendarl.prev();
                }
            },
            cToday : {
                text : 'Σήμερα',
                click: function() {
                    calendar.today();
                    calendarl.today();
                    calendarl.changeView('listMonth');
                }
            }
        },
        buttonText:{
            today:'Σήμερα',
            month:'Μήνας',
            week:'Εβομάδα',
            day:'Μέρα',
            list:'Λίστα'
        },
        headerToolbar:{
            left:'title',
            right:'cToday cPrev,cNext'
        },
        events: function (fetchInfo, successCallback, failureCallback) {
            $("#loader").css("display", "block");
            $.ajax({
                url: '/D1ServicesIN',
                type: 'POST',
                data:{
                    service:"get",
                    object:"calendar",
                },
                success: function(data) {
                    var events = [];
                    $.each(data['data'], function (key, val) {
                        d=JSON.parse(JSON.stringify(this));
                        var allDay;
                        if(d.FINALDATE){
                            allDay=false;
                        }else{
                            allDay=true
                        };
                        if(allDay){
                            events.push({
                                id: d.SOACTION,
                                start: d.FROMDATE,
                                allDay:true,
                                extendedProps:{
                                    comments : d.COMMENTS,
                                    prjc : d.PRJC,
                                }
                            });
                        }else{
                            events.push({
                                id: d.SOACTION,
                                start: d.FROMDATE,
                                end:d.FINALDATE,
                                extendedProps:{
                                    comments : d.COMMENTS,
                                    prjc : d.PRJC,
                                }
                            });
                        }
                    });
                    successCallback(events);
                },
                error: function () {
                    alert('Failed!');
                },
                complete : function (){
                    $("#loader").css("display", "none");
                },
            });
        },
        select:function(info){
            var title = prompt("Enter Event Title");
            if(title){
                $("#loader").css("display", "block");
                $.ajax({
                    url:"calendar/insert",
                    type:"POST",
                    data:{title:title, start:info.startStr, end:info.endStr},
                    success:function(data){
                        //alert(data)
                        calendar.refetchEvents();
                        calendarl.refetchEvents();
                    },
                    complete  :function(){
                        $("#loader").css("display", "none");
                    }
                })
            }
        },
        eventResize:function(info){
            var start = info.event.startStr;
            var end = info.event.endStr;
            var id = info.oldEvent.id;
            $("#loader").css("display", "block");
            $.ajax({
                url:"calendar/update",
                type:"POST",
                data:{start:start, end:end, id:id},
                success : function(){
                    calendar.refetchEvents();
                    calendarl.refetchEvents();
                },
                complete : function(){
                    $("#loader").css("display", "none");
                }

            })
        },
        eventDrop:function(info){
            var start = info.event.startStr;
            var end = info.event.endStr;
            var id = info.event.id;
            $("#loader").css("display", "block");
            $.ajax({
                url:"calendar/update",
                type:"POST",
                data:{start:start, end:end, id:id},
                success : function(){
                    calendar.refetchEvents();
                    calendarl.refetchEvents();
                },
                complete : function(){$("#loader").css("display", "none");}
            })
        },
        eventClick:function(info){
            calendarl.changeView('listDay',info.event.startStr);
            calendarl.gotoDate( info.event.startStr );
        },
        dateClick: function(info) {
            calendarl.changeView('listDay',info.dateStr);
            calendarl.gotoDate( info.dateStr );
        }
    });
    window.calendarl = new FullCalendar.Calendar(calendarEll, {
        initialView: 'listMonth',
        initialDate: today,
        locale: 'gr',
        customButtons: {
            cMonth: {
                text : 'Μήνας',
                click: function() {
                    var date = calendar.getDate()
                    calendarl.gotoDate(date);
                    calendarl.changeView('listMonth');
                }
            },
            cNew: {
                text : 'Νέα',
                click: function() {
                    var date = calendar.getDate()
                    calendarl.gotoDate(date);
                    calendarl.changeView('listMonth');
                }
            }
        },
        views: {
            listMonth: { // name of view
                titleFormat: { year: 'numeric', month: 'short' },
                headerToolbar:{
                    left:'title',
                    center:'',
                    right:''
                },
            },
            listDay : { // name of view
                titleFormat: { year: 'numeric', month: 'short' , day:'2-digit'},
                // other view-specific options here
                headerToolbar:{
                    left:'title',
                    center:'',
                    right:'cMonth'
                },
            }
        },
        headerToolbar:{
            left:'title',
            center:'',
            right:'cMonth cNew'
        },
        events: function (fetchInfo, successCallback, failureCallback) {
            $("#loader").css("display", "block");
            $.ajax({
                url: '/D1ServicesIN',
                type: 'POST',
                data:{
                    service:"get",
                    object:"calendar",
                },
                success: function(data) {
                    var events = [];
                    $.each(data['data'], function (key, val) {
                        d=JSON.parse(JSON.stringify(this));
                        var allDay;
                        if(d.FINALDATE){
                            allDay=false;
                        }else{
                            allDay=true
                        };
                        if(allDay){
                            events.push({
                                id: d.SOACTION,
                                start: d.FROMDATE,
                                allDay:true,
                                title:d.TRDRNAME,
                            });
                        }else{
                            events.push({
                                id: d.SOACTION,
                                start: d.FROMDATE,
                                end:d.FINALDATE,
                                title:d.TRDRNAME,
                            });
                        }
                    });
                    successCallback(events);
                },
                error: function () {
                    alert('Failed!');
                },
                complete : function (){
                    $("#loader").css("display", "none");
                },
            });
        },
        eventDrop:function(info){
            var start = info.event.startStr;
            var end = info.event.endStr;
            var id = info.event.id;
            $("#loader").css("display", "block");
            $.ajax({
                url:"calendar/update",
                type:"POST",
                data:{start:start, end:end, id:id},
                success : function(){
                    calendar.refetchEvents();
                    calendarl.refetchEvents();
                },
                complete : function(){$("#loader").css("display", "none");}
            })
        },
        eventClick:function(info){
            $("#loader").css("display", "block");
            $.ajax({
                url: '/D1ServicesIN',
                method: "POST",
                data:{
                    service:"get",
                    object:"soaction",
                    id:info.event.id,
                },
                success: function (d) {
                    data=jQuery.parseJSON(JSON.stringify(d.data[0]));
                    $("[id='fsoaction']").val(data.SOACTION);
                    $("[id='ftrdr']").val(data.TRDR);
                    $("[id='fcode']").val(data.CODE);
                    $("[id='fname']").val(data.NAME);
                    $("[id='faddress']").val(data.ADDRESS);
                    $("[id='fphone01']").val(data.PHONE01);
                    $("[id='fremarks']").val(data.COMMENTS);
                    $("#screenform .modal-content .modal-body").find("*").attr( "disabled", true );
                    $("#editm1").css("display", "block");
                    $("#savem1").prop("disabled", true);
                    $("#loader").css("display", "none");
                    $('#screenform').modal('toggle');
                }
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
    calendarl.render();
});

function updatethesize(){
    calendar.updateSize();
    calendarl.updateSize();
}

$(document).ready(function(){
    /*When Screen Edit Button is pressed*/
    document.querySelector('#editm1').addEventListener('click',function () {
        $("#screenform .modal-content .modal-body").find("*").attr( "disabled", false );
        document.querySelector('#savem1').disabled = false;
    });

    /*When Screen Cancel Button is pressed*/
    document.querySelector('#cancelm1').addEventListener('click',	function () {
        document.querySelector('#savem1').disabled = true;
        $('#screenform').modal('toggle');
    })

    /*When Screen X Button is pressed*/
    document.querySelector('#cancelm12').addEventListener('click',	function () {
        document.querySelector('#savem1').disabled = true;
        $('#screenform').modal('toggle');
    })

    /*When Right Click on SideBar*/
    $("body").on("contextmenu", "#sidebar-wrapper", function(e) {
            $("#contextMenu").css({
            display: "block",
            left: e.pageX,
            top: e.pageY
            });
            return false;
          });

    /*When Click on ContextMenu*/
    $("#contextMenu").on("click", "a", function() {
        $("#contextMenu").hide();
    });

    /*When Search for customer by name*/
    $("#fname").keyup(function() {
        if($("#fname").val().length > 3 ){
            $.ajax({
                url: '/D1ServicesIN',
                method: "POST",
                data:{
                    service:"get",
                    object:"trdrname",
                    name:"%"+$("#fname").val()+"%"
                },
                success: function (d) {
                    $('#Selectorname').empty();
                    var rect = document.getElementById("fname").getBoundingClientRect();
                    var i=0;
                    $.each(d.data, function(index,value) {
                        i++;
                        data=jQuery.parseJSON(JSON.stringify(d.data[index]));
                        $("#Selectorname").append('<li class="dropdown-item disable-select" style="overflow-x: auto;">'+
                                                    '<div class="container-fluid" style="padding: 0px">'+
					                                    '<div data-slide="'+ data.TRDR +'" class="row">'+
                                                            '<div class="col-3" style="overflow-x: hidden;">'+
                                                                '<a id="SelectorCode"">'+ data.CODE +'</a>'+
                                                            '</div>'+
                                                            '<div class="col-9">'+
                                                                '<a id="SelectorName">'+ data.NAME +'</a>'+
                                                            '</div>'+
                                                       '</div>'+
                                                   '</div>'+
                                                '</li>');
                        if(i == 10) {
                            return false;
                        }
                    });
                    $("#Selectorname").parent().css({'padding-top':rect.bottom-rect.top});
                    $("#Selectorname").css({
                        'display': "block",
                        'left': rect.left,
                        'min-width':rect.right-rect.left,
                    });
                }
            });
        }else{
            $("#Selectorname").css('display','none');
        }
    });

    /*When Click on Selector Name fill the inputs*/
    $("#Selectorname").on("click", ".row", function() {
        freezeClic=true;
        $("[id='loader']").css("display", "block");
        $("#Selectorname").css('display','none');
        var id = $(this).data('slide');
        $.ajax({
            url : '/D1ServicesIN',
            method: "POST",
            data:{
                    service:"get",
                    object:"trdr",
                    id:id,
                },
            success : function (d) {
                data=jQuery.parseJSON(JSON.stringify(d.data[0]));
                $("[id='ftrdr']").val(data.TRDR);
                $("[id='fcode']").val(data.CODE);
                $("[id='fname']").val(data.NAME);
                $("[id='faddress']").val(data.ADDRESS);
                $("[id='fphone01']").val(data.PHONE01)
            },
            complete : function(){
                $("[id='loader']").css("display", "none");
                freezeClic=false;
            }
        });
    });
});

function updAll(event){
    $('[id="'+this.id+'"]').val($(this).val());
}

function expandAll(){
    $("#sidebar-wrapper .accordion-collapse").collapse('show');
}

function closeAll(){
    $("#sidebar-wrapper .accordion-collapse").collapse('hide');
}


let freezeClic = false;

document.addEventListener("click", e => {
    if (freezeClic) {
        e.stopPropagation();
        e.preventDefault();
    }
}, true);