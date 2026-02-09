import React, { createContext, useContext, useState, useEffect } from 'react';

const PlayerFocusContext = createContext();

export const usePlayerFocus = () => {
    return useContext(PlayerFocusContext);
};

export const PlayerFocusProvider = ({ children }) => {
    const [focusedPlayerId, setFocusedPlayerId] = useState(() => {
        return localStorage.getItem('ricochet_focus_player_id') || null;
    });

    useEffect(() => {
        if (focusedPlayerId) {
            localStorage.setItem('ricochet_focus_player_id', focusedPlayerId);
        } else {
            localStorage.removeItem('ricochet_focus_player_id');
        }
    }, [focusedPlayerId]);

    const enableFocus = (playerId) => setFocusedPlayerId(playerId);
    const disableFocus = () => setFocusedPlayerId(null);

    return (
        <PlayerFocusContext.Provider value={{ focusedPlayerId, enableFocus, disableFocus }}>
            {children}
        </PlayerFocusContext.Provider>
    );
};
