import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Keyboard, 
  Lightbulb, 
  CheckCircle, 
  Users, 
  FileText, 
  Palette, 
  Eye,
  Zap,
  Target
} from 'lucide-react';

interface HelpModalProps {
  children: React.ReactNode;
}

export function HelpModal({ children }: HelpModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Resume Builder Help
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="keyboard">Shortcuts</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
            <TabsTrigger value="troubleshooting">Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="getting-started" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Start Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Setup</h4>
                        <p className="text-sm text-gray-600">
                          Start by entering your basic information and selecting your professional field.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Content</h4>
                        <p className="text-sm text-gray-600">
                          Fill in your experience, education, and skills. Use our AI suggestions for better content.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Design</h4>
                        <p className="text-sm text-gray-600">
                          Choose from 18+ professional templates that match your industry.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold text-sm">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Review & Download</h4>
                        <p className="text-sm text-gray-600">
                          Preview your resume and download as PDF when ready.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium mb-1">Live Preview</h4>
                    <p className="text-sm text-gray-600">See changes in real-time</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium mb-1">Auto-save</h4>
                    <p className="text-sm text-gray-600">Never lose your progress</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-medium mb-1">ATS-Friendly</h4>
                    <p className="text-sm text-gray-600">Optimized for job portals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="keyboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Keyboard Shortcuts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Save Resume</span>
                    <Badge variant="outline">Ctrl + S</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Download PDF</span>
                    <Badge variant="outline">Ctrl + D</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Next Tab</span>
                    <Badge variant="outline">Ctrl + →</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Previous Tab</span>
                    <Badge variant="outline">Ctrl + ←</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Toggle Preview (Mobile)</span>
                    <Badge variant="outline">Ctrl + P</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Pro Tips for Better Resumes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Personal Information
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Use a professional email address (avoid nicknames)</li>
                    <li>• Include city and state, but skip full street address</li>
                    <li>• Add LinkedIn profile for networking opportunities</li>
                    <li>• Ensure phone number is current and professional voicemail</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Experience Section
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Start bullet points with strong action verbs</li>
                    <li>• Include quantifiable achievements (numbers, percentages)</li>
                    <li>• Focus on results and impact, not just duties</li>
                    <li>• Use present tense for current job, past tense for others</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Template Selection
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Choose templates that match your industry</li>
                    <li>• Conservative fields prefer traditional layouts</li>
                    <li>• Creative fields can use more colorful designs</li>
                    <li>• Ensure template is ATS-friendly for online applications</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="troubleshooting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Common Issues & Solutions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Resume not saving?</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Check your browser's local storage permissions and ensure you have enough space.
                  </p>
                  <Button variant="outline" size="sm">Clear Browser Cache</Button>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Template not loading?</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Try refreshing the page or switching to a different template temporarily.
                  </p>
                  <Button variant="outline" size="sm">Refresh Page</Button>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">PDF download issues?</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Ensure pop-ups are enabled for this site and try a different browser if issues persist.
                  </p>
                  <Button variant="outline" size="sm">Check Pop-up Settings</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Need More Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  If you're still experiencing issues, our support team is here to help.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    📧 Email Support
                  </Button>
                  <Button variant="outline" size="sm">
                    💬 Live Chat
                  </Button>
                  <Button variant="outline" size="sm">
                    📚 Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export function QuickTips({ section }: { section: string }) {
  const tips = {
    personal: [
      "Use a professional email address",
      "Include your city and state",
      "Add your LinkedIn profile"
    ],
    experience: [
      "Start with action verbs",
      "Include quantifiable results",
      "Focus on achievements"
    ],
    skills: [
      "List relevant skills only",
      "Include both technical and soft skills", 
      "Match job requirements"
    ],
    education: [
      "List highest degree first",
      "Include GPA if above 3.5",
      "Add relevant coursework"
    ]
  };

  const sectionTips = tips[section as keyof typeof tips] || [];

  if (sectionTips.length === 0) return null;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Quick Tips
        </h4>
        <ul className="space-y-1">
          {sectionTips.map((tip, index) => (
            <li key={index} className="text-sm text-blue-700">
              • {tip}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}