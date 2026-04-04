const { withBuildGradle } = require('@expo/config-plugins');

module.exports = function withYoutubeDL(config) {
  return withBuildGradle(config, async (config) => {
    const buildGradle = config.modResults.contents;
    
    // Add YouTube-DL dependencies to the dependencies block
    const dependenciesMatch = buildGradle.match(/dependencies\s*\{/);
    
    if (dependenciesMatch) {
      const youtubeDLDeps = `
    // YouTube-DL Android Library
    implementation 'com.github.yausername.youtubedl-android:library:0.16.+'
    implementation 'com.github.yausername.youtubedl-android:ffmpeg:0.16.+'`;
      
      // Find the last closing brace of dependencies block and insert before it
      const modifiedBuildGradle = buildGradle.replace(
        /dependencies\s*\{([\s\S]*?)\n\}/,
        (match) => match.slice(0, -1) + youtubeDLDeps + '\n}'
      );
      
      config.modResults.contents = modifiedBuildGradle;
    }
    
    return config;
  });
};
