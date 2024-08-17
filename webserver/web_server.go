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
	"fmt"
	"math/big"
	"net"
	"net/http"
	"os"
	"time"
)

// creates a tls server certificate by using a ca and its key to sign this certificate
func createCertificate(caPath string, keyPath string, subject pkix.Name, hosts []string) (tls.Certificate, error) {
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
		return tls.Certificate{}, nil
	}

	// create pem blocks

	certPEMBlock := pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: certBytes})
	keyPEMBlock := pem.EncodeToMemory(&pem.Block{Type: "PRIVATE KEY", Bytes: keyBytes})

	// create tls certificate and return

	return tls.X509KeyPair(certPEMBlock, keyPEMBlock)
}

func listenAndServeTLS(cert tls.Certificate, handler http.Handler) error {
	netListener, err := net.Listen("tcp", ":443")
	if err != nil {
		return err
	}

	tlsListener := tls.NewListener(netListener, &tls.Config{
		Certificates: []tls.Certificate{cert},
		MinVersion:   tls.VersionTLS13,
		CipherSuites: []uint16{
			tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
		},
	})

	fmt.Println("Starting...")
	return http.Serve(tlsListener, handler)
}

func CreateWebServerAndCertificate(caPath string, keyPath string, subject pkix.Name, hosts []string, handler http.Handler) error {
	cert, err := createCertificate(caPath, keyPath, subject, hosts)
	if err != nil {
		return err
	}

	return listenAndServeTLS(cert, handler)
}

func CreateWebServer(certPath string, keyPath string, handler http.Handler) error {
	cert, err := tls.LoadX509KeyPair(certPath, keyPath)
	if err != nil {
		return err
	}

	return listenAndServeTLS(cert, handler)
}
