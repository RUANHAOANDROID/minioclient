package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"strings"
)

func JwtAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 提取Authorization头
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "缺少Authorization头"})
			return
		}

		// 提取Bearer token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization格式无效"})
			return
		}
		tokenStr := parts[1]

		// 解析JWT（不验证签名，Keycloak已经验证过了）
		token, _, err := new(jwt.Parser).ParseUnverified(tokenStr, jwt.MapClaims{})
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "JWT格式无效: " + err.Error()})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "JWT声明无效"})
			return
		}
		// 兼容 Keycloak 和 Cognito
		groups, ok := claims["groups"]
		if !ok {
			groups = claims["cognito:groups"]
		}
		if groupList, ok := groups.([]interface{}); ok {
			stringGroups := make([]string, len(groupList))
			for i, group := range groupList {
				if groupStr, ok := group.(string); ok {
					stringGroups[i] = strings.TrimPrefix(groupStr, "/")
				} else {
					c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "groups 中存在无效数据"})
					return
				}
			}
			c.Set("groups", stringGroups)
		} else if groupStr, ok := groups.(string); ok {
			c.Set("groups", []string{strings.TrimPrefix(groupStr, "/")})
		} else {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "groups 格式无效"})
			return
		}
		c.Next()
	}
}
