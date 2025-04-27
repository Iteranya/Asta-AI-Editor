
export async function generatePdf(latexContent, pdfTitle, slug, callbacks) {
    const { onStart, onSuccess, onError, onComplete } = callbacks;
    
    if (!latexContent.trim()) {
        onError('LaTeX content cannot be empty.');
        return;
    }

    onStart();

    try {
        const apiUrl = '/generate-pdf/';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                directory: `/projects/${slug}`,
                latex_filename: "content.tex",
                output_filename: "content.pdf"
            })
        });

    //     directory: str 
    // latex_filename:str = "content.tex"
    // output_filename: str = "content.pdf"

        const result = await response.json();

        if (response.ok) {
            const pdfPath = `/file/${pdfTitle}?t=${new Date().getTime()}`; 
            onSuccess(result.message || 'PDF generated successfully!', pdfPath);
        } else {
            let errorMessage = 'Failed to generate PDF.';
            if (result.detail) {
                if (Array.isArray(result.detail)) {
                    errorMessage = result.detail.map(err => `${err.loc.join('.')} - ${err.msg}`).join('; ');
                } else if (typeof result.detail === 'string') {
                    errorMessage = result.detail;
                }
            } else if (result.message) {
                errorMessage = result.message;
            }
            onError(errorMessage);
        }
    } catch (error) {
        console.error('Network or Frontend Error:', error);
        onError('An error occurred: ' + error.message);
    } finally {
        onComplete();
    }
}

export async function loadProject(slug) {
    try {
        const response = await fetch(`/db/${slug}`);
        if (!response.ok) {
            throw new Error(`Error fetching project: ${response.statusText}`);
        }
        const project = await response.json();
        return project;
    } catch (error) {
        console.error('Failed to load LaTeX:', error);
        return null;
    }
}

export async function generateLatex(project) {
    console.log(project)
    const markdown_content = project.markdown;
    const template = project.type || "default.tex"; // fallback to default if not provided
    const output = project.slug+"/content.tex";

    try {
        const response = await fetch('/generate-latex/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                markdown: markdown_content,
                output_path: output,
                template: template,
            }),
        });

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();

        if (data && data.latex) {
            return data.latex; // Return the generated LaTeX content
        } else {
            throw new Error("No LaTeX content returned from server.");
        }
    } catch (error) {
        console.error("Failed to generate LaTeX:", error);
        throw error;
    }
}

export async function updateLatex(project, new_latex_content) {
    const output_path = project.slug + "/content.tex";
    
    try {
        // Create a file object from the latex content string
        const file = new File([new_latex_content], output_path, {
            type: 'text/plain',
        });
        
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', file);
        
        // Send the request to the server
        // The endpoint will automatically overwrite existing files with the same path/name
        const response = await fetch('/files', {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.status === "success") {
            return {
                status: "success",
                path: data.filename
            };
        } else {
            throw new Error("Failed to update LaTeX content.");
        }
    } catch (error) {
        console.error("Failed to update LaTeX:", error);
        throw error;
    }
}