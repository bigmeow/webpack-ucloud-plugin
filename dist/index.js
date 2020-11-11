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
        setTimeout(() => {
            const copyOption = JSON.parse(JSON.stringify(this.options));
            delete copyOption.accessKeyId;
            delete copyOption.secretAccessKey;
            console.log("正在上传资源到Ucloud,上传配置:\n", copyOption);
        }, 0);
        uploader.on('error', (err) => {
            console.error('上传失败:', err.stack);
        });
        // console.log('开始上传', Object.keys(stats.compilation.assets))
        uploader.on('end', () => {
            console.log(`上传完毕，总计需要上传${(uploader.progressTotal / 1024 / 1024).toFixed(2)}MB(${uploader.progressTotal}bytes), 实际上传${(uploader.progressAmount / 1024 / 1024).toFixed(2)}MB(${uploader.progressAmount}bytes)`);
        });
    }
}
exports.default = UcloudPlugin;
