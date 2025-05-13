
"use client";

import React from 'react';
import type { Idea } from '@/ai/flows/generate-application-ideas';
import type { ProposalOutput } from '@/ai/flows/generate-detailed-proposal';
import type { AnalyzeMarketOutput } from '@/ai/flows/analyze-market-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Briefcase, BarChartHorizontalBig, Network, ShieldCheck, Users, ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, DollarSign, Target, Zap, Info, BadgeHelp, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import type { AppStepId } from '../AppView';

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

interface MarketAnalysisStepProps {
  proposal: ProposalOutput | null;
  selectedIdea: Idea | null;
  marketAnalysis: AnalyzeMarketOutput | null;
  isLoadingMarketAnalysis: boolean;
  onGenerateMarketAnalysis: () => Promise<void>;
  onNavigateToStep: (stepId: AppStepId) => void;
}

const PrerequisiteMessage = ({ message, onAction, buttonText }: { message: string, onAction: () => void, buttonText: string }) => (
    <Card className="border-dashed border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 p-4 my-4">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-amber-700 dark:text-amber-400 text-base flex items-center gap-2">
          <BadgeHelp className="h-5 w-5" /> Action Required
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-2">
        <p className="text-sm text-amber-600 dark:text-amber-500">{message}</p>
        <Button 
            variant="outline" 
            size="sm" 
            onClick={onAction}
            className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-800/50"
        >
            {buttonText} <ArrowRight className="ml-1.5 h-3.5 w-3.5"/>
        </Button>
      </CardContent>
    </Card>
);

const SegmentedDisplay = ({ title, value, segments, segmentsLowToHigh = true, icon: Icon }: { title: string, value: string | undefined, segments: string[], segmentsLowToHigh?: boolean, icon?: React.ElementType }) => {
  if (!value) return null;
  const orderedSegments = segmentsLowToHigh ? segments : [...segments].reverse();
  
  return (
    <div className="mb-3 p-3 border border-border/30 rounded-md bg-muted/20 dark:bg-muted/10 shadow-sm">
      <div className="flex items-center text-sm font-medium mb-1.5 text-foreground/90">
        {Icon && <Icon className="h-4 w-4 mr-2 text-primary/80" />}
        {title}:
        <Badge variant="outline" className="ml-2 text-xs">{value}</Badge>
      </div>
      <div className="flex gap-1 mt-1">
        {orderedSegments.map(segment => (
          <div
            key={segment}
            className={cn(
              "flex-1 py-1.5 px-1 text-xs rounded text-center transition-all duration-300 ease-in-out border",
              value.toLowerCase() === segment.toLowerCase()
                ? "bg-primary text-primary-foreground border-primary/50 shadow-md scale-105"
                : "bg-muted/50 text-muted-foreground border-transparent opacity-70"
            )}
          >
            {segment}
          </div>
        ))}
      </div>
    </div>
  );
};


const getRevenuePotentialBadgeVariant = (level?: "Low" | "Medium" | "High" | "Very High" | "Uncertain"): "default" | "secondary" | "outline" | "destructive" => {
    switch (level) {
      case "Very High": return "default"; 
      case "High": return "default";
      case "Medium": return "secondary";
      case "Low": return "outline";
      case "Uncertain": return "destructive";
      default: return "outline";
    }
};

const getMarketAttributeBadgeVariant = (level?: "Low" | "Medium" | "High" | "Slow" | "Moderate" | "Rapid" | string ): "default" | "secondary" | "outline" => {
    switch (level?.toLowerCase()) {
    case "high": case "rapid": case "large": case "growing": case "mature": return "default";
    case "medium": case "moderate": case "emerging": return "secondary";
    case "low": case "slow": case "niche": case "saturated": return "outline";
    default: return "outline";
    }
};

const getTrendImpactBadgeVariant = (impact?: "Significant Positive" | "Moderate Positive" | "Neutral" | "Moderate Negative" | "Significant Negative"): "default" | "secondary" | "outline" | "destructive" => {
    switch(impact){
        case "Significant Positive": return "default";
        case "Moderate Positive": return "secondary";
        case "Neutral": return "outline";
        case "Moderate Negative": return "destructive"; 
        case "Significant Negative": return "destructive";
        default: return "outline";
    }
};

