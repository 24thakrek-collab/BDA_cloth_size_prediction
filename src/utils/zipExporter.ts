import JSZip from 'jszip';
import { PROJECT_FILES, ProjectFile } from '../data/projectFiles';

export async function exportAllProjectFilesAsZip(): Promise<void> {
  const zip = new JSZip();

  // Root folder
  const rootFolder = zip.folder('cloth_size_prediction_hadoop_pyspark');
  if (!rootFolder) return;

  for (const file of PROJECT_FILES) {
    const fileName = file.name;
    rootFolder.file(fileName, file.content);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'cloth_size_prediction_hadoop_pyspark.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

export function downloadSingleFile(file: ProjectFile): void {
  const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
