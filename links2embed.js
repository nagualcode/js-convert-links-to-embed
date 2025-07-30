document.addEventListener("DOMContentLoaded", function () {
  const videoLinks = document.querySelectorAll(
    ".post-content a[href*='youtube.com/watch'], " +
    ".post-content a[href*='youtu.be/'], " +
    ".post-content a[href*='vimeo.com/'], " +
    ".post-content a[href*='open.spotify.com/playlist/'], " +
    ".post-content a[href*='instagram.com/reel/'], " +
    ".post-content a[href*='instagram.com/p/'], " +
    ".post-content a[href*='instagram.com/tv/']"
  );

  let instagramScriptLoaded = false;

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
    } else if (
      url.includes("instagram.com/reel/") ||
      url.includes("instagram.com/p/") ||
      url.includes("instagram.com/tv/")
    ) {
      createInstagramEmbed(link, url, linkText);
      if (!instagramScriptLoaded) {
        loadInstagramEmbedScript();
        instagramScriptLoaded = true;
      }
    }
  });

  function getYoutubeInfo(url) {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match && match[1]) {
      return {
        id: match[1],
        thumbnailUrl: `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&vq=hd720`,
      };
    }
    return null;
  }

  async function getVimeoInfo(url) {
    const regex = /vimeo\.com\/(?:video\/)?([0-9]+)/;
    const match = url.match(regex);
    if (match && match[1]) {
      const videoId = match[1];
      const oEmbedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
      let thumbnailUrl = null;

      try {
        const response = await fetch(oEmbedUrl);
        if (!response.ok) throw new Error(`Vimeo oEmbed request failed: ${response.status}`);
        const data = await response.json();
        thumbnailUrl = data.thumbnail_url ? data.thumbnail_url.replace(/^http:/i, "https:") : null;
      } catch (error) {
        console.error("Erro ao buscar dados oEmbed do Vimeo:", error, url);
      }

      return {
        id: videoId,
        embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&transparent=0&dnt=1`,
        thumbnailUrl: thumbnailUrl,
      };
    }
    return null;
  }

  async function getSpotifyInfo(url) {
    const playlistRegex = /open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/;
    const playlistMatch = url.match(playlistRegex);

    if (playlistMatch && playlistMatch[1]) {
      const playlistId = playlistMatch[1];
      const oEmbedSpotifyUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
      let thumbnailUrl = null;

      try {
        const response = await fetch(oEmbedSpotifyUrl);
        if (!response.ok) throw new Error(`Spotify oEmbed request failed: ${response.status}`);
        const data = await response.json();
        thumbnailUrl = data.thumbnail_url ? data.thumbnail_url.replace(/^http:/i, "https:") : null;
      } catch (error) {
        console.error("Erro ao buscar dados oEmbed do Spotify:", error, url);
      }

      return {
        id: playlistId,
        embedUrl: `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`,
        thumbnailUrl: thumbnailUrl,
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
      iframe.style.backgroundImage = "none";
      iframe.style.backgroundColor = "#000";
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute(
        "allow",
        "autoplay; clipboard-write; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; web-share"
      );
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      if (type === "spotify" || type === "instagram") {
        iframe.setAttribute("loading", "lazy");
      }

      const iframeTitle = captionText ? captionText.replace(/<[^>]*>?/gm, "") : "Media Player";
      iframe.setAttribute("title", iframeTitle);

      videoWrapper.replaceChild(iframe, placeholder);
      iframe.focus();
    }, { once: true });

    if (linkElement.parentNode) {
      linkElement.parentNode.replaceChild(videoWrapper, linkElement);
    }
  }

  function createInstagramEmbed(linkElement, url, captionText) {
    const wrapper = document.createElement("div");
    wrapper.className = "video-wrapper-with-caption";

    const blockquote = document.createElement("blockquote");
    blockquote.className = "instagram-media";
    blockquote.setAttribute("data-instgrm-permalink", url);
    blockquote.setAttribute("data-instgrm-version", "14");
    blockquote.style = "background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px rgba(0,0,0,0.5),0 1px 10px rgba(0,0,0,0.15); margin: 1px auto; max-width:540px; min-width:326px; padding:0; width:100%;";

    wrapper.appendChild(blockquote);

    if (captionText && captionText.trim() !== "") {
      const caption = document.createElement("figcaption");
      caption.className = "video-caption";
      const captionLink = document.createElement("a");
      captionLink.href = url;
      captionLink.innerHTML = captionText;
      captionLink.target = "_blank";
      captionLink.rel = "noopener noreferrer";
      caption.appendChild(captionLink);
      wrapper.appendChild(caption);
    }

    if (linkElement.parentNode) {
      linkElement.parentNode.replaceChild(wrapper, linkElement);
    }
  }

  function loadInstagramEmbedScript() {
    if (!document.querySelector('script[src="//www.instagram.com/embed.js"]')) {
      const script = document.createElement("script");
      script.src = "//www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }
});

