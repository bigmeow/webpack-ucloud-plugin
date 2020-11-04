# webpack-ucloud-plugin

webpack ucloud 插件,将编译完成的代码上传到 ucloud 云存储上

## 使用

```bash
npm i webpack-ucloud-plugin -D
```

```js
const UcloudPlugin = require('webpack-ucloud-plugin')
// webpack config
{
  plugins: [
    new UcloudPlugin({
      accessKeyId: '',
      secretAccessKey: '',
      // 存储桶地址(要上传的云存储空间地址)
      endpoint: '',
      // 是否启用https
      sslEnabled: false,
      // 云存储桶空间名
      bucketName: '',
      // 要上传的文件夹
      localDir: '',
      // 上传到 bucketName 下面的目录
      remoteDir: '',
      // 其他配置项 http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
    }),
  ]
}
```
