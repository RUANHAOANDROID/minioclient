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
	"time"
)

type FileController struct {
	MinioClient *minio.Client
	Conf        *config.Config
}
type SimpleObjectInfo struct {
	MD5          string `json:"md5"`
	Name         string `json:"name"`
	Size         int64  `json:"size"`
	LastModified string `json:"lastModified"`
	IsFolder     bool   `json:"isFolder"`
}

func (c FileController) List(g *gin.Context) {
	bucket := g.DefaultQuery("bucket", c.Conf.MinIO.Bucket)
	prefix := g.DefaultQuery("prefix", "") // 从URL参数获取prefix
	options := minio.ListObjectsOptions{Prefix: prefix}
	objectsCh := c.MinioClient.ListObjects(g, bucket, options)

	var objects []SimpleObjectInfo
	for object := range objectsCh {
		if object.Err != nil {
			g.JSON(http.StatusInternalServerError, domain.RespError(object.Err.Error()))
			return
		}
		objects = append(objects, SimpleObjectInfo{
			MD5:  object.ETag,
			Name: object.Key,
			Size: object.Size,
			LastModified: func(t time.Time) string {
				if t.IsZero() {
					return ""
				}
				return t.Format("2006-01-02 15:04:05.000")
			}(object.LastModified),
			IsFolder: object.Size == 0 && object.Key[len(object.Key)-1:] == "/", // 判断是否为文件夹
		})
	}
	g.JSON(http.StatusOK, objects)
}

func (c FileController) Download(g *gin.Context) {
	objName := g.Param("name")
	// 下载对象
	bucket := c.Conf.MinIO.Bucket
	options := minio.GetObjectOptions{}
	object, err := c.MinioClient.GetObject(g, bucket, objName, options)
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

func (c FileController) DownloadWithProgress(g *gin.Context) {
	objName := g.Param("name")
	bucket := c.Conf.MinIO.Bucket
	options := minio.GetObjectOptions{}
	object, err := c.MinioClient.GetObject(g, bucket, objName, options)
	if err != nil {
		g.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	defer object.Close()

	// 获取对象信息以设置 Content-Length
	stat, err := object.Stat()
	if err != nil {
		g.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	g.Header("Content-Disposition", "attachment; filename=\""+objName+"\"")
	g.Header("Content-Type", "application/octet-stream")
	g.Header("Content-Length", fmt.Sprintf("%d", stat.Size))

	// 流式传输文件内容
	if _, err := io.Copy(g.Writer, object); err != nil {
		g.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
}
func (c FileController) Delete(g *gin.Context) {

}

func (c FileController) Upload(g *gin.Context) {

}
