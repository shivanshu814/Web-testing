import { useState } from "react";
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
});

export default function Home() {
  const [browser, setBrowser] = useState("chrome");
  const [url, setUrl] = useState("https://example.com");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleAction = async (action: string) => {
    setMessage("");
    setError("");

    try {
      let endpoint = "";
      let params = new URLSearchParams();

      switch (action) {
        case "start":
          endpoint = `/api/start?browser=${browser}&url=${encodeURIComponent(
            url
          )}`;
          break;
        case "stop":
          endpoint = `/api/stop?browser=${browser}`;
          break;
        case "geturl":
          endpoint = `/api/geturl?browser=${browser}`;
          break;
        case "cleanup":
          endpoint = `/api/cleanup?browser=${browser}`;
          break;
      }

      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred");
      }

      setMessage(
        data.message || data.url || "Operation completed successfully"
      );
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div className={`${geist.className} min-h-screen p-8`}>
      <main className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8'>Browser Control Service</h1>

        <div className='space-y-4'>
          <div>
            <label className='block mb-2'>Browser:</label>
            <select
              value={browser}
              onChange={(e) => setBrowser(e.target.value)}
              className='w-full p-2 border rounded'
            >
              <option value='chrome'>Chrome</option>
              <option value='firefox'>Firefox</option>
            </select>
          </div>

          <div>
            <label className='block mb-2'>URL:</label>
            <input
              type='url'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className='w-full p-2 border rounded'
              placeholder='https://example.com'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <button
              onClick={() => handleAction("start")}
              className='p-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            >
              Start Browser
            </button>
            <button
              onClick={() => handleAction("stop")}
              className='p-2 bg-red-500 text-white rounded hover:bg-red-600'
            >
              Stop Browser
            </button>
            <button
              onClick={() => handleAction("geturl")}
              className='p-2 bg-green-500 text-white rounded hover:bg-green-600'
            >
              Get Current URL
            </button>
            <button
              onClick={() => handleAction("cleanup")}
              className='p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600'
            >
              Cleanup Browser
            </button>
          </div>

          {message && (
            <div className='p-4 bg-green-100 text-green-700 rounded'>
              {message}
            </div>
          )}

          {error && (
            <div className='p-4 bg-red-100 text-red-700 rounded'>{error}</div>
          )}
        </div>
      </main>
    </div>
  );
}
