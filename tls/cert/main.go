package main

import (
	"crypto/x509"
	"encoding/pem"
	"os"
)

func loadCertificate(name string) (*x509.Certificate, error) {
	cert, err := os.ReadFile(name)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(cert)
}

func main() {}
