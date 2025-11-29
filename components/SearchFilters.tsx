
import React, { useState, useEffect } from 'react';
import { JobSearchParams, ResumeData } from '../types';

interface SearchFiltersProps {
  onSearch: (params: JobSearchParams) => void;
  isLoading: boolean;
  resumeData?: ResumeData;
  initialValues?: {
    jobTitle: string;
    company: string;
    location: string;
  }
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, isLoading, resumeData, initialValues }) => {
  const [params, setParams] = useState<JobSearchParams>({
    jobTitle: '',
    company: '',
    location: '',
    targetCompanies: [],
    useTargetedSearch: false
  });
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [resumeInitialized, setResumeInitialized] = useState<string | null>(null);

  // Smart Initialization: Only reset defaults when the actual resume content changes
  useEffect(() => {
    // Create a simple signature for the resume content
    const currentResumeSignature = resumeData ? `${resumeData.suggestedJobTitle}-${resumeData.pastCompanies?.length || 0}-${resumeData.candidateLocation}` : null;
    
    if (currentResumeSignature && currentResumeSignature !== resumeInitialized) {
      setParams(prev => ({
        ...prev,
        jobTitle: resumeData?.suggestedJobTitle || prev.jobTitle,
        company: initialValues?.company || '',
        location: resumeData?.candidateLocation || initialValues?.location || '', // Auto-fill location
        // Default to first 5 companies
        targetCompanies: resumeData?.suggestedTargetCompanies?.slice(0, 5) || [],
        useTargetedSearch: !!(resumeData?.suggestedTargetCompanies && resumeData.suggestedTargetCompanies.length > 0)
      }));
      setResumeInitialized(currentResumeSignature);
      setIsExpanded(true);
    }
  }, [resumeData, initialValues, resumeInitialized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(params);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleCompany = (company: string) => {
    setParams(prev => {
      const exists = prev.targetCompanies.includes(company);
      if (exists) {
        return { ...prev, targetCompanies: prev.targetCompanies.filter(c => c !== company) };
      } else {
        // Increase limit to 15
        if (prev.targetCompanies.length >= 15) return prev; 
        return { ...prev, targetCompanies: [...prev.targetCompanies, company] };
      }
    });
  };

  const visibleCompanies = isExpanded 
    ? resumeData?.suggestedTargetCompanies 
    : resumeData?.suggestedTargetCompanies?.slice(0, 10);

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl mb-8 animate-fade-in">
      
      {/* Search Strategy Toggle */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
        <div>
          <h3 className="text-white font-semibold">Search Strategy</h3>
          <p className="text-xs text-slate-400">Choose how we look for jobs</p>
        </div>
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
          <button
            type="button"
            onClick={() => setParams(prev => ({...prev, useTargetedSearch: false}))}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!params.useTargetedSearch ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Broad Search
          </button>
          <button
            type="button"
            onClick={() => setParams(prev => ({...prev, useTargetedSearch: true}))}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${params.useTargetedSearch ? 'bg-brand-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Targeted Company Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative group">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-slate-500 group-focus-within:text-brand-400"></i>
          </div>
          <input
            type="text"
            name="jobTitle"
            placeholder="Job Title"
            value={params.jobTitle}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>

        <div className="relative group">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-map-marker-alt text-slate-500 group-focus-within:text-brand-400"></i>
          </div>
          <input
            type="text"
            name="location"
            placeholder="Location (Optional)"
            value={params.location}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>
        
        {/* Manual company input only shown in Broad Mode */}
        {!params.useTargetedSearch && (
          <div className="relative group animate-fade-in">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-building text-slate-500 group-focus-within:text-brand-400"></i>
            </div>
            <input
              type="text"
              name="company"
              placeholder="Specific Company (Optional)"
              value={params.company}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
        )}
      </div>

      {/* Target Companies Section */}
      {params.useTargetedSearch && resumeData?.suggestedTargetCompanies && (
        <div className="mb-6 animate-slide-up">
           <div className="flex justify-between items-end mb-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <i className="fas fa-crosshairs mr-1 text-brand-500"></i> AI Recommended Targets (Select up to 15)
              </label>
              <div className="text-xs text-slate-500">
                {params.targetCompanies.length}/15 Selected
              </div>
           </div>
           
           <div className="flex flex-wrap gap-2">
             {visibleCompanies?.map((company) => {
               const isSelected = params.targetCompanies.includes(company);
               return (
                 <button
                   key={company}
                   type="button"
                   onClick={() => toggleCompany(company)}
                   className={`
                     px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center
                     ${isSelected 
                       ? 'bg-brand-900/40 border-brand-500 text-brand-200 shadow-[0_0_10px_rgba(14,165,233,0.3)]' 
                       : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'}
                   `}
                 >
                   {isSelected && <i className="fas fa-check mr-2 text-xs"></i>}
                   {company}
                 </button>
               );
             })}
           </div>
           
           {/* Expand/Collapse Button */}
           {(resumeData.suggestedTargetCompanies.length > 10) && (
             <button 
               type="button"
               onClick={() => setIsExpanded(!isExpanded)}
               className="mt-3 text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center"
             >
               {isExpanded ? (
                 <><i className="fas fa-chevron-up mr-1"></i> Show Less</>
               ) : (
                 <><i className="fas fa-chevron-down mr-1"></i> Show All {resumeData.suggestedTargetCompanies.length} Companies</>
               )}
             </button>
           )}

           {params.targetCompanies.length === 0 && (
             <p className="text-xs text-orange-400 mt-2">Please select at least one company or switch to Broad Search.</p>
           )}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || (params.useTargetedSearch && params.targetCompanies.length === 0)}
        className={`
          w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all
          flex items-center justify-center text-lg
          ${isLoading || (params.useTargetedSearch && params.targetCompanies.length === 0)
            ? 'bg-slate-600 cursor-not-allowed' 
            : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 hover:shadow-brand-500/25'}
        `}
      >
        {isLoading ? (
           <><i className="fas fa-circle-notch fa-spin mr-2"></i> Scouting Jobs...</>
        ) : (
           <><i className="fas fa-rocket mr-2"></i> Find Matches</>
        )}
      </button>
    </form>
  );
};

export default SearchFilters;
