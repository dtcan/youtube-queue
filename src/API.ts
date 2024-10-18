import axios from 'axios';
import LRU from 'lru-cache';
import { API_URL } from './config.json';

interface Video {
    id: string,
    title: string,
    channelTitle: string,
    thumbnailURL: string,
    streamURL: string,
}

interface PipedAPIResponse {
    title: string,
    uploader: string,
    thumbnailUrl: string,
    videoStreams: {
        quality: string,
        url: string,
    }[],
}

export default class API {
    cache: LRU<string, Video>

    constructor(cacheSize: number = 500) {
        this.cache = new LRU(cacheSize);
    }

    async getVideo(id: string): Promise<Video> {
        let cached = this.cache.get(id);
        if (cached) {
            return cached;
        } else {
            const { data } = await axios.get<PipedAPIResponse>(`${API_URL}/streams/${id}`);
            if (data.videoStreams.length >= 1) {
                let streamUrl: string = data.videoStreams[0].url;
                let streamQuality = 0;
                for (let stream of data.videoStreams) {
                    let quality = parseInt(stream.quality);
                    if (!streamUrl || streamQuality < quality) {
                        streamUrl = stream.url;
                        streamQuality = quality;
                    }
                }
                let video = {
                    id: id,
                    title: data.title,
                    channelTitle: data.uploader,
                    thumbnailURL: data.thumbnailUrl,
                    streamURL: streamUrl,
                };
                this.cache.set(id, video);
                return video;
            } else {
                throw Error("Video not found");
            }
        }
    }
}
