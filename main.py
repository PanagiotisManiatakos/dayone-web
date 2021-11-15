import json
import requests
from flask import Flask, render_template, request, redirect, url_for, session
from flask_mobility import Mobility
from datetime import date, datetime
from bs4 import BeautifulSoup
import cryptocode


app = Flask(__name__)
Mobility(app)
app.secret_key = 'hell'

diff = 0


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
		getcred = s1get_Credentials(url, password, username, companycode)
		if getcred['success']:

			session['sn'] = getcred['data'][0]['sn']
			session['prsn'] = getcred['data'][0]['prsn']
			session['users'] = getcred['data'][0]['users']
			session['isadmin'] = getcred['data'][0]['isadmin']
			session['name'] = getcred['data'][0]['name']
			session['name2'] = getcred['data'][0]['name2']

			vD1DatesUsers = s1get_DateUsers(getcred['data'][0]['sn'])

			blcdate = vD1DatesUsers['data'][0]['BLCKDATE']
			users = vD1DatesUsers['data'][0]['USERS']
			today = date.today()
			blckdate = datetime.strptime(blcdate, '%Y-%m-%d %H:%M:%S')
			global diff
			diff = (blckdate.date() - today).days

			session['cccwebaccounts'] = getcred['data'][0]['cccwebaccounts']
			session['erp'] = erp
			session['id'] = auth
			session['url'] = url
			session['companycode'] = companycode
			session['companyname'] = companyname
			session['username'] = username
			session['password'] = password
			session['blckdate'] = blckdate
			session['users'] = users

			if diff >= 0:
				vcheck = check_if_logged_in(getcred['data'][0]['sn'], username)  # Κανω κλήση για να δω εαν είναι συνδεδεμενος
				if vcheck['success']:  # Εάν είναι συνδεδεμένος
					logout_from_log(vcheck['data'][0]['CCCLOGINLOG'])  # Τον αφαιρώ
				vActives = get_actives(getcred['data'][0]['sn'])['data'][0]['ACTIVES']
				if users > vActives:  # Αν οι users είναι περισότεροι απο τους active
					login_to_log()  # Τον προσθέτω
				else:  # Αλλιώς
					session.clear()
					error = 'Υπέρβαση χρηστών'  # Επιστρέφω σφάλμα
					return {'success': False, 'error': error}
				return {'success': True}
			else:
				session['expired'] = True
				return {
					'success': False,
					'error':
						'Η άδεια χρήσης του λογισμικού σας έληξε.\n'
						'Παρακαλώ καλέστε στο: 216 5005060 για ανανέωση.\n'
						'Λήξη: ' + str(blckdate.date())
				}
		else:
			error = 'Try again '

	else:
		if 'id' in session and 'expired' not in session:
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
		if type(creds) is requests.models.Response and creds.status_code == 200:
			if creds.json()['success']:
				data = creds.json()['data'][0]
				return getCompanies(url, data['cccwebaccounts']).json()
			else:
				return s1get_Credentials1(url, password, username).json()
		else:
			return {'success': False, 'error': 'domain'}


@app.route('/logout')
def logout():
	if 'id' in session:
		if 'loginid' in session:
			logout_from_log(session.get('loginid'))
		session.clear()
	return redirect(url_for('login'))


@app.route("/")
def reindex():
	if 'id' in session and 'expired' not in session:
		if request.MOBILE:
			return render_template("mobile/m_home.html")
		else:
			return render_template("desktop/home.html")
	else:
		return redirect(url_for('logout'))


@app.route("/index")
def index():
	if 'id' in session and 'expired' not in session:
		if request.MOBILE:
			return render_template("mobile/m_home.html")
		else:
			return render_template("desktop/home.html")
	else:
		return redirect(url_for('logout'))


@app.route("/renew")
def renew():
	if 'id' in session and 'expired' in session:
		if request.MOBILE:
			return render_template("mobile/m_renew.html")
		else:
			return render_template("desktop/home.html")
	else:
		return redirect(url_for('logout'))


@app.route('/clearcache', methods=['GET', 'POST'])
def clearcache():
	if 'id' in session:
		if request.method == "POST":
			clear = requests.request('GET', session['url'] + '?refresh')
			if clear.status_code == 200:
				session.clear()
				return {'success': True}
			else:
				return {'success': False}
	else:
		return redirect(url_for('logout'))


@app.route('/changepassword', methods=['GET', 'POST'])
def changepassword():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			id = session['cccwebaccounts']
			data = {"cccWEBACCOUNTS": [{"password": request.form['newpassword']}]}
			response = setData(
				session['url'], 'cccWEBACCOUNTS', session['id'], id, data)
			if response.json()['success']:
				session['password'] = request.form['newpassword']

			return response.json()
	else:
		return redirect(url_for('logout'))


