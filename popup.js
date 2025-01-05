document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("capture-btn-with-comments").addEventListener("click", async () => {
    captureScreenshot(true);
  });

  document.getElementById("capture-btn-no-comments").addEventListener("click", async () => {
    captureScreenshot(false);
  });
});

async function captureScreenshot(includeComments) {
  // アクティブなタブを取得
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // 動画ソース（canvas）からスクリーンショットを取得
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: (includeComments) => {
        const video = document.querySelector('video');
        if (!video) {
          // video 要素が見つからない場合はエラーを返す
          return { error: "Video element not found" };
        }

        // crossOrigin 属性を設定
        video.crossOrigin = "anonymous";

        // 新しい canvas 要素を作成
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        // video 要素を canvas に描画
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (includeComments) {
          // コメントを含むキャンバス要素を取得して描画
          const commentCanvas = document.querySelector('div[data-name="comment"] canvas');
          if (commentCanvas) {
            ctx.drawImage(commentCanvas, 0, 0, canvas.width, canvas.height);
          }
        }

        // canvas 要素から画像データを取得
        const imageData = canvas.toDataURL("image/png");
        return { imageData }; // 正常な場合は画像データを返す
      },
      args: [includeComments]
    },
    (results) => {
      if (!results || !results[0].result) {
        alert("スクリプトの実行に失敗しました。");
        return;
      }

      const { error, imageData } = results[0].result;

      if (error) {
        alert(error);
        return;
      }

      // 画像データをダウンロード
      const link = document.createElement("a");
      link.href = imageData;
      link.download = `screenshot_${Date.now()}.png`;
      link.click();
    }
  );
}