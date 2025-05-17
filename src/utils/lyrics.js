export const parseSongStructureLyrics = (structureComment) => {
    if (!structureComment) return [];
    const matches = structureComment.match(
      /\[\d{2}:\d{2}\.\d{2}\].*?(?=\n|$)/g
    );
    if (!matches) return [];
    return matches
      .map((line) => {
        const timeMatch = line.match(/\[(\d{2}):(\d{2}\.\d{2})\]/);
        const text = typeof line === 'string' ? line.replace(/\[\d{2}:\d{2}\.\d{2}\]/, "").trim() : '';
        if (timeMatch) {
          const minutes = parseInt(timeMatch[1]);
          const seconds = parseFloat(timeMatch[2]);
          const time = minutes * 60 + seconds;
          return { time, text };
        }
        return null;
      })
      .filter((item) => item !== null);
  };
