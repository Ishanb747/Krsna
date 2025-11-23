
const parseUrl = (input) => {
    try {
        const url = new URL(input);
        const hostname = url.hostname.toLowerCase();
        const pathname = url.pathname;

        // YouTube
        if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
            let id = "";

            if (hostname.includes("youtu.be")) {
                id = pathname.slice(1);
            } else if (pathname.startsWith("/shorts/")) {
                id = pathname.split("/")[2];
            } else if (pathname.startsWith("/embed/")) {
                id = pathname.split("/")[2];
            } else if (pathname.startsWith("/v/")) {
                id = pathname.split("/")[2];
            } else if (url.searchParams.has("v")) {
                id = url.searchParams.get("v") || "";
            }

            if (id && id.length === 11) {
                return id;
            }
        }
    } catch (e) {
        if (input.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(input)) {
            return input;
        }
    }
    return "NO MATCH";
};

const urls = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://music.youtube.com/watch?v=dQw4w9WgXcQ&feature=share",
    "dQw4w9WgXcQ" // Raw ID
];

urls.forEach(url => {
    console.log(`${url}: ${parseUrl(url)}`);
});
