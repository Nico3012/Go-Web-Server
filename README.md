This project relies on the go programming language.

Es ist nicht notwendig Kenntnisse zu haben, wie man go auf seine Zielplatform kompiliert und baut, da davon auszugehen ist, dass ein Projekt, welches weiterentwickelt wird, auch zukünftig sicherstellt, dass es auf verschiedensten ausführplatformen verfügbar ist (bzw. pre-build installer bereitstellt.)
Das Go weiterentwickelt wird, ist insofern wichtig, da z.B. bei der Kryptografie Fortschritt stattfinden muss. Diese Implementierungen sind nicht durch die Entwicklungsresourcen in diesem Projekt zu stämmen, so dass sich drauf verlassen werden muss, dass Go diese Features aktuell und kompatibel zu allen modernen Webbrowsern hällt.

Das go projekt ist open source und gehört niemandem. Google leistet einen großen Teil der entwickung. Aber auch andere Firmen und Personen tragen zur Entwicklung des Projektes bei.

You can find go at https://go.dev or http://golang.org.
Additional information can be found in the git repository at https://go.googlesource.com/go or https://github.com/golang/go.
It is possible to build go from source but more easy to use a pre-built installer. The go community constantly develops new features and provides pre-build installers for all interesting platforms and architectures. Therefore it is not nessessarely to build from source.

Go is more complex than e.g. python. Therefore the go comunity in average has more experience in computer science compared to python. This means even with a smaller community, we can be sure, go will still 

Go has a smaller community in camparison with python for example. But this does not mean, there are less people working directly on the project and making sure, we can use go as we know it so far!

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
