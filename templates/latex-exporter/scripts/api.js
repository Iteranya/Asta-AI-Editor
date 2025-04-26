
export async function generatePdf(latexContent, pdfTitle, callbacks) {
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
                output_filename: pdfTitle,
                tex_content: latexContent
            })
        });

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