@app.route('/meetings')
def meetings():
	if 'id' in session and 'expired' not in session:
		if request.MOBILE:
			return render_template("mobile/m_meetings.html")
		else:
			return render_template("desktop/meetings.html")
	else:
		return redirect(url_for('logout'))


@app.route('/meetings/insert', methods=["POST", "GET"])
def insertMeet():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			data = {
				"SOACTION": [
					{
						"trndate": request.form['trndate'],
						"series": request.form['series'],
						"fromdate": request.form['fromdate'],
						"finaldate": request.form['finaldate'],
						"trdr": request.form['trdr'],
						"comments": request.form['comments'],
						"remarks": request.form['remarks'],
						"actor": session['users'],
						"actprsn": session['prsn']
					}
				]
			}
			response = setData(session['url'], 'SOMEETING', session['id'], "", data)

			return response.json()
	else:

		return redirect(url_for('logout'))


@app.route('/meetings/update', methods=["POST", "GET"])
def updtMeet():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			id = request.form['soaction']
			data = {"SOACTION": [{
				"fromdate": request.form['fromdate'],
				"finaldate": request.form['finaldate'],
				"trdr": request.form['trdr'],
				"comments": request.form['comments'],
				"remarks": request.form['remarks'],
			}]
			}
			response = setData(session['url'], 'SOMEETING', session['id'], id, data)

			return response.json()
	else:

		return redirect(url_for('logout'))


@app.route('/customers')
def customers():
	if 'id' in session and 'expired' not in session:
		if request.MOBILE:
			return render_template("mobile/m_customerstest.html")

		else:
			return render_template("desktop/customerstest.html")

	else:

		return redirect(url_for('logout'))


@app.route('/customers/insert', methods=["POST", "GET"])
def insertCust():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			data = {
				"CUSTOMER": [
					{
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
					}
				]
			}
			response = setData(session['url'], 'CUSTOMER', session['id'], "", data)

			return response.json()
	else:

		return redirect(url_for('logout'))


@app.route('/customers/update', methods=["POST", "GET"])
def updtCust():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			id = request.form['trdr']
			data = {
				"CUSTOMER": [
					{
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
					}
				]
			}
			response = setData(session['url'], 'CUSTOMER', session['id'], id, data)
			return response.json()
	else:
		return redirect(url_for('logout'))


@app.route('/customers/delete', methods=["POST", "GET"])
def deleteCust():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			id = request.form['id']
			response = delData(session['url'], 'CUSTOMER', session['id'], id)
			return response.json()
	else:
		return redirect(url_for('logout'))


@app.route('/trdprsn/insert', methods=["POST", "GET"])
def instTrdrPrsn():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			data = {
				"PRSNOUT": [
					{
						"code": request.form['code'],
						"name": request.form['name'],
						"name2": request.form['name2'],
						"phone1": request.form['phone1'],
						"phone2": request.form['phone2'],
						"email": request.form['email'],
						"fax": request.form['fax'],
					}
				]
			}
			response = setData(
				session['url'], 'PRSNOUT', session['id'], '', data)
			return response.json()
	else:
		return redirect(url_for('logout'))


@app.route('/prsn/update', methods=["POST", "GET"])
def updtPrsn():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			id = request.form['prsn']
			data = {
				"PRSNOUT": [
					{
						"code": request.form['code'],
						"name": request.form['name'],
						"name2": request.form['name2'],
						"phone1": request.form['phone1'],
						"phone2": request.form['phone2'],
						"email": request.form['email'],
						"fax": request.form['fax'],
					}]
			}
			response = setData(
				session['url'], 'PRSNOUT', session['id'], id, data)
			return response.json()
	else:
		return redirect(url_for('logout'))


@app.route('/getKartela', methods=['GET', 'POST'])
def getKartela():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			trdrname = request.form['trdrname']
			fdate = request.form['fdate']
			response1 = getReportInfo(session['url'], "CUST_STM", session['id'], trdrname, fdate)
			if response1.json()['success']:
				reqid = response1.json()['reqID']
				pages = response1.json()['npages']
				response = getReportData(session['url'], session['id'], reqid, pages)
				soup = BeautifulSoup(response.content, "html.parser")
			return {
				'body': str(soup.body.findChildren(recursive=False)),
				'css': str(soup.link),
				'script': str(soup.script)
			}
	else:
		return redirect(url_for('logout'))


@app.route('/parousiologio')
def parousiologio():
	if 'id' in session and 'expired' not in session:
		token = cryptocode.encrypt(session['url'].lower(), "wow")
		d1 = {'qrcode': token}
		if request.MOBILE:
			return render_template("mobile/m_parousiologio.html", data=d1)
		else:
			return render_template("desktop/parousiologio.html", data=d1)

	else:
		return redirect(url_for('logout'))


