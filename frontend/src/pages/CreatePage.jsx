import React, { useState } from "react";
import { Link } from "react-router";

const CreatePage = () => {
  const {title, setTitle} = useState("");
  const {content, setContent} = useState("");
  const {loading, setLoading} = useState(false);

  const handleSubmit = () => {


  }
  return <div className="min-h-screen bg-base-200">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto"></div>
      <Link to={"/"} className="btn btn-ghost mb-6">
        <ArrowLeftIcon className="size-5" />
        Back to Session
      </Link>

      <div className="card bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Create New Session</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                  <span className="label-text">Title</span>
              </label>
              <input type="text"
                placeholder="Session Title"
                className="input input-bordered"
                value={title}
                onChange={(e) => setTitle(e.target.value)} 
              
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  
};

export default CreatePage