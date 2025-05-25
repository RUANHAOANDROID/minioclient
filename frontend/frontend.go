package frontend

import (
	"embed"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"log"
)

//go:embed dist/*
var Static embed.FS

func Register(r *gin.Engine) {
	fs, err := static.EmbedFolder(Static, "dist")
	if err != nil {
		log.Fatalf("embed static folder error: %v", err)
	}
	r.Use(static.Serve("/", fs))
}
