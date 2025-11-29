
import { GoogleGenAI, Type } from "@google/genai";
import { JobMatch, ResumeData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes an uploaded resume (Image or PDF) to extract summary, skills, past companies, and suggests target companies.
 */
export const analyzeResume = async (
  fileBase64: string,
  mimeType: string
): Promise<ResumeData> => {
  try {
    const model = "gemini-2.5-flash";
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this resume. Extract the following structured data:
            1. A professional summary (max 3 sentences).
            2. Top 10 technical/professional skills.
            3. A 'suggestedJobTitle' that describes the best role for this candidate.
            4. 'candidateLocation': The candidate's city and state (or country) extracted from contact info. If not found, return "Remote".
            5. 'pastCompanies': A list of companies the candidate has worked for.
            6. 'suggestedTargetCompanies': Based on the candidate's past companies and industry level, list 30 *other* companies (competitors, partners, or peers) where they would be a great fit.
            
            Return the result in JSON format.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            skills: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            suggestedJobTitle: { type: Type.STRING },
            candidateLocation: { type: Type.STRING },
            pastCompanies: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            suggestedTargetCompanies: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "skills", "suggestedJobTitle", "candidateLocation", "pastCompanies", "suggestedTargetCompanies"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as ResumeData;

  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error("Failed to analyze resume. Please ensure the file is clear and readable.");
  }
};

/**
 * Searches for jobs using Google Search Grounding.
 * Implements "Targeted Search" vs "Broad Search".
 */
export const searchAndMatchJobs = async (
  criteria: { 
    jobTitle: string; 
    company: string; 
    location: string;
    targetCompanies: string[];
    useTargetedSearch: boolean;
  },
  resumeData: ResumeData
): Promise<JobMatch[]> => {
  try {
    const model = "gemini-2.5-flash";
    
    // --- Query Construction ---
    let searchQuery = "";

    if (criteria.useTargetedSearch && criteria.targetCompanies.length > 0) {
      // Strategy: Create a Boolean OR query for the companies to find specific roles
      // Limit to top 15 (increased from 7)
      // Strip legal suffixes to save query tokens/length
      const cleanCompany = (name: string) => name.replace(/,|\.| Inc\.| Corp\.| LLC| Ltd| Group/gi, "").trim();
      
      const companyGroup = criteria.targetCompanies
        .slice(0, 15)
        .map(c => `"${cleanCompany(c)}"`)
        .join(" OR ");
      
      const locationPart = criteria.location ? `in "${criteria.location}"` : "";
      
      // Targeted search now also hints at LinkedIn to find jobs for these companies
      searchQuery = `"${criteria.jobTitle}" jobs (${companyGroup}) ${locationPart} (site:linkedin.com/jobs OR "careers" OR "apply") -"closed" -"filled"`;
    } else {
      // Broad Search Strategy
      // Explicitly include LinkedIn and major boards in the query parts
      const parts = ["(site:linkedin.com/jobs OR site:indeed.com OR site:glassdoor.com OR \"careers\" OR \"hiring now\")"];
      
      if (criteria.jobTitle && criteria.jobTitle.trim()) parts.push(`"${criteria.jobTitle}"`);
      
      // If broad search, and user specified a single company manually
      if (criteria.company && criteria.company.trim()) parts.push(`at "${criteria.company}"`);
      
      if (criteria.location && criteria.location.trim()) {
        parts.push(`in "${criteria.location}"`);
      } else {
        // If no location, explicitly ask for generic listings to avoid purely local IP based results if undesired
        parts.push("current open jobs");
      }
      
      // Fallback
      if (parts.length === 1) { 
           parts.push(`"${resumeData.suggestedJobTitle}"`);
      }
      searchQuery = parts.join(" ");
    }

    const prompt = `
      You are an expert technical recruiter using Google Search to find LIVE job listings.
      
      SEARCH QUERY: '${searchQuery}'
      
      INSTRUCTIONS:
      1. Use Google Search to find real, active job postings.
      2. If 'Targeted Search' is active, prioritize results from the specific companies requested: ${criteria.targetCompanies.join(", ")}.
      3. FILTER OUT: Avoid listings that say "Closed", "Expired", or are from more than 30 days ago if visible.
      4. Select the top 20 most relevant active listings.
      5. Compare against Candidate:
         - Summary: ${resumeData.summary}
         - Skills: ${resumeData.skills.join(", ")}
         - Preferred Location: ${criteria.location || resumeData.candidateLocation || "Any"}

      OUTPUT FORMAT: JSON Array.
      For each job:
      - title: Job Title.
      - company: Company Name.
      - location: Location.
      - matchScore: 0-100 based on skill overlap and location fit.
      - matchReasoning: Why it fits (mention location match if applicable).
      - applyLink: The specific URL found.
      - salary: "Not listed" or value.
      - postedDate: "Recently" or specific date.
      
      IMPORTANT:
      - Only return jobs found in the search results.
      - Do not hallucinate links.
      - Return RAW JSON.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    let rawText = response.text || "";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    let jobs: any[] = [];
    try {
      jobs = JSON.parse(rawText);
    } catch (e) {
      // Fallback extraction
      const start = rawText.indexOf('[');
      const end = rawText.lastIndexOf(']');
      if (start !== -1 && end !== -1) {
        try {
            jobs = JSON.parse(rawText.substring(start, end + 1));
        } catch (e2) { jobs = []; }
      }
    }

    if (!Array.isArray(jobs)) return [];

    return jobs.map((job: any, index: number) => {
      // Link Verification Logic
      const chunkUrl = findBestUrl(groundingChunks, job.title, job.company);
      
      // Prioritize ATS links (greenhouse, lever, etc) over job boards if possible
      let jsonUrl = (job.applyLink && typeof job.applyLink === 'string' && job.applyLink.startsWith('http')) 
        ? job.applyLink 
        : null;

      const isJsonUrlVerified = jsonUrl && groundingChunks.some(c => c.web?.uri === jsonUrl);
      
      let finalLink = null;
      let isDirectLink = false;

      if (isJsonUrlVerified) {
        finalLink = jsonUrl;
        isDirectLink = true;
      } else if (chunkUrl) {
        finalLink = chunkUrl;
        isDirectLink = true;
      } else {
        // Fallback: Construct a high-intent Google Search URL
        finalLink = `https://www.google.com/search?q=${encodeURIComponent(job.title + " " + job.company + " careers apply")}`;
        isDirectLink = false;
      }

      return {
        id: `job-${index}-${Date.now()}`,
        title: job.title || "Unknown Title",
        company: job.company || "Unknown Company",
        location: job.location || "Remote/Unknown",
        matchScore: Number(job.matchScore || 0),
        matchReasoning: job.matchReasoning || "Analysis not available.",
        description: job.description || "",
        applyLink: finalLink,
        isDirectLink: isDirectLink, 
        salary: job.salary || "Not listed",
        postedDate: job.postedDate || "Recently"
      };
    });

  } catch (error) {
    console.error("Error searching jobs:", error);
    throw new Error("Unable to fetch jobs at this time.");
  }
};

