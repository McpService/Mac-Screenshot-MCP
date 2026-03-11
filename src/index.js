#!/usr/bin/env node
/**
 * macOS 截图 MCP 服务
 * 封装 macOS 的 screencapture 命令，提供全屏截图功能
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawn } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// ==================== 工具函数 ====================

/**
 * 生成文件名（年月日时分秒格式）
 */
function generateFileName() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}.png`;
}

/**
 * 获取截图保存目录
 * @param {string} [customPath] - 自定义路径（可选）
 * @returns {string} 截图保存目录的完整路径
 */
function getScreenshotDir(customPath) {
  if (customPath) {
    if (!customPath.startsWith("/")) {
      customPath = join(process.cwd(), customPath);
    }
    return customPath;
  }

  const defaultDir = join(homedir(), "Desktop", "Screenshots");

  if (!existsSync(defaultDir)) {
    mkdirSync(defaultDir, { recursive: true });
  }

  return defaultDir;
}

/**
 * 执行 screencapture 命令
 * @param {string[]} args - screencapture 命令参数
 * @returns {Promise<string>} 执行结果
 */
function executeScreencapture(args) {
  return new Promise((resolve, reject) => {
    const command = "screencapture";
    const fullArgs = [...args];

    console.error(`执行命令：${command} ${fullArgs.join(" ")}`);

    const process = spawn(command, fullArgs, {
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stderr = "";

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        const outputPath = fullArgs[fullArgs.length - 1];
        resolve(outputPath);
      } else {
        reject(new Error(`screencapture 执行失败 (退出码：${code}): ${stderr}`));
      }
    });

    process.on("error", (err) => {
      reject(new Error(`无法执行 screencapture 命令：${err.message}`));
    });
  });
}

/**
 * 获取当前时间字符串
 */
function getCurrentTimeString() {
  const now = new Date();
  return now.toISOString();
}

// ==================== MCP 工具定义 ====================

/**
 * 全屏截图工具参数验证 Schema
 */
const captureScreenSchema = z.object({
  outputPath: z.string().optional().describe("截图保存目录（可选，默认为 ~/Desktop/Screenshots/）"),
  includeCursor: z.boolean().optional().default(false).describe("是否在截图中包含鼠标光标"),
  showPreview: z.boolean().optional().default(false).describe("截图后是否显示预览窗口")
});

// ==================== 创建 MCP 服务器 ====================

const server = new McpServer({
  name: "mac-screenshot-mcp",
  version: "1.0.0",
  description: "macOS 截图服务，提供全屏截图功能"
});

// ------------------- 全屏截图工具 -------------------
server.tool(
  "capture_screen",
  "全屏截图：捕获整个屏幕的画面",
  {
    outputPath: captureScreenSchema.shape.outputPath,
    includeCursor: captureScreenSchema.shape.includeCursor,
    showPreview: captureScreenSchema.shape.showPreview
  },
  async (params) => {
    try {
      const validatedParams = captureScreenSchema.parse(params);

      const screenshotDir = getScreenshotDir(validatedParams.outputPath);
      const fileName = generateFileName();
      const screenshotPath = join(screenshotDir, fileName);

      const args = [];

      if (validatedParams.includeCursor) {
        args.push("-C");
      }

      if (validatedParams.showPreview) {
        args.push("-P");
      }

      args.push("-x");
      args.push(screenshotPath);

      await executeScreencapture(args);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              screenshotType: "fullscreen",
              filePath: screenshotPath,
              fileName: fileName,
              captureTime: getCurrentTimeString(),
              options: {
                includeCursor: validatedParams.includeCursor,
                showPreview: validatedParams.showPreview
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: `全屏截图失败：${errorMessage}`,
              screenshotType: "fullscreen",
              captureTime: getCurrentTimeString()
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }
);

// ==================== 启动服务器 ====================

async function main() {
  try {
    console.error("正在启动 macOS 截图 MCP 服务...");

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("MCP 服务已启动，等待请求...");
  } catch (error) {
    console.error("启动 MCP 服务失败:", error);
    process.exit(1);
  }
}

main();
