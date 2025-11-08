// (function () {
//   const script = document.currentScript;
//   const formId = script?.getAttribute('data-form-id');
//   const containerId = script?.getAttribute('data-container-id') || 'feedback-widget-container';

//   console.log("📦 script embed running with formId:", formId);
//   console.log("📦 containerId:", containerId);

//   if (!formId) {
//     console.error("❌ No formId found in script tag");
//     return;
//   }

//   const iframe = document.createElement('iframe');
//   iframe.src = `https://feedbackapp2.vercel.app/form/${formId}`;
//   iframe.width = '100%';
//   iframe.height = '600';
//   iframe.style.border = 'none';
//   iframe.style.maxWidth = '500px';
//   iframe.style.display = 'block';

//   const mountPoint = document.getElementById(containerId);
//   if (mountPoint) {
//     mountPoint.appendChild(iframe);
//   } else {
//     console.warn('⚠️ No element found with id:', containerId);
//   }
// })();