import { createFileRoute , redirect } from '@tanstack/react-router'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import React, { useState , useEffect } from 'react';
import Config from "../config"
import LibAuth from "../lib/LibAuth"

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  useEffect(() => {
    LibAuth.isValidLogin();
  }, []);

  const logout = () => {
    LibAuth.logout();
  }

  return (
    <div className="p-2">
      <h3 className="text-lg font-semibold">Welcome Home </h3>
      <hr />
      <button
      className="my-2" 
      onClick={()=>{logout();}}>[ Logout ]</button>
    </div>
  )
}
