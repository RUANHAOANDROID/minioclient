package api

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
	"minioclient/api/middleware"
	"minioclient/config"
	"minioclient/frontend"
)

const ApiUri = "/api/v1"

func Setup(conf *config.Config, minoClient *minio.Client) error {
	router := gin.Default()
	trustedProxies := []string{
		"127.0.0.1",
		//config.Localhost,
	}
	if err := router.SetTrustedProxies(trustedProxies); err != nil {
		fmt.Printf("server: %s", err)
	}
	frontend.Register(router)
	//开启重定向
	router.RedirectTrailingSlash = true
	router.Use(middleware.Cors())
	router.Use(middleware.ErrorHandler())
	router.Use(middleware.LoggerMiddleware())
	apiV1 := router.Group(ApiUri)
	RegisterRoutes(apiV1, minoClient, conf)
	return router.Run(conf.Options.Port)
}