@app.route('/parousiologio/insert', methods=["POST", "GET"])
def insertParousiologio():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			message = request.form['qrcode']
			latitude = request.form['latitude']
			longitude = request.form['longitude']
			mm = cryptocode.decrypt(message, "wow")
			if mm == session['url'].lower():
				datee = request.form['date']
				thecheck = s1_CheckForChekIn(session['url'], session['prsn'], datee, session['companycode'])
				if thecheck.json()['success']:
					soaction = thecheck.json()['data'][0]['SOACTION']
					data = {"SOPRSN": [{
						"finaldate": datee,
						'ccclatitudecheckout': latitude,
						'ccclongitudecheckout': longitude,
					}]
					}
					setData(session['url'], 'SOPRSN', session['id'], soaction, data)
					return {'success': True, 'status': 'update'}
				else:
					data = {
						"SOPRSN": [
							{
								"trndate": datee,
								"fromdate": datee,
								'series': 9889,
								'ccclatitudecheckin': latitude,
								'ccclongitudecheckin': longitude,
								'actprsn': session['prsn'],
							}
						]
					}
					print(data)
					setData(session['url'], 'SOPRSN', session['id'], "", data)
					return {'success': True, 'status': 'insert'}
			else:
				return {'success': True, 'status': 'qrcode'}
	else:
		return redirect(url_for('logout'))


@app.route('/calls')
def calls():
	if 'id' in session and 'expired' not in session:
		if request.MOBILE:
			return render_template("mobile/m_calls.html")
		else:
			return render_template("desktop/m_calls.html")
	else:
		return redirect(url_for('logout'))


@app.route('/calls/insert', methods=["POST", "GET"])
def insertcall():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			if request.form['actstatus'] == 'true':
				data = {
					"SOACTION": [
						{
							"tsodtype": request.form.get('tsodtype'),
							"fromdate": request.form.get('start'),
							"finaldate": request.form.get('start'),
							"actor": session['users'],
							"actprsn": session['prsn'],
							"comments": request.form.get('comments'),
							"trdr": request.form.get('trdr'),
							"trdprsn": request.form.get('prsn'),
							"remarks": request.form.get('remarks'),
							"actstatus": 3
						}
					]
				}
			else:
				data = {
					"SOACTION": [
						{
							"tsodtype": request.form.get('tsodtype'),
							"fromdate": request.form.get('start'),
							"actor": session['users'],
							"actprsn": session['prsn'],
							"comments": request.form.get('comments'),
							"trdr": request.form.get('trdr'),
							"trdprsn": request.form.get('prsn'),
							"remarks": request.form.get('remarks'),
						}
					]
				}

			response = setData(session['url'], 'SOCALL', session['id'], "", data)

			return response.text
	else:
		return redirect(url_for('logout'))


@app.route('/calls/update', methods=["POST", "GET"])
def updatecall():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			id = request.form['soaction']
			if request.form['actstatus'] == 'true':
				data = {
					"SOACTION": [
						{
							"tsodtype": request.form['tsodtype'],
							"finaldate": request.form.get('start'),
							"actor": session['users'],
							"actprsn": session['prsn'],
							"comments": request.form.get('comments'),
							"trdr": request.form['trdr'],
							"trdprsn": request.form.get('prsn'),
							"remarks": request.form.get('remarks'),
							"actstatus": 3
						}
					]
				}
			else:
				data = {
					"SOACTION": [
						{
							"tsodtype": request.form['tsodtype'],
							"actor": session['users'],
							"actprsn": session['prsn'],
							"comments": request.form['comments'],
							"trdr": request.form.get('trdr'),
							"trdprsn": request.form.get('prsn'),
							"remarks": request.form.get('remarks'),
						}
					]
				}
			response = setData(session['url'], 'SOCALL', session['id'], id, data)

			return response.text
	else:
		return redirect(url_for('logout'))


@app.route('/calendar')
def calendar():
	if 'id' in session and 'expired' not in session:
		headers = {'Content-Type': 'application/json'}
		data = json.dumps({'clientID': session['id'], 'username': session['username']})
		call = requests.request('POST', session['url'] + '/js/connector.connector/getCalendarInfo', headers=headers, data=data)
		if request.MOBILE:
			return render_template("mobile/m_calendar.html", cdata=call.json())
		else:
			return render_template("desktop/calendar.html", cdata=call.json())
	else:
		return redirect(url_for('logout'))


