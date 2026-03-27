import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { platform } from "node:os";

const fallback = process.argv[2] || "Completed";
const title = "Claude Code";

let message = fallback;
try {
  const input = JSON.parse(readFileSync(0, "utf8"));
  const lines = readFileSync(input.transcript_path, "utf8").trim().split("\n");
  const last = JSON.parse(lines[lines.length - 1]);
  message =
    (last.message?.content?.find((c) => c.type === "text")?.text || fallback)
      .slice(0, 100);
} catch {
  // use fallback
}

const os = platform();

if (os === "darwin") {
  const escaped = message.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  execSync(
    `osascript -e 'display notification "${escaped}" with title "${title}"'`
  );
} else if (os === "win32") {
  const clean = message.replace(/[\r\n]+/g, " ");
  const ps = `Add-Type -AssemblyName System.Windows.Forms; $n = New-Object System.Windows.Forms.NotifyIcon; $n.Icon = [System.Drawing.SystemIcons]::Information; $n.Visible = $true; $n.ShowBalloonTip(5000, ${JSON.stringify(title)}, ${JSON.stringify(clean)}, 'Info'); Start-Sleep 6; $n.Dispose()`;
  const encoded = Buffer.from(ps, "utf16le").toString("base64");
  execSync(`powershell -EncodedCommand ${encoded}`);
} else {
  // Linux
  try {
    const escaped = message.replace(/"/g, '\\"');
    execSync(`notify-send "${title}" "${escaped}"`);
  } catch {
    // notify-send not available
  }
}
