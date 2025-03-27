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

	type request struct {
		Prefix string `json:"prefix"`
		Suffix string `json:"suffix"`
	}
	var req request
	err := g.ShouldBindJSON(&req)
	if err != nil {
		g.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Println(req)
	options := minio.ListObjectsOptions{Recursive: true}
	if req.Prefix != "" {
		options.Prefix = req.Prefix
	}
	objectsCh := c.MinioClient.ListObjects(g, c.Conf.MinIO.Bucket, options)

	var objects []string
	for object := range objectsCh {
		if object.Err != nil {
			g.JSON(http.StatusInternalServerError, domain.RespError(object.Err.Error()))
			return
		}
		if req.Suffix != object.Key[len(object.Key)-len(req.Suffix):] {
			continue
		}
		objects = append(objects, object.Key)
	}
	g.JSON(http.StatusOK, domain.RespSuccess(objects))
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
