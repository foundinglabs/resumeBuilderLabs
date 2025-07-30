import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResumeTemplatesProps {
  selectedTemplate: string;
  onTemplateSelect: (template: string) => void;
}

export function ResumeTemplates({ selectedTemplate, onTemplateSelect }: ResumeTemplatesProps) {
  const templates = [
    {
      id: "onyx",
      name: "Onyx",
      description: "Formal & Executive – minimalist, structured, black/gray color scheme for senior positions.",
      color: "slate",
      category: "Executive",
    },
    {
      id: "ditto",
      name: "Ditto",
      description: "Universal – clean, simple, easy to scan with excellent ATS compatibility.",
      color: "blue",
      category: "Universal",
    },
    {
      id: "kakuna",
      name: "Kakuna",
      description: "Tech-Focused – supports projects, skills, certifications in modular layout.",
      color: "green",
      category: "Technology",
    },
    {
      id: "chikorita",
      name: "Chikorita",
      description: "Academic – supports publications, teaching, and research for academia.",
      color: "emerald",
      category: "Academic",
    },
    {
      id: "azurill",
      name: "Azurill",
      description: "Entry-Level – simple, readable, education-first layout for new graduates.",
      color: "sky",
      category: "Entry-Level",
    },
    {
      id: "pikachu",
      name: "Pikachu",
      description: "Creative – modern, visually appealing, suitable for designers/marketers.",
      color: "yellow",
      category: "Creative",
    },
    {
      id: "bronzor",
      name: "Bronzor",
      description: "Professional – balanced layout with clean typography for corporate environments.",
      color: "amber",
      category: "Professional",
    },
    {
      id: "gengar",
      name: "Gengar",
      description: "Modern – contemporary design with subtle accents for tech professionals.",
      color: "purple",
      category: "Modern",
    },
    {
      id: "glalie",
      name: "Glalie",
      description: "Elegant – sophisticated layout with refined typography for executive roles.",
      color: "indigo",
      category: "Executive",
    },
    {
      id: "leafish",
      name: "Leafish",
      description: "Nature-Inspired – organic design elements perfect for environmental sectors.",
      color: "green",
      category: "Creative",
    },
    {
      id: "nosepass",
      name: "Nosepass",
      description: "Structured – organized layout ideal for engineering and technical roles.",
      color: "gray",
      category: "Technology",
    },
    {
      id: "rhyhorn",
      name: "Rhyhorn",
      description: "Bold – strong visual hierarchy perfect for leadership and management positions.",
      color: "orange",
      category: "Executive",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card
          key={template.id}
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedTemplate === template.id
              ? "ring-2 ring-blue-500 shadow-lg"
              : "hover:shadow-md"
          }`}
          onClick={() => onTemplateSelect(template.id)}
        >
          <CardContent className="p-6">
            <div className={`aspect-[3/4] bg-gradient-to-br from-${template.color}-600 to-${template.color}-700 p-4 rounded-lg mb-4 relative`}>
              {/* Category Badge */}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-slate-700">
                {template.category}
              </div>
              <div className="bg-white rounded p-4 h-full flex flex-col">
                <div className="flex items-center mb-2">
                  <div className={`w-6 h-6 bg-${template.color}-600 rounded-full mr-2`}></div>
                  <div>
                    <div className="w-12 h-1.5 bg-slate-800 rounded mb-1"></div>
                    <div className="w-8 h-1 bg-slate-500 rounded"></div>
                  </div>
                </div>
                <div className="space-y-1 mb-2">
                  <div className="w-full h-1 bg-slate-200 rounded"></div>
                  <div className="w-3/4 h-1 bg-slate-200 rounded"></div>
                </div>
                <div className="space-y-1">
                  <div className={`w-1/2 h-1 bg-${template.color}-600 rounded`}></div>
                  <div className="w-full h-0.5 bg-slate-200 rounded"></div>
                  <div className="w-5/6 h-0.5 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-800">{template.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${template.color}-100 text-${template.color}-700`}>
                {template.category}
              </span>
            </div>
            <p className="text-slate-600 text-sm mb-4">{template.description}</p>
            <Button
              className={`w-full ${
                selectedTemplate === template.id
                  ? "bg-blue-600 hover:bg-blue-700"
                  : `bg-${template.color}-600 hover:bg-${template.color}-700`
              }`}
            >
              {selectedTemplate === template.id ? "Selected" : "Use This Template"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}