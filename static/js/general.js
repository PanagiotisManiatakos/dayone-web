$(document).ready(function () {
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

  const sidebarToggle = document.body.querySelector("#sidebarToggle");

  sidebarToggle.addEventListener("click", (event) => {
    event.preventDefault();
    document.body.classList.toggle("sb-sidenav-toggled");
    localStorage.setItem(
      "sb|sidebar-toggle",
      document.body.classList.contains("sb-sidenav-toggled")
    );
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
