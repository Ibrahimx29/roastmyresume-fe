import { useState } from "react";
import { Upload, FileType, Zap, X, Copy, ArrowRight, Loader2 } from "lucide-react";

// Main App Component
export default function App() {
  const [step, setStep] = useState("landing"); // landing, upload, result
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [roastMode, setRoastMode] = useState("roast"); // roast, professional
  const [resumeText, setResumeText] = useState("");
  const [roastResult, setRoastResult] = useState("");
  
  const handleFileUpload = async (file) => {
    // Basic validation
    if (!file || file.type !== "application/pdf") {
      setUploadError("Please upload a valid PDF file.");
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', roastMode);
      
      // Use environment variable for API URL
      const apiUrl = import.meta.env.VITE_API_URL + '/analyze';
      
      // Send to backend
      const response = await fetch(apiUrl, { 
        method: 'POST', 
        body: formData 
      });
      
      if (!response.ok) {
        throw new Error('Server error');
      }
      
      const data = await response.json();
      
      // Update state with response from server
      setResumeText(data.resume_text);
      setRoastResult(data.feedback);
      setStep("result");
    } catch (error) {
      setUploadError("Failed to upload your resume. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  }
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(roastResult);
    alert("Roast copied to clipboard!");
  };
  
  const resetApp = () => {
    setStep("landing");
    setResumeText("");
    setRoastResult("");
    setUploadError(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center">
      <header className="w-full py-6 flex justify-center">
        <div className="flex items-center">
          <Zap className="h-8 w-8 text-yellow-400 mr-2" />
          <h1 className="text-2xl font-bold tracking-tight">Resume Roaster</h1>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-6xl px-4 pb-20">
        {step === "landing" && <LandingPage onStart={() => setStep("upload")} />}
        
        {step === "upload" && (
          <UploadPage 
            onFileSelect={handleFileUpload} 
            isUploading={isUploading}
            error={uploadError}
            roastMode={roastMode}
            setRoastMode={setRoastMode}
          />
        )}
        
        {step === "result" && (
          <ResultPage 
            resumeText={resumeText}
            roastResult={roastResult}
            onCopy={copyToClipboard}
            onUploadAnother={resetApp}
            roastMode={roastMode}
          />
        )}
      </main>
      
      <footer className="w-full py-4 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Resume Roaster - Burning bad resumes since 2025
      </footer>
    </div>
  );
}

// Landing Page Component
function LandingPage({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
        Think your resume's fire?
        <br />
        <span className="text-white">Let us roast it anyway.</span>
      </h2>
      
      <p className="text-xl text-gray-300 mb-8 max-w-2xl">
        Upload your resume and get a brutally honest, yet strangely helpful critique.
        It might hurt, but so does rejection emails.
      </p>
      
      <button 
        onClick={onStart}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl flex items-center text-lg transition-all transform hover:scale-105"
      >
        <Upload className="mr-2 h-5 w-5" />
        Upload & Get Roasted
      </button>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {[
          { name: "A Developer", quote: "My resume cried. 10/10." },
          { name: "HR Manager", quote: "Savage but accurate. I hired the person after they fixed everything." },
          { name: "Recent Grad", quote: "I didn't know my resume was that bad. Now I do." }
        ].map((testimonial, i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-xl">
            <p className="italic text-gray-300 mb-4">"{testimonial.quote}"</p>
            <p className="text-yellow-400">- {testimonial.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Upload Page Component
function UploadPage({ onFileSelect, isUploading, error, roastMode, setRoastMode }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const submitFile = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };
  
  const clearSelectedFile = () => {
    setSelectedFile(null);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h2 className="text-3xl font-bold mb-8">Upload Your Resume</h2>
      
      <div 
        className={`w-full max-w-xl border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-colors
          ${dragActive ? "border-red-500 bg-gray-800/50" : "border-gray-600 bg-gray-800/20"}
          ${selectedFile ? "border-green-500" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center">
          {!selectedFile ? (
            <>
              <FileType className="h-12 w-12 text-gray-400 mb-4" />
              <p className="mb-4 text-gray-300">
                Drag & drop your resume here, or <label className="text-blue-400 cursor-pointer hover:underline">browse
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf" 
                    onChange={handleFileChange}
                  />
                </label>
              </p>
              <p className="text-sm text-gray-500">PDF files only, please.</p>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex items-center bg-gray-700 px-4 py-2 rounded-lg mb-4">
                <FileType className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-sm text-gray-200 truncate max-w-xs">{selectedFile.name}</span>
                <button 
                  onClick={clearSelectedFile}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-green-400 text-sm">Ready to roast!</p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="text-red-400 mb-6 text-center">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex bg-gray-800 p-1 rounded-lg">
          <button
            className={`px-4 py-2 rounded-md transition-colors ${roastMode === 'roast' 
              ? 'bg-red-600 text-white' 
              : 'text-gray-300 hover:text-white'}`}
            onClick={() => setRoastMode('roast')}
          >
            🔥 Roast Mode
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${roastMode === 'professional' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-300 hover:text-white'}`}
            onClick={() => setRoastMode('professional')}
          >
            🎯 Professional Mode
          </button>
        </div>
      </div>
      
      <button
        onClick={submitFile}
        disabled={!selectedFile || isUploading}
        className={`flex items-center bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all ${isUploading ? 'animate-pulse' : ''}`}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing Resume...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-5 w-5" />
            Roast Me
          </>
        )}
      </button>
    </div>
  );
}

// Result Page Component
function ResultPage({ resumeText, roastResult, onCopy, onUploadAnother, roastMode }) {
  // Function to format markdown-like text
  const formatRoastText = (text) => {
    if (!text) return [];
    
    // Split by paragraphs (double line breaks)
    const paragraphs = text.split(/\n\n+/);
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a bold header like "**Summary:**"
      if (paragraph.match(/^\*\*([^*]+)\*\*:/)) {
        const [, sectionTitle] = paragraph.match(/^\*\*([^*]+)\*\*:/);
        const content = paragraph.replace(/^\*\*([^*]+)\*\*:/, '');
        
        return (
          <div key={index} className="mb-4">
            <h4 className="text-yellow-400 font-bold text-lg mb-1">{sectionTitle}:</h4>
            <p>{content}</p>
          </div>
        );
      }
      
      // Process regular paragraphs with bold text
      let processedText = paragraph;
      
      // Replace **bold text** with styled spans
      const boldTextMatches = paragraph.match(/\*\*([^*]+)\*\*/g);
      if (boldTextMatches) {
        boldTextMatches.forEach(match => {
          const boldText = match.replace(/\*\*/g, '');
          processedText = processedText.replace(
            match, 
            `<span class="font-bold text-yellow-300">${boldText}</span>`
          );
        });
      }
      
      // If the paragraph contains HTML (from our bold text processing)
      if (processedText.includes('<span')) {
        return (
          <div 
            key={index} 
            className="mb-3" 
            dangerouslySetInnerHTML={{ __html: processedText }}
          />
        );
      }
      
      // Regular paragraph with no special formatting
      return <p key={index} className="mb-3">{processedText}</p>;
    });
  };

  // Function to format the resume text with better styling
  const formatResumeText = (text) => {
    if (!text) return [];
    
    // Parse the text into sections
    const sections = [];
    let currentSection = null;
    let currentContent = [];
    let contactInfo = null;
    
    // Split by lines
    const lines = text.split('\n');
    
    // Extract contact info from the end
    const contactLines = [];
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].includes('@') || lines[i].includes('+') || lines[i].match(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/)) {
        contactLines.unshift(lines[i]);
        lines.pop();
      } else if (contactLines.length > 0 && (lines[i].trim() === '' || i === lines.length - 1)) {
        break;
      } else {
        break;
      }
    }
    
    if (contactLines.length > 0) {
      contactInfo = contactLines.join('\n');
    }
    
    // Process remaining lines into sections
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if this is a new section header (usually capitalized, short, and not indented)
      if (trimmedLine !== '' && 
          !line.startsWith(' ') && 
          !line.startsWith('\t') && 
          trimmedLine.length < 30 &&
          !trimmedLine.includes('|') &&
          !trimmedLine.match(/^\d/) &&
          !trimmedLine.includes('-')) {
        
        // Save previous section if it exists
        if (currentSection) {
          sections.push({
            title: currentSection,
            content: currentContent.join('\n')
          });
        }
        
        // Start new section
        currentSection = trimmedLine;
        currentContent = [];
      }
      // Add line to current section content
      else if (currentSection) {
        currentContent.push(trimmedLine);
      }
    });
    
    // Add the last section
    if (currentSection && currentContent.length > 0) {
      sections.push({
        title: currentSection,
        content: currentContent.join('\n')
      });
    }
    
    // Render each section with proper formatting
    return (
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="mb-4">
            <h4 className="text-yellow-400 font-bold text-lg mb-1">{section.title}</h4>
            <div className="space-y-1">
              {section.content.split('\n').map((paragraph, pIndex) => {
                // Format job titles and companies
                if (paragraph.includes('|')) {
                  const parts = paragraph.split('|').map(p => p.trim());
                  return (
                    <div key={`p-${pIndex}`} className="mb-2">
                      <div className="font-bold text-blue-300">{parts[0]}</div>
                      {parts.slice(1).map((part, partIndex) => (
                        <div key={`part-${partIndex}`} className="text-gray-300">{part}</div>
                      ))}
                    </div>
                  );
                }
                
                // Format bullet points
                if (paragraph.startsWith('•') || paragraph.match(/^[A-Za-z]/) && paragraph.endsWith('.')) {
                  return (
                    <div key={`p-${pIndex}`} className="flex">
                      <div className="mr-2">•</div>
                      <div>{paragraph.startsWith('•') ? paragraph.substring(1).trim() : paragraph}</div>
                    </div>
                  );
                }
                
                // Format skills and other lists
                if (section.title === "Technical Skills" || section.title === "Languages" || section.title === "Certificates") {
                  const skills = paragraph.split(',').map(skill => skill.trim());
                  return (
                    <div key={`p-${pIndex}`} className="flex flex-wrap gap-2">
                      {skills.map((skill, skillIndex) => (
                        <span key={`skill-${skillIndex}`} className="bg-gray-600 px-2 py-1 rounded-md text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  );
                }
                
                // Regular paragraph
                return paragraph.trim() ? <p key={`p-${pIndex}`}>{paragraph}</p> : null;
              })}
            </div>
          </div>
        ))}
        
        {contactInfo && (
          <div className="mt-6 pt-4 border-t border-gray-600 text-center">
            {contactInfo.split('\n').map((line, i) => (
              <div key={`contact-${i}`} className={i === 0 ? "font-bold text-lg" : "text-gray-300"}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
      <h2 className="text-3xl font-bold mb-8 text-center">
        {roastMode === 'roast' ? 'Your Resume Got Flame-Grilled' : 'Your Resume Review'}
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left side - Roast result */}
        <div className="bg-gray-800 rounded-xl p-6 relative">
          <div className="absolute -top-6 left-6">
            <div className="bg-yellow-500 rounded-full h-12 w-12 flex items-center justify-center">
              {roastMode === 'roast' ? (
                <span className="text-xl">🔥</span>
              ) : (
                <span className="text-xl">🎯</span>
              )}
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-4 text-gray-300 mt-6">
            {roastMode === 'roast' ? 'The Roast' : 'Professional Feedback'}
          </h3>
          
          <div className="bg-gray-700 p-4 rounded-lg text-white mb-4 overflow-auto max-h-[70vh]">
            <div className="text-sm md:text-base">
              {formatRoastText(roastResult)}
            </div>
          </div>
          
          <button
            onClick={onCopy}
            className="flex items-center text-sm text-gray-300 hover:text-white"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy to clipboard
          </button>
        </div>

        {/* Right side - Resume text */}
        <div className="bg-gray-800 rounded-xl p-6 h-min">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Your Resume</h3>
          <div className="bg-gray-700 p-4 rounded-lg text-white mb-4 overflow-auto max-h-[70vh]">
            <div className="text-sm md:text-base">
            {formatResumeText(resumeText)}
            </div>
            </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={onUploadAnother}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
        >
          <Upload className="mr-2 h-5 w-5" />
          Upload Another Resume
        </button>
      </div>
    </div>
  );
}