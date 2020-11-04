/// <reference path="../types/index.d.ts" />
import * as webpack from 'webpack';
import * as s3 from 's3';

const defaultOptions = {
  s3ForcePathStyle: true,
  s3BucketEndpoint: true
};

export default class UcloudPlugin {
  options: UcloudPluginOptions
  constructor(options: UcloudPluginOptions) {
    this.options = {
      ...defaultOptions,
      ...options
    };
  }

  apply(compiler: webpack.Compiler) {
    const doneFn = (stats: webpack.Stats) => {
      this.upload(stats);
    }
    if (compiler.hooks) {
      const plugin = { name: 'UcloudPlugin' };
      compiler.hooks.done.tap(plugin, doneFn);
    } else {
      compiler.plugin('done', doneFn);
    }
  }

  upload(stats: webpack.Stats) {
    if (stats.hasErrors()) {
      console.warn('UcloudPlugin: 编译出错，暂停上传');
      return;
    }
    const client = s3.createClient({
      s3Options: {
        ...this.options
      }
    });
    const params = {
      localDir: this.options.localDir,
      s3Params: {
        Prefix: this.options.remoteDir,
        Bucket: this.options.bucketName,
      },
    };
    const uploader = client.uploadDir(params);
    const needUploadFile: string[] = [];
    uploader.on('error', (err: Error) => {
      console.error('上传失败:', err.stack);
    });
    uploader.on('fileUploadStart', (fullPath: string) => {
      needUploadFile.push(fullPath);
    });
    uploader.on('fileUploadEnd', (fullPath: string) => {
      const willDeleteIndex = needUploadFile.indexOf(fullPath)
      if (willDeleteIndex > -1) {
        needUploadFile.splice(willDeleteIndex, 1);
      }
    });
    uploader.on('end', () => {
      if (needUploadFile.length > 0) {
        console.warn('\n注意：存在未上传文件：', needUploadFile)
      } else {
        console.info('\n上传完毕')
      }
    });
    // console.log('开始上传', Object.keys(stats.compilation.assets))
  }
}

export interface UcloudPluginOptions {
  accessKeyId: string;
  secretAccessKey: string;
  /** 存储域名 */
  endpoint: string;
  /** 存储桶名 */
  bucketName: string;
  /** 上传至存储桶的某个路径下 */
  remoteDir: string;
  /** 本地要上传的文件夹路径 */
  localDir: string;
  /** 是否启用https */
  sslEnabled?: boolean;

  [k: string]: any
  // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
}
