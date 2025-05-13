
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, type FormEvent } from 'react';
import { Send, Mail as MailIcon, User, MessageSquare, Info } from "lucide-react";

export default function ContactForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    // Placeholder for contact form submission
    setTimeout(() => {
      toast({
        title: "Message Sent (Demo)",
        description: "Your message has been 'sent'. This is a demo and no actual email was sent.",
      });
      setIsLoading(false);
      (event.target as HTMLFormElement).reset(); // Reset form after mock submission
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
      <Card className="w-full shadow-2xl border-border/20 bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mx-auto mb-4 border border-primary/20 shadow-sm w-16 h-16">
            <MailIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-bold text-primary">Get in Touch</CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-2">
            Have questions or feedback? We&apos;d love to hear from you!
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 px-6 md:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center text-xs font-medium text-muted-foreground">
                  <User className="mr-1.5 h-3.5 w-3.5" /> Full Name
                </Label>
                <Input id="name" placeholder="John Doe" required className="rounded-md shadow-sm text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center text-xs font-medium text-muted-foreground">
                  <MailIcon className="mr-1.5 h-3.5 w-3.5" /> Email Address
                </Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" required className="rounded-md shadow-sm text-base" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center text-xs font-medium text-muted-foreground">
                <Info className="mr-1.5 h-3.5 w-3.5" /> Subject
              </Label>
              <Input id="subject" placeholder="Regarding..." required className="rounded-md shadow-sm text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="flex items-center text-xs font-medium text-muted-foreground">
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Your Message
              </Label>
              <Textarea
                id="message"
                placeholder="Let us know how we can help..."
                required
                rows={5}
                className="rounded-md shadow-sm text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="px-6 md:px-8 pb-6">
            <Button type="submit" className="w-full rounded-md shadow-md hover:shadow-lg transition-shadow text-base py-3" disabled={isLoading}>
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? "Sending..." : "Send Message"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
