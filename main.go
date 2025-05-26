package main

import (
	"minioclient/api"
	"minioclient/config"
	"minioclient/mio"
	"minioclient/pkg"
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
	err = api.Setup(conf, minioClient)
	if err != nil {
		pkg.Log.Error(err.Error())
	}
}