@app.route('/calendar/insert', methods=["POST", "GET"])
def insertcal():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			data = {
				"SOACTION": [
					{
						"trndate": request.form['start'],
						"fromdate": request.form['start'],
						"finaldate": request.form['end'],
						"actprsn": session['prsn'],
						"COMMENTS": request.form['title'],
					}
				]
			}
			response = setData(
				session['url'], 'SOMEETING', session['id'], "", data)
			return response.text
	else:
		return redirect(url_for('logout'))


@app.route('/calendar/update', methods=["POST", "GET"])
def updatecal():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			id = request.form['id']
			data = {
				"SOACTION": [
					{
						"trndate": request.form['start'],
						"fromdate": request.form['start'],
						"finaldate": request.form['end'],
						"actprsn": session['prsn']
					}
				]
			}
			response = setData(session['url'], 'SOMEETING', session['id'], id, data)

			return response.text
	else:
		return redirect(url_for('logout'))


@app.route('/calendar/delete', methods=["POST", "GET"])
def deletecal():
	if 'id' in session and 'expired' not in session:
		if request.method == "POST":
			id = request.form['id']
			response = delData(session['url'], 'SOMEETING', session['id'], id)

			return response.text
	else:
		return redirect(url_for('logout'))


@app.route("/getProducts")
def getProducts():
	if 'id' in session and 'expired' not in session:
		url = 'http://dayone.oncloud.gr/s1services'
		log = s1login(url)
		auth = s1authenticate(url, log, session['companycode'])

		return get_Products(url, auth)
	else:
		return redirect(url_for('logout'))


@app.route("/getPayments")
def getPayments():
	if 'id' in session and 'expired' not in session:
		url = 'http://dayone.oncloud.gr/s1services'
		log = s1login(url)
		auth = s1authenticate(url, log, session['companycode'])

		return get_Payments(url, auth)
	else:
		return redirect(url_for('logout'))


@app.route("/getPrintOutForms", methods=["POST", "GET"])
def getPrintOutForms():
	if 'id' in session and 'expired' not in session:
		headers = {'Content-Type': 'application/json'}
		sosource = request.form['sosource']
		data = json.dumps(
			{
				'clientID': session['id'],
				'company': session['companycode'],
				'sosource': sosource
			}
		)
		call = requests.request('POST', session['url'] + '/js/connector.connector/getForms', headers=headers, data=data)

		return call.json()
	else:
		return redirect(url_for('logout'))


@app.route("/D1ServicesIN", methods=['GET', 'POST'])
def D1ServicesIN():
	erp = session['erp']
	service = request.form['service']
	obj = request.form['object']
	company = session['companycode']
	url = session['url']
	auth = session['id']
	if obj == 'findoc':
		questions = {'findoc': request.form['id']}
	elif obj == 'trdr':
		questions = {'trdr': request.form['id']}
	elif obj == 'mtrl':
		questions = {'mtrl': request.form['id']}
	elif obj == 'prsn':
		questions = {'prsn': request.form['prsn']}
	elif obj == 'toptrdr':
		questions = {'sodtype': request.form['sodtype']}
	elif obj == 'trdrcode':
		questions = {'code': request.form['code']}
	elif obj == 'trdrname':
		questions = {'name': request.form['name']}
	elif obj == 'mtrlname':
		questions = {
			'name': request.form['name'],
			'sodtype': request.form['sodtype']
		}
	elif obj == 'mtrlcode':
		questions = {
			'code': request.form['code'],
			'sodtype': request.form['sodtype']
		}
	elif obj == 'trdraddress':
		questions = {'trdr': request.form['trdr']}
	elif obj == 'trdrpeople':
		questions = {'trdr': request.form['trdr']}
	elif obj == 'trdropenorders':
		questions = {
			'trdr': request.form['trdr'],
			'company': session['companycode']
		}
	elif obj == 'soaction' or obj == 'soactionfirst':
		questions = {'soaction': request.form['id']}
	elif obj == 'soactionseries':
		questions = {'company': session['companycode']}
	elif obj == 'calendar' or obj == 'calls' or obj == 'meetings':
		questions = ''
	elif obj == 'callinfo':
		questions = {'soaction': request.form['soaction']}

	elif obj == 'printoutform':
		questions = {
			'ObjectName': request.form['ObjectName'],
			'FormName': "",
			'RecordID': request.form['id'],
			'TemplateCode': request.form['TemplateCode']
		}
	else:
		questions = {'qname': request.form['qname'], 'qcode': request.form['qcode']}
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


