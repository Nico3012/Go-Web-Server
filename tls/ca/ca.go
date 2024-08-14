package ca

import (
	"crypto/rand"
	"crypto/rsa"
)

func CreateCA() {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
}
