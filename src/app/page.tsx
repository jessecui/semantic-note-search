"use client";

import { useEffect, useState } from "react";

import supabaseClient from "../supabase/supabaseClient";
import Dashboard from "./components/dashboard/dashboard";
import Landing from "./components/landing/landing";

export default function Home() {
  const [userLoggedin, setUserLoggedin] = useState<boolean | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) console.log(error);
      if (data.session) {
        setUserLoggedin(true);
      } else {
        setUserLoggedin(false);
      }
    };
    fetchUser();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUserLoggedin(false);
        } else if (session) {
          setUserLoggedin(true);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      {userLoggedin != null ? userLoggedin ? <Dashboard /> : <Landing /> : null}
    </>
  );
}
