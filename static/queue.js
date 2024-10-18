const socket = io({ auth: { token: "screen" } });
let playing = false;
let current = 0;

function playCurrent(queue) {
    if (queue.length <= 0) {
        current = 0;
        player.loadVideoById('', 0);
        playing = false;
    } else {
        current = current % queue.length;
        player.loadVideoById(queue[current], 0);
        playing = true;
    }
}

socket.on('add', async (who, id, index, queue) => {
    const response = await fetch(`/api/video/${id}`);
    const data = await response.json();
    addToast(`${who} added`, data.title, data.thumbnailURL);
    if (!playing) {
        player.loadVideoById(id, 0);
        playing = true;
    }
});

socket.on('remove', async (who, id, index, queue) => {
    const response = await fetch(`/api/video/${id}`);
    const data = await response.json();

    if (who != 'queue') {
        addToast(`${who} removed`, data.title, data.thumbnailURL);
    }

    if (index < current) {
        current--;
    } else if (index == current) {
        playCurrent(queue);
    }
});

socket.on('play', async () => {
    if (playing) {
        player.playVideo();
    }
});

socket.on('pause', async () => {
    if (playing) {
        player.pauseVideo();
    }
});

window.addEventListener('youtube-ready', async () => {
    const response = await fetch('/api/queue');
    const data = await response.json();
    playCurrent(data);
});

window.addEventListener('youtube-ended', async () => {
    const response = await fetch(`/api/queue/remove/${current}?who=queue`, { method: 'DELETE' });
    const data = await response.json();
    playCurrent(data);
});