@app.route("/d1services", methods=['POST'])
def d1services():
	if request.method == "POST":
		data1 = request.get_json()
		data = dict((k.lower(), v) for k, v in data1.items())
		erp = data.get('erp')
		service = data.get('service')
		connection = data.get('connection')
		company = data.get('company')
		if erp.lower() == "softone":
			url = 'https://' + connection + '.oncloud.gr/s1services'
			if service.lower() == "login":
				company = data.get('company')
				user = data.get('user')
				password = data.get('password')
				clientID = s1login_Out(url, user, password)
				if clientID['success']:
					return s1authenticate_Out(url, clientID['clientID'], company)
				else:
					return clientID
			elif service.lower() == "get":
				clientID = data.get('clientid')
				obj = data.get('object')
				key = data.get('key')
				response = s1_get_call_out(url, clientID, company, obj)
				return response
			elif service.lower() == "set_order":
				clientID = data.get('clientid')
				dataset = dict((k.lower(), v) for k, v in data.get('data').items())
				saldoc = dict((k.lower(), v) for k, v in dataset.get('saldoc').items())
				trdr = dict((k.lower(), v) for k, v in saldoc.get('trdr').items())
				itelines = dataset.get('itelines')
				headers = {'Content-Type': 'application/json'}
				# Αν δεν έχει συμπληρωμένο trdr
				if trdr.get('trdr') == '':
					# Χτίζω την κλήση για να δω αν υπαρχει ο trdr συμφωνα με το τηλεφωνο
					payload = json.dumps(
						{
							"clientID": clientID,
							"company": company,
							"phone": trdr.get('phone01')
						})
					trdrexist = requests.request('POST', url + '/js/connector.ws_Mparouti/getTrdr', headers=headers, data=payload)
					if trdrexist.json().get('success'):
						trdr['trdr'] = trdrexist.json().get('data')[0].get('TRDR')
				payload = json.dumps(
					{
						"service": "setData",
						"clientID": clientID,
						"appId": "2001",
						"OBJECT": "CUSTOMER",
						"KEY": trdr['trdr'],
						"data": {
							"CUSTOMER": [
								{
									"CODE": trdr.get('code'),
									"NAME": trdr.get('name'),
									"EMAIL": trdr.get('email'),
									"PHONE01": trdr.get('phone01'),
									"COMPANY": company
								}
							]
						}
					})
				setTrdr = requests.request('POST', url, headers=headers, data=payload)
				if setTrdr.json().get('success'):
					saldoc['trdr'] = setTrdr.json().get('id')
				else:
					errorTrdr = setTrdr.json()
					errorTrdr['object'] = 'customer'
					return errorTrdr
				y = 0
				mt = [dict() for number in itelines]
				# Λουπα για κάθε iteline
				for i in itelines:
					item = dict((k.lower(), v) for k, v in i.items())
					# Τα στοιχεία του mtrl της γραμμης
					mtrl = dict((k.lower(), v) for k, v in item.get('mtrl').items())
					# Αν δεν έχει συμπληρωμένο mtrl τότε κάνω κλήση για να δω αν υπάρχει
					if mtrl.get('mtrl') == '':
						# Χτίζω την κλήση
						payload = json.dumps(
							{
								"clientID": clientID,
								"company": company,
								"code": mtrl.get('code')
							})
						# Κάνω κλήση για να δω αν υπάρχει το συγκεκριμένο mtrl με αυτό το όνομα
						mtrlexist = requests.request('POST', url + '/js/connector.ws_Mparouti/getMtrl', headers=headers, data=payload)
						# Αν υπάρχει τοτε ενημερώνω το mtrl
						if mtrlexist.json().get('success'):
							mtrl['mtrl'] = mtrlexist.json().get('data')[0].get('MTRL')
					# Χτίζω την κλήση για UPDATE ή INSERT
					payload = json.dumps(
						{
							"service": "setData",
							"clientID": clientID,
							"appId": "2001",
							"OBJECT": "ITEM",
							"KEY": mtrl.get('mtrl'),
							"data": {
								"ITEM": [
									{
										"CODE": mtrl.get('code'),
										"NAME": mtrl.get('name'),
										"VAT": mtrl.get('vat'),
										"PRICER": mtrl.get('pricer'),
										"PRICEW": mtrl.get('pricew'),
										"MTRUNIT1": mtrl.get('mtrunit'),
										"MTRUNIT2": mtrl.get('mtrunit'),
										"MTRUNIT3": mtrl.get('mtrunit'),
										"MTRUNIT4": mtrl.get('mtrunit'),
										"MU21": 1,
										"MU31": 1,
										"MU41": 1,
										"COMPANY": company
									}
								], "ITEEXTRA": [
									{
										"VARCHAR01": mtrl.get('publisher')
									}
								]
							}
						})
					setMtrl = requests.request('POST', url, headers=headers, data=payload)
					if setMtrl.json().get('success'):
						i['MTRL'] = setMtrl.json().get('id')
						mt[y]['itemID'] = setMtrl.json().get('id')
						mt[y]['isbn'] = mtrl.get('code')
					else:
						errorMtrl = setMtrl.json()
						errorMtrl['object'] = 'item'
						errorMtrl['isbn'] = mtrl.get('code')
						return errorMtrl
					y = y + 1
				payload = json.dumps(
					{
						"service": "setData",
						"clientID": clientID,
						"appId": "2001",
						"OBJECT": "SALDOC",
						"KEY": "",
						"data": {
							"SALDOC": [saldoc],
							"ITELINES": dataset.get('itelines'),
							"MTRDOC": dataset.get('mtrdoc')
						}
					})
				setOrder = requests.request('POST', url, headers=headers, data=payload)
				if setOrder.json().get('success'):
					setOrderMsg = setOrder.json()

					setOrderMsg['data'] = {
						'customerID': saldoc.get('trdr'),
						'items': mt
					}
					return setOrderMsg
				else:
					return setOrder.json()
		else:
			return {'success': False, 'error': 'false erp'}


