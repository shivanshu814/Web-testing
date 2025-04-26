import { spawn } from "child_process";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

export class BrowserController {
  private browserProcesses: Map<string, any> = new Map();

  private getChromePath(): string {
    const possiblePaths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      path.join(
        os.homedir(),
        "AppData",
        "Local",
        "Google",
        "Chrome",
        "Application",
        "chrome.exe"
      ),
    ];

    for (const chromePath of possiblePaths) {
      if (require("fs").existsSync(chromePath)) {
        return chromePath;
      }
    }
    throw new Error("Chrome executable not found");
  }

  private getFirefoxPath(): string {
    const possiblePaths = [
      "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
      "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe",
      path.join(
        os.homedir(),
        "AppData",
        "Local",
        "Mozilla Firefox",
        "firefox.exe"
      ),
    ];

    for (const firefoxPath of possiblePaths) {
      if (require("fs").existsSync(firefoxPath)) {
        return firefoxPath;
      }
    }
    throw new Error("Firefox executable not found");
  }

  async startBrowser(browser: string, url: string): Promise<void> {
    if (this.browserProcesses.has(browser)) {
      throw new Error(`${browser} is already running`);
    }

    let command: string;
    let args: string[];

    if (browser === "chrome") {
      command = this.getChromePath();
      args = ["--new-window", url];
    } else if (browser === "firefox") {
      command = this.getFirefoxPath();
      args = ["-new-window", url];
    } else {
      throw new Error("Unsupported browser");
    }

    const process = spawn(command, args);
    this.browserProcesses.set(browser, process);

    process.on("error", (error) => {
      console.error(`Error starting ${browser}:`, error);
      this.browserProcesses.delete(browser);
      throw error;
    });
  }

  async stopBrowser(browser: string): Promise<void> {
    if (!this.browserProcesses.has(browser)) {
      throw new Error(`${browser} is not running`);
    }

    const process = this.browserProcesses.get(browser);
    process.kill();
    this.browserProcesses.delete(browser);
  }

  async getCurrentUrl(browser: string): Promise<string> {
    if (!this.browserProcesses.has(browser)) {
      throw new Error(`${browser} is not running`);
    }

    try {
      if (browser === "chrome") {
        const { stdout } = await execAsync(
          'powershell -command "Get-Process chrome | Select-Object -First 1 | ForEach-Object { $_.MainWindowTitle }"'
        );
        return stdout.trim();
      } else if (browser === "firefox") {
        const { stdout } = await execAsync(
          'powershell -command "Get-Process firefox | Select-Object -First 1 | ForEach-Object { $_.MainWindowTitle }"'
        );
        return stdout.trim();
      }
      throw new Error("Unsupported browser");
    } catch (error: any) {
      throw new Error(`Failed to get URL: ${error.message}`);
    }
  }

  async cleanupBrowser(browser: string): Promise<void> {
    if (this.browserProcesses.has(browser)) {
      throw new Error(`${browser} is still running. Stop it first.`);
    }

    try {
      if (browser === "chrome") {
        const chromeProfilePath = path.join(
          os.homedir(),
          "AppData",
          "Local",
          "Google",
          "Chrome",
          "User Data",
          "Default"
        );
        await execAsync(`rmdir /s /q "${chromeProfilePath}"`);
      } else if (browser === "firefox") {
        const firefoxProfilePath = path.join(
          os.homedir(),
          "AppData",
          "Roaming",
          "Mozilla",
          "Firefox",
          "Profiles"
        );
        await execAsync(`rmdir /s /q "${firefoxProfilePath}"`);
      } else {
        throw new Error("Unsupported browser");
      }
    } catch (error: any) {
      throw new Error(`Failed to cleanup ${browser}: ${error.message}`);
    }
  }
}
