package api

import (
	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
	"minioclient/api/controller"
	"time"
)

func RegisterRoutes(group *gin.RouterGroup, minioClient *minio.Client, timeout time.Duration) {
	NewFileRouter(group, minioClient, timeout)
}
func NewFileRouter(group *gin.RouterGroup, minioClient *minio.Client, timeout time.Duration) {
	fc := &controller.FileController{
		MinIoClient: minioClient,
	}
	group.POST("/List", fc.List)
	group.POST("/Download/:oid", fc.Download)
	group.POST("/Delete/:oid", fc.Delete)
	group.POST("/Upload/:oid", fc.Upload)
}
