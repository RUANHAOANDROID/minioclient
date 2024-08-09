package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

type FileController struct {
	MinIoClient *minio.Client
}

func (c FileController) List(context *gin.Context) {

}

func (c FileController) Download(context *gin.Context) {

}

func (c FileController) Delete(context *gin.Context) {

}

func (c FileController) Upload(context *gin.Context) {

}
