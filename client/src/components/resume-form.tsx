import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Sparkles, Link as LinkIcon, Award, BookOpen, Globe, Users, Briefcase, Code } from "lucide-react";
import type { ResumeData } from "@/pages/builder";

interface ResumeFormProps {
  resumeData: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function ResumeForm({ resumeData, onChange }: ResumeFormProps) {
  const [activeTab, setActiveTab] = useState("personal");

  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value,
      },
    });
  };

  const updateSummary = (value: string) => {
    onChange({
      ...resumeData,
      summary: value,
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExperience = [...resumeData.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value,
    };
    onChange({
      ...resumeData,
      experience: newExperience,
    });
  };

  const addExperience = () => {
    onChange({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          title: "",
          company: "",
          startDate: "",
          endDate: "",
          description: "",
          location: "",
          employment_type: "Full-time",
        },
      ],
    });
  };

  const removeExperience = (index: number) => {
    onChange({
      ...resumeData,
      experience: resumeData.experience.filter((_, i) => i !== index),
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducation = [...resumeData.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value,
    };
    onChange({
      ...resumeData,
      education: newEducation,
    });
  };

  const addEducation = () => {
    onChange({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          degree: "",
          school: "",
          graduationYear: "",
          gpa: "",
          field_of_study: "",
          location: "",
          honors: "",
        },
      ],
    });
  };

  const removeEducation = (index: number) => {
    onChange({
      ...resumeData,
      education: resumeData.education.filter((_, i) => i !== index),
    });
  };

  const updateSkills = (value: string) => {
    const skills = value.split(",").map(skill => skill.trim()).filter(skill => skill);
    onChange({
      ...resumeData,
      skills,
    });
  };

  const generateAISummary = () => {
    // Mock AI generation - in a real app, this would call an AI service
    const aiSummary = "Experienced professional with proven track record in delivering high-quality results. Skilled in problem-solving, team collaboration, and innovative thinking. Passionate about continuous learning and contributing to organizational success.";
    updateSummary(aiSummary);
  };

  // Add projectSkills to ResumeForm
  const updateProjectSkills = (value: string) => {
    const projectSkills = value.split(",").map(skill => skill.trim()).filter(skill => skill);
    onChange({
      ...resumeData,
      projectSkills,
    });
  };

  // Helper functions for array fields
  const updateArrayField = (fieldName: keyof ResumeData, index: number, key: string, value: any) => {
    const array = resumeData[fieldName] as any[];
    const newArray = [...array];
    newArray[index] = { ...newArray[index], [key]: value };
    onChange({ ...resumeData, [fieldName]: newArray });
  };

  const addArrayItem = (fieldName: keyof ResumeData, newItem: any) => {
    const array = (resumeData[fieldName] as any[]) || [];
    onChange({ ...resumeData, [fieldName]: [...array, newItem] });
  };

  const removeArrayItem = (fieldName: keyof ResumeData, index: number) => {
    const array = resumeData[fieldName] as any[];
    onChange({ ...resumeData, [fieldName]: array.filter((_, i) => i !== index) });
  };

  const updateSocialLinks = (platform: string, value: string) => {
    onChange({
      ...resumeData,
      socialLinks: { ...resumeData.socialLinks, [platform]: value }
    });
  };

  return (
    <div className="w-full">
      {/* Custom Tab Navigation */}
      <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-1 sm:space-x-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap">
        {[
          { id: "personal", label: "Personal", icon: Users },
          { id: "experience", label: "Experience", icon: Briefcase },
          { id: "skills", label: "Skills", icon: Code },
          { id: "additional", label: "Additional", icon: Award },
          { id: "others", label: "Others", icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-max flex items-center justify-center px-2 sm:px-3 lg:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              <Icon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "personal" && (
        <div className="space-y-8">
          {/* Personal Information */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
              <Users className="mr-2 h-6 w-6" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-foreground dark:text-white">First Name</Label>
                <Input
                  id="firstName"
                  value={resumeData.personalInfo.firstName}
                  onChange={(e) => updatePersonalInfo("firstName", e.target.value)}
                  placeholder="John"
                  className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-foreground dark:text-white">Last Name</Label>
                <Input
                  id="lastName"
                  value={resumeData.personalInfo.lastName}
                  onChange={(e) => updatePersonalInfo("lastName", e.target.value)}
                  placeholder="Doe"
                  className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground dark:text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={resumeData.personalInfo.email}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  placeholder="john.doe@email.com"
                  className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-foreground dark:text-white">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                  className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-foreground dark:text-white">Address</Label>
                <Input
                  id="address"
                  value={resumeData.personalInfo.address || ""}
                  onChange={(e) => updatePersonalInfo("address", e.target.value)}
                  placeholder="City, State, Country"
                  className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
              <LinkIcon className="mr-2 h-5 w-5" />
              Social Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin" className="text-foreground dark:text-white">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={resumeData.socialLinks?.linkedin || ""}
                  onChange={(e) => updateSocialLinks("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="github" className="text-foreground dark:text-white">GitHub</Label>
                <Input
                  id="github"
                  value={resumeData.socialLinks?.github || ""}
                  onChange={(e) => updateSocialLinks("github", e.target.value)}
                  placeholder="https://github.com/username"
                  className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="portfolio" className="text-foreground dark:text-white">Portfolio</Label>
                <Input
                  id="portfolio"
                  value={resumeData.socialLinks?.portfolio || ""}
                  onChange={(e) => updateSocialLinks("portfolio", e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="website" className="text-foreground dark:text-white">Website</Label>
                <Input
                  id="website"
                  value={resumeData.socialLinks?.website || ""}
                  onChange={(e) => updateSocialLinks("website", e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">Professional Summary</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="summary" className="text-foreground dark:text-white">Professional Summary</Label>
                <Textarea
                  id="summary"
                  rows={4}
                  value={resumeData.summary}
                  onChange={(e) => updateSummary(e.target.value)}
                  placeholder="Write a brief professional summary..."
                  className="resize-none bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateAISummary}
                  className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Sparkles className="mr-1 h-4 w-4" />
                  Generate with AI
                </Button>
              </div>
              <div>
                <Label htmlFor="careerObjective" className="text-foreground dark:text-white">Career Objective (Optional)</Label>
                <Textarea
                  id="careerObjective"
                  rows={2}
                  value={resumeData.careerObjective || ""}
                  onChange={(e) => onChange({ ...resumeData, careerObjective: e.target.value })}
                  placeholder="What are your career goals and aspirations?"
                  className="resize-none bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
              <BookOpen className="mr-2 h-6 w-6" />
              Education
            </h2>
            <div className="space-y-4">
              {resumeData.education.map((edu, index) => (
                <Card key={index} className="bg-slate-50 dark:bg-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-slate-700 dark:text-white">Education {index + 1}</h3>
                      {resumeData.education.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`degree-${index}`} className="text-foreground dark:text-white">Degree</Label>
                        <Input
                          id={`degree-${index}`}
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, "degree", e.target.value)}
                          placeholder="Bachelor of Science in Computer Science"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`school-${index}`} className="text-foreground dark:text-white">School</Label>
                        <Input
                          id={`school-${index}`}
                          value={edu.school}
                          onChange={(e) => updateEducation(index, "school", e.target.value)}
                          placeholder="University of Technology"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`field_of_study-${index}`} className="text-foreground dark:text-white">Field of Study</Label>
                        <Input
                          id={`field_of_study-${index}`}
                          value={edu.field_of_study || ""}
                          onChange={(e) => updateEducation(index, "field_of_study", e.target.value)}
                          placeholder="Computer Science"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`graduationYear-${index}`} className="text-foreground dark:text-white">Graduation Year</Label>
                        <Input
                          id={`graduationYear-${index}`}
                          value={edu.graduationYear}
                          onChange={(e) => updateEducation(index, "graduationYear", e.target.value)}
                          placeholder="2018"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`gpa-${index}`} className="text-foreground dark:text-white">GPA (Optional)</Label>
                        <Input
                          id={`gpa-${index}`}
                          value={edu.gpa || ""}
                          onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                          placeholder="3.8"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`location-${index}`} className="text-foreground dark:text-white">Location</Label>
                        <Input
                          id={`location-${index}`}
                          value={edu.location || ""}
                          onChange={(e) => updateEducation(index, "location", e.target.value)}
                          placeholder="City, State"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`honors-${index}`} className="text-foreground dark:text-white">Honors & Awards</Label>
                        <Input
                          id={`honors-${index}`}
                          value={edu.honors || ""}
                          onChange={(e) => updateEducation(index, "honors", e.target.value)}
                          placeholder="Magna Cum Laude, Dean's List"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addEducation}
                className="w-full dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-transparent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Education
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "experience" && (
        <div className="space-y-8">
          {/* Work Experience */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
              <Briefcase className="mr-2 h-6 w-6" />
              Work Experience
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp, index) => (
                <Card key={index} className="bg-slate-50 dark:bg-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-slate-700 dark:text-white">Experience {index + 1}</h3>
                      {resumeData.experience.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor={`jobTitle-${index}`} className="text-foreground dark:text-white">Job Title</Label>
                        <Input
                          id={`jobTitle-${index}`}
                          value={exp.title}
                          onChange={(e) => updateExperience(index, "title", e.target.value)}
                          placeholder="Senior Software Engineer"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`company-${index}`} className="text-foreground dark:text-white">Company</Label>
                        <Input
                          id={`company-${index}`}
                          value={exp.company}
                          onChange={(e) => updateExperience(index, "company", e.target.value)}
                          placeholder="Tech Company Inc."
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`startDate-${index}`} className="text-foreground dark:text-white">Start Date</Label>
                        <Input
                          id={`startDate-${index}`}
                          value={exp.startDate}
                          onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                          placeholder="January 2020"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`endDate-${index}`} className="text-foreground dark:text-white">End Date</Label>
                        <Input
                          id={`endDate-${index}`}
                          value={exp.endDate}
                          onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                          placeholder="Present"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`location-${index}`} className="text-foreground dark:text-white">Location</Label>
                        <Input
                          id={`location-${index}`}
                          value={exp.location || ""}
                          onChange={(e) => updateExperience(index, "location", e.target.value)}
                          placeholder="San Francisco, CA"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`employmentType-${index}`} className="text-foreground dark:text-white">Employment Type</Label>
                        <Select
                          value={exp.employment_type || "Full-time"}
                          onValueChange={(value) => updateExperience(index, "employment_type", value)}
                        >
                          <SelectTrigger className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background dark:bg-slate-800 border-border dark:border-slate-600">
                            <SelectItem value="Full-time" className="text-foreground dark:text-white">Full-time</SelectItem>
                            <SelectItem value="Part-time" className="text-foreground dark:text-white">Part-time</SelectItem>
                            <SelectItem value="Contract" className="text-foreground dark:text-white">Contract</SelectItem>
                            <SelectItem value="Internship" className="text-foreground dark:text-white">Internship</SelectItem>
                            <SelectItem value="Freelance" className="text-foreground dark:text-white">Freelance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`description-${index}`} className="text-foreground dark:text-white">Description</Label>
                      <Textarea
                        id={`description-${index}`}
                        rows={3}
                        value={exp.description}
                        onChange={(e) => updateExperience(index, "description", e.target.value)}
                        placeholder="Describe your responsibilities and achievements..."
                        className="resize-none bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addExperience}
                className="w-full dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-transparent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Experience
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "skills" && (
        <div className="space-y-8">
          {/* Skills */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
              <Code className="mr-2 h-6 w-6" />
              Skills
            </h2>
            <Label htmlFor="skills" className="text-foreground dark:text-white">Skills (comma separated)</Label>
            <Input
              id="skills"
              value={resumeData.skills.join(", ")}
              onChange={(e) => updateSkills(e.target.value)}
              placeholder="JavaScript, React, Node.js, ..."
              className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
            />
          </div>
          {/* Project Skills */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
              <Code className="mr-2 h-6 w-6" />
              Project Skills
            </h2>
            <Label htmlFor="projectSkills" className="text-foreground dark:text-white">Project Skills (comma separated)</Label>
            <Input
              id="projectSkills"
              value={resumeData.projectSkills ? resumeData.projectSkills.join(", ") : ""}
              onChange={(e) => updateProjectSkills(e.target.value)}
              placeholder="REST APIs, GraphQL, Microservices, ..."
              className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
            />
          </div>

          {/* Languages */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Languages
            </h2>
            <div className="space-y-4">
              {(resumeData.languages || []).map((lang, index) => (
                <Card key={index} className="bg-slate-50 dark:bg-slate-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium dark:text-white">Language {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("languages", index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-foreground dark:text-white">Language</Label>
                        <Input
                          value={lang.language || ""}
                          onChange={(e) => updateArrayField("languages", index, "language", e.target.value)}
                          placeholder="English"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground dark:text-white">Proficiency</Label>
                        <Select
                          value={lang.proficiency || ""}
                          onValueChange={(value) => updateArrayField("languages", index, "proficiency", value)}
                        >
                          <SelectTrigger className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white">
                            <SelectValue placeholder="Select proficiency" />
                          </SelectTrigger>
                          <SelectContent className="bg-background dark:bg-slate-800 border-border dark:border-slate-600">
                            <SelectItem value="Native" className="text-foreground dark:text-white">Native</SelectItem>
                            <SelectItem value="Fluent" className="text-foreground dark:text-white">Fluent</SelectItem>
                            <SelectItem value="Proficient" className="text-foreground dark:text-white">Proficient</SelectItem>
                            <SelectItem value="Intermediate" className="text-foreground dark:text-white">Intermediate</SelectItem>
                            <SelectItem value="Basic" className="text-foreground dark:text-white">Basic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem("languages", { language: "", proficiency: "" })}
                className="w-full dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-transparent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Language
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "additional" && (
        <div className="space-y-8">
          {/* Projects */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
              <Code className="mr-2 h-6 w-6" />
              Projects
            </h2>
            <div className="space-y-4">
              {(resumeData.projects || []).map((project, index) => (
                <Card key={index} className="bg-slate-50 dark:bg-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium dark:text-white">Project {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("projects", index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-foreground dark:text-white">Project Title</Label>
                        <Input
                          value={project.title || ""}
                          onChange={(e) => updateArrayField("projects", index, "title", e.target.value)}
                          placeholder="E-commerce Website"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground dark:text-white">Link (Optional)</Label>
                        <Input
                          value={project.link || ""}
                          onChange={(e) => updateArrayField("projects", index, "link", e.target.value)}
                          placeholder="https://github.com/username/project"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <Label className="text-foreground dark:text-white">Description</Label>
                      <Textarea
                        rows={2}
                        value={project.description || ""}
                        onChange={(e) => updateArrayField("projects", index, "description", e.target.value)}
                        placeholder="Brief description of the project and your role..."
                        className="resize-none bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground dark:text-white">Technologies (comma-separated)</Label>
                      <Input
                        value={(project.technologies || []).join(", ")}
                        onChange={(e) => {
                          const technologies = e.target.value.split(",").map(tech => tech.trim()).filter(tech => tech);
                          updateArrayField("projects", index, "technologies", technologies);
                        }}
                        placeholder="React, Node.js, MongoDB"
                        className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem("projects", { title: "", description: "", technologies: [], link: "" })}
                className="w-full dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-transparent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
              <Award className="mr-2 h-6 w-6" />
              Certifications
            </h2>
            <div className="space-y-4">
              {(resumeData.certifications || []).map((cert, index) => (
                <Card key={index} className="bg-slate-50 dark:bg-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium dark:text-white">Certification {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("certifications", index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-foreground dark:text-white">Certification Name</Label>
                        <Input
                          value={cert.name || ""}
                          onChange={(e) => updateArrayField("certifications", index, "name", e.target.value)}
                          placeholder="AWS Certified Solutions Architect"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground dark:text-white">Issuing Organization</Label>
                        <Input
                          value={cert.issuer || ""}
                          onChange={(e) => updateArrayField("certifications", index, "issuer", e.target.value)}
                          placeholder="Amazon Web Services"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground dark:text-white">Issue Date</Label>
                        <Input
                          value={cert.date || ""}
                          onChange={(e) => updateArrayField("certifications", index, "date", e.target.value)}
                          placeholder="January 2023"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground dark:text-white">Expiry Date (Optional)</Label>
                        <Input
                          value={cert.expiry || ""}
                          onChange={(e) => updateArrayField("certifications", index, "expiry", e.target.value)}
                          placeholder="January 2026"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem("certifications", { name: "", issuer: "", date: "", expiry: "" })}
                className="w-full dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-transparent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Certification
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "others" && (
        <div className="space-y-8">
          {/* Awards */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
              <Award className="mr-2 h-6 w-6" />
              Awards
            </h2>
            <div className="space-y-4 overflow-x-auto">
              {(resumeData.awards || []).map((award, index) => (
                <Card key={index} className="bg-slate-50 dark:bg-slate-700 w-full">
                  <CardContent className="p-4 sm:p-6 w-full">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-y-2">
                      <h4 className="font-medium dark:text-white text-base sm:text-lg">Award {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("awards", index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                      <div>
                        <Label className="text-foreground dark:text-white">Title</Label>
                        <Input
                          className="w-full bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                          value={award.title || ""}
                          onChange={e => updateArrayField("awards", index, "title", e.target.value)}
                          placeholder="Award Title"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground dark:text-white">Issuer</Label>
                        <Input
                          className="w-full bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                          value={award.issuer || ""}
                          onChange={e => updateArrayField("awards", index, "issuer", e.target.value)}
                          placeholder="Awarding Organization"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground dark:text-white">Date</Label>
                        <Input
                          className="w-full bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                          value={award.date || ""}
                          onChange={e => updateArrayField("awards", index, "date", e.target.value)}
                          placeholder="2023"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-foreground dark:text-white">Description</Label>
                        <Textarea
                          className="w-full resize-none bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                          value={award.description || ""}
                          onChange={e => updateArrayField("awards", index, "description", e.target.value)}
                          placeholder="Description of the award..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem("awards", { title: "", issuer: "", date: "", description: "" })}
                className="w-full dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-transparent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Award
              </Button>
            </div>
          </div>

          {/* Volunteering */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
              <Users className="mr-2 h-6 w-6" />
              Volunteering
            </h2>
            <div className="space-y-4">
              {(resumeData.volunteerWork || []).map((vol, index) => (
                <Card key={index} className="bg-slate-50 dark:bg-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium dark:text-white">Volunteering {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("volunteerWork", index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-foreground dark:text-white">Role</Label>
                        <Input
                          value={vol.role || ""}
                          onChange={e => updateArrayField("volunteerWork", index, "role", e.target.value)}
                          placeholder="Volunteer Role"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground dark:text-white">Organization</Label>
                        <Input
                          value={vol.organization || ""}
                          onChange={e => updateArrayField("volunteerWork", index, "organization", e.target.value)}
                          placeholder="Organization Name"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground dark:text-white">Start Date</Label>
                        <Input
                          value={vol.startDate || ""}
                          onChange={e => updateArrayField("volunteerWork", index, "startDate", e.target.value)}
                          placeholder="2022"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground dark:text-white">End Date</Label>
                        <Input
                          value={vol.endDate || ""}
                          onChange={e => updateArrayField("volunteerWork", index, "endDate", e.target.value)}
                          placeholder="Present"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-foreground dark:text-white">Description</Label>
                        <Textarea
                          value={vol.description || ""}
                          onChange={e => updateArrayField("volunteerWork", index, "description", e.target.value)}
                          placeholder="Describe your volunteering experience..."
                          className="resize-none bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem("volunteerWork", { role: "", organization: "", startDate: "", endDate: "", description: "" })}
                className="w-full dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-transparent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Volunteering
              </Button>
            </div>
          </div>

          {/* Publications */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
              <BookOpen className="mr-2 h-6 w-6" />
              Publications
            </h2>
            <div className="space-y-4">
              {(resumeData.publications || []).map((pub, index) => (
                <Card key={index} className="bg-slate-50 dark:bg-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium dark:text-white">Publication {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem("publications", index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-foreground dark:text-white">Title</Label>
                        <Input
                          value={pub.title || ""}
                          onChange={e => updateArrayField("publications", index, "title", e.target.value)}
                          placeholder="Publication Title"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground dark:text-white">Publisher</Label>
                        <Input
                          value={pub.publisher || ""}
                          onChange={e => updateArrayField("publications", index, "publisher", e.target.value)}
                          placeholder="Publisher Name"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground dark:text-white">Date</Label>
                        <Input
                          value={pub.date || ""}
                          onChange={e => updateArrayField("publications", index, "date", e.target.value)}
                          placeholder="2023-01"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground dark:text-white">Link</Label>
                        <Input
                          value={pub.link || ""}
                          onChange={e => updateArrayField("publications", index, "link", e.target.value)}
                          placeholder="https://publication-link.com"
                          className="bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem("publications", { title: "", publisher: "", date: "", link: "" })}
                className="w-full dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-transparent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Publication
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}