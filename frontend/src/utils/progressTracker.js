export function storeProgress(eventData) {
  if (!eventData || typeof eventData !== 'object') return;
  
  const data = eventData.data || eventData;
  
  if (!data.id) {
    console.warn('No content ID found in progress data:', data);
    return;
  }
  
  let progressData = {};
  try {
    const storedData = localStorage.getItem('watchProgress');
    if (storedData) {
      progressData = JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    progressData = {};
  }
  
  const contentType = data.mediaType || data.type || 'movie';
  
  let contentKey;
  if (contentType === 'tv') {
    const season = data.season || 1;
    const episode = data.episode || 1;
    contentKey = `tv_${data.id}_s${season}_e${episode}`;
  } else {
    contentKey = `movie_${data.id}`;
  }
  
  let progress = data.progress || 0;
  if (!progress && data.currentTime && data.duration && data.duration > 0) {
    progress = (data.currentTime / data.duration) * 100;
  }
  
  const existingEntry = progressData[contentKey] || {};
  
  if (progress === 0 && existingEntry.progress > 0 && existingEntry.lastUpdated > Date.now() - 60000) {
    console.log(`Skipping progress 0 for ${contentKey} - already have ${existingEntry.progress}%`);
    return progressData[contentKey];
  }
  
  progressData[contentKey] = {
    id: data.id,
    type: contentType,
    progress: Math.min(Math.round(progress), 100),
    timestamp: data.currentTime || data.timestamp || 0,
    duration: data.duration || 0,
    season: data.season || 1,
    episode: data.episode || 1,
    event: data.event || 'timeupdate',
    lastUpdated: Date.now()
  };
  
  if (contentType === 'tv') {
    const showKey = `tv_${data.id}_latest`;
    const currentLatest = progressData[showKey] || {};
    
    if (!currentLatest.lastUpdated || currentLatest.lastUpdated < Date.now()) {
      progressData[showKey] = {
        id: data.id,
        type: contentType,
        season: data.season || 1,
        episode: data.episode || 1,
        progress: Math.min(Math.round(progress), 100),
        lastUpdated: Date.now()
      };
    }
  }
  
  try {
    localStorage.setItem('watchProgress', JSON.stringify(progressData));
    console.log(`Progress stored for ${contentKey}: ${progressData[contentKey].progress}%`);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
  
  return progressData[contentKey];
}

export function getLastWatchedEpisode(id) {
  try {
    const storedData = localStorage.getItem('watchProgress');
    if (!storedData) return { season: 1, episode: 1, progress: 0 };
    
    const progressData = JSON.parse(storedData);
    const latestKey = `tv_${id}_latest`;
    
    if (progressData[latestKey]) {
      const latest = progressData[latestKey];
      return {
        season: latest.season || 1,
        episode: latest.episode || 1,
        progress: latest.progress || 0
      };
    }
    
    let lastWatched = null;
    let latestTimestamp = 0;
    
    Object.keys(progressData).forEach(key => {
      if (key.startsWith(`tv_${id}_s`) && key !== latestKey) {
        const entry = progressData[key];
        if (entry.lastUpdated > latestTimestamp) {
          latestTimestamp = entry.lastUpdated;
          lastWatched = entry;
        }
      }
    });
    
    if (lastWatched) {
      return {
        season: lastWatched.season || 1,
        episode: lastWatched.episode || 1,
        progress: lastWatched.progress || 0
      };
    }
    
    return { season: 1, episode: 1, progress: 0 };
  } catch (error) {
    console.error('Error getting last watched episode:', error);
    return { season: 1, episode: 1, progress: 0 };
  }
}

export function getProgress(id, type, season, episode) {
  try {
    const storedData = localStorage.getItem('watchProgress');
    if (!storedData) return null;
    
    const progressData = JSON.parse(storedData);
    let contentKey;
    if (type === 'tv') {
      contentKey = `tv_${id}_s${season || 1}_e${episode || 1}`;
    } else {
      contentKey = `movie_${id}`;
    }
    
    return progressData[contentKey] || null;
  } catch (error) {
    console.error('Error getting progress from localStorage:', error);
    return null;
  }
}

export function getAllProgress() {
  try {
    const storedData = localStorage.getItem('watchProgress');
    if (!storedData) return {};
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Error getting all progress:', error);
    return {};
  }
}

export function initProgressTracker() {
  window.addEventListener("message", function (event) {
    if (typeof event.data === "string") {
      try {
        const parsedData = JSON.parse(event.data);
        
        if (parsedData.type === "PLAYER_EVENT" && parsedData.data) {
          storeProgress(parsedData);
          window.dispatchEvent(new Event('progressUpdated'));
        } else if (parsedData.id && (parsedData.type || parsedData.mediaType)) {
          storeProgress(parsedData);
          window.dispatchEvent(new Event('progressUpdated'));
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    }
  });
}