package main

import (
	"minioclient/api"
	"minioclient/config"
	"minioclient/mio"
)

func main() {
	// 初始化 Gin 路由
	conf, err := config.Load("config.yml")
	if err != nil {
		panic(err)
	}
	err, minioClient := mio.Connect(conf)
	if err != nil {
		panic(err)
	}
	// 启动服务
	api.Setup(conf, minioClient)
}
