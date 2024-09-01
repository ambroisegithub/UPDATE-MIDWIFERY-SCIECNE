export interface EmergencyFile {
    file_url: string;
    file_type: 'pdf' | 'video' | 'audio';
    description: string;
  }
  
  export interface Emergency {
    id: number;
    title: string;
    description: string;
    created_at: string;
    files: EmergencyFile[];
  }
  