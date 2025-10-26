import {createContext, type ReactNode, useEffect, useState} from "react";
import {supabase} from "./supabase";

// Define the shape of the AuthContext
export const AuthContext = createContext<{ userId: string | null }>({userId: null});

// Define the props for the AuthProvider component
type AuthProviderProps = {
    children: ReactNode;
};

// AuthProvider component to manage and provide authentication state
export function AuthProvider({children}: AuthProviderProps){
    const [userId, setUserId] = useState<string | null>(null);

    // Subscribe to authentication state changes
    useEffect(() => {
        const {data: listener} = supabase.auth.onAuthStateChange((_event, session) => {
            const id = session?.user?.id ?? null;
            setUserId(id);
            console.log("Auth state changed, user id:", id);
        });

        
        // Initial check for existing session
        supabase.auth
            .getSession()
            .then(({data, error: sessionError}) => {
                if (sessionError) {
                    console.error("Initial session check failed:", sessionError);
                    return;
                }

                const id = data?.session?.user?.id ?? null;
                setUserId(id);
                console.log("Initial session check, user id:", id);
            })
            .catch((err) => {
                console.error("Initial session check threw:", err);
            });
        // Cleanup subscription on unmount
        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);


    
// Provide the userId to the context consumers
    return (
        <AuthContext.Provider value={{userId}}>
            {children}
        </AuthContext.Provider>
    );
}
