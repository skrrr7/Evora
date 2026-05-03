import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/navbar";
import RateLimitedUI from "../components/Ratelimit";
import api from "../lib/axios";

import toast from "react-hot-toast";
import SessionCard from "../components/SessionCard";
import SessionNotFound from "../components/SessionNotFound";

const HomePage = () => {
  const [rateLimited, setIsRateLimited] = useState(false);
  const [session, setSession] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchSession = async () => {
      try {
        const res = await api.get("/session");
        console.log(res.data);

        setSession(res.data);
        setIsRateLimited(false);
      } catch (error) {
        console.log("Error fetching session");
        console.log(error);
        if (error.response?.status === 429) {
          setIsRateLimited(true);
        } else {
          toast.error("Failed to load session");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return (
  <div className="min-h-screen">
    <Navbar />
    {rateLimited && <RateLimitedUI/>}

    <div className="max-w-7xl mx-auto p-4 mt-6">
      {loading && <div className="text-center text-primary py-10">Loading session...</div>}

      {session.length === 0 && !loading && !rateLimited && <SessionNotFound/>}

      {session.length > 0 && !rateLimited && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {session.map((session) => (
            <SessionCard key={session._id} session={session} setSession={setSession} />
          ))}

        </div>
      )}

    </div>
  </div>
  );
};

export default HomePage;