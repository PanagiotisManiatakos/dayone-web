from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from datetime import timedelta
import requests
import json
from flask_mobility import Mobility

app = Flask(__name__)
Mobility(app)
app.secret_key = 'hell'
app.permanent_session_lifetime = timedelta(days=1)


@app.route("/")
def reindex():
    if 'id' in session:
        return redirect(url_for('index'))
    else:
        return redirect(url_for('login'))


@app.route("/index")
def index():
    if 'id' in session:
        return render_template("home.html")
    else:
        return redirect(url_for('login'))


@app.route("/about")
def about():
    return render_template("about.html")


# Route for handling the login page logic
@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None

    if request.method == 'POST':
        session.permanent = True
        erp = request.form['platform']
        username = request.form['username']
        password = request.form['password']
        connection = request.form['companyname']
        company = request.form['comcode']
        companycode = company[0:company.index(',')]
        companyname = company[company.index(',') + 1:len(company)]
        url = "http://" + connection + ".oncloud.gr/s1services"
        log = s1login(url)
        auth = s1authenticate(url, log, companycode)
        session['erp'] = erp
        session['id'] = auth
        session['url'] = url
        session['companycode'] = companycode
        session['companyname'] = companyname
        session['username'] = username
        session['password'] = password
        getcred = s1get_Credentials(url, password, username, session['companycode'])
        if getcred['success']:
            session['prsn'] = getcred['data'][0]['prsn']
            session['isadmin'] = getcred['data'][0]['isadmin']
            session['name'] = getcred['data'][0]['name']
            session['name2'] = getcred['data'][0]['name2']
            session['cccwebaccounts'] = getcred['data'][0]['cccwebaccounts']
            return redirect(url_for('index'))
        else:
            error = 'Try again '
    else:
        if 'id' in session:
            return redirect(url_for('index'))
    return render_template('login.html', error=error)


@app.route('/login/checkurl', methods=['GET', 'POST'])
def companies():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        company = request.form['companyname']
        url = "http://" + company + ".oncloud.gr/s1services"
        creds = s1get_Credentials1(url, password, username)
        if creds['success']:
            return jsonify(getCompanies(url, creds['data'][0]['cccwebaccounts']))
        else:
            return jsonify(s1get_Credentials1(url, password, username))


@app.route('/logout', methods=['GET', 'POST'])
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/changepassword', methods=['GET', 'POST'])
def changepassword():
    if 'id' in session:
        if request.method == "POST":
            id = session['cccwebaccounts']
            data = {"cccWEBACCOUNTS": [{"password": request.form['newpassword']}]}
            response = setData(session['url'], 'cccWEBACCOUNTS', session['id'], id, data)
            if response.json()['success']:
                session['password'] = request.form['newpassword']
            return response.json()
    else:
        return redirect(url_for('login'))


@app.route('/meetings')
def meetings():
    if 'id' in session:
        headings = ('Κωδικός', 'Από', 'Έως', 'Πελάτης', 'Σχόλια', 'Έργο')
        d1 = getSoaction(session['url'], session['id'])
        d2 = getCustomersSelector(session['url'], session['id'], session['companycode'])
        d3 = getPrjcSelector(session['url'], session['id'], session['companycode'])
        return render_template("meetings.html", headings=headings, data=d1, customers=d2, prjc=d3)
    else:
        return redirect(url_for('login'))


@app.route('/meetings/insert', methods=["POST", "GET"])
def insertMeet():
    if 'id' in session:
        if request.method == "POST":
            data = {"SOACTION": [{
                "trndate": request.form['trndate'],
                "fromdate": request.form['fromdate'],
                "finaldate": request.form['finaldate'],
                "prjc": request.form['prjc'],
                "trdr": request.form['trdr'],
                "comments": request.form['comments']
            }]
            }
            response = setData(session['url'], 'SOMEETING', session['id'], "", data)
            if response.json()['success']:
                return 'Insert Successfully'
            else:
                return "Error :" + response.text
    else:
        return redirect(url_for('login'))


@app.route('/meetings/update', methods=["POST", "GET"])
def updtMeet():
    if 'id' in session:
        if request.method == "POST":
            id = request.form['soaction']
            data = {"SOACTION": [{
                "trndate": request.form['trndate'],
                "fromdate": request.form['fromdate'],
                "finaldate": request.form['finaldate'],
                "prjc": request.form['prjc'],
                "trdr": request.form['trdr'],
                "comments": request.form['comments']
            }]
            }
            response = setData(session['url'], 'SOMEETING', session['id'], id, data)
            if response.json()['success']:
                return 'Update Successfully'
            else:
                return "Error :" + response.text
    else:
        return redirect(url_for('login'))


