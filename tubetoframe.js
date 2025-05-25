document.addEventListener("DOMContentLoaded", function () {
  const videoLinks = document.querySelectorAll(
    ".body a[href*='youtube.com/watch'], .post-content a[href*='youtu.be/'], .post-content a[href*='vimeo.com/']"
  );
  videoLinks.forEach((link) => {
    const url = link.href;
    const linkText = link.innerHTML;
    let videoInfo = null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      videoInfo = getYoutubeInfo(url);
      if (videoInfo) {
        createVideoPlaceholder(link, videoInfo, "youtube", linkText);
      }
    } else if (url.includes("vimeo.com")) {
      videoInfo = getVimeoInfo(url); 
      if (videoInfo) {
        createVideoPlaceholder(link, videoInfo, "vimeo", linkText);
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
  function getVimeoInfo(url) {
    const regex = /vimeo\.com\/(?:video\/)?([0-9]+)/;
    const match = url.match(regex);
    if (match && match[1]) {
      return {
        id: match[1],
        oEmbedUrl: `https:
        embedUrl: `https:
      };
    }
    return null;
  }
 function createVideoPlaceholder(linkElement, videoInfo, type, captionText) {
    const videoWrapper = document.createElement("div");
    videoWrapper.className = "video-wrapper-with-caption";
    const placeholder = document.createElement("div");
    placeholder.className = "youtube-placeholder";
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
    if (type === "youtube") {
        placeholder.style.backgroundImage = `url(${videoInfo.thumbnailUrl})`;
    } else if (type === "vimeo") {
        fetch(videoInfo.oEmbedUrl)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (data.thumbnail_url) {
                    placeholder.style.backgroundImage = `url(${data.thumbnail_url.replace(/^http:/i, 'https:')})`;
                } else {
                    console.warn("Vimeo image not found:", videoInfo.id);
                }
            })
            .catch(error => console.error("Error trying to get Vimeo Image:", error));
    }
    placeholder.addEventListener("click", () => {
        const iframe = document.createElement("iframe");
        iframe.src = videoInfo.embedUrl;
        iframe.className = placeholder.className;
        iframe.style.backgroundImage = 'none';
        iframe.style.backgroundColor = '#000';
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; web-share");
        iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        const iframeTitle = captionText ? captionText.replace(/<[^>]*>?/gm, '') : (type === "youtube" ? "YouTube video player" : "Vimeo video player");
        iframe.setAttribute("title", iframeTitle);
        videoWrapper.replaceChild(iframe, placeholder);
        iframe.focus();
    }, { once: true });
    if (linkElement.parentNode) {
        linkElement.parentNode.replaceChild(videoWrapper, linkElement);
    }
}
});
