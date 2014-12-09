ghost-bcs
=========

在 ghost 中添加 Baidu BCS 云存储支持

## 安装

虽然ghost提供了存储策略的接口, 但是却没有公共的API供其它模块使用. 因此必须将bcs.js文件拷贝到 `core/storage` 目录下才能完成安装.

## 依赖

ghost-bcs依赖于baidu-bcs模块:
```bash
  # 在ghost目录下执行命令:
  npm install baidu-bcs
```

### 配置

在ghost目录下的config.js中添加相关配置:

```javascript
  production: {
    // ...
    storage: {
        provider: 'bcs',
        bucketname: 'your bucket name',
        ACCESS_KEY: 'your access key',
        SECRET_KEY: 'your secret key',
        root: 'path/to/root/',
        prefix: 'http://bcs.duapp.com/'
    }
    
  }
```
