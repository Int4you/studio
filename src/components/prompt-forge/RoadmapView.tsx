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
import { Loader2, Milestone, Route, CheckCircle2, Library as LibraryIcon, ArrowRight, ListChecks, Target, ListOrdered, Lightbulb, TrendingUp, AlertTriangle, Coins, ShoppingCart, CalendarDays, FolderSearch, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RoadmapViewProps {
  savedProjects: SavedProject[];
}

const RoadmapView = React.memo(({ savedProjects }: RoadmapViewProps) => {
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
    <section id="roadmap-generator-content" className="space-y-8">
      <Card className="shadow-xl border rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 dark:bg-muted/10">
          <CardTitle className="flex items-center gap-3 text-2xl sm:text-3xl text-primary">
            <Milestone className="h-7 w-7 sm:h-8 sm:w-8" />
            <span>MVP Roadmap Generator</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">Select a saved project to generate an AI-powered MVP roadmap.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-6">
          {savedProjects.length === 0 ? (
             <div className="text-center py-12 px-6 rounded-lg bg-card border border-dashed border-border/50">
              <FolderSearch className="mx-auto h-20 w-20 text-muted-foreground/40 mb-6" />
              <p className="text-2xl font-semibold text-muted-foreground mb-3">No Projects Found</p>
              <p className="text-md text-muted-foreground mb-8 max-w-md mx-auto">
                It looks like your library is empty. Please create and save a project first in the "App" tab to generate a roadmap.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Label className="text-md font-semibold text-foreground flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary"/>
                Choose a Project:
              </Label>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedProjects.map(proj => (
                      <Card 
                          key={proj.id} 
                          onClick={() => {setSelectedProjectForRoadmap(proj); setGeneratedRoadmap(null); setError(null);}}
                          className={cn(
                            "cursor-pointer transition-all duration-200 ease-in-out rounded-lg p-4 border shadow-sm group hover:shadow-primary/20",
                            selectedProjectForRoadmap?.id === proj.id ? 'ring-2 ring-primary shadow-lg border-primary bg-primary/5' : 'border-border/40 bg-card hover:border-primary/50'
                          )}
                      >
                          <div className="flex justify-between items-start">
                            <div className="flex-grow">
                              <h5 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{proj.appName}</h5>
                              <p className="text-xs text-muted-foreground line-clamp-1">{proj.ideaTitle}</p>
                            </div>
                            {selectedProjectForRoadmap?.id === proj.id && <CheckCircle2 className="h-6 w-6 text-primary ml-2 shrink-0" />}
                          </div>
                          
                          <div className="mt-3 pt-2 border-t border-border/20 text-xs text-muted-foreground flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                <span>Saved: {format(new Date(proj.savedAt), "PP")}</span>
                            </div>
                            <Badge variant={selectedProjectForRoadmap?.id === proj.id ? "default" : "outline"} className="text-xs">
                                {selectedProjectForRoadmap?.id === proj.id ? "Selected" : "Select"}
                            </Badge>
                          </div>
                      </Card>
                  ))}
               </div>
            </div>
          )}

          {selectedProjectForRoadmap && (
            <div className="mt-6 pt-6 border-t border-border/30">
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Roadmap for: <span className="text-primary">{selectedProjectForRoadmap.appName}</span>
              </h3>
              <Button 
                  onClick={handleGenerateRoadmap} 
                  disabled={isLoadingRoadmap}
                  size="lg"
                  className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow text-base py-3"
              >
                {isLoadingRoadmap ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Route className="mr-2 h-5 w-5" />}
                Generate MVP Roadmap
              </Button>
            </div>
          )}

          {isLoadingRoadmap && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
              <p className="text-xl font-semibold text-muted-foreground">Crafting Your Roadmap...</p>
              <p className="text-sm text-muted-foreground/80">AI is analyzing features and planning phases. This might take a moment.</p>
            </div>
          )}

          {generatedRoadmap && !isLoadingRoadmap && (
            <div className="mt-8 space-y-8">
              <Card className="shadow-lg border-primary/30 rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-background dark:from-primary/20 dark:via-primary/10 dark:to-background p-4 md:p-6">
                  <CardTitle className="text-2xl md:text-3xl text-primary flex items-center gap-3">
                     <Milestone className="h-7 w-7 md:h-8 md:w-8"/> {generatedRoadmap.roadmapTitle}
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base text-muted-foreground flex items-center gap-2 pt-1">
                    <CalendarDays className="h-4 w-4"/>
                    Overall MVP Timeline: <Badge variant="secondary" className="text-sm">{generatedRoadmap.overallMvpTimeline}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="multiple" defaultValue={['phase-0']} className="w-full">
                    {generatedRoadmap.mvpPhases.map((phase, idx) => (
                      <AccordionItem value={`phase-${idx}`} key={idx} className={cn("border-b border-border/20", idx === generatedRoadmap.mvpPhases.length -1 ? "border-b-0" : "")}>
                        <AccordionTrigger className="px-4 md:px-6 py-4 text-lg font-semibold hover:bg-muted/20 dark:hover:bg-muted/10 data-[state=open]:bg-muted/30 dark:data-[state=open]:bg-muted/15 transition-colors text-left">
                          <div className="flex items-center gap-3 w-full">
                            <Badge variant="default" className="h-8 w-8 p-0 items-center justify-center text-md rounded-full shadow-md bg-primary text-primary-foreground">{phase.phaseNumber}</Badge>
                            <span className="flex-grow">{phase.phaseTitle}</span>
                            <Badge variant="outline" className="text-xs sm:text-sm ml-auto shadow-sm whitespace-nowrap">{phase.estimatedDuration}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 md:px-6 py-4 space-y-4 bg-background border-t border-border/20">
                          <Card className="p-3 md:p-4 bg-muted/20 dark:bg-muted/10 rounded-lg border shadow-inner">
                            <h5 className="font-semibold text-md mb-1.5 flex items-center gap-2"><Target className="h-5 w-5 text-primary/90"/>Phase Goal:</h5>
                            <p className="text-sm text-muted-foreground">{phase.phaseGoal}</p>
                          </Card>
                          
                          <div className="space-y-3">
                            <h5 className="font-semibold text-md mb-2 flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary/90"/>Features in this Phase:</h5>
                            {phase.featuresInPhase.map((feat, fIdx) => (
                              <Card key={fIdx} className="p-3 bg-card border shadow-sm rounded-md">
                                <h6 className="font-medium text-base text-foreground mb-0.5">{feat.featureName}</h6>
                                <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">{feat.featureDescription}</p>
                                <p className="text-xs text-primary/90 italic border-l-2 border-primary/30 pl-2">Justification: {feat.justificationForPhase}</p>
                              </Card>
                            ))}
                          </div>

                          <div>
                            <h5 className="font-semibold text-md mb-1.5 flex items-center gap-2"><ListOrdered className="h-5 w-5 text-primary/90"/>Key Deliverables:</h5>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-3">
                              {phase.keyDeliverables.map((del, dIdx) => <li key={dIdx}>{del}</li>)}
                            </ul>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
              
              <Card className="shadow-md rounded-lg border">
                  <CardHeader className="pb-3 pt-4 px-4 md:px-6 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                      <CardTitle className="text-xl flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary"/>Key Success Metrics for MVP</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 px-4 md:px-6 pb-4">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {generatedRoadmap.keySuccessMetricsForMvp.map((metric, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-background rounded-md border border-border/30 shadow-xs">
                           <Check className="h-4 w-4 text-green-500 shrink-0"/> <span>{metric}</span>
                        </li>
                      ))}
                      </ul>
                  </CardContent>
              </Card>

              {generatedRoadmap.postMvpSuggestions && generatedRoadmap.postMvpSuggestions.length > 0 && (
                   <Card className="shadow-md rounded-lg border">
                      <CardHeader className="pb-3 pt-4 px-4 md:px-6 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                          <CardTitle className="text-xl flex items-center gap-2"><Lightbulb className="h-6 w-6 text-primary"/>Post-MVP Suggestions</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 px-4 md:px-6 pb-4">
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-3">
                          {generatedRoadmap.postMvpSuggestions.map((suggestion, idx) => <li key={idx}>{suggestion}</li>)}
                          </ul>
                      </CardContent>
                  </Card>
              )}
            </div>
          )}
          {error && (
            <Card role="alert" className="mt-6 p-4 bg-destructive/10 border-destructive text-destructive rounded-md shadow-lg">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-lg"><AlertTriangle className="h-5 w-5"/>Error Generating Roadmap</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm">{error}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </section>
  );
});
RoadmapView.displayName = 'RoadmapView';
export default RoadmapView;
