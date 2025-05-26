package controller

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
	"io"
	"minioclient/config"
	"minioclient/domain"
	"minioclient/pkg"
	"net/http"
	"path"
	"time"
)

type FileController struct {
	MinioClient *minio.Client
	Conf        *config.Config
}
type SimpleObjectInfo struct {
	Key          string    `json:"key"`
	Name         string    `json:"name"`
	LastModified time.Time `json:"lastModified"`
	Size         int64     `json:"size"`
	Type         string    `json:"type"` // FileType 可用 string 表示
	Path         string    `json:"path"`
	IsFolder     bool      `json:"isFolder"`
}

func (c FileController) List(g *gin.Context) {
	bucket := g.GetString("bucket")
	prefix := g.DefaultQuery("prefix", "") // 从URL参数获取prefix
	options := minio.ListObjectsOptions{Prefix: prefix}
	objectsCh := c.MinioClient.ListObjects(g, bucket, options)

	var objects []SimpleObjectInfo
	for object := range objectsCh {
		if object.Err != nil {
			g.JSON(http.StatusInternalServerError, domain.RespError(object.Err.Error()))
			return
		}

		data, err := json.Marshal(object)
		if err != nil {
			pkg.Log.Println("JSON 序列化错误:", err)
		} else {
			pkg.Log.Println(string(data))
		}
		objects = append(objects, SimpleObjectInfo{
			Key:          object.Key,
			Name:         path.Base(object.Key),
			LastModified: object.LastModified,
			Size:         object.Size,
			Type:         "file",                                                    // 这里可根据实际类型判断赋值
			Path:         object.Key,                                                // 或根据需要拼接路径
			IsFolder:     object.Size == 0 && object.Key[len(object.Key)-1:] == "/", // 判断是否为文件夹
		})
	}
	g.JSON(http.StatusOK, domain.RespSuccess(objects))
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
	// 从表单中获取桶名称
	bucket := g.DefaultQuery("bucket", "")
	if bucket == "" {
		g.JSON(http.StatusBadRequest, domain.RespError("Bucket name is required"))
		return
	}

	// 从表单中获取对象名称
	objName := g.DefaultQuery("object", "")
	if objName == "" {
		g.JSON(http.StatusBadRequest, domain.RespError("Object name is required"))
		return
	}

	// 删除对象
	err := c.MinioClient.RemoveObject(g, bucket, objName, minio.RemoveObjectOptions{})
	if err != nil {
		g.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	// 返回成功响应
	g.JSON(http.StatusOK, domain.RespSuccess(fmt.Sprintf("Object %s deleted successfully from bucket %s", objName, bucket)))
}

func (c FileController) Upload(g *gin.Context) {
	// 从表单中获取桶名称
	bucket := g.DefaultQuery("bucket", "")

	// 获取对象路径前缀
	prefix := g.DefaultQuery("prefix", "")

	// 获取上传的文件
	file, header, err := g.Request.FormFile("file")
	if err != nil {
		g.JSON(http.StatusBadRequest, domain.RespError("Failed to get file: "+err.Error()))
		return
	}
	defer file.Close()

	// 创建一个带有进度读取器的结构
	fileSize := header.Size
	progressReader := &ProgressReader{
		Reader: file,
		Total:  fileSize,
		Callback: func(progress int64) {
			pkg.Log.Printf("上传进度: %.2f%%\n", float64(progress)/float64(fileSize)*100)
		},
	}

	// 构建对象名称
	objectName := header.Filename
	if prefix != "" {
		objectName = "/" + prefix + "/" + objectName
	}

	// 设置上传选项
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// 上传对象到 MinIO
	info, err := c.MinioClient.PutObject(g.Request.Context(), bucket, objectName, progressReader, fileSize, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		g.JSON(http.StatusInternalServerError, domain.RespError("Failed to upload file: "+err.Error()))
		return
	}

	// 返回上传成功信息
	g.JSON(http.StatusOK, domain.RespSuccess(map[string]interface{}{
		"bucket":     info.Bucket,
		"key":        info.Key,
		"etag":       info.ETag,
		"size":       info.Size,
		"objectName": objectName,
	}))
}

// ProgressReader 实现了 io.Reader 接口，用于跟踪读取进度
type ProgressReader struct {
	Reader    io.Reader
	Total     int64
	BytesRead int64 // 改为更具描述性的名称
	Callback  func(int64)
}

func (pr *ProgressReader) Read(p []byte) (int, error) {
	n, err := pr.Reader.Read(p)
	pr.BytesRead += int64(n) // 正确引用字段
	if pr.Callback != nil {
		pr.Callback(pr.BytesRead) // 正确引用字段
	}
	return n, err
}
