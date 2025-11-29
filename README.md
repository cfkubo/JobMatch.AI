# JobMatch AI 🚀

JobMatch AI is a next-generation job search application that bridges the gap between your static resume and the live job market. 

Instead of searching for keywords manually, this app reads your resume (PDF or Image), understands your profile using **Google Gemini 2.5 Flash**, and performs **Grounding-based Google Searches** to find live listings that actually match your skills.

## ✨ Key Features

*   **Multimodal Resume Parsing**: Upload a PDF or Image of your resume. The AI extracts your summary, skills, location, and past employers.
*   **Smart Strategy**:
    *   **Broad Search**: Finds jobs based on title and location across major job boards (including LinkedIn, Indeed, Glassdoor).
    *   **Targeted Search**: The AI analyzes your industry and suggests **30 target companies**. You can select up to 15 specific companies to hunt for roles exclusively on their career pages or listings.
*   **Live Google Search Grounding**: Uses the latest Google Search data to find currently active job posts, filtering out "closed" or "filled" positions.
*   **Match Scoring**: Every found job is compared against your resume to generate a 0-100% match score with specific reasoning.
*   **LinkedIn Integration**: Prioritizes and visualizes LinkedIn job postings.
*   **Direct Link Verification**: Validates URLs to ensure "Apply" buttons lead to real pages, minimizing broken links.

## 🛠️ Tech Stack

*   **Frontend**: React (TypeScript)
*   **AI & Search**: Google Gemini API (`gemini-2.5-flash`) with Search Grounding
*   **Styling**: Tailwind CSS
*   **Icons**: FontAwesome

## 🚀 How to Run Locally

Follow these instructions to set up the project on your local machine.

### Prerequisites

1.  **Node.js**: Ensure you have Node installed (v16+ recommended).
2.  **Google Gemini API Key**: You need a paid API key to use the Search Grounding feature. Get one at [Google AI Studio](https://aistudio.google.com/).

### Installation Steps

1.  **Clone the repository** (or download the source code):
    ```bash
    git clone <repository-url>
    cd job-match-ai
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```
    *Note: If you don't have a `package.json` yet because you just downloaded these files, run `npm init -y` and then install the required packages:*
    ```bash
    npm install react react-dom @google/genai parcel-bundler --save-dev
    ```

3.  **Configure API Key**:
    *   **Option A (Environment Variable - Recommended):**
        Create a `.env` file in the root directory:
        ```
        API_KEY=your_actual_api_key_here
        ```
    *   **Option B (Temporary Testing):**
        If you are having trouble with environment variables in your local bundler, you can temporarily paste your key into `services/geminiService.ts` (line 5), but **never commit this to GitHub**.

4.  **Run the Application**:
    ```bash
    npm start
    ```
    (Or `npx parcel index.html` if you are using Parcel directly).

5.  **Open in Browser**:
    Go to `http://localhost:1234` (or whatever port your terminal says).

## 🧪 How to Test

1.  **Upload a Resume**: Drag and drop a PDF or Image of a resume.
    *   *Test different profiles:* Try a Software Engineer resume vs. a Marketing Manager resume to see how the "Target Companies" suggestion changes.
2.  **Review Analysis**: Ensure the summary and skills look correct.
3.  **Select Strategy**:
    *   **Broad Search**: Good for seeing what's out there generally.
    *   **Targeted Search**: Click "Targeted Company Search". The AI will suggest 30 companies. Select 5-10 of them and hit "Find Matches".
4.  **Apply**: Click the links to ensure they go to the actual job postings.

## 🔒 Security Note

This is a client-side application. The API Key is used within the browser. 
*   **For Local Use:** It is safe to use your key.
*   **For Public Deployment:** Do not deploy this to a public URL (like Vercel/Netlify) without adding a backend proxy, otherwise your API key will be visible to users in the network tab.

## 📄 License

MIT
