function companies() {
  $("#loader").css("display", "block");
  $("#error").hide();
  var companyname = document.forms["login"]["companyname"].value;
  var username = document.forms["login"]["username"].value;
  var password = document.forms["login"]["password"].value;
  $.ajax({
    url: "login/checkurl",
    type: "POST",
    data: { companyname: companyname, username: username, password: password },
    success: function (response) {
      var success = JSON.parse(JSON.stringify(response)).success;
      if (success == false) {
        $("#loader").hide();
        $("#error").css("display", "block");
        return;
      } else {
        data = JSON.parse(JSON.stringify(response)).data;
        var $dropdown = $("#comcode");
        $.each(data, function () {
          $dropdown.append(
            $("<option>").val(Object.values(this)).text(Object.values(this))
          );
        });
        $("#divcom").css("display", "block");
        $("#btlogin").css("display", "block");
        $("#btnext").hide();
        $("#loader").hide();
      }
    },
  });
}
