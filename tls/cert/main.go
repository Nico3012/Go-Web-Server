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
	"net"
	"os"
	"strings"
	"time"
)

func main() {
	// read ca files

	caFile, err := os.ReadFile("../ca/trusted/ca.pem")
	if err != nil {
		log.Fatalf("Failed to read ca.pem file: %v", err)
	}

	caKeyFile, err := os.ReadFile("../ca/trusted/key.pem")
	if err != nil {
		log.Fatalf("Failed to read key.pem file: %v", err)
	}

	// decode pem

	caBlock, _ := pem.Decode(caFile)
	if caBlock == nil || caBlock.Type != "CERTIFICATE" {
		log.Fatalf("Failed to decode PEM block containing certificate")
	}

	caKeyBlock, _ := pem.Decode(caKeyFile)
	if caKeyBlock == nil || caKeyBlock.Type != "PRIVATE KEY" {
		log.Fatalf("Failed to decode PEM block containing private key")
	}

	// parse ca and key

	caTemplate, err := x509.ParseCertificate(caBlock.Bytes)
	if err != nil {
		log.Fatalf("Failed to parse ca certificate: %v", err)
	}

	caKey, err := x509.ParsePKCS8PrivateKey(caKeyBlock.Bytes)
	if err != nil {
		log.Fatalf("Failed to parse PKCS#8 private key: %v", err)
	}

	// generate new certificate stuff

	priv, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		log.Fatalf("Failed to generate private key: %v", err)
	}

	serialNumber, err := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 128))
	if err != nil {
		log.Fatalf("Failed to generate serial number: %v", err)
	}

	notBefore := time.Now()
	notAfter := notBefore.Add(2 * 365 * 24 * time.Hour)

	certTemplate := x509.Certificate{
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

		KeyUsage:              x509.KeyUsageDigitalSignature,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
	}

	hosts := "localhost,127.0.0.1,192.168.2.53"
	for _, host := range strings.Split(hosts, ",") {
		ip := net.ParseIP(host)
		if ip != nil {
			certTemplate.IPAddresses = append(certTemplate.IPAddresses, ip)
		} else {
			certTemplate.DNSNames = append(certTemplate.DNSNames, host)
		}
	}

	// create cert and key

	// create certificate bytes
	certBytes, err := x509.CreateCertificate(rand.Reader, &certTemplate, caTemplate, &priv.PublicKey, caKey)
	if err != nil {
		log.Fatalf("Failed to create certificate: %v", err)
	}

	// PKCS#8 is a standard for storing private key information for any algorithm
	keyBytes, err := x509.MarshalPKCS8PrivateKey(priv)
	if err != nil {
		log.Fatalf("Unable to marshal private key: %v", err)
	}

	// writing files:

	// create cert.pem
	certOut, err := os.Create("cert.pem")
	if err != nil {
		log.Fatalf("Failed to open cert.pem for writing: %v", err)
	}
	// write to cert.pem
	err = pem.Encode(certOut, &pem.Block{Type: "CERTIFICATE", Bytes: certBytes})
	if err != nil {
		log.Fatalf("Failed to write data to cert.pem: %v", err)
	}

	// create key.pem
	keyOut, err := os.Create("key.pem")
	if err != nil {
		log.Fatalf("Failed to open priv.pem for writing: %v", err)
	}
	// write to key.pem
	err = pem.Encode(keyOut, &pem.Block{Type: "PRIVATE KEY", Bytes: keyBytes})
	if err != nil {
		log.Fatalf("Failed to write data to key.pem: %v", err)
	}
}
