function companies() {
    if (!checkit()) {
        startload()
        $("#error").css('opacity',0);
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
                    var rect = document
                        .getElementById("btnext")
                        .getBoundingClientRect();
                    if(data['error'] == 'domain'){
                        error = 'Ελέγξτε την σύνδεση σας'
                        $("#cname").css("border", "2px solid #f00");
                        $("#cname").focus();
                    }else{
                        error = 'Ελέγξτε username/password';
                        $("#uname").css("border", "2px solid #f00");
                        $("#password").css("border", "2px solid #f00");
                    }
                    stopload()
                    $("#errorDisplay").text(error);
                    $("#error").show();
                    $("#error").css({
                        'opacity': 1,
                        'left': rect.left,
                        "top": rect.bottom
                    });
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
                    stopload()
                }
            },
        });
    }
}

$(document).ready(function () {
    stopload()
    
    $('input').on('keydown',function(e){
        if(e.keyCode == 13) {
            e.preventDefault();
            if ($(this).attr("id")=='platform'){
                $('#cname').focus();
            }else if ($(this).attr("id")=='cname'){
                $('#uname').focus();
            }else if ($(this).attr("id")=='uname'){
                $('#password').focus();
            }else if ($(this).attr("id")=='password'){
                if ($('#bbtlogin').is(":visible")){
                     $('#bbtlogin').click();
                }else{
                    $('#bbtnext').click();
                }
            }
        }
    });
    
    $('#bbtlogin').on('click',function(){
        startload();
        $("#error").css('opacity',0);
        $("#error").hide();
        $.ajax({
            url: "login",
            type: "POST",
            data: { 
                companyname: $("#cname").val(),
                comcode: $("#comcode").val(),
                username: $("#uname").val(),
                password: $("#password").val(),
                platform : $("#platform").val(),
            },
            success: function (data) {
                if (data['success'] == true) {
                    document.location.href="/"
                }else{
                    var rect = document
                        .getElementById("bbtlogin")
                        .getBoundingClientRect();
                    stopload();
                    $("#errorDisplay").text(data['error']);
                    $("#error").show();
                    $("#error").css({
                        'opacity': 1,
                        'left': rect.left,
                        "top": rect.bottom
                    });
                }
            }
        });  
    });
});

function checkit() {
    var check = false;
    $('.required').each(function (i, el) {
        var data = $(el).val();
        if(data==""){
            $(el).css("border", "2px solid #f00");
            if(i==0) $(el).focus();
            check = true;
        }else{
            $(el).css("border", "");
        };
    });
    return check;
}

function startload(){
    $(".loaderr").css("display", "block");
    $("body").append('<div id="overlayyy"</div>');
}

function stopload(){
    $(".loaderr").css("display", "none");
    $("#overlayyy").remove();
}
