
"use client";

import React from 'react';
import type { SavedProject } from '@/lib/libraryModels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Library as LibraryIcon, FolderOpen, Trash2, PlusCircle, Cpu, BarChart3, TrendingUp, Tag, Terminal } from 'lucide-react';
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
          <CardTitle className="flex items-center gap-2 text-2xl">
            <LibraryIcon className="text-primary h-6 w-6" />
            <span>My Project Library</span>
          </CardTitle>
          <CardDescription>View and manage your saved application projects. ({savedProjects.length} project(s))</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {savedProjects.length === 0 ? (
            <div className="text-center py-10">
              <LibraryIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-xl font-semibold text-muted-foreground mb-2">Your library is empty.</p>
              <p className="text-sm text-muted-foreground mb-6">Start a new project in the "App" tab to save your work here.</p>
              <Button onClick={onStartNewProject} variant="default">
                  <PlusCircle className="mr-2 h-4 w-4"/> Create New Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProjects.map((project) => (
                <Card key={project.id} className="flex flex-col border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <CardHeader className="pb-3 space-y-1">
                    <CardTitle className="text-xl line-clamp-1">{project.appName}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 h-8">
                      {project.ideaTitle}
                    </CardDescription>
                     <p className="text-[10px] text-muted-foreground/70 pt-1">Saved: {format(new Date(project.savedAt), "PPp")}</p>
                  </CardHeader>
                  <CardContent className="py-3 px-6 flex-grow space-y-3">
                      <div className="relative aspect-[16/10] w-full rounded-md overflow-hidden border shadow-inner bg-muted/20 flex items-center justify-center">
                           <Cpu className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                      <div className="flex flex-wrap gap-1.5 items-center">
                          {project.marketAnalysis && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" size="sm" className="cursor-default">
                                  <BarChart3 className="h-3 w-3 mr-1" /> Market
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent><p>Market analysis available.</p></TooltipContent>
                            </Tooltip>
                          )}
                          {project.prioritizedFeatures && project.prioritizedFeatures.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="secondary" size="sm" className="cursor-default">
                                  <TrendingUp className="h-3 w-3 mr-1" /> Prioritized
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent><p>Features are prioritized.</p></TooltipContent>
                            </Tooltip>
                          )}
                          {project.pricingStrategy && ( 
                             <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" size="sm" className="cursor-default bg-green-500/10 text-green-700 border-green-500/30 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/40">
                                  <Tag className="h-3 w-3 mr-1" /> Pricing
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent><p>Pricing strategy available.</p></TooltipContent>
                            </Tooltip>
                          )}
                           {project.textToAppPrompt && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" size="sm" className="cursor-default bg-primary/10 text-primary border-primary/30">
                                  <Terminal className="h-3 w-3 mr-1" /> Dev Prompt
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent><p>AI Developer prompt available.</p></TooltipContent>
                            </Tooltip>
                          )}
                      </div>
                  </CardContent>
                  <CardFooter className="gap-2 pt-3 p-4 border-t bg-muted/10 dark:bg-muted/5 rounded-b-lg">
                    <Button variant="default" size="sm" onClick={() => onLoadProject(project.id)} className="flex-1 rounded-md text-xs shadow-sm hover:shadow">
                      <FolderOpen className="mr-1.5 h-3.5 w-3.5" /> Load
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onDeleteProject(project.id)} className="rounded-md text-xs shadow-sm hover:shadow text-destructive hover:border-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                       <span className="sr-only">Delete Project</span>
                    </Button>
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
