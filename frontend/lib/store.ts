import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  subscriptionTier?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (user, token) => {
        console.log('🟡 [STORE] setAuth called');
        console.log('🟡 [STORE] setAuth params:', {
          user: user ? { id: user.id, email: user.email, name: user.name, role: user.role } : null,
          token: token ? '***exists***' : null,
          tokenLength: token?.length
        });
        
        // Clean the token - remove any "Bearer " prefix or extra whitespace
        const cleanToken = token ? token.replace(/^Bearer\s+/i, '').trim() : null;
        
        if (!cleanToken) {
          console.error('🔴 [STORE] CRITICAL: Token is empty after cleaning!');
          return;
        }
        
        console.log('🟡 [STORE] Cleaned token:', {
          originalLength: token?.length,
          cleanedLength: cleanToken.length,
          tokenPreview: cleanToken.length > 30 
            ? `${cleanToken.substring(0, 20)}...${cleanToken.substring(cleanToken.length - 10)}`
            : cleanToken
        });
        
        if (typeof window !== 'undefined') {
          console.log('🟡 [STORE] Setting token in localStorage...');
          localStorage.setItem('token', cleanToken);
          
          // Verify it was stored correctly
          const stored = localStorage.getItem('token');
          if (stored !== cleanToken) {
            console.error('🔴 [STORE] CRITICAL: Token mismatch after storage!');
          } else {
            console.log('✅ [STORE] Token set in localStorage and verified');
          }
        }
        
        // Use cleaned token for state
        const authState = { user, token: cleanToken, isAuthenticated: !!user && !!cleanToken };
        console.log('🟡 [STORE] Setting Zustand state:', {
          hasUser: !!authState.user,
          hasToken: !!authState.token,
          isAuthenticated: authState.isAuthenticated,
          tokenLength: authState.token?.length
        });
        
        set(authState);
        
        // Verify state was set
        const currentState = get();
        console.log('✅ [STORE] State after setAuth:', {
          hasUser: !!currentState.user,
          hasToken: currentState.token ? '***exists***' : null,
          isAuthenticated: currentState.isAuthenticated
        });
        
        // Verify localStorage
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('token');
          const storedAuth = localStorage.getItem('auth-storage');
          console.log('✅ [STORE] localStorage verification:', {
            token: storedToken ? '***exists***' : null,
            authStorage: storedAuth ? '***exists***' : null
          });
        }
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating auth store:', error);
            return;
          }
          
          // Sync token from localStorage if it exists but not in state
          if (typeof window !== 'undefined' && state) {
            const token = localStorage.getItem('token');
            if (token && !state.token) {
              state.token = token;
            }
            // Update isAuthenticated based on actual state
            state.isAuthenticated = !!(state.user && state.token);
            // Mark as hydrated
            state._hasHydrated = true;
          }
        };
      },
    }
  )
);

