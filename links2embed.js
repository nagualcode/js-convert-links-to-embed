document.addEventListener("DOMContentLoaded", function () {
  const videoLinks = document.querySelectorAll(
    ".body a[href*='youtube.com/watch'], .post-content a[href*='youtu.be/'], .post-content a[href*='vimeo.com/'], .post-content a[href*='open.spotify.com/playlist/']"
  );
  videoLinks.forEach(async (link) => { 
    const url = link.href;
    const linkText = link.innerHTML;
    let videoInfo = null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      videoInfo = getYoutubeInfo(url); 
      if (videoInfo) {
        createVideoPlaceholder(link, videoInfo, "youtube", linkText);
      }
    } else if (url.includes("vimeo.com/")) {
      videoInfo = await getVimeoInfo(url); 
      if (videoInfo) {
        createVideoPlaceholder(link, videoInfo, "vimeo", linkText);
      }
    } else if (url.includes("open.spotify.com/playlist/")) {
      videoInfo = await getSpotifyInfo(url); 
      if (videoInfo) {
        createVideoPlaceholder(link, videoInfo, "spotify", linkText);
      }
    }
  });
  function getYoutubeInfo(url) {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match && match[1]) {
      return {
        id: match[1],
        thumbnailUrl: `https:
        embedUrl: `https:
      };
    }
    return null;
  }
  async function getVimeoInfo(url) { 
    const regex = /vimeo\.com\/(?:video\/)?([0-9]+)/;
    const match = url.match(regex);
    if (match && match[1]) {
      const videoId = match[1];
      const oEmbedUrl = `https:
      let thumbnailUrl = null;
      try {
        const response = await fetch(oEmbedUrl);
        if (!response.ok) throw new Error(`Vimeo oEmbed request failed: ${response.status}`);
        const data = await response.json();
        thumbnailUrl = data.thumbnail_url ? data.thumbnail_url.replace(/^http:/i, 'https:') : null;
      } catch (error) {
        console.error("Erro ao buscar dados oEmbed do Vimeo:", error, url);
      }
      return {
        id: videoId,
        embedUrl: `https:
        thumbnailUrl: thumbnailUrl 
      };
    }
    return null;
  }
  async function getSpotifyInfo(url) { 
    const playlistRegex = /open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/;
    const playlistMatch = url.match(playlistRegex);
    if (playlistMatch && playlistMatch[1]) {
      const playlistId = playlistMatch[1];
      const oEmbedSpotifyUrl = `https:
      let thumbnailUrl = null;
      try {
        const response = await fetch(oEmbedSpotifyUrl);
        if (!response.ok) {
          throw new Error(`Spotify oEmbed request failed: ${response.status}`);
        }
        const data = await response.json();
        thumbnailUrl = data.thumbnail_url ? data.thumbnail_url.replace(/^http:/i, 'https:') : null;
      } catch (error) {
        console.error("Erro ao buscar dados oEmbed do Spotify:", error, url);
      }
      return {
        id: playlistId,
        embedUrl: `https:
        thumbnailUrl: thumbnailUrl 
      };
    }
    return null;
  }
  function createVideoPlaceholder(linkElement, videoInfo, type, captionText) {
    const videoWrapper = document.createElement("div");
    videoWrapper.className = "video-wrapper-with-caption";
    const placeholder = document.createElement("div");
    placeholder.className = `${type}-placeholder`; 
    const playButton = document.createElement("div");
    playButton.className = "youtube-play-button";
    placeholder.appendChild(playButton);
    videoWrapper.appendChild(placeholder);
    if (captionText && captionText.trim() !== "") {
      const caption = document.createElement("figcaption");
      caption.className = "video-caption";
      const captionLink = document.createElement("a");
      captionLink.href = linkElement.href;
      captionLink.innerHTML = captionText;
      captionLink.target = "_blank";
      captionLink.rel = "noopener noreferrer";
      caption.appendChild(captionLink);
      videoWrapper.appendChild(caption);
    }
    if (videoInfo.thumbnailUrl) {
      placeholder.style.backgroundImage = `url(${videoInfo.thumbnailUrl})`;
    } else {
      console.warn(`Miniatura não encontrada para ${type}:`, videoInfo.id);
    }
    placeholder.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = videoInfo.embedUrl;
      iframe.className = placeholder.className;
      iframe.style.backgroundImage = 'none';
      iframe.style.backgroundColor = '#000';
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("allow", "autoplay; clipboard-write; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; web-share");
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      if (type === "spotify") {
        iframe.setAttribute("loading", "lazy");
      }
      let iframeTitleText = "Media Player";
      if (type === "youtube") iframeTitleText = "YouTube video player";
      else if (type === "vimeo") iframeTitleText = "Vimeo video player";
      else if (type === "spotify") iframeTitleText = "Spotify playlist player";
      const iframeTitle = captionText ? captionText.replace(/<[^>]*>?/gm, '') : iframeTitleText;
      iframe.setAttribute("title", iframeTitle);
      videoWrapper.replaceChild(iframe, placeholder);
      iframe.focus();
    }, { once: true });
    if (linkElement.parentNode) {
      linkElement.parentNode.replaceChild(videoWrapper, linkElement);
    }
  }
});
