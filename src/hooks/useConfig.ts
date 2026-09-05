/**
 * Configuration storage hook
 */

import { storage } from "#imports";
import type { APIConfig, ExtensionConfig, UserPreferences } from "~/types";
import { DEFAULT_CONFIG, STORAGE_KEYS } from "~/types";

// Define typed storage items
const configItem = storage.defineItem<ExtensionConfig>(
  `local:${STORAGE_KEYS.CONFIG}`,
  {
    defaultValue: DEFAULT_CONFIG,
  }
);

/**
 * Hook to manage extension configuration
 */
export function useConfig() {
  // Get current config
  const getConfig = async (): Promise<ExtensionConfig> =>
    await configItem.getValue();

  // Update config
  const updateConfig = async (
    updates: Partial<ExtensionConfig>
  ): Promise<void> => {
    const current = await getConfig();
    await configItem.setValue({
      ...current,
      ...updates,
    });
  };

  // Update API config
  const updateAPIConfig = async (
    apiConfig: Partial<APIConfig>
  ): Promise<void> => {
    const current = await getConfig();
    await configItem.setValue({
      ...current,
      apiConfig: {
        ...current.apiConfig,
        ...apiConfig,
      },
    });
  };

  // Update preferences
  const updatePreferences = async (
    preferences: Partial<UserPreferences>
  ): Promise<void> => {
    const current = await getConfig();
    await configItem.setValue({
      ...current,
      preferences: {
        ...current.preferences,
        ...preferences,
      },
    });
  };

  // Reset to defaults
  const resetConfig = async (): Promise<void> => {
    await configItem.setValue(DEFAULT_CONFIG);
  };

  // Watch for changes
  const watchConfig = (
    callback: (newValue: ExtensionConfig, oldValue: ExtensionConfig) => void
  ) => storage.watch<ExtensionConfig>(`local:${STORAGE_KEYS.CONFIG}`, callback);

  return {
    getConfig,
    resetConfig,
    updateAPIConfig,
    updateConfig,
    updatePreferences,
    watchConfig,
  };
}
