/// <reference path="../../types/index.d.ts" />
import * as webpack from 'webpack';
export default class UcloudPlugin {
    options: UcloudPluginOptions;
    constructor(options: UcloudPluginOptions);
    apply(compiler: webpack.Compiler): void;
    upload(stats: webpack.Stats): void;
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
    [k: string]: any;
}
