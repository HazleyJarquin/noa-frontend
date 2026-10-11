"use cache";

// cacheComponents forbids new Date() during prerender; caching makes it a stable value
export const getCurrentYear = async () => new Date().getFullYear();
