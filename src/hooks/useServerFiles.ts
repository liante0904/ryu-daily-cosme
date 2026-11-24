import { useCallback, useEffect, useState } from 'react';
import { downloadServerFileBlob, fetchServerFiles } from '../api/mapiaApi';
import type { ServerCsvFile } from '../types';
import { triggerBrowserDownload } from '../utils';

/**
 * Manage server-stored CSV file listing, polling, and file downloads.
 */
export function useServerFiles(
  isGenerating: boolean,
  onDownloadError: (message: string) => void
) {
  const [serverFiles, setServerFiles] = useState<ServerCsvFile[]>([]);

  const refreshServerFiles = useCallback(async () => {
    try {
      const files = await fetchServerFiles();
      setServerFiles(files);
    } catch (err) {
      console.error('서버 파일 목록 로딩 실패:', err);
    }
  }, []);

  const downloadServerFile = useCallback(
    async (filename: string): Promise<boolean> => {
      try {
        const blob = await downloadServerFileBlob(filename);
        triggerBrowserDownload(blob, filename);
        return true;
      } catch (err) {
        console.error('서버 파일 다운로드 실패:', err);
        onDownloadError('파일 다운로드에 실패했습니다.');
        return false;
      }
    },
    [onDownloadError]
  );

  useEffect(() => {
    let active = true;
    fetchServerFiles()
      .then((files) => {
        if (active) setServerFiles(files);
      })
      .catch((err) => {
        console.error('서버 파일 목록 로딩 실패:', err);
      });
    // 생성 중에는 새 파일을 빠르게 반영하고, 대기 중에도 목록이 오래된 상태로 남지 않게 합니다.
    const interval = window.setInterval(() => void refreshServerFiles(), isGenerating ? 2000 : 30 * 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isGenerating, refreshServerFiles]);

  return {
    serverFiles,
    refreshServerFiles,
    downloadServerFile,
  };
}
