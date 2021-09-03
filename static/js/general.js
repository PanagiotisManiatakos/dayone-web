$(document).ready(
    function() {
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

        /*When Click out of ContextMenu*/
        document.addEventListener('click', function(e){
            if($("#contextMenu").css('display')=='block'){
                let inside = (e.target.closest('#contextMenu'));
                if(!inside){
                    $("#contextMenu").hide();
                }
            }
        });

        const sidebarToggle = document.body.querySelector('#sidebarToggle');

        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });

        /*When the user scrolls down 20px from the top of the document, show the button*/
        window.onscroll = function () {
            if ( document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                document.querySelector("#btn-back-to-top").style.display = "block";
            } else {
                document.querySelector("#btn-back-to-top").style.display = "none";
            }
        };

        /*When the user clicks on the button, scroll to the top of the document*/
        document.querySelector("#btn-back-to-top").addEventListener("click", function() {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });
    }
);

function updAll(event){
    $('[id="'+this.id+'"]').val($(this).val());
}

function expandAll(){
    $("#sidebar-wrapper .accordion-collapse").collapse('show');
}

function closeAll(){
    $("#sidebar-wrapper .accordion-collapse").collapse('hide');
}