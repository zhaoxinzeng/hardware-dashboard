# ERNIE-Image 昇腾 910A 单卡部署镜像说明

## 📦 下载信息

| 项目 | 详情 |
|------|------|
| **镜像下载链接** | http://119.6.186.130:12080/ernie-image-ascend910a-deploy-package_20260421.tar.gz |
| 镜像大小 | 716 MB (压缩后) |
| SHA256 | `fa1704bd2241ed4a152724528c76eea0e5984fcf6d96dd57adceb522204c40e5` |
| 下载有效期 | 临时服务，建议尽快下载 |

---

## 🚀 快速部署步骤

### 1. 下载部署包
```bash
wget http://119.6.186.130:12080/ernie-image-ascend910a-deploy-package_20260421.tar.gz
```

### 2. 解压
```bash
tar -xzf ernie-image-ascend910a-deploy-package_20260421.tar.gz
```

### 3. 导入镜像
```bash
docker load < ernie-image-ascend910a-single_20260421.tar.gz
```

### 4. 准备模型权重
从 ModelScope 下载 ERNIE-Image 模型到 `/path/to/model`:
```bash
mkdir -p /path/to/model/PaddlePaddle
cd /path/to/model/PaddlePaddle
# 使用 modelscope snapshot_download 下载 ERNIE-Image
# 目录结构: /path/to/model/PaddlePaddle/ERNIE-Image/
```

### 5. 启动服务
```bash
docker run -d \
  --name ernie-image-single \
  --device /dev/davinci0:/dev/davinci0 \
  --device /dev/davinci_manager:/dev/davinci_manager \
  --device /dev/devmm_svm:/dev/devmm_svm \
  --device /dev/hisi_hdc:/dev/hisi_hdc \
  -v /usr/local/Ascend:/usr/local/Ascend:ro \
  -v /etc/ascend_install.info:/etc/ascend_install.info:ro \
  -v /path/to/model:/root/ernie_image_deploy/model:ro \
  -v /path/to/outputs:/data/outputs \
  -p 12050:8080 \
  -e ERNIE_IMAGE_MODEL_DIR=/root/ernie_image_deploy/model/PaddlePaddle/ERNIE-Image \
  -e ASCEND_RT_VISIBLE_DEVICES=0 \
  ernie-image-ascend910a:20260421
```

### 6. 验证服务
```bash
# 健康检查
curl http://localhost:12050/health

# 测试生成
curl -X POST http://localhost:12050/generate \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"a beautiful sunset","steps":4,"height":512,"width":512}'
```

---

## 📊 性能预期

| 指标 | 数值 |
|------|------|
| 首次推理 (含算子编译) | ~220 秒 |
| 后续推理 | ~32 秒 |
| 分辨率 | 512x512 |
| 推理步数 | 4 steps |
| 显存占用 | ~32GB |

---

## ✨ 镜像内置优化

- ✅ **VAE Slicing**: 解决 32GB 显存下的 OOM 问题
- ✅ **torch_npu NPU 加速**: 昇腾 910A 原生支持
- ✅ **CANN 算子自动融合**: 30-50% 性能提升
- ✅ **PyTorch 3.10 环境**: 完整的 Python 运行时

---

## 🔧 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `ERNIE_IMAGE_MODEL_DIR` | 模型目录路径 | `/root/ernie_image_deploy/model/PaddlePaddle/ERNIE-Image` |
| `ERNIE_IMAGE_OUTPUT_DIR` | 输出目录 | `/data/outputs` |
| `ASCEND_RT_VISIBLE_DEVICES` | NPU 设备编号 | `0` |
| `ERNIE_IMAGE_DTYPE` | 精度 | `float16` |

---

## 📋 前置要求

- 昇腾 910A 服务器 (单卡 32GB 显存以上)
- openEuler 22.03 LTS 或兼容系统
- CANN 7.0+ Toolkit 已安装在 `/usr/local/Ascend`
- Docker 18.09+

---

## ⚠️ 注意事项

1. 临时下载服务会在服务器重启后停止，请尽快下载
2. 镜像不包含模型权重，需单独从 ModelScope 下载
3. 首次推理包含算子编译过程，耗时较长属于正常现象
4. 完整部署说明详见部署包内的 `README_DEPLOY.md`
