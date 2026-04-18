import type {
  UploadCompletionRecord,
  UploadFileInput,
  UploadedFileConfirmation,
  UploadProvider,
  UploadTarget,
} from '@/types/upload'

export interface UploadAdapter {
  provider: UploadProvider
  createUploadTargets(files: UploadFileInput[], uploaderName?: string): Promise<UploadTarget[]>
  completeUpload(
    items: UploadedFileConfirmation[],
    uploaderName?: string,
  ): Promise<UploadCompletionRecord[]>
}
