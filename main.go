package main

import (
	"bytes"
	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"io"
	"log"
	"net/http"
)

const ServerUrl = "192.168.8.6:9768"
const AccessKey = "ELUGN04RII6WD4K59DEM"
const SecretKey = "ObhJpLZ6dNvR1sw2ZOU8EgvFCC9yuzEZIqS+m+Ul"
const Bucket = "uchi"

// 初始化 MinIO 客户端
var minioClient *minio.Client

func main() {
	// 初始化 MinIO 客户端
	var err error
	minioClient, err = minio.New(ServerUrl, &minio.Options{
		Creds:  credentials.NewStaticV4(AccessKey, SecretKey, ""),
		Secure: false,
	})
	if err != nil {
		log.Fatal(err)
	}
	if minioClient.IsOffline() {
		panic("Minio 不在线")
	}
	// 初始化 Gin 路由
	r := gin.Default()
	// 定义路由
	r.GET("/list", handleListObjects)
	r.GET("/download/*objectName", handleDownloadObject)
	// 启动服务
	r.Run(":8080")
}

// 处理列出对象的请求
func handleListObjects(c *gin.Context) {
	objectsCh := minioClient.ListObjects(c, Bucket, minio.ListObjectsOptions{Prefix: "闸机票务/icbc/"})

	var objects []string
	for object := range objectsCh {
		if object.Err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": object.Err.Error()})
			return
		}
		objects = append(objects, object.Key)
	}

	c.JSON(http.StatusOK, gin.H{"apks": objects})
}

// 处理下载对象的请求
func handleDownloadObject(c *gin.Context) {
	objectName := c.Param("objectName")
	// 下载对象
	object, err := minioClient.GetObject(c, Bucket, objectName, minio.GetObjectOptions{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer object.Close()

	// 将对象内容读取到内存中
	var buffer bytes.Buffer
	if _, err := io.Copy(&buffer, object); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// 设置响应头
	c.Data(http.StatusOK, "application/octet-stream", buffer.Bytes())
}
