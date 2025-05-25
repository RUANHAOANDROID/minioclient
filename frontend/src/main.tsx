import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import keycloak from './lib/keycloak.ts'
// 先初始化 Keycloak
keycloak.init({
    onLoad: 'login-required',  // 自动要求用户登录
    checkLoginIframe: false    // 提高性能
}).then(authenticated => {
    if (authenticated) {
        console.log('认证成功')
        console.log(keycloak.token)
        // 认证成功后渲染应用
        createRoot(document.getElementById('root')!).render(
            <StrictMode>
                <App/>
            </StrictMode>,
        )
    } else {
        console.log('未认证，重定向到登录页')
        keycloak.login()
    }
}).catch(error => {
    console.error('Keycloak 初始化失败:', error)
})