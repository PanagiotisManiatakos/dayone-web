function user() {
    $("#usermodal").modal("toggle");
}

function hidethepassworddiv() {
    $("#passwordchangediv").css("display", "none");
    $("#passwordchangeconfirmdiv").css("display", "block");
    $("#changepassdiv").css("display", "block");
    $("#oldpassdiv").css("display", "none");
}

function checkpass() {
    $("#passerror").text("");
    $("#oldpasswchange").css("border", "");
    $("#newpasswchange").css("border", "");
    $("#confirmpasswchange").css("border", "");
    if ($("#oldpasswchange").val() == "") {
        $("#oldpasswchange").css("border", "2px solid #f00");
        $("#oldpasswchange").focus();
        $("#passerror").text("Συμπληρώστε τον τρέχων κωδικό.");
    } else {
        if ($("#newpasswchange").val() == "") {
            $("#newpasswchange").css("border", "2px solid #f00");
            $("#newpasswchange").focus();
            $("#passerror").text("Συμπληρώστε τον νέο κωδικό.");
        } else {
            if ($("#confirmpasswchange").val() == "") {
                $("#confirmpasswchange").css("border", "2px solid #f00");
                $("#confirmpasswchange").focus();
                $("#passerror").text("Συμπληρώστε την επιβεβαίωση κωδικού.");
            } else {
                if ($("#oldpasswchange").val() != $("#oldpasswcfromsession").val()) {
                    $("#oldpasswchange").css("border", "2px solid #f00");
                    $("#oldpasswchange").focus();
                    $("#passerror").text("Λάθος κωδικός");
                } else {
                    if ($("#newpasswchange").val() != $("#confirmpasswchange").val()) {
                        $("#confirmpasswchange").css("border", "2px solid #f00");
                        $("#confirmpasswchange").focus();
                        $("#passerror").text("Επιβεβαιώστε σωστά");
                    } else {
                        $("[id=loader]").css("display", "block");
                        $.ajax({
                            url: "/changepassword",
                            method: "POST",
                            data: { newpassword: $("#newpasswchange").val() },
                            success: function (data) {
                                if (JSON.stringify(data["success"])) {
                                    $("#oldpasswcfromsession").val($("#newpasswchange").val());
                                    $("[id=loader]").css("display", "none");
                                    $("#successmodal").modal("toggle");
                                    setTimeout(function () {
                                        $("#successmodal").modal("hide");
                                    }, 2000);
                                } else {
                                    $("#loader").css("display", "none");
                                    $("#insertIDFail").text(data["error"]);
                                    $("#failuremodal").modal("toggle");
                                    setTimeout(function () {
                                        $("#failuremodal").modal("hide");
                                    }, 3000);
                                }
                            },
                            complete: function () {
                                $("#usermodal").modal("hide");
                            },
                        });
                    }
                }
            }
        }
    }
}

function closethismodal() {
    $("#usermodal").modal("hide");
}

$(document).ready(function () {
    $("#usermodal").on("hidden.bs.modal", function () {
        $("#passwordchangediv").css("display", "block");
        $("#passwordchangeconfirmdiv").css("display", "none");
        $("#changepassdiv").css("display", "none");
        $("#oldpassdiv").css("display", "block");
        $("#passerror").text("");
        $("#oldpasswchange").css("border", "");
        $("#newpasswchange").css("border", "");
        $("#confirmpasswchange").css("border", "");
        $("#oldpasswchange").val("");
        $("#newpasswchange").val("");
        $("#confirmpasswchange").val("");
    });
    
    $('#settingsclear').on('click',function(){
        if (confirm('Με την διαγραφή της cache θα αποσυνδεθείτε απο την σελίδα.\nΕπιθυμείτε να συνεχίσετε;')) {
            startload();
            const clearCookies = document.cookie.split(';').forEach(
                cookie => document.cookie = cookie.replace(/^ +/,'').replace(
                    /=.*/,`=;expires=${new Date(0).toUTCString()};path=/`
                )
            );
            $.ajax({
                url: '/clearcache',
                method: 'POST',
                success: function (data){
                    if (data['success']){
                        stopload();
                        window.location.href = '/logout';
                    }else{
                        stopload();
                        alert('Κάτι πήγε στραβά.\nΠροσπαθήστε ξανά.')
                    }
                }
            })
        }
    })
});

function startload(){
    $(".loaderr").css("display", "block");
    $("body").append('<div id="overlayyy"</div>');
}

function stopload(){
    $(".loaderr").css("display", "none");
    $("#overlayyy").remove();
}

