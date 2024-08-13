import React, { useState, useEffect, useRef } from 'react';
import './Player.scss';

function Player() {
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef(null);
    const [player, setPlayer] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isRepeat, setIsRepeat] = useState(false);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [durationTime, setDurationTime] = useState('0:00');
    const [searchQuery, setSearchQuery] = useState('');
    const [videoTitle, setVideoTitle] = useState('');
    const [volume, setVolume] = useState(100);
    const YOUTUBE_API_KEY = 'AIzaSyDYYkOBajqHz9SkWiealL6loHkz0LDAUK0';

    let videoId = '';

    const backgroundImage = document.querySelector('.bg-image');
    

    useEffect(() => {
        

        // Cargar la API de YouTube
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // Inicializar el reproductor cuando la API esté lista
        window.onYouTubeIframeAPIReady = () => {
            const ytPlayer = new window.YT.Player(playerRef.current, {
                videoId: videoId,
                events: {
                    onReady: (event) => {
                        setPlayer(event.target);
                        if (event.target.getDuration() - 1 < 0){
                            setDurationTime(formatTime(0));
                        }
                        else {
                            setDurationTime(formatTime(event.target.getDuration() - 1));
                        }
                        event.target.setVolume(volume);
                    },
                    onStateChange: onPlayerStateChange,
                },
            });
        };
    }, []);

    useEffect(() => {
        let interval;
        if (isPlaying && player) {
            interval = setInterval(() => {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                const newProgress = (currentTime / duration) * 100;

                setProgress(newProgress);
                setCurrentTime(formatTime(currentTime));

                console.log(newProgress);

                // Verificar si el progreso ha alcanzado el 100% y si está en modo bucle
                if (newProgress >= 99 && isRepeat) {
                    if(newProgress >= 99.25 && isRepeat) {
                        if(newProgress >= 99.5 && isRepeat) {
                            if(newProgress >= 99.75 && isRepeat) {
                                player.seekTo(0);
                                player.playVideo();
                            }
                            else{
                                player.seekTo(0);
                                player.playVideo();
                            }
                        }
                        else{
                            player.seekTo(0);
                            player.playVideo();
                        }
                    }
                    else{
                        player.seekTo(0);
                        player.playVideo();
                    }
                    
                }
            }, 1000); // Actualizar cada segundo
        } else if (interval) {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isPlaying, player, isRepeat]);


    const handleVolumeChange = (event) => {
        const newVolume = event.target.value;
        setVolume(newVolume);
        if (player) {
            player.setVolume(newVolume);
        }
    };

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleRepeat = () => {
        setIsRepeat(!isRepeat);

        console.log(isRepeat);
    };

    const onPlayerStateChange = (event) => {
        if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
        } else if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setDurationTime(formatTime(player.getDuration()));
        }
    };

    const handleProgressBarClick = (event) => {
        if (!player) return;

        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const totalWidth = rect.width;

        const newProgress = (offsetX / totalWidth) * 100;
        const newTime = (newProgress / 100) * player.getDuration();

        setProgress(newProgress);
        player.seekTo(newTime, true);
        setCurrentTime(formatTime(newTime));
    };

    const handleProgressBarDrag = (event) => {
        handleProgressBarClick(event);
    };




    const handleSearch = async () => {
        if (searchQuery.trim() === '') return;

        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
                searchQuery
            )}&key=${YOUTUBE_API_KEY}`
        );
        const data = await response.json();
        const firstVideo = data.items[0];
        const firstVideoId = data.items[0]?.id?.videoId;
        const firstVideoTitle = firstVideo?.snippet?.title;

        if (firstVideoId) {
            videoId = firstVideoId;
            setVideoTitle(firstVideoTitle);
            document.querySelector('iframe').src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=http%3A%2F%2Flocalhost%3A5173&widgetid=1`;
            let thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            backgroundImage.style.backgroundImage = `url(${thumbnail})`;
            document.getElementById('album-cover').src = thumbnail;
        }
    };

    return (
      <>
        <div className='song-embed'>
            <div id="player" ref={playerRef}></div>
        </div>

        <h1>{videoTitle}</h1>
        
        <div className='player-container'>
            <div className="search-bar">
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
                <button onClick={handleSearch}><i className="material-icons">search</i></button>
            </div>
            <div className="song-container">
                <img id='album-cover' src='../../../public/defaultAlbum.png' alt="Album cover" />
                <div className="time-display">
                    {currentTime} / {durationTime}
                </div>
                <div 
                    className="progress-bar" 
                    onClick={handleProgressBarClick}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseMove={(e) => {
                        if (e.buttons === 1) {
                            handleProgressBarDrag(e);
                        }
                    }}
                >
                    <div className="progress" style={{ width: `${progress}%` }}></div>
                    <div className="progress-circle" style={{ left: `${progress}%` }}></div>
                </div>
                <div className="player-controls">
                    <button><i className="material-icons">skip_previous</i></button>
                    <button onClick={togglePlayPause}>
                        <i className="material-icons">
                            {isPlaying ? 'pause' : 'play_arrow'}
                        </i>
                    </button>
                    <button><i className="material-icons">skip_next</i></button>
                    <button onClick={toggleRepeat} className={isRepeat ? 'active' : ''}>
                        <i className="material-icons">repeat</i>
                    </button>
                    <div className="volume-control">
                        <i className="material-icons">volume_up</i>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={handleVolumeChange}
                        />
                    </div>
                </div>
            </div>
        </div>
      </>
    );



}

export default Player;
