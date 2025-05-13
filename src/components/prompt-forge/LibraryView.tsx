
"use client";

import React from 'react';
import type { SavedProject } from '@/lib/libraryModels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Library as LibraryIcon, FolderOpen, Trash2, PlusCircle, BarChart3, TrendingUp, Tag, Terminal, CalendarDays, FileText, Users, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface LibraryViewProps {
  savedProjects: SavedProject[];
  onLoadProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onStartNewProject: () => void;
}

// Helper to get an icon based on project content
const getProjectStageIcon = (project: SavedProject): React.ElementType => {
  if (project.textToAppPrompt) return Terminal;
  if (project.pricingStrategy) return Tag;
  if (project.marketAnalysis) return BarChart3;
  if (project.prioritizedFeatures && project.prioritizedFeatures.length > 0) return TrendingUp;
  if (project.coreFeatures && project.coreFeatures.length > 0) return FileText;
  if (project.ideaTitle) return Brain;
  return LibraryIcon;
};


export default function LibraryView({ savedProjects, onLoadProject, onDeleteProject, onStartNewProject }: LibraryViewProps) {
  return (
    <section id="library-view-content" className="space-y-6">
      <Card className="shadow-xl border rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 dark:bg-muted/10">
          <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl">
            <LibraryIcon className="text-primary h-7 w-7 sm:h-8 sm:w-8" />
            <span>My Project Library</span>
          </CardTitle>
          <CardDescription>View and manage your saved application projects. ({savedProjects.length} project(s) found)</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {savedProjects.length === 0 ? (
            <div className="text-center py-12 px-6">
              <LibraryIcon className="mx-auto h-20 w-20 text-muted-foreground/40 mb-6" />
              <p className="text-2xl font-semibold text-muted-foreground mb-3">Your Library is Currently Empty</p>
              <p className="text-md text-muted-foreground mb-8 max-w-md mx-auto">Start creating amazing app concepts in the "App" tab, and they'll appear here once saved.</p>
              <Button onClick={onStartNewProject} variant="default" size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                  <PlusCircle className="mr-2 h-5 w-5"/> Create New Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {savedProjects.map((project) => {
                const StageIcon = getProjectStageIcon(project);
                return (
                  <Card 
                    key={project.id} 
                    className={cn(
                        "flex flex-col border rounded-xl shadow-lg hover:shadow-primary/15 transition-all duration-300 overflow-hidden bg-card group",
                        "transform hover:-translate-y-0.5" 
                    )}
                  >
                    <CardHeader className="p-4 pb-2 border-b bg-muted/20 dark:bg-muted/10">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 shadow-sm">
                                    <StageIcon className="h-5 w-5 text-primary" />
                                </div>
                                <CardTitle 
                                    className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors cursor-pointer"
                                    onClick={() => onLoadProject(project.id)}
                                >
                                    {project.appName || "Untitled Project"}
                                </CardTitle>
                            </div>
                            <Badge variant="secondary" className="text-xs shadow-sm whitespace-nowrap h-fit">
                                <CalendarDays className="h-3 w-3 mr-1.5" />
                                {format(new Date(project.savedAt), "MMM d, yyyy")}
                            </Badge>
                        </div>
                        <CardDescription className="text-xs text-muted-foreground line-clamp-2 pt-1.5 min-h-[32px]">
                            {project.ideaDescription || project.ideaTitle || "No description"}
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-4 flex-grow space-y-3">
                        <div className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/80">Core Idea: </span>{project.ideaTitle}
                        </div>
                        {project.originalPrompt && (
                             <div className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/80">Original Prompt Focus: </span>
                                <span className="italic line-clamp-1">{project.originalPrompt}</span>
                             </div>
                        )}
                        <div className="flex flex-wrap gap-1.5 items-center pt-1">
                            {project.coreFeatures && project.coreFeatures.length > 0 && (
                              <Tooltip>
                                <TooltipTrigger asChild><Badge variant="outline" size="sm" className="cursor-default"><FileText className="h-3 w-3 mr-1" />{project.coreFeatures.length} Features</Badge></TooltipTrigger>
                                <TooltipContent><p>{project.coreFeatures.length} core feature(s) defined.</p></TooltipContent>
                              </Tooltip>
                            )}
                            {project.prioritizedFeatures && project.prioritizedFeatures.length > 0 && (
                              <Tooltip>
                                <TooltipTrigger asChild><Badge variant="outline" size="sm" className="cursor-default border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-400"><TrendingUp className="h-3 w-3 mr-1" />Prioritized</Badge></TooltipTrigger>
                                <TooltipContent><p>Features have been prioritized.</p></TooltipContent>
                              </Tooltip>
                            )}
                            {project.marketAnalysis && (
                              <Tooltip>
                                <TooltipTrigger asChild><Badge variant="outline" size="sm" className="cursor-default border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400"><BarChart3 className="h-3 w-3 mr-1" />Market</Badge></TooltipTrigger>
                                <TooltipContent><p>Market analysis available.</p></TooltipContent>
                              </Tooltip>
                            )}
                            {project.pricingStrategy && ( 
                               <Tooltip>
                                <TooltipTrigger asChild><Badge variant="outline" size="sm" className="cursor-default border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400"><Tag className="h-3 w-3 mr-1" />Pricing</Badge></TooltipTrigger>
                                <TooltipContent><p>Pricing strategy available.</p></TooltipContent>
                              </Tooltip>
                            )}
                             {project.textToAppPrompt && (
                              <Tooltip>
                                <TooltipTrigger asChild><Badge variant="outline" size="sm" className="cursor-default border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"><Terminal className="h-3 w-3 mr-1" />Dev Prompt</Badge></TooltipTrigger>
                                <TooltipContent><p>AI Developer prompt available.</p></TooltipContent>
                              </Tooltip>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="gap-3 p-3 border-t bg-muted/20 dark:bg-muted/10">
                      <Button variant="default" size="sm" onClick={() => onLoadProject(project.id)} className="flex-1 rounded-md text-xs shadow-sm hover:shadow-md transition-shadow h-8">
                        <FolderOpen className="mr-1.5 h-3.5 w-3.5" /> View/Edit
                      </Button>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => onDeleteProject(project.id)} className="rounded-md text-xs shadow-sm hover:shadow text-destructive hover:border-destructive/70 hover:bg-destructive/10 h-8 w-8">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete {project.appName}</span>
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top"><p>Delete Project</p></TooltipContent>
                      </Tooltip>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

