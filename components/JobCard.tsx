
import React from 'react';
import { JobMatch } from '../types';

interface JobCardProps {
  job: JobMatch;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 border-green-500/30 bg-green-500/10';
    if (score >= 60) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  const isLinkedIn = job.applyLink?.includes('linkedin.com');

  return (
    <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-brand-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand-900/20 animate-slide-up flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-grow pr-2">
          <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2">
            {job.title}
          </h3>
          <p className="text-slate-400 text-sm font-medium flex items-center mt-1">
            <i className="fas fa-building mr-2 text-brand-500"></i> {job.company}
          </p>
          <p className="text-slate-500 text-xs mt-1 flex items-center">
             <i className="fas fa-map-marker-alt mr-2.5 ml-0.5 w-3 text-center"></i> {job.location}
          </p>
        </div>
        
        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 flex-shrink-0 ml-2 ${getScoreColor(job.matchScore)}`}>
          <span className="text-sm font-bold">{job.matchScore}%</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Why it matches</div>
        <p className="text-slate-300 text-sm leading-relaxed line-clamp-4">
          {job.matchReasoning}
        </p>
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between">
         <div className="text-xs text-slate-500">
            <i className="far fa-clock mr-1"></i> {job.postedDate}
         </div>
         {job.salary !== "Not listed" && (
            <div className="text-xs text-slate-400">
               <i className="fas fa-money-bill-wave mr-1 text-emerald-500"></i> {job.salary}
            </div>
         )}
      </div>

      <a 
        href={job.applyLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`mt-4 block w-full text-center py-2.5 px-4 rounded-lg font-medium transition-colors text-sm shadow-lg flex items-center justify-center ${
          job.isDirectLink 
            ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/50' 
            : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
        }`}
      >
        {isLinkedIn ? (
            <><i className="fab fa-linkedin mr-2 text-lg"></i> Apply on LinkedIn</>
        ) : job.isDirectLink ? (
          <>Apply Now <i className="fas fa-external-link-alt ml-2 text-xs opacity-70"></i></>
        ) : (
          <>Search to Apply <i className="fas fa-search ml-2 text-xs opacity-70"></i></>
        )}
      </a>
    </div>
  );
};

export default JobCard;
