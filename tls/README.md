<h2>install a certificate authority (ca)</h2>

<h5>Windows</h5>
<p>open cmd or powershell in <code>ca.pem</code>'s directory as administrator</p>
<p>run: <code>certutil -addstore root ca.pem</code></p>

<h5>IOS</h5>
<p>click on <code>ca.pem</code> file to load it</p>
<p>install ca.pem in settings: "VPN und Geräteverwaltung"</p>
<p>enable ca.pem in settings: "Zertifikatsvertrauenseinstellungen"</p>

<h5>Android (Samsung)</h5>
<p>click "Von USB-Speicher installieren" in settings: "Zertifikatverwaltungs-App"</p>
<p>choose "CA-Zertifikat"</p>
<p>select your <code>ca.pem</code></p>
