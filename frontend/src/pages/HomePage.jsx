import React, { useState } from 'react'
import Navbar from '../components/navbar';
import RateLimitedUI from '../components/Ratelimit';
import axios from "axios";
import toast from "react-hot-toast";

const HomePage = () => {
  const [rateLimited, setIsRateLimited] = useState(false)
  const [session, setSession] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await Axis3DIcon.get("http:localhost:5001/api/session")
        console.log(res.data);

        setSession(res.data);
        setIsRateLimited(false);
      } catch (error) {
        console.log("Error fetching session");
        console.log(error);
        if(error.response?.status === 429){
          setIsRateLimited(true);
        }else{
          toast.error("Failed to load session");
        }
      }finally{
        setLoading(false)
      }
    }

    fetchSession();
  },[])

  return (
  <div className="min-h-screen">
    <Navbar />
    {setIsRateLimited && <RateLimitedUI/>}

    <div className="max-w-7xl mx-auto p-4 mt-6">
      { loading && <div className="text-center text-primary py-10">Loading session...</div>}

      {session.length > 0  && !setIsRateLimited && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {session.map(session => (
            <div>
              {session.title} | {session.content}
            </div>
          ))}

        </div>
      )}

    </div>
  </div>
  );
};

export default HomePage