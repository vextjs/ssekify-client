/**
 * vsse 自定义请求头使用示例
 * 演示如何使用 event-source-polyfill 支持的自定义请求头功能
 */

import { SSEClient } from '../src/index.js';

// 示例1：基础自定义请求头用法
console.log('=== 示例1：基础自定义请求头 ===');
const basicSSE = new SSEClient({
  url: '/sse?userId=alice',
  eventName: 'notify',

  // ✨ 新功能：SSE 连接自定义请求头
  sseHeaders: {
    'X-API-Key': 'your-api-key-here',
    'X-Client-Version': '1.0.0',
    'X-Request-Source': 'web-client'
  },

  // 原有功能保持不变
  idleTimeout: 30_000,
  withHeartbeat: true,
});

// 使用方式完全不变
try {
  const { requestId, unsubscribe } = await basicSSE.postAndListen(
    '/api/chat',
    { message: 'Hello with custom headers!' },
    ({ phase, type, payload }) => {
      console.log(`[${requestId}] 收到消息:`, { phase, type, payload });
    }
  );

  console.log('任务已启动，requestId:', requestId);
} catch (error) {
  console.error('基础示例失败:', error.message);
}

// 示例2：JWT Token 自动注入
console.log('\n=== 示例2：JWT Token 自动注入 ===');
const authSSE = new SSEClient({
  url: '/sse/authenticated',
  eventName: 'notify',

  // ✨ token 现在会自动添加到 SSE 连接的 Authorization 头
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',

  // 同时支持其他自定义头
  sseHeaders: {
    'X-Service-Name': 'frontend-client',
    'X-Trace-ID': crypto.randomUUID()
  },
});

// 示例3：微服务架构场景
console.log('\n=== 示例3：微服务间认证 ===');
const microserviceSSE = new SSEClient({
  url: '/internal/sse/notifications',

  // 服务间认证
  token: await getServiceToken(),
  sseHeaders: {
    'X-Service-Name': 'web-frontend',
    'X-Service-Version': '2.1.0',
    'X-Correlation-ID': generateCorrelationId(),
    'X-Request-Priority': 'high'
  },

  // 微服务环境通常需要携带凭据
  sseWithCredentials: true,
});

// 示例4：跨域场景配置
console.log('\n=== 示例4：跨域 SSE 连接 ===');
const corsSSE = new SSEClient({
  url: 'https://api.external-service.com/sse',

  sseHeaders: {
    'Origin': 'https://myapp.com',
    'X-Requested-With': 'XMLHttpRequest',
    'X-API-Version': 'v2'
  },

  sseWithCredentials: true, // 跨域携带凭据
});

// 示例5：动态更新认证信息
console.log('\n=== 示例5：动态更新配置 ===');
const dynamicSSE = new SSEClient({
  url: '/sse?userId=bob',
  sseHeaders: {
    'X-Session-ID': 'initial-session'
  }
});

// 模拟 token 刷新场景
setTimeout(() => {
  console.log('更新认证信息...');
  dynamicSSE.updateConfig({
    token: 'new-refreshed-token',
    sseHeaders: {
      'X-Session-ID': 'refreshed-session',
      'X-Auth-Timestamp': Date.now().toString()
    }
  });
}, 5000);

// 辅助函数
async function getServiceToken() {
  // 模拟获取服务间认证 token
  return 'service-token-' + Date.now();
}

function generateCorrelationId() {
  return 'corr-' + Math.random().toString(36).substr(2, 9);
}

// 示例6：错误处理和回退
console.log('\n=== 示例6：错误处理最佳实践 ===');
const robustSSE = new SSEClient({
  url: '/sse/robust',

  // 主要认证方式
  token: localStorage.getItem('authToken'),
  sseHeaders: {
    'X-API-Key': process.env.API_KEY || 'fallback-key',
    'X-Client-ID': getClientId(),
  },

  // 重连配置优化
  reconnectBackoff: {
    baseMs: 1000,
    maxMs: 10000,
    factor: 1.5,
    jitter: 0.2
  },

  // 心跳优化
  expectedPingInterval: 10000,
});

function getClientId() {
  return localStorage.getItem('clientId') ||
         sessionStorage.getItem('clientId') ||
         'anonymous-' + Date.now();
}

console.log('所有示例已初始化完成！');