@app.route('/customers')
def customers():
    if 'id' in session:
        headings = ('Κωδικός', 'Επωνυμία', 'ΑΦΜ', 'Διεύθυνση', 'Τηλ1', 'Email', 'Υπόλοιπο', 'hidentrdr')
        return render_template("customerstest.html", headings=headings)
    else:
        return redirect(url_for('login'))


@app.route('/customers/insert', methods=["POST", "GET"])
def insertCust():
    if 'id' in session:
        if request.method == "POST":
            data = {"CUSTOMER": [{
                "code": request.form['code'],
                "name": request.form['name'],
                "afm": request.form['afm'],
                "address": request.form['address'],
                "zip": request.form['zip'],
                "city": request.form['town'],
                "district": request.form['district'],
                "phone01": request.form['phone01'],
                "phone02": request.form['phone02'],
                "email": request.form['email'],
                "remarks": request.form['remarks']
            }]
            }
            response = setData(session['url'], 'CUSTOMER', session['id'], "", data)
            return response.json()
    else:
        return redirect(url_for('login'))


@app.route('/customers/update', methods=["POST", "GET"])
def updtCust():
    if 'id' in session:
        if request.method == "POST":
            id = request.form['trdr']
            data = {"CUSTOMER": [{
                "code": request.form['code'],
                "name": request.form['name'],
                "afm": request.form['afm'],
                "address": request.form['address'],
                "zip": request.form['zip'],
                "city": request.form['town'],
                "district": request.form['district'],
                "phone01": request.form['phone01'],
                "phone02": request.form['phone02'],
                "email": request.form['email'],
                "remarks": request.form['remarks']
            }]
            }
            response = setData(session['url'], 'CUSTOMER', session['id'], id, data)
            return response.json()
    else:
        return redirect(url_for('login'))


@app.route('/customers/delete', methods=["POST", "GET"])
def deleteCust():
    if 'id' in session:
        if request.method == "POST":
            id = request.form['id']
            response = delData(session['url'], 'CUSTOMER', session['id'], id)
            return response.json()
    else:
        return redirect(url_for('login'))


@app.route('/parousiologio')
def parousiologio():
    if 'id' in session:
        d1 = {'qrcode': session['url']}
        return render_template("parousiologio.html", data=d1)
    else:
        return redirect(url_for('login'))


@app.route('/parousiologio/insert', methods=["POST", "GET"])
def insertParousiologio():
    if 'id' in session:
        if request.method == "POST":
            message = request.form['qrcode']
            if message.lower() == session['url'].lower():
                date = request.form['date']
                thecheck = s1_CheckForChekIn(session['url'], session['prsn'], date, session['companycode'])
                if thecheck.json()['success']:
                    soaction = thecheck.json()['data'][0]['SOACTION']
                    data = {"SOPRSN": [{
                        "finaldate": date
                    }]
                    }
                    setData(session['url'], 'SOPRSN', session['id'], soaction, data)
                    return {'success': True, 'status': 'update'}
                else:
                    data = {"SOPRSN": [{
                        "trndate": date,
                        "fromdate": date,
                        'series': 9889,
                        'actprsn': session['prsn']
                    }]
                    }
                    setData(session['url'], 'SOPRSN', session['id'], "", data)
                    return {'success': True, 'status': 'insert'}
            else:
                return {'success': True, 'status': 'qrcode'}
    else:
        return redirect(url_for('login'))


@app.route('/calendar')
def calendar():
    if 'id' in session:
        if request.MOBILE:
            return render_template("m_calendar.html")
        else:
            return render_template("calendar.html")
    else:
        return redirect(url_for('login'))


@app.route('/calendar/insert', methods=["POST", "GET"])
def insertcal():
    if 'id' in session:
        if request.method == "POST":
            data = {"SOACTION": [{
                "trndate": request.form['start'],
                "fromdate": request.form['start'],
                "finaldate": request.form['end'],
                "actprsn": session['prsn'],
                "COMMENTS": request.form['title'],
            }]
            }
            response = setData(session['url'], 'SOMEETING', session['id'], "", data)
            return response.text
    else:
        return redirect(url_for('login'))


