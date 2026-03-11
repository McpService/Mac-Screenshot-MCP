# mac-screenshot-mcp

macOS 截图 MCP 服务，封装 macOS 的 `screencapture` 命令，提供全屏截图功能。

## 安装

```bash
npm install -g mac-screenshot-mcp
```

## 使用

### 在 MCP Client 中配置

在你的 MCP 配置文件中添加：

```json
{
  "mcpServers": {
    "mac-screenshot": {
      "command": "npx",
      "args": ["-y", "mac-screenshot-mcp"]
    }
  }
}
```

或者直接调用：

```json
{
  "mcpServers": {
    "mac-screenshot": {
      "command": "mac-screenshot-mcp"
    }
  }
}
```

### 可用的 Tools

#### `capture_screen` - 全屏截图

捕获整个屏幕的画面并保存为 PNG 文件。

**参数：**

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `outputPath` | string | `~/Desktop/Screenshots/` | 截图保存目录（可选） |
| `includeCursor` | boolean | `false` | 是否在截图中包含鼠标光标 |
| `showPreview` | boolean | `false` | 截图后是否显示预览窗口 |

**示例请求：**

```json
{
  "tool": "capture_screen",
  "arguments": {
    "outputPath": "/Users/hamm/Pictures/Screenshots",
    "includeCursor": true
  }
}
```

**示例响应：**

```json
{
  "success": true,
  "screenshotType": "fullscreen",
  "filePath": "/Users/hamm/Desktop/Screenshots/20260311143025.png",
  "fileName": "20260311143025.png",
  "captureTime": "2026-03-11T14:30:25.000Z",
  "options": {
    "includeCursor": true,
    "showPreview": false
  }
}
```

## 文件命名

截图文件使用年月日时分秒格式命名：`YYYYMMDDHHmmss.png`

示例：`20260311143025.png`

## 权限说明

首次使用时，macOS 会提示授予**屏幕录制权限**。如果未自动弹出，请手动在：

**系统设置** → **隐私与安全性** → **屏幕录制** 

中授予终端或你的 MCP Client 屏幕录制权限。

## 开发

```bash
# 克隆项目
git clone https://github.com/HammCn/mac-screenshot-mcp.git
cd mac-screenshot-mcp

# 安装依赖
npm install

# 本地测试
npm start
```

## License

MIT
