package pkg

import (
	"path"
	"strings"
)

// GetFileType 根据 key 后缀名返回文件类型
func GetFileType(key string) string {
	ext := strings.ToLower(path.Ext(key))
	switch ext {
	case ".txt":
		return "text"
	case ".apk":
		return "apk"
	// 可以继续根据需求增加其他后缀类型
	case ".jpg", ".jpeg", ".png", ".gif":
		return "image"
	case ".mp4", ".avi", ".mov":
		return "video"
	case ".mp3", ".wav":
		return "audio"
	default:
		return "other"
	}
}
