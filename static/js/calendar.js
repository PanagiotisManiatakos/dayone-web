$(document).ready(function() {
    var calendar = $('#calendar').fullCalendar({
        initialView: 'timeGridDay',
        selectable:true,
        selectHelper:true,
        editable:true,
        buttonText:{
            today:'Σήμερα',
            month:'Μήνας',
            week:'Εβομάδα',
            day:'Μέρα',
            list:'Λίστα'
        },
        header:{
            left:'prev,next today',
            center:'title',
            right:'month,agendaWeek,agendaDay,list'
        },
        events: function (start, end, timezone, callback) {
            $.ajax({
                url: '/D1ServicesIN',
                type: 'POST',
                data:{
                    service:"get",
                    object:"soaction",
                },
                success: function(data) {
                    var events = [];
                    $.each(data['data'], function (key, val) {
                        d=JSON.parse(JSON.stringify(this));
                        events.push({
                            id: d.SOACTION,
                            start: d.FROMDATE,
                            end:d.FINALDATE,
                            title:d.SOACTIONCODE+' | '+d.TRDRNAME,
                            extendedProps:{
                                comments : d.COMMENTS,
                                trdr : d.TRDR,
                                trdrcode : d.TRDRCODE,
                                trdrname : d.TRDRNAME,
                                prjc : d.PRJC,
                                prjcode : d.PRJCODE,
                                prjname : d.PRJNAME
                            }
                        });
                    });
                    callback(events);
                },
                error: function () { alert('Failed!'); },
            });
        },
        select:
        function(start, end, allDay){
            var title = prompt("Enter Event Title");
            if(title){
                var start = $.fullCalendar.formatDate(start, "Y-MM-DD HH:mm:ss");
                var end = $.fullCalendar.formatDate(end, "Y-MM-DD HH:mm:ss");
                $.ajax({
                    url:"calendar/insert",
                    type:"POST",
                    data:{title:title, start:start, end:end},
                    success:function(data){
                        //alert(data)
                        calendar.fullCalendar('refetchEvents');
                    }
                })
            }
        },
        eventResize:function(event){
            var start = $.fullCalendar.formatDate(event.start,"Y-MM-DD HH:mm:ss");
            var end = $.fullCalendar.formatDate(event.end,"Y-MM-DD HH:mm:ss");
            var title = event.title;
            var id = event.id;
            $.ajax({
                url:"calendar/update",
                type:"POST",
                data:{start:start, end:end, id:id},
                success:function(){
                    calendar.fullCalendar('refetchEvents');
                }
            })
        },
        eventDrop:function(event){
            var start = $.fullCalendar.formatDate(event.start,"Y-MM-DD HH:mm:ss");
            var end = $.fullCalendar.formatDate(event.end,"Y-MM-DD HH:mm:ss");
            var title = event.title;
            var id = event.id;
            $.ajax({
                url:"calendar/update",
                type:"POST",
                data:{start:start, end:end, id:id},
                success:function(){
                    calendar.fullCalendar('refetchEvents');
                }
            })
        },
        eventClick:function(event){
            if (confirm("Are you sure you want to remove?")){
                var id = event.id;
                $.ajax({
                    url:"calendar/delete",
                    type:"POST",
                    data:{id:id},
                    success:function(){
                        calendar.fullCalendar('refetchEvents');
                    }
                })
            }
        },
    });
});