// PDF Parsing Worker
self.onmessage = async (event) => {
  const { arrayBuffer } = event.data;
  
  try {
    // Dynamically import PDF.js from CDN (Worker must be type: module)
    const pdfjs = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs';

    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
      
      self.postMessage({ 
        type: 'progress', 
        percent: (i / pdf.numPages) * 100 
      });
    }

    self.postMessage({ type: 'success', text: fullText });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};