# -------------functions for CONTROL------------- #

def s1get_DateUsers(sn):
	payload = json.dumps(
		{
			"sn": sn
		})
	response = requests.request('POST', 'http://dayone.oncloud.gr/s1services/js/ModuleCheck.D1WebServices/checkUsers', data=payload)
	return response.json()


def check_if_logged_in(sn, username):
	payload = json.dumps(
		{
			"sn": sn,
			"username": username
		})
	response = requests.request('POST', 'http://dayone.oncloud.gr/s1services/js/ModuleCheck.D1WebServices/checkIfUserIsLoggedIn', data=payload)
	return response.json()


def login_to_log():
	payload = json.dumps(
		{
			"service": "setData",
			"clientID": "9J8pJMXuSqrBL69JLqrtLrLvTK5oP4DCM45KLKHGLqHiP49CIanLJoKtHabpHKfaK4Po9JL3TIKrGr1DT5LtPMLKLbbcL4DLP5GbDKDPGKmbDKLXPavrH5D7Kr5r9JL4LL53JoKsC7HpL4fPHrH1HNKbDKDK9JL4Oqb2S6LHG4r5KIKrH5LcGaDeKqrnT75KLbLNLrXnSafaU6D9J2KsC6DJL4rtLrLvPKHpL6DEPcXpL695S5XVTLLEG6X2J4biObTV9JT4TKvhH792PNXaLNDnTLS",
			"appId": "2001",
			"OBJECT": "CCCLOGINLOG",
			"KEY": "",
			"data": {
				"CCCLOGINLOG": [
					{
						"SN": session['sn'],
						"ACCOUNT": session['cccwebaccounts'],
						"USERNAME": session['username'],
						"TYPE": 601,
						"ID": session['id'],
						"LOGIN": datetime.today().strftime('%Y-%m-%dT%H:%M')
					}
				]
			}
		})
	response = requests.request('POST', 'http://dayone.oncloud.gr/s1services', data=payload)
	session['loginid'] = response.json()['id']
	return response.json()


def logout_from_log(key):
	headers = {'Content-Type': 'application/json'}
	payload = json.dumps(
		{
			"service": "delData",
			"clientID": "9J8pJMXuSqrBL69JLqrtLrLvTK5oP4DCM45KLKHGLqHiP49CIanLJoKtHabpHKfaK4Po9JL3TIKrGr1DT5LtPMLKLbbcL4DLP5GbDKDPGKmbDKLXPavrH5D7Kr5r9JL4LL53JoKsC7HpL4fPHrH1HNKbDKDK9JL4Oqb2S6LHG4r5KIKrH5LcGaDeKqrnT75KLbLNLrXnSafaU6D9J2KsC6DJL4rtLrLvPKHpL6DEPcXpL695S5XVTLLEG6X2J4biObTV9JT4TKvhH792PNXaLNDnTLS",
			"appId": "2001",
			"OBJECT": "CCCLOGINLOG",
			"KEY": key
		})
	response = requests.request("POST", 'http://dayone.oncloud.gr/s1services', headers=headers, data=payload)

	return response.json()


def get_actives(sn):
	payload = json.dumps(
		{
			"sn": sn
		})
	response = requests.request('POST', 'http://dayone.oncloud.gr/s1services/js/ModuleCheck.D1WebServices/getActiveUsers', data=payload)
	return response.json()


# -------------functions for LOGIN------------- #


def s1login(url):
	payload = json.dumps({
		"service": "login",
		"username": "eshop",
		"password": "eshop",
		"appId": "2001"})
	response = requests.post(url + '/post', data=payload)

	return response.json()['clientID']


def s1login_Out(url, username, password):
	payload = json.dumps({
		"service": "login",
		"username": username,
		"password": password,
		"appId": "2001"})
	response = requests.post(url + '/post', data=payload)

	return response.json()


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


