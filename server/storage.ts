import { users, resumes, type User, type InsertUser, type Resume, type InsertResume, type UpdateResume } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getResume(id: number): Promise<Resume | undefined>;
  getResumesByUser(userId: number): Promise<Resume[]>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, resume: UpdateResume): Promise<Resume | undefined>;
  deleteResume(id: number): Promise<boolean>;
  
  // Initialize mock user for demo purposes
  initializeMockUser(): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume || undefined;
  }

  async getResumesByUser(userId: number): Promise<Resume[]> {
    return await db.select().from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.updatedAt));
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const [resume] = await db
      .insert(resumes)
      .values(insertResume)
      .returning();
    return resume;
  }

  async updateResume(id: number, updateResume: UpdateResume): Promise<Resume | undefined> {
    const [resume] = await db
      .update(resumes)
      .set({ ...updateResume, updatedAt: new Date() })
      .where(eq(resumes.id, id))
      .returning();
    return resume || undefined;
  }

  async deleteResume(id: number): Promise<boolean> {
    const result = await db.delete(resumes).where(eq(resumes.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async initializeMockUser(): Promise<User> {
    // Check if mock user already exists
    const existingUser = await this.getUserByUsername("demo_user");
    if (existingUser) {
      return existingUser;
    }

    // Create mock user for demo purposes
    return await this.createUser({
      username: "demo_user",
      password: "demo_password" // In real app, this would be hashed
    });
  }
}

export const storage = new DatabaseStorage();