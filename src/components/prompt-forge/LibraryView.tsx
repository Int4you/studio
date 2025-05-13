
"use client";

import React from 'react';
import type { SavedProject } from '@/lib/libraryModels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Library as LibraryIcon, FolderOpen, Trash2, PlusCircle, Cpu, BarChart3, TrendingUp, Tag, Terminal, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

interface LibraryViewProps {
  savedProjects: SavedProject[];
  onLoadProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onStartNewProject: () => void;
}

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedProjects.map((project) => (
                <Card key={project.id} className="flex flex-col border rounded-xl shadow-lg hover:shadow-primary/10 transition-all duration-300 overflow-hidden bg-card">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted/40 dark:bg-muted/20 flex items-center justify-center border-b">
                      <Cpu className="h-16 w-16 text-primary/30" />
                       <Badge variant="secondary" className="absolute top-2 right-2 text-xs shadow-sm">
                          <CalendarDays className="h-3 w-3 mr-1.5" />
                          {format(new Date(project.savedAt), "MMM d, yyyy")}
                       </Badge>
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg font-semibold line-clamp-2 leading-tight hover:text-primary transition-colors">
                      <button onClick={() => onLoadProject(project.id)} className="text-left w-full focus:outline-none">
                        {project.appName || "Untitled Project"}
                      </button>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 h-8">
                      {project.ideaTitle}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-1 flex-grow space-y-3">
                      <div className="flex flex-wrap gap-1.5 items-center">
                          {project.proposal && project.coreFeatures.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild><Badge variant="outline" size="sm" className="cursor-default"><Cpu className="h-3 w-3 mr-1" />Proposal</Badge></TooltipTrigger>
                              <TooltipContent><p>Base proposal exists.</p></TooltipContent>
                            </Tooltip>
                          )}
                          {project.prioritizedFeatures && project.prioritizedFeatures.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild><Badge variant="secondary" size="sm" className="cursor-default"><TrendingUp className="h-3 w-3 mr-1" />Prioritized</Badge></TooltipTrigger>
                              <TooltipContent><p>Features are prioritized.</p></TooltipContent>
                            </Tooltip>
                          )}
                          {project.marketAnalysis && (
                            <Tooltip>
                              <TooltipTrigger asChild><Badge variant="outline" size="sm" className="cursor-default bg-blue-500/10 text-blue-700 border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/40"><BarChart3 className="h-3 w-3 mr-1" />Market</Badge></TooltipTrigger>
                              <TooltipContent><p>Market analysis available.</p></TooltipContent>
                            </Tooltip>
                          )}
                          {project.pricingStrategy && ( 
                             <Tooltip>
                              <TooltipTrigger asChild><Badge variant="outline" size="sm" className="cursor-default bg-green-500/10 text-green-700 border-green-500/30 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/40"><Tag className="h-3 w-3 mr-1" />Pricing</Badge></TooltipTrigger>
                              <TooltipContent><p>Pricing strategy available.</p></TooltipContent>
                            </Tooltip>
                          )}
                           {project.textToAppPrompt && (
                            <Tooltip>
                              <TooltipTrigger asChild><Badge variant="outline" size="sm" className="cursor-default bg-purple-500/10 text-purple-700 border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/40"><Terminal className="h-3 w-3 mr-1" />Dev Prompt</Badge></TooltipTrigger>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

