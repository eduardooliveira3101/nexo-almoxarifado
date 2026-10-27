import {seedData} from './demo.js';
const key='nexo-portfolio-demo-v1';
let memory={data:seedData(),revision:1};
try { const saved=localStorage.getItem(key); if(saved) memory=JSON.parse(saved); } catch {}
export class ApiError extends Error {constructor(message,status){super(message);this.status=status;}}
export const api={
session:async()=>({authenticated:true,configured:true,email:'visitante@example.test'}),
login:async()=>({ok:true}),
logout:async()=>{memory={data:seedData(),revision:1};localStorage.removeItem(key);location.reload();},
load:async()=>structuredClone(memory),
save:async(data,revision)=>{if(revision!==memory.revision)throw new ApiError('Recarregue os dados da demonstração.',409);memory={data:structuredClone(data),revision:revision+1};localStorage.setItem(key,JSON.stringify(memory));return structuredClone(memory);}
};
export async function downloadCertificate(pdf, code) {
  if (!pdf) return;
  if (!pdf.startsWith('/api/certificate?key=') && !pdf.startsWith('data:application/pdf;base64,')) {
    throw Error('Este PDF usa um endereço do sistema anterior. Baixe-o por lá e anexe novamente.');
  }
  const response = await fetch(pdf, { credentials: 'same-origin' });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw Error(data.error || 'Não foi possível baixar o PDF.');
  }
  downloadBlob(await response.blob(), `${code.replace(/[^a-zA-Z0-9_-]/g, '_')}-certificado.pdf`);
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readPdf(file) {
  if (!file || !file.size) return null;
  if (file.size > 2 * 1024 * 1024 || (file.type && file.type !== 'application/pdf'))
    throw Error('Selecione um PDF de até 2 MB.');
  if (!new TextDecoder().decode(await file.slice(0, 5).arrayBuffer()).startsWith('%PDF-'))
    throw Error('O arquivo não é um PDF válido.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(Error('Não foi possível ler o PDF.'));
    reader.readAsDataURL(file);
  });
}
