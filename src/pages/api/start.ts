import { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";
import { BrowserController } from "../../utils/browserController";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { browser, url } = req.query;

  if (!browser || !url) {
    return res.status(400).json({ error: "Browser and URL are required" });
  }

  if (typeof browser !== "string" || typeof url !== "string") {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  if (!["chrome", "firefox"].includes(browser.toLowerCase())) {
    return res.status(400).json({ error: "Unsupported browser" });
  }

  try {
    const controller = new BrowserController();
    await controller.startBrowser(browser.toLowerCase(), url);
    res.status(200).json({ message: `${browser} started successfully` });
  } catch (error) {
    console.error("Error starting browser:", error);
    res.status(500).json({ error: "Failed to start browser" });
  }
}
