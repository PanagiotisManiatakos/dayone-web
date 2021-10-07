function companies() {
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
        $("#loader").css("display", "block");
        $("#error").hide();
        var companyname = document.forms["login"]["companyname"].value;
        var username = document.forms["login"]["username"].value;
        var password = document.forms["login"]["password"].value;
        $.ajax({
            url: "login/checkurl",
            type: "POST",
            data: { companyname: companyname, username: username, password: password },
            success: function (data) {
                if (data['success'] == false) {
                    if(data['error'] == 'domain'){
                        error = 'Ελέγξτε την σύνδεση σας'
                        $("#cname").css("border", "2px solid #f00");
                        $("#cname").focus();
                    }else{
                        error = 'Ελέγξτε username ή password';
                        $("#uname").css("border", "2px solid #f00");
                        $("#password").css("border", "2px solid #f00");
                    }
                    $("#loader").hide();
                    $("#errorDisplay").text(error);
                    $("#error").css("display", "block");
                    return false;
                }else{
                    data = JSON.parse(JSON.stringify(data)).data;
                    var $dropdown = $("#comcode");
                    $dropdown.empty()
                    $.each(data, function () {
                        cdata=JSON.parse(JSON.stringify(this));
                        $dropdown.append(
                            $("<option>").val(Object.values(this)).text(cdata['name'])
                        );
                    });
                    $("#cname").prop('readonly', true);
                    $("#uname").prop('readonly', true);
                    $("#password").prop('readonly', true);
                    $("#platform").prop('readonly', true);
                    $("#divcom").css("display", "block");
                    $("#btlogin").css("display", "block");
                    $("#btnext").hide();
                    $("#loader").hide();
                    $("#btlogin").focus();
                }
            },
        });
    }
}

$(document).ready(function () {
    $("#loader").css("display", "none");

    $( "form" ).submit(function() {
        $("#loader").css("display", "block");
    });
});
