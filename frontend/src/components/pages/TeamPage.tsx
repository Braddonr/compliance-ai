import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Crown,
  User,
  Settings,
  MoreHorizontal,
  FileText,
  CheckSquare,
  Clock,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { documentsAPI, complianceAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const TeamPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Mock team data - in a real app, this would come from an API
  const mockTeamMembers = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      role: 'admin',
      avatar: null,
      joinedAt: '2024-01-15',
      lastActive: '2024-02-01',
      department: 'Compliance',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      documentsCount: 12,
      tasksCompleted: 45,
      tasksInProgress: 3,
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      role: 'compliance_officer',
      avatar: null,
      joinedAt: '2024-01-20',
      lastActive: '2024-02-01',
      department: 'Legal',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      documentsCount: 8,
      tasksCompleted: 32,
      tasksInProgress: 5,
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@company.com',
      role: 'auditor',
      avatar: null,
      joinedAt: '2024-02-01',
      lastActive: '2024-02-01',
      department: 'Audit',
      phone: '+1 (555) 345-6789',
      location: 'Chicago, IL',
      documentsCount: 15,
      tasksCompleted: 28,
      tasksInProgress: 7,
    },
  ];

  // Fetch documents to show collaboration data
  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsAPI.getAll(),
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'compliance_officer': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'auditor': return <CheckSquare className="h-4 w-4 text-green-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-800';
      case 'compliance_officer': return 'bg-blue-100 text-blue-800';
      case 'auditor': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMembers = mockTeamMembers.filter((member) => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getCollaborationData = (memberId: string) => {
    // Mock collaboration data - in a real app, this would be calculated from actual data
    const collaboratedDocs = documents?.filter((doc: any) => 
      doc.author?.id === memberId || Math.random() > 0.7 // Mock collaboration
    ) || [];
    
    return {
      documentsCollaborated: collaboratedDocs.length,
      recentDocuments: collaboratedDocs.slice(0, 3),
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and track collaboration on compliance documents.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Team Settings
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your compliance team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Email address" type="email" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auditor">Auditor</SelectItem>
                    <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full">Send Invitation</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Team Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTeamMembers.length}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockTeamMembers.filter(m => m.role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">System administrators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Officers</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockTeamMembers.filter(m => m.role === 'compliance_officer').length}
            </div>
            <p className="text-xs text-muted-foreground">Compliance specialists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auditors</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockTeamMembers.filter(m => m.role === 'auditor').length}
            </div>
            <p className="text-xs text-muted-foreground">Internal auditors</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
            <SelectItem value="auditor">Auditor</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Team Members */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="collaboration">Document Collaboration</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((member) => (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  className="cursor-pointer"
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.firstName}`}
                              alt={member.firstName}
                            />
                            <AvatarFallback>
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              {member.firstName} {member.lastName}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{member.department}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                            <div className="flex items-center gap-1">
                              {getRoleIcon(member.role)}
                              {member.role.replace('_', ' ').toUpperCase()}
                            </div>
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{member.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                          <div className="text-center">
                            <div className="text-lg font-semibold">{member.documentsCount}</div>
                            <div className="text-xs text-muted-foreground">Documents</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">{member.tasksCompleted}</div>
                            <div className="text-xs text-muted-foreground">Completed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-yellow-600">{member.tasksInProgress}</div>
                            <div className="text-xs text-muted-foreground">In Progress</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-4">
            <div className="space-y-4">
              {filteredMembers.map((member) => {
                const collaboration = getCollaborationData(member.id);
                return (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.firstName}`}
                              alt={member.firstName}
                            />
                            <AvatarFallback>
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {member.firstName} {member.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {collaboration.documentsCollaborated} documents collaborated
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            <FileText className="mr-1 h-3 w-3" />
                            {collaboration.documentsCollaborated}
                          </Badge>
                        </div>
                      </div>
                      
                      {collaboration.recentDocuments.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Recent collaborations:</p>
                          <div className="flex flex-wrap gap-1">
                            {collaboration.recentDocuments.map((doc: any) => (
                              <Badge key={doc.id} variant="secondary" className="text-xs">
                                {doc.title}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default TeamPage;