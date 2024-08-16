package webserver

import (
	"crypto/tls"
	"net"
	"net/http"
)

func ListenAndServeTLS(cert tls.Certificate, handler http.Handler) error {
	netListener, err := net.Listen("tcp", ":443")
	if err != nil {
		return err
	}

	tlsListener := tls.NewListener(netListener, &tls.Config{
		Certificates: []tls.Certificate{cert},
	})

	err = http.Serve(tlsListener, handler)
	return err
}
