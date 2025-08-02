import { DatabaseStorage } from '../storage';

export interface ResumeData {
  title: string;
  content: any;
  template_id?: string;
  is_public?: boolean;
}

export interface ResumeVersion {
  id: string;
  version_number: number;
  content: any;
  created_at: Date;
  created_by: string;
}

export class ResumeService {
  private storage: DatabaseStorage;

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  /**
   * Create a new resume
   */
  async createResume(userId: string, resumeData: ResumeData) {
    try {
      const resume = await this.storage.createResume({
        user_id: userId,
        title: resumeData.title,
        content: resumeData.content,
        template_id: resumeData.template_id,
        is_public: resumeData.is_public || false
      });

      return resume;
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  }

  /**
   * Get user's resumes
   */
  async getUserResumes(userId: string) {
    try {
      return await this.storage.getResumesByUserId(userId);
    } catch (error) {
      console.error('Error fetching user resumes:', error);
      throw error;
    }
  }

  /**
   * Get a specific resume
   */
  async getResume(resumeId: string, userId: string) {
    try {
      const resume = await this.storage.getResumeById(resumeId);
      
      // Check if user owns this resume or if it's public
      if (resume.user_id !== userId && !resume.is_public) {
        throw new Error('Unauthorized access to resume');
      }
      
      return resume;
    } catch (error) {
      console.error('Error fetching resume:', error);
      throw error;
    }
  }

  /**
   * Update a resume
   */
  async updateResume(resumeId: string, userId: string, updates: Partial<ResumeData>) {
    try {
      const resume = await this.storage.getResumeById(resumeId);
      
      // Check if user owns this resume
      if (resume.user_id !== userId) {
        throw new Error('Unauthorized access to resume');
      }
      
      return await this.storage.updateResume(resumeId, updates);
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  }

  /**
   * Delete a resume
   */
  async deleteResume(resumeId: string, userId: string) {
    try {
      const resume = await this.storage.getResumeById(resumeId);
      
      // Check if user owns this resume
      if (resume.user_id !== userId) {
        throw new Error('Unauthorized access to resume');
      }
      
      return await this.storage.deleteResume(resumeId);
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }

  /**
   * Get resume versions
   */
  async getResumeVersions(resumeId: string, userId: string) {
    try {
      const resume = await this.storage.getResumeById(resumeId);
      
      // Check if user owns this resume
      if (resume.user_id !== userId) {
        throw new Error('Unauthorized access to resume');
      }
      
      return await this.storage.getResumeVersions(resumeId);
    } catch (error) {
      console.error('Error fetching resume versions:', error);
      throw error;
    }
  }

  /**
   * Restore resume to a specific version
   */
  async restoreResumeVersion(resumeId: string, versionId: string, userId: string) {
    try {
      const resume = await this.storage.getResumeById(resumeId);
      
      // Check if user owns this resume
      if (resume.user_id !== userId) {
        throw new Error('Unauthorized access to resume');
      }
      
      const version = await this.storage.getResumeVersionById(versionId);
      
      // Update resume with version content
      return await this.storage.updateResume(resumeId, {
        content: version.content
      });
    } catch (error) {
      console.error('Error restoring resume version:', error);
      throw error;
    }
  }
} 