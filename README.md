This project relies on the go programming language.

Es ist nicht notwendig Kenntnisse zu haben, wie man go auf seine Zielplatform kompiliert und baut, da davon auszugehen ist, dass ein Projekt, welches weiterentwickelt wird, auch zukünftig sicherstellt, dass es auf verschiedensten ausführplatformen verfügbar ist (bzw. pre-build installer bereitstellt.)
Das Go weiterentwickelt wird, ist insofern wichtig, da z.B. bei der Kryptografie Fortschritt stattfinden muss. Diese Implementierungen sind nicht durch die Entwicklungsresourcen in diesem Projekt zu stämmen, so dass sich drauf verlassen werden muss, dass Go diese Features aktuell und kompatibel zu allen modernen Webbrowsern hällt.

<p>------------------------------------------------------------------------------------------------------</p>

<h2>Go create server certificate</h2>
<code>go run generate_cert.go --host localhost,127.0.0.1,192.168.2.53 --ecdsa-curve P256</code>

<h2>install a certificate authority (ca)</h2>

<h5>Windows</h5>
<p>open cmd or powershell in <code>ca.pem</code>'s directory as administrator</p>
<p>run: <code>certutil -addstore root ca.pem</code></p>

<h5>IOS</h5>
<p>click on <code>ca.pem</code> file to load it</p>
<p>install ca.pem in settings: "VPN und Geräteverwaltung"</p>
<p>enable ca.pem in settings: "Zertifikatsvertrauenseinstellungen"</p>

<h5>Android (Samsung)</h5>
<p>"Sicherheit und Datenschutz"</p>
<p>"Weitere Sicherheitseinstellungen"</p>
<p>"Von Gerätespeicher installieren"</p>
<p>choose "CA-Zertifikat"</p>
<p>select your <code>ca.pem</code></p>
<p>OLD:</p>
<p>click "Von USB-Speicher installieren" in settings: "Zertifikatverwaltungs-App"</p>
<p>choose "CA-Zertifikat"</p>
<p>select your <code>ca.pem</code></p>
