import { spawn } from "child_process";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class BrowserController {
  private browserProcesses: Map<string, any> = new Map();

  async startBrowser(browser: string, url: string): Promise<void> {
    if (this.browserProcesses.has(browser)) {
      throw new Error(`${browser} is already running`);
    }

    let command: string;
    let args: string[];

    if (browser === "chrome") {
      command = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
      args = ["--new-window", url];
    } else if (browser === "firefox") {
      command = "/Applications/Firefox.app/Contents/MacOS/firefox";
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
          "osascript -e 'tell application \"Google Chrome\" to get URL of active tab of front window'"
        );
        return stdout.trim();
      } else if (browser === "firefox") {
        const { stdout } = await execAsync(
          "osascript -e 'tell application \"Firefox\" to get URL of active tab of front window'"
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
        await execAsync(
          "rm -rf ~/Library/Application\\ Support/Google/Chrome/Default/*"
        );
      } else if (browser === "firefox") {
        await execAsync(
          "rm -rf ~/Library/Application\\ Support/Firefox/Profiles/*.default/*"
        );
      } else {
        throw new Error("Unsupported browser");
      }
    } catch (error: any) {
      throw new Error(`Failed to cleanup ${browser}: ${error.message}`);
    }
  }
}
