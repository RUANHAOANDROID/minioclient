package middleware

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func BucketAuthorization() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取 bucket 参数
		bucket := c.Query("bucket")
		if bucket == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "缺少 bucket 参数"})
			return
		}

		// 获取用户的 groups
		groups, exists := c.Get("groups")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "用户未授权"})
			return
		}

		// 检查 groups 是否为字符串切片
		groupList, ok := groups.([]string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "groups 格式无效"})
			return
		}

		// 判断 bucket 是否在 groups 中
		for _, group := range groupList {
			if group == bucket {
				c.Set("bucket", bucket) // 存储 bucket 到上下文
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "无权访问该 bucket"})
	}
}
