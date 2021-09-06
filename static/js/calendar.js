document.addEventListener('DOMContentLoaded', function() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    window.today = yyyy + '-' + mm + '/' + dd;


    var calendarEl = document.getElementById('calendar');
    window.calendar = new FullCalendar.Calendar(calendarEl, {
        selectable:true,
        initialView: 'timeGridWeek',
        height: $( "#calendar" ).parent().height()-50,
        initialDate: today,
        locale: 'gr',
        editable:true,
        buttonText:{
            today:'Σήμερα',
            month:'Μήνας',
            week:'Εβομάδα',
            day:'Μέρα',
            list:'Λίστα'
        },
        headerToolbar:{
            left:'prev,next today',
            center:'title',
            right:'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
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
                        events.push({
                            id: d.SOACTION,
                            start: d.FROMDATE,
                            end:d.FINALDATE,
                            title:d.TRDRNAME,
                            extendedProps:{
                                comments : d.COMMENTS,
                                prjc : d.PRJC,
                            }
                        });
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
        select:
        function(info){
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
                },
                complete : function(){$("#loader").css("display", "none");}
            })
        },
        eventClick:function(info){
            if (confirm("Are you sure you want to remove?")){
                var id = info.event.id;
                $("#loader").css("display", "block");
                $.ajax({
                    url:"calendar/delete",
                    type:"POST",
                    data:{id:id},
                    success : function(){
                        calendar.refetchEvents();
                    },
                    complete : function(){$("#loader").css("display", "block");}
                })
            }
        },
    });
    calendar.render();
});

function updatethesize(){
    calendar.updateSize();
}