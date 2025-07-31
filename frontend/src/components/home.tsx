import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Settings,
  PlusCircle,
  FileText,
  Shield,
  ChevronRight,
  Search,
} from "lucide-react";
import ComplianceProgressTracker from "./ComplianceProgressTracker";
import DocumentGrid from "./DocumentGrid";

const Home = () => {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r bg-card p-4">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">Compliance AI</h1>
        </div>

        <nav className="space-y-1">
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Frameworks
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Team
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>

        <div className="mt-auto">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <PlusCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">New Workflow</h3>
                  <p className="text-xs text-muted-foreground">
                    Start compliance process
                  </p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
          <div className="flex items-center gap-2 md:hidden">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold">Compliance AI</h1>
          </div>

          <div className="relative hidden md:block w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full rounded-md border border-input bg-background pl-8 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                alt="User"
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="p-6">
          <div className="flex flex-col md:flex-row items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor your compliance progress and recent documents.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button variant="outline">Export Report</Button>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </div>
          </div>

          {/* Compliance Progress Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Compliance Progress</h2>
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <ComplianceProgressTracker />
          </div>

          {/* Recent Documents Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Documents</h2>
            </div>

            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pci">PCI-DSS</TabsTrigger>
                <TabsTrigger value="soc2">SOC2</TabsTrigger>
                <TabsTrigger value="gdpr">GDPR</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <DocumentGrid />
              </TabsContent>
              <TabsContent value="pci" className="mt-0">
                <DocumentGrid />
              </TabsContent>
              <TabsContent value="soc2" className="mt-0">
                <DocumentGrid />
              </TabsContent>
              <TabsContent value="gdpr" className="mt-0">
                <DocumentGrid />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
