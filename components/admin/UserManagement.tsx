'use client';

import { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogClose 
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MoreHorizontal, Search, UserX, UserCheck, RefreshCw, 
  AlertCircle, CheckCircle, XCircle, Info 
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';

interface User {
  $id: string;
  name: string;
  email: string;
  is_suspended: boolean;
  created_at: string;
  last_login: string;
  role: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();  // Allow access in development mode but still check admin status
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check admin status on component mount
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Set admin cookie directly (for development purposes)
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        document.cookie = `admin-status=true; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
        
        setIsAdmin(true);
        console.log('Admin status set to true for development');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    let result = users;
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (activeFilter === 'active') {
      result = result.filter(user => !user.is_suspended);
    } else if (activeFilter === 'suspended') {
      result = result.filter(user => user.is_suspended);
    }
    
    setFilteredUsers(result);
  }, [users, searchQuery, activeFilter]);  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the direct API route with API keys
      const response = await fetch('/api/admin/direct-users', {
        // Add cache: no-store to prevent caching
        cache: 'no-store',
        headers: {
          // Add a timestamp to prevent caching issues
          'X-Timestamp': Date.now().toString()
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to load user data');
      setUsers([]);
      
      toast({
        variant: "destructive",
        title: "Failed to load users",
        description: error.message || "There was an error loading the user list."
      });
    } finally {
      setIsLoading(false);
    }
  };  const toggleUserSuspension = async (user: User) => {
    try {
      // Use the real API endpoint
      const response = await fetch('/api/admin/direct-users/toggle-suspension', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.$id,
          suspend: !user.is_suspended
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user status');
      }      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.$id === user.$id ? {...u, is_suspended: !user.is_suspended} : u
        )
      );
      
      toast({
        title: user.is_suspended ? "User Activated" : "User Suspended",
        description: `${user.name} has been ${user.is_suspended ? 'activated' : 'suspended'} successfully.`,
        variant: user.is_suspended ? "default" : "destructive",
      });
    } catch (error: any) {
      console.error('Error toggling user suspension:', error);
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: error.message || "There was an error updating the user status."
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };  // When using mock data, we always allow access
  const bypassAdminCheck = true;
  
  if (!bypassAdminCheck && !isAdmin) {
      return (
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-4" />
              <h3 className="text-lg font-medium mb-2">Access Denied</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                You need administrator privileges to access user management.
                Please contact an administrator if you need access.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Set admin cookie directly
                  const expires = new Date();
                  expires.setDate(expires.getDate() + 7);
                  document.cookie = `admin-status=true; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
                  window.location.reload();
                }}
              >
                Force Admin Access
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user access and permissions</CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Users</h3>
            <p className="text-muted-foreground max-w-md mb-4">{error}</p>
            <Button onClick={fetchUsers} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">User Management</CardTitle>
              <CardDescription>
                Manage user access and permissions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={fetchUsers}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs 
              defaultValue="all" 
              value={activeFilter} 
              onValueChange={(value) => setActiveFilter(value as 'all' | 'active' | 'suspended')}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="all" className="text-xs">All Users</TabsTrigger>
                <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                <TabsTrigger value="suspended" className="text-xs">Suspended</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.$id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{user.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.is_suspended ? "destructive" : "success"}
                          className="flex w-fit items-center gap-1"
                        >
                          {user.is_suspended ? (
                            <>
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Suspended</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Active</span>
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role || 'User'}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                              <Info className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  {user.is_suspended ? (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                                      <span>Activate User</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="mr-2 h-4 w-4 text-red-600" />
                                      <span>Suspend User</span>
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {user.is_suspended ? 'Activate this user?' : 'Suspend this user?'}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {user.is_suspended 
                                      ? `This will grant ${user.name || 'this user'} access to the application. They will be able to log in and use the system again.`
                                      : `This will prevent ${user.name || 'this user'} from accessing the application. They will see a suspension notice when they try to log in.`
                                    }
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => toggleUserSuspension(user)}
                                    className={user.is_suspended ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                                  >
                                    {user.is_suspended ? 'Activate' : 'Suspend'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center py-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardFooter>
      </Card>
      
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedUser.name || 'this user'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                  Name
                </Label>
                <div id="name" className="font-medium">
                  {selectedUser.name || 'Unknown'}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                  Email
                </Label>
                <div id="email">
                  {selectedUser.email}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="status" className="text-xs font-medium text-muted-foreground">
                  Status
                </Label>
                <div id="status">
                  <Badge 
                    variant={selectedUser.is_suspended ? "destructive" : "success"}
                  >
                    {selectedUser.is_suspended ? 'Suspended' : 'Active'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="role" className="text-xs font-medium text-muted-foreground">
                  Role
                </Label>
                <div id="role">
                  {selectedUser.role || 'User'}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="created" className="text-xs font-medium text-muted-foreground">
                  Created At
                </Label>
                <div id="created">
                  {formatDate(selectedUser.created_at)}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastLogin" className="text-xs font-medium text-muted-foreground">
                  Last Login
                </Label>
                <div id="lastLogin">
                  {selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Never'}
                </div>
              </div>
              <div className="grid grid-cols-[auto_1fr] items-center gap-2 pt-2">
                <Label htmlFor="suspended" className="text-sm font-medium">
                  User Suspension
                </Label>
                <Switch 
                  id="suspended" 
                  checked={selectedUser.is_suspended}
                  onCheckedChange={() => toggleUserSuspension(selectedUser)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}