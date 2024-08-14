package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"fmt"
	"io/ioutil"
	"math/big"
	"os"
	"time"
)

// LoadCertificate loads a PEM encoded certificate from a file
func LoadCertificate(filename string) (*x509.Certificate, error) {
	certPEM, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(certPEM)
	if block == nil || block.Type != "CERTIFICATE" {
		return nil, fmt.Errorf("failed to decode PEM block containing certificate")
	}

	return x509.ParseCertificate(block.Bytes)
}

// LoadPrivateKey loads a PEM encoded RSA private key from a file
func LoadPrivateKey(filename string) (*rsa.PrivateKey, error) {
	keyPEM, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(keyPEM)
	if block == nil || block.Type != "RSA PRIVATE KEY" {
		return nil, fmt.Errorf("failed to decode PEM block containing private key")
	}

	return x509.ParsePKCS1PrivateKey(block.Bytes)
}

func main() {
	// Load CA certificate and key
	caCert, err := LoadCertificate("ca_cert.pem")
	if err != nil {
		fmt.Println("Failed to load CA certificate:", err)
		return
	}

	caKey, err := LoadPrivateKey("ca_key.pem")
	if err != nil {
		fmt.Println("Failed to load CA private key:", err)
		return
	}

	// Generate RSA key pair for new server certificate
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		fmt.Println("Failed to generate private key:", err)
		return
	}

	// Create a template for the new server certificate
	certTemplate := &x509.Certificate{
		SerialNumber: big.NewInt(2),
		Subject: pkix.Name{
			Organization:  []string{"Example Server"},
			Country:       []string{"US"},
			Province:      []string{"California"},
			Locality:      []string{"San Francisco"},
			StreetAddress: []string{"1234 Server Street"},
			PostalCode:    []string{"94101"},
		},
		NotBefore:             time.Now(),
		NotAfter:              time.Now().AddDate(1, 0, 0), // Valid for 1 year
		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageKeyEncipherment,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
	}

	// Add Subject Alternative Name (SAN) extension for the server
	certTemplate.DNSNames = []string{"localhost"}

	// Create the server certificate
	certDER, err := x509.CreateCertificate(rand.Reader, certTemplate, caCert, &privateKey.PublicKey, caKey)
	if err != nil {
		fmt.Println("Failed to create certificate:", err)
		return
	}

	// Encode and save the server certificate
	certFile, err := os.Create("server_cert.pem")
	if err != nil {
		fmt.Println("Failed to open server_cert.pem for writing:", err)
		return
	}
	defer certFile.Close()

	if err := pem.Encode(certFile, &pem.Block{Type: "CERTIFICATE", Bytes: certDER}); err != nil {
		fmt.Println("Failed to write data to server_cert.pem:", err)
		return
	}
	fmt.Println("Server certificate written to server_cert.pem")

	// Encode and save the private key
	keyFile, err := os.Create("server_key.pem")
	if err != nil {
		fmt.Println("Failed to open server_key.pem for writing:", err)
		return
	}
	defer keyFile.Close()

	if err := pem.Encode(keyFile, &pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(privateKey)}); err != nil {
		fmt.Println("Failed to write data to server_key.pem:", err)
		return
	}
	fmt.Println("Private key written to server_key.pem")
}
