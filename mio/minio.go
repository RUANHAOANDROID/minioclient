package mio

import (
	"bytes"
	"context"
	"fmt"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"io"
	"minioclient/config"
)

// 初始化 MinIO 客户端
var minioClient *minio.Client
var bucket = "uchi"

func Connect(conf *config.Config) (error, *minio.Client) {
	serverUrl := conf.MinIO.Address
	accessKey := conf.MinIO.AccessKey
	secretKey := conf.MinIO.SecretKey
	token := conf.MinIO.Token
	bucket = conf.MinIO.Bucket
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

// HandleListObjects 处理列出对象的请求
func HandleListObjects(c context.Context, prefix string) (error, []string) {
	//objectsCh := minioClient.ListObjects(c, Bucket, mio.ListObjectsOptions{Prefix: "闸机票务/icbc/"})
	objectsCh := minioClient.ListObjects(c, bucket, minio.ListObjectsOptions{Prefix: prefix})

	var objects []string
	for object := range objectsCh {
		if object.Err != nil {
			return object.Err, nil
		}
		objects = append(objects, object.Key)
	}
	return nil, objects
}

// DownloadObject 处理下载对象的请求
func DownloadObject(c context.Context, objName string) (error, []byte) {
	// 下载对象
	object, err := minioClient.GetObject(c, bucket, objName, minio.GetObjectOptions{})
	if err != nil {
		return err, nil
	}
	defer func(object *minio.Object) {
		err := object.Close()
		if err != nil {
			fmt.Printf("关闭minio错误%v\n", err)
		}
	}(object)

	// 将对象内容读取到内存中
	var buffer bytes.Buffer
	if _, err := io.Copy(&buffer, object); err != nil {
		return err, nil
	}
	// 设置响应头
	//c.Data(http.StatusOK, "application/octet-stream", buffer.Bytes())
	return nil, buffer.Bytes()
}
