"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useParams, useNavigate } from "react-router-dom";

import { apiRequest } from "@/lib/apiRequest";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const templates = [
  { name: "Modern", value: "modern" },
  { name: "Elegant", value: "elegant" },
  { name: "Professional", value: "professional" },
  { name: "Creative", value: "creative" },
];

export default function ResumeBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [resumeData, setResumeData] = useState({
    name: "",
    email: "",
    phone: "",
    summary: "",
    template: "modern",
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await apiRequest("GET", `/api/resumes/${id}`);
        setResumeData(response);
      } catch (error) {
        toast.error("Failed to fetch resume data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchResume();
  }, [id]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResumeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (value: string) => {
    const selectedTemplate = templates.find((template) => template.value === value);
    setResumeData((prev) => ({ ...prev, template: value }));
    toast.success("Template changed", {
      description: `${selectedTemplate?.name} template loaded successfully!`,
    });
  };

  const handleSave = async () => {
    try {
      await apiRequest("PUT", `/api/resumes/${id}`, resumeData);
      toast.success("Resume saved successfully.");
    } catch (error) {
      toast.error("Failed to save resume.");
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Resume Builder</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
            <div className="md:col-span-4 space-y-4">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <Label>Name</Label>
                    <Input name="name" value={resumeData.name} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input name="email" value={resumeData.email} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input name="phone" value={resumeData.phone} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>Summary</Label>
                    <Input name="summary" value={resumeData.summary} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>Template</Label>
                    <Select value={resumeData.template} onValueChange={handleTemplateChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.value} value={template.value}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    onClick={handleSave}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Save Resume
                  </button>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-6">
              <Card className="h-full">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold">Name:</span> {resumeData.name || "Your Name"}
                    </div>
                    <div>
                      <span className="font-semibold">Email:</span> {resumeData.email || "your@email.com"}
                    </div>
                    <div>
                      <span className="font-semibold">Phone:</span> {resumeData.phone || "123-456-7890"}
                    </div>
                    <div>
                      <span className="font-semibold">Summary:</span> {resumeData.summary || "Your summary here."}
                    </div>
                    <div>
                      <span className="font-semibold">Template:</span> {resumeData.template || "Not selected"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
