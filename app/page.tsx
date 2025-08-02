"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface FileItem {
  key: string;
  lastModified: string;
  size: number;
}

interface FolderItem {
  prefix: string;
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderPath = searchParams.get("path") || "";

  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/objects?path=${folderPath}`);
      const data = await res.json();
      setFiles(data.files || []);
      setFolders(data.folders || []);
    } catch (err) {
      console.error("Error fetching objects:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [folderPath]);

  const navigateToFolder = (prefix: string) => {
    router.push(`/?path=${prefix}`);
  };

  const goBack = () => {
    const parts = folderPath.split("/").filter(Boolean);
    parts.pop();
    const newPath = parts.length ? parts.join("/") + "/" : "";
    router.push(`/?path=${newPath}`);
  };

  const handleDelete = async (keyOrPrefix: string) => {
    await fetch(`/api/delete?key=${encodeURIComponent(keyOrPrefix)}`, {
      method: "DELETE",
    });
    fetchData();
  };

  const handleFileClick = async (key: string) => {
    const res = await fetch(`/api/download?key=${encodeURIComponent(key)}`);
    const data = await res.json();
    window.open(data.url, "_blank");
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const key = folderPath + file.name;
    const res = await fetch(`/api/upload?key=${encodeURIComponent(key)}`);
    const { url } = await res.json();

    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    fetchData();
  };

  const createFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    const key = folderPath + folderName + "/";
    const res = await fetch(`/api/upload?key=${encodeURIComponent(key)}`);
    const { url } = await res.json();

    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/x-directory" },
    });

    fetchData();
  };

  return (
    <main className="min-h-screen p-10 bg-gray-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">📁 S3 File Manager</h1>
          <div className="flex items-center gap-3">
            <input
              type="file"
              onChange={handleUpload}
              className="hidden"
              id="upload"
            />
            <label
              htmlFor="upload"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded cursor-pointer"
            >
              📤 Upload File
            </label>
            <button
              onClick={createFolder}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              ➕ Create Folder
            </button>
          </div>
        </div>

        {folderPath && (
          <button
            onClick={goBack}
            className="text-blue-600 hover:underline mb-4"
          >
            🔙 Back
          </button>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-2">
            {folders.map((folder) => (
              <li
                key={folder.prefix}
                className="bg-white p-3 rounded shadow flex justify-between items-center"
              >
                <button
                  onClick={() => navigateToFolder(folder.prefix)}
                  className="text-blue-600 hover:underline flex-1 text-left"
                >
                  📁 {folder.prefix.replace(folderPath, "")}
                </button>
                <button
                  onClick={() => handleDelete(folder.prefix)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  🗑
                </button>
              </li>
            ))}
            {files.map((file) => (
              <li
                key={file.key}
                className="bg-white p-3 rounded shadow flex justify-between items-center"
              >
                <button
                  onClick={() => handleFileClick(file.key)}
                  className="text-gray-900 truncate hover:underline flex-1 text-left"
                >
                  📄 {file.key.replace(folderPath, "")}
                </button>
                <button
                  onClick={() => handleDelete(file.key)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
