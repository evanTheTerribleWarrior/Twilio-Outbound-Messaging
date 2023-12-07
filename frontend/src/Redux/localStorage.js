export const loadState = () => {
    try {
      const serializedState = localStorage.getItem('outbound_messaging_app_state');
      if (serializedState === null) {
        return undefined;
      }
      return JSON.parse(serializedState);
    } catch (err) {
      return undefined;
    }
  };
  
  export const saveState = (state) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('outbound_messaging_app_state', serializedState);
    } catch (err) {
    }
  };