@app.route('/calendar/update', methods=["POST", "GET"])
def updatecal():
    if 'id' in session:
        if request.method == "POST":
            id = request.form['id']
            data = {"SOACTION": [{
                "trndate": request.form['start'],
                "fromdate": request.form['start'],
                "finaldate": request.form['end'],
                "actprsn": session['prsn']
            }]
            }
            response = setData(session['url'], 'SOMEETING', session['id'], id, data)
            return response.text
    else:
        return redirect(url_for('login'))


@app.route('/calendar/delete', methods=["POST", "GET"])
def deletecal():
    if 'id' in session:
        if request.method == "POST":
            id = request.form['id']
            response = delData(session['url'], 'SOMEETING', session['id'], id)
            return response.text
    else:
        return redirect(url_for('login'))


@app.route("/getProducts")
def getProducts():
    if 'id' in session:
        url = 'http://dayone.oncloud.gr/s1services'
        log = s1login(url)
        auth = s1authenticate(url, log, session['companycode'])
        return get_Products(url, auth)
    else:
        return redirect(url_for('login'))


@app.route("/getPayments")
def getPayments():
    if 'id' in session:
        url = 'http://dayone.oncloud.gr/s1services'
        log = s1login(url)
        auth = s1authenticate(url, log, session['companycode'])
        return get_Payments(url, auth)
    else:
        return redirect(url_for('login'))


@app.route("/D1ServicesIN", methods=['GET', 'POST'])
def D1ServicesIN():
    erp = session['erp']
    service = request.form['service']
    obj = request.form['object']
    company = session['companycode']
    url = session['url']
    auth = session['id']
    if obj == 'trdr':
        questions = {'trdr': request.form['id']}
    elif obj == 'trdrname':
        questions = {'name': request.form['name']}
    elif obj == 'soaction':
        questions = {'soaction': request.form['id']}
    elif obj == 'calendar':
        questions = ''
    else:
        questions = {'qname': request.form['qname'],
                     'qcode': request.form['qcode']}
    if service == "set":
        data = request.form['data']
    else:
        data = questions
    if erp == "Softone":
        response = s1call(url, service, obj, company, auth, data)
        if response.json()['success']:
            return {'data': response.json()['data']}
        else:
            return {'error': response.json()['error']}
    else:
        return "Paizei mono gia Softone ...pros to parwn"


@app.route("/D1Services", methods=['GET', 'POST'])
def D1Services():
    erp = request.json['erp']
    service = request.json['service']
    obj = request.json['object']
    callfrom = request.json['callfrom']
    if callfrom == 'out':
        url = request.json['url']
        company = request.json['company']
    elif callfrom == 'in':
        company = session['company']
        if erp == 'Softone':
            url = 'https://' + session['companycode'] + '/s1services'
    else:
        return 'Error:Not valid callfrom || Select callfrom out'
    if service == "set":
        data = request.json['data']
    else:
        data = ""
    clientID = s1login(url)
    auth = s1authenticate(url, clientID, company)
    if erp == "Softone":
        return s1call(url, service, obj, company, auth, data)
    else:
        return "Paizei mono gia Softone ...pros to parwn"


# -------------functions for LOGIN------------- #


def s1login(url):
    payload = json.dumps({
        "service": "login",
        "username": "eshop",
        "password": "eshop",
        "appId": "2001"})
    response = requests.post(url + '/post', data=payload)
    return response.json()['clientID']


def s1authenticate(url, id, company):
    payload = json.dumps({
        "service": "authenticate",
        "clientID": id,
        "COMPANY": company,
        "BRANCH": "1000",
        "MODULE": "0",
        "REFID": "303"})
    response = requests.post(url + '/post', data=payload)
    return response.json()['clientID']


def s1get_Credentials1(url, password, username):
    payload = json.dumps({"password": password,
                          "username": username})
    response = requests.request('POST', url + '/js/connector.connector/getCredentials1', data=payload)
    return response.json()


def s1get_Credentials(url, password, username, company):
    payload = json.dumps({"password": password,
                          "username": username,
                          "company": company})
    response = requests.request('POST', url + '/js/connector.connector/getCredentials', data=payload)
    return response.json()


def s1_CheckForChekIn(url, prsn, date, company):
    payload = json.dumps({"clientID": session['id'],
                          "date": date,
                          "prsn": prsn,
                          "company": company})
    response = requests.request('POST', url + '/js/connector.connector/checkForCheckIn', data=payload)
    return response


def getCompanies(url, cccwebaccounts):
    payload = json.dumps({"cccwebaccounts": cccwebaccounts})
    response = requests.request('POST', url + '/js/connector.connector/getCompanies', data=payload)
    return response.json()


