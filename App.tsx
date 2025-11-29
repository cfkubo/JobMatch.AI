
import React, { useState } from 'react';
import ResumeUploader from './components/ResumeUploader';
import SearchFilters from './components/SearchFilters';
import JobCard from './components/JobCard';
import { ResumeData, JobMatch, JobSearchParams } from './types';
import { searchAndMatchJobs } from './services/geminiService';

const App: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleResumeAnalyzed = (data: ResumeData) => {
    setResumeData(data);
    // Reset search state when new resume is uploaded
    setJobs([]);
    setHasSearched(false);
  };

  const handleSearch = async (params: JobSearchParams) => {
    if (!resumeData) return;
    setIsSearching(true);
    setHasSearched(false);
    setJobs([]); // Clear previous
    
    try {
      const results = await searchAndMatchJobs(params, resumeData);
      setJobs(results);
    } catch (error) {
      console.error("Search failed", error);
      alert("Something went wrong while fetching jobs. Please try again.");
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handleReset = () => {
    setResumeData(null);
    setJobs([]);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/30 rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-900/20 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <header className="relative z-10 w-full py-6 px-4 md:px-8 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                <i className="fas fa-brain text-white text-xl"></i>
             </div>
             <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
               JobMatch AI
             </h1>
          </div>
          {resumeData && (
             <button 
                onClick={handleReset}
                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center"
             >
                <i className="fas fa-undo mr-2"></i> Start Over
             </button>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-grow flex flex-col items-center justify-start p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {!resumeData ? (
          <div className="flex flex-col items-center justify-center flex-grow py-20 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-6 leading-tight">
              Find the job that <span className="text-brand-400">actually</span> fits.
            </h2>
            <p className="text-lg text-slate-400 text-center max-w-2xl mb-12">
              Upload your resume and let our AI scout the web for live job openings, analyze the requirements, and match them to your unique skills profile.
            </p>
            <ResumeUploader onResumeAnalyzed={handleResumeAnalyzed} />
          </div>
        ) : (
          <div className="w-full animate-slide-up">
            <div className="mb-8">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                 <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-3xl">
                       👋
                    </div>
                 </div>
                 <div className="flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2">Resume Analyzed</h3>
                    <p className="text-slate-400 text-sm mb-2">{resumeData.summary}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {resumeData.skills.slice(0, 8).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-md bg-brand-900/30 border border-brand-500/30 text-brand-300 text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                    {resumeData.pastCompanies && resumeData.pastCompanies.length > 0 && (
                      <div className="text-xs text-slate-500">
                        <span className="font-semibold text-slate-400">Past exp:</span> {resumeData.pastCompanies.join(", ")}
                      </div>
                    )}
                 </div>
              </div>

              <h2 className="text-xl font-semibold mb-4 text-white">Find Your Next Role</h2>
              <SearchFilters 
                onSearch={handleSearch} 
                isLoading={isSearching} 
                resumeData={resumeData}
                // Avoid passing new object literal every render to prevent effect loops
                initialValues={undefined} 
              />
            </div>

            {hasSearched && (
               <div className="animate-slide-up">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Top Matches</h2>
                    <span className="text-sm text-slate-500">{jobs.length} relevant positions found</span>
                  </div>
                  
                  {jobs.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                       <i className="fas fa-search text-4xl text-slate-600 mb-4"></i>
                       <h3 className="text-xl font-semibold text-slate-300 mt-4">No direct matches found</h3>
                       <p className="text-slate-400 mt-2 max-w-md mx-auto">
                         We couldn't find active listings matching all your criteria. 
                         <br/><br/>
                         Try switching to <strong>Broad Search</strong> or selecting different Target Companies.
                       </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  )}
               </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="relative z-10 py-6 text-center text-slate-600 text-sm border-t border-slate-800 bg-slate-900">
         <p>Powered by Gemini 2.5 Flash & Google Search Grounding</p>
      </footer>
    </div>
  );
};

export default App;
