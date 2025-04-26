import { NextApiRequest, NextApiResponse } from "next";
import { BrowserController } from "../../utils/browserController";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { browser } = req.query;

  if (!browser) {
    return res.status(400).json({ error: "Browser parameter is required" });
  }

  if (typeof browser !== "string") {
    return res.status(400).json({ error: "Invalid browser parameter" });
  }

  if (!["chrome", "firefox"].includes(browser.toLowerCase())) {
    return res.status(400).json({ error: "Unsupported browser" });
  }

  try {
    const controller = new BrowserController();
    await controller.cleanupBrowser(browser.toLowerCase());
    res
      .status(200)
      .json({ message: `${browser} cleanup completed successfully` });
  } catch (error) {
    console.error("Error cleaning up browser:", error);
    res.status(500).json({ error: "Failed to cleanup browser" });
  }
}
