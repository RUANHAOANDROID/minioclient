package config

import (
	"minioclient/pkg"
	"time"
)

// Config app config
type Config struct {
	App     App
	MinIO   MinIO
	Options Options
}
type App struct {
	Name    string `yaml:"name"`
	Version string `yaml:"version"`
}

type MinIO struct {
	Address   string `yaml:"address"`
	AccessKey string `yaml:"accessKey"`
	SecretKey string `yaml:"secretKey"`
	Token     string `yaml:"token"`
	Bucket    string `yaml:"bucket"`
}

type Options struct {
	Port    string        `yaml:"port"`
	Timeout time.Duration `yaml:"timeout"`
}

func Load(path string) (*Config, error) {
	// Initialize options from config file and CLI context.
	var config Config
	err := pkg.LoadYml(path, &config)
	if err != nil {
		pkg.Log.Error(err)
	}
	return &config, nil
}
