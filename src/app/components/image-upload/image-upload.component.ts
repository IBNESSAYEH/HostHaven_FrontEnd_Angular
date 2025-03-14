import { Component } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  uploadProgress = 0;
  uploadSuccess = false;
  uploadError = '';
  uploadedImageUrls: string[] = [];
  isUploading = false;

  constructor(private http: HttpClient) {}

  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = [];
      this.previewUrls = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (this.isImageFile(file)) {
          this.selectedFiles.push(file);
          this.createImagePreview(file);
        } else {
          this.uploadError = 'Please select only image files.';
        }
      }
    }
  }

  private isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrls.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  uploadImages(): void {
    if (this.selectedFiles.length === 0) {
      this.uploadError = 'Please select at least one image to upload.';
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadSuccess = false;
    this.uploadError = '';
    this.uploadedImageUrls = [];

    const formData = new FormData();
    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    this.http.post<string[]>('http://localhost:8080/api/annonces/upload-images', formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.uploadSuccess = true;
          this.uploadedImageUrls = event.body;
          this.isUploading = false;
        }
      },
      error: (error) => {
        this.uploadError = 'Error uploading images. Please try again.';
        this.isUploading = false;
        console.error('Upload error:', error);
      }
    });
  }

  getUploadedUrls(): string[] {
    return this.uploadedImageUrls;
  }

  resetUpload(): void {
    this.selectedFiles = [];
    this.previewUrls = [];
    this.uploadProgress = 0;
    this.uploadSuccess = false;
    this.uploadError = '';
    this.uploadedImageUrls = [];
  }
}
