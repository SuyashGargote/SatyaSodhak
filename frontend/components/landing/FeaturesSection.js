import { Shield, BarChart2, Users } from 'lucide-react';

const features = [
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: 'Reliable Verification',
    description: 'Get accurate fact-checking results using advanced AI and trusted sources.'
  },
  {
    icon: <BarChart2 className="h-8 w-8 text-primary" />,
    title: 'Detailed Analysis',
    description: 'Understand the reasoning behind each verification with comprehensive breakdowns.'
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Community Trusted',
    description: 'Join a community committed to truth and accuracy in information.'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose SatyaShodhak?
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-card/50 hover:bg-card transition-all duration-300 rounded-xl p-6 shadow-sm hover:shadow-md border border-border/50"
            >
              <div className="flex flex-col h-full">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
