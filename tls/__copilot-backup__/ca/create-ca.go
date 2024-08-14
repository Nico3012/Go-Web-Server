package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"fmt"
	"math/big"
	"os"
	"time"
)

func main() {
	// Generate RSA key pair
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		fmt.Println("Failed to generate private key:", err)
		return
	}

	// Create a template for the CA certificate
	caCertTemplate := &x509.Certificate{
		SerialNumber: big.NewInt(1),
		Subject: pkix.Name{
			Organization:  []string{"Example Corp"},
			Country:       []string{"US"},
			Province:      []string{"California"},
			Locality:      []string{"San Francisco"},
			StreetAddress: []string{"1234 Example Street"},
			PostalCode:    []string{"94101"},
		},
		NotBefore:             time.Now(),
		NotAfter:              time.Now().AddDate(10, 0, 0), // Valid for 10 years
		KeyUsage:              x509.KeyUsageCertSign | x509.KeyUsageDigitalSignature | x509.KeyUsageKeyEncipherment,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth, x509.ExtKeyUsageClientAuth},
		BasicConstraintsValid: true,
		IsCA:                  true,
		MaxPathLen:            1,
	}

	// Create the CA certificate
	caCertDER, err := x509.CreateCertificate(rand.Reader, caCertTemplate, caCertTemplate, &privateKey.PublicKey, privateKey)
	if err != nil {
		fmt.Println("Failed to create CA certificate:", err)
		return
	}

	// Encode and save the CA certificate
	caCertFile, err := os.Create("ca_cert.pem")
	if err != nil {
		fmt.Println("Failed to open ca_cert.pem for writing:", err)
		return
	}
	defer caCertFile.Close()

	if err := pem.Encode(caCertFile, &pem.Block{Type: "CERTIFICATE", Bytes: caCertDER}); err != nil {
		fmt.Println("Failed to write data to ca_cert.pem:", err)
		return
	}
	fmt.Println("CA certificate written to ca_cert.pem")

	// Encode and save the private key
	keyFile, err := os.Create("ca_key.pem")
	if err != nil {
		fmt.Println("Failed to open ca_key.pem for writing:", err)
		return
	}
	defer keyFile.Close()

	if err := pem.Encode(keyFile, &pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(privateKey)}); err != nil {
		fmt.Println("Failed to write data to ca_key.pem:", err)
		return
	}
	fmt.Println("Private key written to ca_key.pem")
}
