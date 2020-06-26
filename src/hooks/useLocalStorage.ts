type LocalStorageKey = 'UPDATED_NOTES' | 'DELETED_NOTES' | 'ADDED_NOTES' | 'USER';
export const useLocalStorage = () => {
  const getLocalStorageItems = (key: LocalStorageKey) => {
    try {
      return JSON.parse(localStorage.getItem(key) || '');
    } catch {
      return undefined;
    }
  };

  const setLocalStorageItems = (key: LocalStorageKey, dataArray: { id: any }[]) => {
    const storedItems: { id: string }[] = JSON.parse(localStorage.getItem(key) || '[]');

    if (!storedItems.length) {
      localStorage.setItem(key, JSON.stringify(dataArray));
      return;
    }

    dataArray.forEach((item) => {
      const duplicateOnIndex = storedItems.findIndex((storedItem) => storedItem.id === item.id);

      if (duplicateOnIndex > -1) {
        storedItems[duplicateOnIndex] = item;
      } else {
        storedItems.push(item);
      }
    });

    localStorage.setItem(key, JSON.stringify(storedItems));
  };

  const setSingleLocalStorageItem = (key: LocalStorageKey, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const clearLocalStorageItems = (key: LocalStorageKey) => {
    localStorage.setItem(key, '');
  };

  return {
    getLocalStorageItems,
    setSingleLocalStorageItem,
    setLocalStorageItems,
    clearLocalStorageItems,
  };
};
