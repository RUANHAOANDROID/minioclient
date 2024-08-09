package controller

import (
	"bytes"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
	"io"
	"minioclient/config"
	"minioclient/domain"
	"net/http"
)

type FileController struct {
	MinioClient *minio.Client
	Conf        *config.Config
}

func (c FileController) List(g *gin.Context) {
	objectsCh := c.MinioClient.ListObjects(g, c.Conf.MinIO.Bucket, minio.ListObjectsOptions{Prefix: "prefix"})

	var objects []string
	for object := range objectsCh {
		if object.Err != nil {
			g.JSON(http.StatusInternalServerError, domain.RespError(object.Err.Error()))
			return
		}
		objects = append(objects, object.Key)
	}
	g.JSON(http.StatusOK, objects)
}

func (c FileController) Download(g *gin.Context) {
	objName := g.Param("name")
	// 下载对象
	object, err := c.MinioClient.GetObject(g, c.Conf.MinIO.Bucket, objName, minio.GetObjectOptions{})
	if err != nil {
		g.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
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
		g.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	// 设置响应头
	//c.Data(http.StatusOK, "application/octet-stream", buffer.Bytes())
	g.Data(http.StatusOK, "application/octet-stream", buffer.Bytes())
}

func (c FileController) Delete(g *gin.Context) {

}

func (c FileController) Upload(g *gin.Context) {

}