def s1authenticate_Out(url, id, company):
	payload = json.dumps({
		"service": "authenticate",
		"clientID": id,
		"COMPANY": company,
		"BRANCH": "1000",
		"MODULE": "0",
		"REFID": "303"})
	response = requests.post(url + '/post', data=payload)

	return response.json()


def s1get_Credentials1(url, password, username):
	payload = json.dumps({
		"password": password,
		"username": username
	})
	try:
		response = requests.request('POST', url + '/js/connector.connector/getCredentials1', data=payload)
		return response
	except requests.exceptions.RequestException as e:
		return {'success': False, 'error': e}


def s1get_Credentials(url, password, username, company):
	payload = json.dumps(
		{
			"password": password,
			"username": username,
			"company": company
		})
	response = requests.request('POST', url + '/js/connector.connector/getCredentials', data=payload)

	return response.json()


def s1_CheckForChekIn(url, prsn, datee, company):
	payload = json.dumps(
		{
			"clientID": session['id'],
			"date": datee,
			"prsn": prsn,
			"company": company
		})
	response = requests.request('POST', url + '/js/connector.connector/checkForCheckIn', data=payload)

	return response


def getCompanies(url, cccwebaccounts):
	payload = json.dumps({"cccwebaccounts": cccwebaccounts})
	response = requests.request('POST', url + '/js/connector.connector/getCompanies', data=payload)

	return response


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


# -------------functions for LISTS------------- #


def getCustomers(url, id, company):
	payload = json.dumps(
		{
			'clientID': id,
			'company': company
		})
	response = requests.request('POST', url + '/js/connector.connector/getCustomers', data=payload)

	return response.json()['data']


def getSoaction(url, id):
	payload = json.dumps(
		{
			'clientID': id,
			'company': session['companycode'],
			'prsn': session['prsn']
		})
	response = requests.request('POST', url + '/js/connector.connector/getSoaction', data=payload)

	return response


def getCalendar(url, id):
	payload = json.dumps(
		{
			'clientID': id,
			'company': session['companycode'],
			'prsn': session['prsn']
		})
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
			data = json.dumps(
				{
					'clientID': id,
					'company': company,
					'qname': data['qname'],
					'qcode': data['qcode']
				})
			call = requests.request('POST', url + '/js/connector.connector/getCustomers', headers=headers, data=data)

		elif obj == "trdr":
			data = json.dumps(
				{
					'clientID': id,
					'trdr': data['trdr']
				})
			call = requests.request('POST', url + '/js/connector.connector/getTrdr', headers=headers, data=data)

		elif obj == "mtrl":
			data = json.dumps(
				{
					'clientID': id,
					'mtrl': data['mtrl']
				})
			call = requests.request('POST', url + '/js/connector.connector/getMtrl', headers=headers, data=data)
		elif obj == "prsn":
			data = json.dumps(
				{
					'clientID': id,
					'prsn': data['prsn']
				})
			call = requests.request('POST', url + '/js/connector.connector/getPrsn', headers=headers, data=data)
		elif obj == "toptrdr":
			data = json.dumps(
				{
					"clientID": id,
					"company": session['companycode'],
					"sodtype": data['sodtype']
				})
			call = requests.request('POST', url + '/js/connector.connector/getTopTrdr', headers=headers, data=data)
		elif obj == "trdrcode":
			data = json.dumps(
				{
					"clientID": id,
					"code": data['code'],
					"company": session['companycode']
				})
			call = requests.request('POST', url + '/js/connector.connector/getTrdrSelectorByCode', headers=headers, data=data)
		elif obj == "trdrname":
			data = json.dumps(
				{
					"clientID": id,
					"name": data['name'],
					"company": session['companycode']
				})
			call = requests.request('POST', url + '/js/connector.connector/getTrdrSelectorByName', headers=headers, data=data)
		elif obj == "mtrlname":
			data = json.dumps(
				{
					"clientID": id,
					"name": data['name'],
					"company": session['companycode'],
					"sodtype": data['sodtype']
				})
			call = requests.request('POST', url + '/js/connector.connector/getMtrlSelectorByName', headers=headers, data=data)
		elif obj == "mtrlcode":
			data = json.dumps(
				{
					"clientID": id,
					"code": data['code'],
					"company": session['companycode'],
					"sodtype": data['sodtype']
				})
			call = requests.request('POST', url + '/js/connector.connector/getMtrlSelectorByCode', headers=headers, data=data)
		elif obj == "trdraddress":
			data = json.dumps(
				{
					"clientID": id,
					"trdr": data['trdr']
				})
			call = requests.request('POST', url + '/js/connector.connector/getTrdrAddress', headers=headers, data=data)
		elif obj == "trdrpeople":
			data = json.dumps(
				{
					"clientID": id,
					"trdr": data['trdr']
				})
			call = requests.request('POST', url + '/js/connector.connector/getTrdrPeople', headers=headers, data=data)
		elif obj == "trdropenorders":
			data = json.dumps(
				{
					"clientID": id,
					"trdr": data['trdr'],
					"company": data['company']
				})
			call = requests.request('POST', url + '/js/connector.connector/getTrdrOpenOrders', headers=headers, data=data)
		elif obj == 'soaction':
			data = json.dumps(
				{
					'clientID': id,
					'soaction': data['soaction'],
					'company': session['companycode']
				})
			call = requests.request('POST', url + '/js/connector.connector/getSoaction', headers=headers, data=data)
		elif obj == 'soactionfirst':
			data = json.dumps(
				{
					'clientID': id,
					'soaction': data['soaction'],
					'company': session['companycode']
				})
			call = requests.request('POST', url + '/js/connector.connector/getSoactionFirst', headers=headers, data=data)
		elif obj == 'soactionseries':
			data = json.dumps(
				{
					'clientID': id,
					'company': data['company']
				})
			call = requests.request('POST', url + '/js/connector.connector/getSoactionSeries', headers=headers, data=data)
		elif obj == 'findoc':
			data = json.dumps(
				{
					'clientID': id,
					'findoc': data['findoc']
				})
			call = requests.request('POST', url + '/js/connector.connector/getFindoc', headers=headers, data=data)
		elif obj == 'printoutform':
			data = json.dumps(
				{
					'clientID': id,
					'ObjectName': data['ObjectName'],
					'FormName': "",
					'RecordID': data['RecordID'],
					'TemplateCode': data['TemplateCode']
				})
			call = requests.request('POST', url + '/js/connector.connector/PrintS1Template', headers=headers, data=data)
		elif obj == 'calendar':
			data = json.dumps(
				{
					'clientID': id,
					'company': session['companycode'],
					'prsn': session['prsn']
				})
			call = requests.request('POST', url + '/js/connector.connector/getCalendar', headers=headers, data=data)
		elif obj == 'meetings':
			data = json.dumps(
				{
					'clientID': id,
					'company': session['companycode'],
					'prsn': session['prsn']
				})
			call = requests.request('POST', url + '/js/connector.connector/getMeetings', headers=headers, data=data)
		elif obj == 'calls':
			data = json.dumps(
				{
					'clientID': id,
					'company': session['companycode'],
					'prsn': session['prsn']
				})
			call = requests.request('POST', url + '/js/connector.connector/getCalls', headers=headers, data=data)
		elif obj == 'callinfo':
			data = json.dumps(
				{
					'clientID': id,
					'soaction': data['soaction']
				})
			call = requests.request('POST', url + '/js/connector.connector/getCallInfo', headers=headers, data=data)
	elif service == "set":
		call = setData(url, obj, id, "", data)

	return call


