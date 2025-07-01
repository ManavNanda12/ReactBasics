import React, { useEffect, useState } from 'react'

export default function CommonMethods() {
  const [checkIfLoggedIn , setCheckIfLoggedIn] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('userEmail');
    if (isLoggedIn) {
      setCheckIfLoggedIn(true);
    }
}, []);
}
