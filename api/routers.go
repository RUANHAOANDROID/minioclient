package api

import (
	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
	"minioclient/api/controller"
	"minioclient/config"
)

func RegisterRoutes(group *gin.RouterGroup, minioClient *minio.Client, conf *config.Config) {
	NewFileRouter(group, minioClient, conf)
}
func NewFileRouter(group *gin.RouterGroup, minioClient *minio.Client, conf *config.Config) {
	fc := &controller.FileController{
		MinioClient: minioClient,
		Conf:        conf,
	}
	group.GET("/list", fc.List)
	group.GET("/download/:oid", fc.Download)
	group.GET("/download-p/:oid", fc.DownloadWithProgress)
	group.DELETE("/delete/:oid", fc.Delete)
	group.POST("/upload/:oid", fc.Upload)
}
