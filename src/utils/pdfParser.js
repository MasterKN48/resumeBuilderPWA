export const parsePdf = (file, onProgress) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a new worker for each parsing task to keep it clean
      // Using import.meta.url with URL constructor is the Vite-recommended way to spawn workers
      const worker = new Worker(
        new URL('./pdf.worker.js', import.meta.url), 
        { type: 'module' }
      );

      const arrayBuffer = await file.arrayBuffer();
      
      // Transfer the ArrayBuffer to the worker to avoid cloning (zero-copy)
      worker.postMessage({ arrayBuffer }, [arrayBuffer]);
      
      worker.onmessage = (e) => {
        const { type, percent, text, error } = e.data;
        
        if (type === 'progress') {
          if (onProgress) onProgress(percent);
        } else if (type === 'success') {
          resolve(text);
          worker.terminate();
        } else if (type === 'error') {
          reject(new Error(error));
          worker.terminate();
        }
      };
      
      worker.onerror = (err) => {
        console.error("Worker error:", err);
        reject(new Error("PDF worker failed to initialize or execute."));
        worker.terminate();
      };

    } catch (err) {
      console.error("Failed to start PDF worker:", err);
      reject(err);
    }
  });
};
