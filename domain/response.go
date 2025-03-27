package domain

type Response struct {
	Msg  string      `json:"msg"`
	Data interface{} `json:"data,omitempty"`
}

func RespError(msg interface{}) Response {
	var errMsg string
	switch v := msg.(type) {
	case string:
		errMsg = v // 如果是 string，直接赋值
	case error:
		errMsg = v.Error() // 如果是 error 类型，调用其 Error() 方法
	default:
		errMsg = "Unknown error" // 如果是其他类型，返回默认错误信息
	}
	return Response{Msg: errMsg, Data: nil}
}

func RespSuccess(data interface{}) Response {
	return Response{Msg: "OK", Data: data}
}
