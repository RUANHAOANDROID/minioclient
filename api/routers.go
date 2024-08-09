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
	group.POST("/List", fc.List)
	group.POST("/Download/:oid", fc.Download)
	group.POST("/Delete/:oid", fc.Delete)
	group.POST("/Upload/:oid", fc.Upload)
}
