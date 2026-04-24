import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import React from "react";
import { formatDate } from "../lib/utils";


const SessionCard = ({session}) => {
  return <Link to={`/session/${session._id}`}
    className="card bg-base-100 hover:shadow-lg transition-all duration-200 border-t-4 border-solid border-[#00FF9D]"
  >
    <div className="card-body">
        <h3 className="card-title text-base-content">{session.title}</h3>
        <p classname="text-base-content/70 line-clamp-3">{session.content}</p>
        <div className="card-actions justify-between items-center mt-4">
            <span className="text-sm text-base-content/60">
                {formatDate(new Date(session.createdAt))}
            </span>
            <div className="flex items-center gap-1">
                    <PenSquareIcon className="size-4"/>
                <button className='btn btn-ghost btn-xs text-error'>
                    <Trash2Icon classname="size-4" />
                </button>

            </div>
        </div>
    </div>

  </Link>
};

export default SessionCard