package webserver

import (
	"crypto/tls"
)

func LoadCertificate(certPath string, keyPath string) (tls.Certificate, error) {
	return tls.LoadX509KeyPair(certPath, keyPath)
}
