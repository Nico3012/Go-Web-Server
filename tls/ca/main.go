package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"log"
	"math/big"
	"os"
	"time"
)

func main() {
	priv, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		log.Fatalf("Failed to generate private key: %v", err)
	}

	serialNumber, err := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 128))
	if err != nil {
		log.Fatalf("Failed to generate serial number: %v", err)
	}

	notBefore := time.Now()
	notAfter := notBefore.Add(365 * 24 * time.Hour)

	template := x509.Certificate{
		SerialNumber: serialNumber,
		Subject: pkix.Name{
			// if this information is missing, the certificate may not be trusted:
			CommonName:         "liquipay.de",                                // required by openssl
			Organization:       []string{"Liquipay UG (haftungsbeschränkt)"}, // required by openssl
			OrganizationalUnit: []string{"IT"},                               // required by openssl
			Country:            []string{"DE"},                               // required by openssl
			Province:           []string{"Nordrhein-Westfalen"},              // required by openssl
			Locality:           []string{"Lindlar"},                          // required by openssl
			PostalCode:         []string{"51789"},                            // optional
			StreetAddress:      []string{"Hauptstraße 10"},                   // optional
		},
		NotBefore: notBefore,
		NotAfter:  notAfter,

		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
		IsCA:                  true,
	}

	// create cert and key

	// create certificate bytes
	certBytes, err := x509.CreateCertificate(rand.Reader, &template, &template, &priv.PublicKey, priv)
	if err != nil {
		log.Fatalf("Failed to create certificate: %v", err)
	}

	// PKCS#8 is a standard for storing private key information for any algorithm
	keyBytes, err := x509.MarshalPKCS8PrivateKey(priv)
	if err != nil {
		log.Fatalf("Unable to marshal private key: %v", err)
	}

	// writing files:

	// create ca.pem
	certOut, err := os.Create("ca.pem")
	if err != nil {
		log.Fatalf("Failed to open ca.pem for writing: %v", err)
	}
	// write to ca.pem
	err = pem.Encode(certOut, &pem.Block{Type: "CERTIFICATE", Bytes: certBytes})
	if err != nil {
		log.Fatalf("Failed to write data to ca.pem: %v", err)
	}

	// create key.pem
	keyOut, err := os.Create("key.pem")
	if err != nil {
		log.Fatalf("Failed to open key.pem for writing: %v", err)
	}
	// write to key.pem
	err = pem.Encode(keyOut, &pem.Block{Type: "PRIVATE KEY", Bytes: keyBytes})
	if err != nil {
		log.Fatalf("Failed to write data to key.pem: %v", err)
	}
}
