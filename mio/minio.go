package mio

import (
	"fmt"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"minioclient/config"
)

// 初始化 MinIO 客户端

func Connect(conf *config.Config) (error, *minio.Client) {
	serverUrl := conf.MinIO.Address
	accessKey := conf.MinIO.AccessKey
	secretKey := conf.MinIO.SecretKey
	token := conf.MinIO.Token
	// 初始化 MinIO 客户端
	minioClient, err := minio.New(serverUrl, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, token),
		Secure: false,
	})
	if err != nil {
		return err, nil
	}
	if minioClient.IsOffline() {
		return fmt.Errorf("minio不在线%v", minioClient), nil
	}
	return nil, minioClient
}
