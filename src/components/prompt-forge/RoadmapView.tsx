
"use client";

import React, { useState } from 'react';
import type { SavedProject } from '@/lib/libraryModels';
import type { GenerateRoadmapInput, GenerateRoadmapOutput } from '@/ai/flows/generate-roadmap-flow';
import { generateRoadmap } from '@/ai/flows/generate-roadmap-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Loader2, Milestone, Route, CheckCircle2, Library as LibraryIcon, ArrowRight, ListChecks, Target, ListOrdered, Lightbulb, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface RoadmapViewProps {
  savedProjects: SavedProject[];
}

export default function RoadmapView({ savedProjects }: RoadmapViewProps) {
  const [selectedProjectForRoadmap, setSelectedProjectForRoadmap] = useState<SavedProject | null>(null);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<GenerateRoadmapOutput | null>(null);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateRoadmap = async () => {
    if (!selectedProjectForRoadmap) {
      toast({ title: "No Project Selected", description: "Please select a saved project to generate a roadmap.", variant: "destructive" });
      return;
    }
    setIsLoadingRoadmap(true);
    setGeneratedRoadmap(null);
    setError(null);

    try {
      const featuresForRoadmap = selectedProjectForRoadmap.prioritizedFeatures
        ? selectedProjectForRoadmap.prioritizedFeatures.map(pf => ({
            feature: pf.feature,
            description: pf.description,
            priorityScore: pf.priorityScore,
            estimatedImpact: pf.estimatedImpact,
            estimatedEffort: pf.estimatedEffort,
            reasoning: pf.reasoning,
          }))
        : selectedProjectForRoadmap.coreFeatures.map(cf => ({
            feature: cf.feature,
            description: cf.description,
          }));

      const input: GenerateRoadmapInput = {
        appName: selectedProjectForRoadmap.appName,
        appDescription: selectedProjectForRoadmap.ideaDescription,
        features: featuresForRoadmap,
        targetAudience: selectedProjectForRoadmap.originalPrompt,
        marketAnalysisSummary: selectedProjectForRoadmap.marketAnalysis?.marketOverview || selectedProjectForRoadmap.marketAnalysis?.competitiveLandscapeSummary,
      };

      const result = await generateRoadmap(input);
      setGeneratedRoadmap(result);
      toast({ title: "Roadmap Generated!", description: `MVP roadmap for ${selectedProjectForRoadmap.appName} is ready.` });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to generate roadmap: ${errorMessage}`);
      toast({ title: "Error Generating Roadmap", description: `An error occurred: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  return (
    <section id="roadmap-generator-content" className="space-y-6">
      <Card className="shadow-xl border rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 dark:bg-muted/10">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Milestone className="text-primary h-6 w-6" />
            <span>MVP Roadmap Generator</span>
          </CardTitle>
          <CardDescription>Select a saved project to generate an AI-powered MVP roadmap.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {savedProjects.length === 0 ? (
             <div className="text-center py-10">
              <LibraryIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-xl font-semibold text-muted-foreground mb-2">No projects in library.</p>
              <p className="text-sm text-muted-foreground mb-6">Please save a project first to generate a roadmap.</p>
               {/* TODO: Add a button to navigate to App View or Library View if needed */}
            </div>
          ) : (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Select Project for Roadmap:</Label>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedProjects.map(proj => (
                      <Card 
                          key={proj.id} 
                          onClick={() => {setSelectedProjectForRoadmap(proj); setGeneratedRoadmap(null);}}
                          className={`cursor-pointer transition-all duration-200 ease-in-out hover:shadow-lg hover:ring-1 hover:ring-primary/50 rounded-lg p-4 ${selectedProjectForRoadmap?.id === proj.id ? 'ring-2 ring-primary shadow-lg border-primary' : 'border-border/50 shadow-sm'}`}
                      >
                          <div className="flex justify-between items-center">
                              <h5 className="font-semibold text-md line-clamp-1">{proj.appName}</h5>
                              {selectedProjectForRoadmap?.id === proj.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{proj.ideaTitle}</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">Saved: {format(new Date(proj.savedAt), "PP")}</p>
                      </Card>
                  ))}
               </div>
            </div>
          )}

          {selectedProjectForRoadmap && (
            <div className="mt-6">
              <Button 
                  onClick={handleGenerateRoadmap} 
                  disabled={isLoadingRoadmap}
                  className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow"
              >
                {isLoadingRoadmap ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Route className="mr-2 h-4 w-4" />}
                Generate MVP Roadmap for "{selectedProjectForRoadmap.appName}"
              </Button>
            </div>
          )}

          {isLoadingRoadmap && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-lg text-muted-foreground">Generating roadmap...</p>
            </div>
          )}

          {generatedRoadmap && (
            <div className="mt-8 space-y-8">
              <Card className="shadow-md border-primary/30">
                <CardHeader className="bg-primary/5 dark:bg-primary/10">
                  <CardTitle className="text-2xl text-primary flex items-center gap-2">
                     <Milestone className="h-6 w-6"/> {generatedRoadmap.roadmapTitle}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">Overall MVP Timeline: <Badge variant="secondary">{generatedRoadmap.overallMvpTimeline}</Badge></CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="multiple" defaultValue={['phase-0']} className="w-full">
                    {generatedRoadmap.mvpPhases.map((phase, idx) => (
                      <AccordionItem value={`phase-${idx}`} key={idx} className={idx === generatedRoadmap.mvpPhases.length -1 ? "border-b-0" : ""}>
                        <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:bg-muted/20 dark:hover:bg-muted/10 data-[state=open]:bg-muted/30 dark:data-[state=open]:bg-muted/15 transition-colors">
                          <div className="flex items-center gap-3">
                            <Badge variant="default" className="h-7 w-7 p-0 items-center justify-center text-sm rounded-full shadow-sm">{phase.phaseNumber}</Badge>
                            <span>{phase.phaseTitle}</span>
                            <Badge variant="outline" className="text-xs ml-auto shadow-sm">{phase.estimatedDuration}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 py-4 space-y-4 bg-background border-t">
                          <div className="p-3 bg-muted/20 dark:bg-muted/10 rounded-md border shadow-sm">
                            <h5 className="font-semibold text-md mb-1 flex items-center gap-2"><Target className="h-4 w-4 text-primary/80"/>Phase Goal:</h5>
                            <p className="text-sm text-muted-foreground">{phase.phaseGoal}</p>
                          </div>
                          
                          <div className="space-y-3">
                            <h5 className="font-semibold text-md mb-1 flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary/80"/>Features in this Phase:</h5>
                            {phase.featuresInPhase.map((feat, fIdx) => (
                              <Card key={fIdx} className="p-3 bg-background border shadow-xs">
                                <h6 className="font-medium text-sm text-foreground">{feat.featureName}</h6>
                                <p className="text-xs text-muted-foreground mt-0.5 mb-1">{feat.featureDescription}</p>
                                <p className="text-xs text-primary/90 italic">Justification: {feat.justificationForPhase}</p>
                              </Card>
                            ))}
                          </div>

                          <div>
                            <h5 className="font-semibold text-md mb-1.5 flex items-center gap-2"><ListOrdered className="h-4 w-4 text-primary/80"/>Key Deliverables:</h5>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
                              {phase.keyDeliverables.map((del, dIdx) => <li key={dIdx}>{del}</li>)}
                            </ul>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                  <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                      <CardTitle className="text-xl flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>Key Success Metrics for MVP</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2">
                      {generatedRoadmap.keySuccessMetricsForMvp.map((metric, idx) => <li key={idx}>{metric}</li>)}
                      </ul>
                  </CardContent>
              </Card>

              {generatedRoadmap.postMvpSuggestions && generatedRoadmap.postMvpSuggestions.length > 0 && (
                   <Card className="shadow-sm">
                      <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                          <CardTitle className="text-xl flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary"/>Post-MVP Suggestions</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2">
                          {generatedRoadmap.postMvpSuggestions.map((suggestion, idx) => <li key={idx}>{suggestion}</li>)}
                          </ul>
                      </CardContent>
                  </Card>
              )}
            </div>
          )}
          {error && (
            <Card role="alert" className="mt-4 p-4 bg-destructive/10 border-destructive text-destructive rounded-md">
              <CardContent className="p-0">
                <p>{error}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

