"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s3 = require("s3");
const defaultOptions = {
    s3ForcePathStyle: true,
    s3BucketEndpoint: true
};
class UcloudPlugin {
    constructor(options) {
        this.options = Object.assign(Object.assign({}, defaultOptions), options);
    }
    apply(compiler) {
        const doneFn = (stats) => {
            this.upload(stats);
        };
        if (compiler.hooks) {
            const plugin = { name: 'UcloudPlugin' };
            compiler.hooks.done.tap(plugin, doneFn);
        }
        else {
            compiler.plugin('done', doneFn);
        }
    }
    upload(stats) {
        if (stats.hasErrors()) {
            console.warn('UcloudPlugin: 编译出错，暂停上传');
            return;
        }
        const client = s3.createClient({
            s3Options: Object.assign({}, this.options)
        });
        const params = {
            localDir: this.options.localDir,
            s3Params: {
                Prefix: this.options.remoteDir,
                Bucket: this.options.bucketName,
            },
        };
        const uploader = client.uploadDir(params);
        const needUploadFile = [];
        uploader.on('error', (err) => {
            console.error('上传失败:', err.stack);
        });
        uploader.on('fileUploadStart', (fullPath) => {
            needUploadFile.push(fullPath);
        });
        uploader.on('fileUploadEnd', (fullPath) => {
            const willDeleteIndex = needUploadFile.indexOf(fullPath);
            if (willDeleteIndex > -1) {
                needUploadFile.splice(willDeleteIndex, 1);
            }
        });
        uploader.on('end', () => {
            if (needUploadFile.length > 0) {
                console.warn('\n注意：存在未上传文件：', needUploadFile);
            }
            else {
                console.info('\n上传完毕');
            }
        });
        // console.log('开始上传', Object.keys(stats.compilation.assets))
    }
}
exports.default = UcloudPlugin;
