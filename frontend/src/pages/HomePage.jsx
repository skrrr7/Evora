import React, { useState } from 'react'
import Navbar from '../components/navbar';
import RateLimitedUI from '../components/Ratelimit';
import axios from "axios"

const HomePage = () => {
  const [rateLimited, setIsRateLimited] = useState(true)
  const [session, setSession] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await Axis3DIcon.get("http:localhost:5001/api/session")
        console.log(res.data)
      } catch (error) {
        console.log("Error fetching session");
        
      }
    }

    fetchSession();
  },[])

  return (
  <div className="min-h-screen">
    <Navbar />

    {setIsRateLimited && <RateLimitedUI/>}


  </div>
  );
};

export default HomePage