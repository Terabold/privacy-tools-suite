import { useState, useEffect } from 'react';

export const useRecentTools = () => {
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [favoriteTools, setFavoriteTools] = useState<string[]>([]);

  useEffect(() => {
    const storedRecent = localStorage.getItem('recentTools');
    if (storedRecent) {
      try { setRecentTools(JSON.parse(storedRecent)); } catch (e) {}
    }
    const storedFavs = localStorage.getItem('favoriteTools');
    if (storedFavs) {
      try { setFavoriteTools(JSON.parse(storedFavs)); } catch (e) {}
    }
  }, []);

  const addRecentTool = (toolPath: string) => {
    setRecentTools(prev => {
      const updated = [toolPath, ...prev.filter(p => p !== toolPath)].slice(0, 4);
      localStorage.setItem('recentTools', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFavorite = (toolPath: string) => {
    setFavoriteTools(prev => {
      let updated;
      if (prev.includes(toolPath)) {
        updated = prev.filter(p => p !== toolPath);
      } else {
        updated = [...prev, toolPath];
      }
      localStorage.setItem('favoriteTools', JSON.stringify(updated));
      return updated;
    });
  };

  return { recentTools, favoriteTools, addRecentTool, toggleFavorite };
};