# -------------functions for SELECTORS------------- #


def getCustomersSelector(url, id, company):
    payload = json.dumps({
        "clientID": id,
        "company": company})
    response = requests.request('POST', url + '/js/connector.connector/getCustomersSelector', data=payload)
    return response.json()['data']


def getPrjcSelector(url, id, company):
    payload = json.dumps({
        "clientID": id,
        "company": company})
    response = requests.request('POST', url + '/js/connector.connector/getPrjcSelector', data=payload)
    return response.json()['data']


# -------------functions for ENCRYPT------------- #

LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ'
LETTERS = LETTERS.lower()


def encrypt(message, key):
    encrypted = ''
    for chars in message:
        if chars in LETTERS:
            num = LETTERS.find(chars)
            num += key
            encrypted += LETTERS[num]

    return encrypted


def decrypt(message, key):
    decrypted = ''
    for chars in message:
        if chars in LETTERS:
            num = LETTERS.find(chars)
            num -= key
            decrypted += LETTERS[num]

    return decrypted


# -------------functions for LISTS------------- #


def getCustomers(url, id, company):
    payload = json.dumps({'clientID': id,
                          'company': company})
    response = requests.request('POST', url + '/js/connector.connector/getCustomers', data=payload)
    return response.json()['data']


def getSoaction(url, id):
    payload = json.dumps({'clientID': id,
                          'company': session['companycode'],
                          'prsn': session['prsn']})
    response = requests.request('POST', url + '/js/connector.connector/getSoaction', data=payload)
    return response


def getCalendar(url, id):
    payload = json.dumps({'clientID': id,
                          'company': session['companycode'],
                          'prsn': session['prsn']})
    response = requests.request('POST', url + '/js/connector.connector/getCalendar', data=payload)
    return response


def get_Payments(url, id):
    payload = json.dumps({'clientID': id})
    response = requests.post(url + '/js/connector.connector/getPayments/post', data=payload)
    return response.text


def get_Products(url, id):
    payload = json.dumps({'clientID': id})
    response = requests.post(url + '/js/connector.connector/getProducts/post', data=payload)
    return response.text


def s1call(url, service, obj, company, id, data):
    headers = {'Content-Type': 'application/json'}
    clientID = json.dumps({'clientID': id})
    call = ""
    if service == "get":
        if obj == "item":
            call = requests.request('POST', url + '/js/connector.connector/getProducts', headers=headers, data=clientID)
        elif obj == "payment":
            call = requests.request('POST', url + '/js/connector.connector/getPayments', headers=headers, data=clientID)
        elif obj == "customer":
            data = json.dumps({'clientID': id,
                               'company': company,
                               'qname': data['qname'],
                               'qcode': data['qcode']})
            call = requests.request('POST', url + '/js/connector.connector/getCustomers', headers=headers, data=data)
        elif obj == "trdr":
            data = json.dumps({'clientID': id,
                               'trdr': data['trdr']})
            call = requests.request('POST', url + '/js/connector.connector/getTrdr', headers=headers, data=data)
        elif obj == "trdrname":
            data = json.dumps({"clientID": id,
                               "name": data['name'],
                               "company": session['companycode']})
            call = requests.request('POST', url + '/js/connector.connector/getTrdrSelectorByName', headers=headers, data=data)
        elif obj == 'soaction':
            data = json.dumps({'clientID': id,
                               'soaction': data['soaction']})
            call = requests.request('POST', url + '/js/connector.connector/getSoaction', headers=headers, data=data)
        elif obj == 'calendar':
            call = getCalendar(session['url'], session['id'])
    elif service == "set":
        call = setData(url, obj, id, "", data)
    return call


def setData(url, obj, id, key, data):
    headers = {'Content-Type': 'application/json'}
    payload = json.dumps({"service": "setData",
                          "clientID": id,
                          "appId": "2001",
                          "OBJECT": obj,
                          "KEY": key,
                          "data": data})
    response = requests.request("POST", url, headers=headers, data=payload)
    return response


def delData(url, obj, id, key):
    headers = {'Content-Type': 'application/json'}
    payload = json.dumps({"service": "delData",
                          "clientID": id,
                          "appId": "2001",
                          "OBJECT": obj,
                          "KEY": key})
    response = requests.request("POST", url, headers=headers, data=payload)
    return response


if __name__ == "__main__":
    app.run(debug=True)