/**
 * Helper to find best matching URL in grounding chunks.
 */
function findBestUrl(chunks: any[], jobTitle: string, company: string): string | null {
  if (!chunks || chunks.length === 0 || !jobTitle || !company) return null;

  let bestChunk = null;
  let maxScore = 0;

  const titleWords = jobTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const companyName = company.toLowerCase();

  for (const chunk of chunks) {
    if (!chunk.web?.title || !chunk.web?.uri) continue;
    
    const chunkTitle = chunk.web.title.toLowerCase();
    const chunkUri = chunk.web.uri.toLowerCase();
    let score = 0;

    // Prioritize LinkedIn, and ATS systems
    if (chunkUri.includes('linkedin.com/jobs')) {
      score += 15;
    }
    if (chunkUri.includes('greenhouse.io') || chunkUri.includes('lever.co') || chunkUri.includes('workday')) {
        score += 10;
    }

    if (chunkTitle.includes(companyName)) score += 20;
    
    for (const word of titleWords) {
      if (chunkTitle.includes(word)) score += 5;
    }
    
    if (score > maxScore) {
      maxScore = score;
      bestChunk = chunk;
    }
  }

  // Lowered threshold slightly to accept more matches if we want 20 results
  if (maxScore >= 15) {
     return bestChunk?.web?.uri || null;
  }

  return null;
}
