package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"log"
	"math/big"
	"net"
	"os"
	"time"
)

var (
	hosts     = [...]string{"localhost", "127.0.0.1"}
	notBefore = time.Date(2024, 7, 24, 0, 0, 0, 0, time.UTC)
	notAfter  = notBefore.Add(2 * 365 * 24 * time.Hour)
)

func main() {
	serialNumber, err := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 128))
	if err != nil {
		log.Fatalf("Failed to generate serial number: %v", err)
	}

	keyUsage := x509.KeyUsageDigitalSignature | x509.KeyUsageKeyEncipherment // rsa key

	template := x509.Certificate{
		SerialNumber: serialNumber,
		Subject: pkix.Name{
			Organization: []string{"Liquipay UG (haftungsbeschränkt)"},
		},
		NotBefore: notBefore,
		NotAfter:  notAfter,

		KeyUsage:              keyUsage,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
	}

	for _, host := range hosts {
		ip := net.ParseIP(host)

		if ip != nil {
			template.IPAddresses = append(template.IPAddresses, ip)
		} else {
			template.DNSNames = append(template.DNSNames, host)
		}
	}

	// create rsa priv key

	priv, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		log.Fatalf("Failed to generate private key: %v", err)
	}

	// create bytes for cert and key

	certificateBytes, err := x509.CreateCertificate(rand.Reader, &template, &template, &priv.PublicKey, priv)
	if err != nil {
		log.Fatalf("Failed to create certificate: %v", err)
	}

	privBytes, err := x509.MarshalPKCS8PrivateKey(priv)
	if err != nil {
		log.Fatalf("Unable to marshal private key: %v", err)
	}

	// save "cert.pem"

	certOut, err := os.Create("cert.pem")
	if err != nil {
		log.Fatalf("Failed to open cert.pem for writing: %v", err)
	}

	err = pem.Encode(certOut, &pem.Block{Type: "CERTIFICATE", Bytes: certificateBytes})
	if err != nil {
		log.Fatalf("Failed to write data to cert.pem: %v", err)
	}

	err = certOut.Close()
	if err != nil {
		log.Fatalf("Error closing cert.pem: %v", err)
	}

	log.Print("wrote cert.pem\n")

	// save "key.pem"

	keyOut, err := os.Create("key.pem")
	if err != nil {
		log.Fatalf("Failed to open key.pem for writing: %v", err)
	}

	err = pem.Encode(keyOut, &pem.Block{Type: "PRIVATE KEY", Bytes: privBytes})
	if err != nil {
		log.Fatalf("Failed to write data to key.pem: %v", err)
	}

	err = keyOut.Close()
	if err != nil {
		log.Fatalf("Error closing key.pem: %v", err)
	}

	log.Print("wrote key.pem\n")
}
