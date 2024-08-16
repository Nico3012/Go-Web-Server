package webserver

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"errors"
	"log"
	"math/big"
	"net"
	"os"
	"time"
)

func CreateCertificateFromAuthority(caPath string, keyPath string, subject pkix.Name, hosts []string) (tls.Certificate, error) {
	// read ca and key file

	caFile, err := os.ReadFile(caPath)
	if err != nil {
		return tls.Certificate{}, err
	}

	caKeyFile, err := os.ReadFile(keyPath)
	if err != nil {
		return tls.Certificate{}, err
	}

	// decode pem

	caBlock, _ := pem.Decode(caFile)
	if caBlock == nil || caBlock.Type != "CERTIFICATE" {
		return tls.Certificate{}, errors.New("failed to decode PEM block containing certificate")
	}

	caKeyBlock, _ := pem.Decode(caKeyFile)
	if caKeyBlock == nil || caKeyBlock.Type != "PRIVATE KEY" {
		return tls.Certificate{}, errors.New("failed to decode PEM block containing private key")
	}

	// parse ca and key

	caTemplate, err := x509.ParseCertificate(caBlock.Bytes)
	if err != nil {
		return tls.Certificate{}, err
	}

	caKey, err := x509.ParsePKCS8PrivateKey(caKeyBlock.Bytes)
	if err != nil {
		return tls.Certificate{}, err
	}

	// create new certificate essential stuff

	priv, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return tls.Certificate{}, err
	}

	serialNumber, err := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 128))
	if err != nil {
		return tls.Certificate{}, err
	}

	notBefore := time.Now()
	notAfter := notBefore.Add(60 * 24 * time.Hour) // 60 days is recommended for certificates

	// create new certificate template

	certTemplate := x509.Certificate{
		SerialNumber: serialNumber,
		Subject:      subject,
		NotBefore:    notBefore,
		NotAfter:     notAfter,

		KeyUsage:              x509.KeyUsageDigitalSignature,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
	}

	// assign hosts to certificate

	for _, host := range hosts {
		ip := net.ParseIP(host)
		if ip != nil {
			certTemplate.IPAddresses = append(certTemplate.IPAddresses, ip)
		} else {
			certTemplate.DNSNames = append(certTemplate.DNSNames, host)
		}
	}

	// create certificate and key bytes

	certBytes, err := x509.CreateCertificate(rand.Reader, &certTemplate, caTemplate, &priv.PublicKey, caKey)
	if err != nil {
		return tls.Certificate{}, nil
	}

	// PKCS#8 is a standard for storing private key information for any algorithm
	keyBytes, err := x509.MarshalPKCS8PrivateKey(priv)
	if err != nil {
		log.Fatalf("Unable to marshal private key: %v", err)
	}

	// create pem blocks

	certPEMBlock := pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: certBytes})
	keyPEMBlock := pem.EncodeToMemory(&pem.Block{Type: "PRIVATE KEY", Bytes: keyBytes})

	// create tls certificate and return

	return tls.X509KeyPair(certPEMBlock, keyPEMBlock)
}
