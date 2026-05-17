export interface SpotifyIntegrationState {
  isConnected: boolean;
  canUseAiPlaylist: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'blocked_external_dependency';
}

/**
 * Item 56 - Playlist Spotify por IA
 * Integration contract/guard. Does not create a connected button without real OAuth.
 */
export function checkSpotifyIntegrationGuard(): SpotifyIntegrationState {
  return {
    isConnected: false,
    canUseAiPlaylist: false,
    status: 'blocked_external_dependency'
  };
}