def setData(url, obj, id, key, data):
	headers = {'Content-Type': 'application/json'}
	payload = json.dumps(
		{
			"service": "setData",
			"clientID": id,
			"appId": "2001",
			"OBJECT": obj,
			"KEY": key,
			"data": data
		})
	response = requests.request("POST", url, headers=headers, data=payload)

	return response


def delData(url, obj, id, key):
	headers = {'Content-Type': 'application/json'}
	payload = json.dumps(
		{
			"service": "delData",
			"clientID": id,
			"appId": "2001",
			"OBJECT": obj,
			"KEY": key
		})
	response = requests.request("POST", url, headers=headers, data=payload)

	return response


def getReportInfo(url, obj, id, trdrname, fdate):
	headers = {'Content-Type': 'application/json'}
	payload = json.dumps(
		{
			"service": "getReportInfo",
			"clientID": id,
			"appId": "2001",
			"OBJECT": obj,
			"FILTERS": "QUESTIONS.FNAME=" + trdrname + "*;QUESTIONS.FROMDATE=" + fdate
		})
	response = requests.request("POST", url, headers=headers, data=payload)

	return response


def getReportData(url, id, reqID, page):
	headers = {'Content-Type': 'application/json'}
	payload = json.dumps(
		{
			"service": "getReportData",
			"clientID": id,
			"appId": "2001",
			"reqID": reqID,
			"PAGENUM": page
		})
	response = requests.get(url, headers=headers, data=payload)

	return response


def s1_get_call_out(url, clientID, company, obj):
	headers = {'Content-Type': 'application/json'}
	if obj == 'items':
		payload = json.dumps(
			{
				"clientID": clientID,
				"company": company
			})
		response = requests.request('POST', url + '/js/connector.D1API/getProducts', headers=headers, data=payload)

	return response.json()


if __name__ == "__main__":
	app.run(debug=True, host='0.0.0.0')
