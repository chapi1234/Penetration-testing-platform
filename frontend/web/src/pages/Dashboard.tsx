
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { scanApi, ScanStatus } from '@/api/apiService';
import { Shield, AlertTriangle, CheckCircle, Clock, ExternalLink, Loader2 } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';

interface ScanItem {
  id: string;
  url: string;
  type: string;
  status: ScanStatus;
  date: string;
  vulnerabilities: number | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [recentScans, setRecentScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentScans = async () => {
      try {
        const response = await scanApi.getScanHistory();
        setRecentScans(response.data.slice(0, 4)); // Only show 4 most recent
      } catch (error) {
        console.error('Error fetching scan history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentScans();
  }, []);

  // Calculate stats
  const completedScans = recentScans.filter(scan => scan.status === 'completed').length;
  const vulnerabilitiesFound = recentScans.reduce((total, scan) => 
    total + (scan.vulnerabilities || 0), 0
  );
  const pendingScans = recentScans.filter(scan => scan.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Completed Scans
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-status-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedScans}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Vulnerabilities Found
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vulnerabilitiesFound}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Pending Scans
            </CardTitle>
            <Clock className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingScans}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Scans</h2>
          <Link to="/scan-history">
            <Button variant="outline" size="sm">View all</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recentScans.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {recentScans.map((scan) => (
              <Card key={scan.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="truncate flex-1">
                      <CardTitle className="text-base">
                        {scan.url}
                      </CardTitle>
                      <CardDescription>
                        {new Date(scan.date).toLocaleString()}
                      </CardDescription>
                    </div>
                    <StatusBadge status={scan.status} className="ml-2 mt-1" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Scan Type</p>
                      <p className="font-medium">{scan.type}</p>
                    </div>
                    {scan.status === 'completed' && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground ml-4">Vulnerabilities</p>
                        <p className={`font-medium ${scan.vulnerabilities ? 'text-status-danger' : 'text-status-success'}`}>
                          {scan.vulnerabilities || 0}
                        </p>
                      </div>
                    )}
                    <Link to={`/scan-result/${scan.id}`} className="ml-auto">
                      <Button size="sm" variant="outline" className="gap-1">
                        <ExternalLink className="h-4 w-4" />
                        Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center mb-4">
                You haven't run any scans yet. Start securing your applications now.
              </p>
              <Link to="/scan">
                <Button>
                  Start New Scan
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>Tips to get started with Blue Haven Security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. Submit Your First Scan</h3>
              <p className="text-sm text-muted-foreground">
                Start by running a Basic scan on your web application to get a quick security assessment.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">2. Review Results</h3>
              <p className="text-sm text-muted-foreground">
                Analyze your scan results and focus on high and medium severity findings first.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">3. Run a Full Scan</h3>
              <p className="text-sm text-muted-foreground">
                Once you've addressed initial findings, run a Full scan for comprehensive security testing.
              </p>
            </div>
            <Link to="/scan">
              <Button variant="outline" className="w-full mt-2">
                Start Your First Scan
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Security Resources</CardTitle>
            <CardDescription>Learn more about web application security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <ExternalLink className="h-4 w-4 mr-2" />
                OWASP Top 10
              </h3>
              <p className="text-sm text-muted-foreground">
                A standard awareness document for developers and web application security.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <ExternalLink className="h-4 w-4 mr-2" />
                Web Security Academy
              </h3>
              <p className="text-sm text-muted-foreground">
                Free online training materials and labs covering web security vulnerabilities.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <ExternalLink className="h-4 w-4 mr-2" />
                Security Headers
              </h3>
              <p className="text-sm text-muted-foreground">
                Learn about HTTP security headers and how they protect your web applications.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