export default function MarketAnalysisStep({
  proposal,
  selectedIdea,
  marketAnalysis,
  isLoadingMarketAnalysis,
  onGenerateMarketAnalysis,
  onNavigateToStep,
}: MarketAnalysisStepProps) {

  if (!proposal || !selectedIdea) {
    return <PrerequisiteMessage message="Please complete Steps 1 (Idea) and 2 (Proposal) first." onAction={() => onNavigateToStep(proposal ? 'proposal' : 'ideas')} buttonText={`Go to ${proposal ? 'Proposal' : 'Idea'} Step`} />;
  }

  const marketSizeChartData = marketAnalysis ? [
    { name: "Market Size", value: marketAnalysis.marketSizeAndGrowth.estimation, fill: "hsl(var(--chart-1))"},
    { name: "Growth Potential", value: marketAnalysis.marketSizeAndGrowth.potential, fill: "hsl(var(--chart-2))"},
    { name: "Saturation", value: marketAnalysis.marketSizeAndGrowth.marketSaturation, fill: "hsl(var(--chart-3))"},
    { name: "Growth Outlook", value: marketAnalysis.marketSizeAndGrowth.growthRateOutlook, fill: "hsl(var(--chart-4))"},
  ] : [];

  const marketSizeChartConfig = {
    value: { label: "Value" },
    estimation: { label: "Estimation", color: "hsl(var(--chart-1))" },
    potential: { label: "Potential", color: "hsl(var(--chart-2))" },
    saturation: { label: "Saturation", color: "hsl(var(--chart-3))" },
    outlook: { label: "Outlook", color: "hsl(var(--chart-4))" },
  } satisfies Record<string, any>;

  const competitorRevenueChartData = marketAnalysis ? marketAnalysis.potentialCompetitors.map((c,i) => ({
    name: c.name,
    potential: c.estimatedRevenuePotential === "Very High" ? 4 : c.estimatedRevenuePotential === "High" ? 3 : c.estimatedRevenuePotential === "Medium" ? 2 : c.estimatedRevenuePotential === "Low" ? 1 : 0,
    fill: COLORS[i % COLORS.length]
  })) : [];
  
  const competitorRevenueChartConfig = {
     potential: { label: "Revenue Potential Score (0-4)" },
     name: {label: "Competitor"}
  } satisfies Record<string, any>;

  const swotChartData = marketAnalysis ? [
    { name: "Strengths", value: marketAnalysis.swotAnalysis.strengths.length, items: marketAnalysis.swotAnalysis.strengths, fill: "hsl(var(--chart-1))" },
    { name: "Weaknesses", value: marketAnalysis.swotAnalysis.weaknesses.length, items: marketAnalysis.swotAnalysis.weaknesses, fill: "hsl(var(--chart-2))" },
    { name: "Opportunities", value: marketAnalysis.swotAnalysis.opportunities.length, items: marketAnalysis.swotAnalysis.opportunities, fill: "hsl(var(--chart-3))" },
    { name: "Threats", value: marketAnalysis.swotAnalysis.threats.length, items: marketAnalysis.swotAnalysis.threats, fill: "hsl(var(--chart-4))" },
  ] : [];

  const swotChartConfig = {
    value: { label: "Count" },
    Strengths: { label: "Strengths", color: "hsl(var(--chart-1))" },
    Weaknesses: { label: "Weaknesses", color: "hsl(var(--chart-2))" },
    Opportunities: { label: "Opportunities", color: "hsl(var(--chart-3))" },
    Threats: { label: "Threats", color: "hsl(var(--chart-4))" },
  } satisfies Record<string, any>;


  return (
    <>
      {!marketAnalysis && !isLoadingMarketAnalysis && (
        <Button 
            onClick={onGenerateMarketAnalysis}
            disabled={isLoadingMarketAnalysis}
            className="w-full sm:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow"
        >
            {isLoadingMarketAnalysis ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Search className="mr-2 h-4 w-4" />
            )}
            Analyze Market & Competition (AI)
        </Button>
      )}
      {isLoadingMarketAnalysis && (
        <div className="flex justify-center items-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Analyzing market...</p>
        </div>
      )}
      {marketAnalysis && (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                    <CardTitle className="text-xl flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/>Market Overview</CardTitle>
                </CardHeader>
                <CardContent className="pt-4"><p className="text-sm text-muted-foreground">{marketAnalysis.marketOverview}</p></CardContent>
            </Card>
            
            <Card className="shadow-sm">
                <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                    <CardTitle className="text-xl flex items-center gap-2"><BarChartHorizontalBig className="h-5 w-5 text-primary"/>Market Size & Growth</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm space-y-3">
                    <div className="flex items-center gap-2">
                        <strong className="text-sm">Estimation:</strong> 
                        <Badge variant={getMarketAttributeBadgeVariant(marketAnalysis.marketSizeAndGrowth.estimation)} className="text-xs">{marketAnalysis.marketSizeAndGrowth.estimation}</Badge>
                    </div>
                    <p><strong className="text-sm">Potential:</strong> <span className="text-muted-foreground">{marketAnalysis.marketSizeAndGrowth.potential}</span></p>
                    <SegmentedDisplay title="Market Saturation" value={marketAnalysis.marketSizeAndGrowth.marketSaturation} segments={["Low", "Medium", "High"]} icon={Users}/>
                    <SegmentedDisplay title="Growth Outlook" value={marketAnalysis.marketSizeAndGrowth.growthRateOutlook} segments={["Slow", "Moderate", "Rapid"]} icon={TrendingUp}/>
                    
                    <Card className="mt-4 shadow-xs">
                        <CardHeader className="pb-2 pt-3 px-4 bg-muted/10 dark:bg-muted/5 rounded-t-lg">
                        <CardTitle className="text-base font-medium">Market Attributes Visualization</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3 pb-4 px-2">
                        <ChartContainer config={marketSizeChartConfig} className="h-[150px] w-full text-xs">
                            <BarChart accessibilityLayer data={[
                                { metric: 'Saturation', value: marketAnalysis.marketSizeAndGrowth.marketSaturation === 'High' ? 3 : marketAnalysis.marketSizeAndGrowth.marketSaturation === 'Medium' ? 2 : 1, fill: "hsl(var(--chart-1))" },
                                { metric: 'Outlook', value: marketAnalysis.marketSizeAndGrowth.growthRateOutlook === 'Rapid' ? 3 : marketAnalysis.marketSizeAndGrowth.growthRateOutlook === 'Moderate' ? 2 : 1, fill: "hsl(var(--chart-2))" }
                            ]} layout="vertical" margin={{left:10, right: 10}}>
                            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="value" domain={[0,3]} ticks={[0,1,2,3]} tickFormatter={(val) => ['','Low','Med','High'][val]} />
                            <YAxis type="category" dataKey="metric" width={70} tickLine={false} axisLine={false} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="value" radius={4} barSize={20}>
                                {[{value:1},{value:2}].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.value === 1 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"} />
                                ))}
                            </Bar>
                            </BarChart>
                        </ChartContainer>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                    <CardTitle className="text-xl flex items-center gap-2"><Zap className="h-5 w-5 text-primary"/>Market Trends</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    {marketAnalysis.marketTrends.map((trend, idx) => (
                        <div key={idx} className="p-3 bg-background dark:bg-muted/20 rounded-md border shadow-sm">
                            <h5 className="font-semibold text-md mb-1.5 text-foreground/90">{trend.trend}</h5>
                            <p className="text-xs text-muted-foreground mb-2.5">{trend.description}</p>
                            <div className="space-y-2">
                                <SegmentedDisplay title="Relevance to App" value={trend.relevanceToApp} segments={["Low", "Medium", "High"]} icon={Target}/>
                                <div className="flex items-center gap-2 text-xs">
                                <strong className="text-xs">Potential Impact:</strong> 
                                <Badge variant={getTrendImpactBadgeVariant(trend.potentialImpactMagnitude)} size="sm">{trend.potentialImpactMagnitude}</Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                    <CardTitle className="text-xl flex items-center gap-2"><Network className="h-5 w-5 text-primary"/>Potential Competitors</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <ChartContainer config={competitorRevenueChartConfig} className="h-[200px] w-full text-xs mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={competitorRevenueChartData} layout="vertical" margin={{top: 5, right: 20, left: 60, bottom: 5}}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                                <XAxis type="number" domain={[0,4]} ticks={[0,1,2,3,4]} tickFormatter={(value) => ["","Low","Med","High","V.High"][value]} />
                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                <Bar dataKey="potential" name="Revenue Potential" radius={4} barSize={25}>
                                {competitorRevenueChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                    <Accordion type="multiple" className="w-full space-y-2">
                    {marketAnalysis.potentialCompetitors.map((competitor, idx) => (
                        <AccordionItem key={idx} value={`competitor-${idx}`} className="border rounded-md overflow-hidden shadow-sm">
                            <AccordionTrigger className="p-3 bg-background dark:bg-muted/20 hover:no-underline hover:bg-muted/30 dark:hover:bg-muted/30 text-md rounded-t-md data-[state=closed]:rounded-b-md">
                                <span className="font-semibold">{competitor.name}</span>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 text-sm space-y-2 bg-background border-t">
                                <p><strong>Primary Offering:</strong> <span className="text-muted-foreground">{competitor.primaryOffering}</span></p>
                                <div><strong>Strengths:</strong> <ul className="list-disc list-inside text-muted-foreground text-xs ml-4">{competitor.strengths.map((s,i) => <li key={i}>{s}</li>)}</ul></div>
                                <div><strong>Weaknesses:</strong> <ul className="list-disc list-inside text-muted-foreground text-xs ml-4">{competitor.weaknesses.map((w,i) => <li key={i}>{w}</li>)}</ul></div>
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                                <strong>Est. Revenue Potential:</strong> 
                                <Badge variant={getRevenuePotentialBadgeVariant(competitor.estimatedRevenuePotential)} className="shadow-sm">
                                    <DollarSign className="h-3 w-3 mr-1"/>{competitor.estimatedRevenuePotential}
                                </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground italic mt-1">Reasoning: {competitor.revenuePotentialReasoning}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </CardContent>
            </Card>
            
            <Card className="shadow-sm">
                <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/>SWOT Analysis</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                <ChartContainer config={swotChartConfig} className="h-[250px] w-full text-xs mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                        <Pie
                            data={swotChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                            {swotChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Legend wrapperStyle={{fontSize: "0.7rem"}}/>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {[
                    { title: "Strengths", items: marketAnalysis.swotAnalysis.strengths, Icon: ThumbsUp, color: "text-green-500 dark:text-green-400", bg: "bg-green-50/50 dark:bg-green-900/20 border-green-500/30" },
                    { title: "Weaknesses", items: marketAnalysis.swotAnalysis.weaknesses, Icon: ThumbsDown, color: "text-red-500 dark:text-red-400", bg: "bg-red-50/50 dark:bg-red-900/20 border-red-500/30" },
                    { title: "Opportunities", items: marketAnalysis.swotAnalysis.opportunities, Icon: TrendingUp, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-50/50 dark:bg-blue-900/20 border-blue-500/30" },
                    { title: "Threats", items: marketAnalysis.swotAnalysis.threats, Icon: TrendingDown, color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-50/50 dark:bg-orange-900/20 border-orange-500/30" },
                    ].map(category => (
                        <Card key={category.title} className={`shadow-sm rounded-lg ${category.bg} border`}>
                            <CardHeader className="pb-2 pt-3 px-4">
                                <CardTitle className={`flex items-center gap-2 text-lg font-semibold ${category.color}`}>
                                    <category.Icon className={`h-5 w-5 ${category.color}`}/>{category.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-3">
                                <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1 pl-2">
                                    {category.items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                </CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                    <CardTitle className="text-xl">Competitive Landscape Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-4"><p className="text-sm text-muted-foreground">{marketAnalysis.competitiveLandscapeSummary}</p></CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardHeader className="pb-3 bg-muted/20 dark:bg-muted/10 rounded-t-lg">
                    <CardTitle className="text-xl">Strategic Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                        {marketAnalysis.strategicRecommendations.map((rec, idx) => <li key={idx} className="leading-relaxed">{rec}</li>)}
                    </ul>
                </CardContent>
            </Card>
        </div>
      )}
    </>
  );
}
