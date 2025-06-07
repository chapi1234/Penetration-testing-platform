
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck,
  Network,
  Lock,
  AlertTriangle,
  FileCode,
  Loader2
} from 'lucide-react';
import { scanApi } from '@/api/apiService';
import { useToast } from '@/hooks/use-toast';

export default function ScanSubmission() {
  const [url, setUrl] = useState('');
  const [scanType, setScanType] = useState('basic');
  const [customOptions, setCustomOptions] = useState({
    network: false,
    ssl: false,
    firewall: false,
    http: false,
    nse: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCustomOptionChange = (option: keyof typeof customOptions) => {
    setCustomOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive",
      });
      return;
    }
    
    // Validate custom options
    if (scanType === 'custom' && !Object.values(customOptions).some(Boolean)) {
      toast({
        title: "Error",
        description: "Please select at least one custom scan option",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // In a real app, this would send the actual scan configuration
      const scanData = {
        url,
        type: scanType,
        options: scanType === 'custom' ? customOptions : {},
      };
      
      const response = await scanApi.submitScan(scanData);
      
      toast({
        title: "Scan submitted successfully",
        description: "You will be notified when your scan is complete",
      });
      navigate('/scan-history');
    } catch (error) {
      console.error('Error submitting scan:', error);
      toast({
        title: "Error",
        description: "Failed to submit scan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Security Scan</h1>
        <p className="text-muted-foreground">
          Configure and submit a new security scan
        </p>
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Scan Configuration</CardTitle>
            <CardDescription>
              Enter the target URL and select your scan options
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Target URL */}
            <div className="space-y-2">
              <Label htmlFor="url">Target URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={submitting}
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter the full URL including http:// or https://
              </p>
            </div>
            
            {/* Scan Type */}
            <div className="space-y-3">
              <Label>Scan Type</Label>
              <RadioGroup 
                value={scanType} 
                onValueChange={setScanType}
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 border p-4 rounded-md hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="fast" id="basic" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="basic" className="text-base font-medium flex items-center cursor-pointer">
                      <ShieldCheck className="h-5 w-5 text-status-info mr-2" />
                      Basic Scan
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quick security assessment with minimal server load. Completes in 2-5 minutes.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 border p-4 rounded-md hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="full" id="full" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="full" className="text-base font-medium flex items-center cursor-pointer">
                      <Shield className="h-5 w-5 text-primary mr-2" />
                      Full Scan
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Comprehensive security testing including all vulnerability types. May take 10-20 minutes.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 border p-4 rounded-md hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="custom" id="custom" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="custom" className="text-base font-medium flex items-center cursor-pointer">
                      <ShieldAlert className="h-5 w-5 text-status-warning mr-2" />
                      Custom Scan
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select specific test categories to include in your scan.
                    </p>
                    
                    {scanType === 'custom' && (
                      <div className="mt-4 space-y-3 border-t pt-3">
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="network"
                            checked={customOptions.network}
                            onCheckedChange={() => handleCustomOptionChange('network')}
                          />
                          <div>
                            <Label htmlFor="network" className="flex items-center cursor-pointer">
                              <Network className="h-4 w-4 mr-2" />
                              Network Scanning
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Port scanning and service discovery
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="ssl"
                            checked={customOptions.ssl}
                            onCheckedChange={() => handleCustomOptionChange('ssl')}
                          />
                          <div>
                            <Label htmlFor="ssl" className="flex items-center cursor-pointer">
                              <Lock className="h-4 w-4 mr-2" />
                              SSL/TLS Analysis
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Certificate verification and cipher suite checks
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="firewall"
                            checked={customOptions.firewall}
                            onCheckedChange={() => handleCustomOptionChange('firewall')}
                          />
                          <div>
                            <Label htmlFor="firewall" className="flex items-center cursor-pointer">
                              <Shield className="h-4 w-4 mr-2" />
                              Firewall Detection
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              WAF fingerprinting and evasion testing
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="http"
                            checked={customOptions.http}
                            onCheckedChange={() => handleCustomOptionChange('http')}
                          />
                          <div>
                            <Label htmlFor="http" className="flex items-center cursor-pointer">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              HTTP Security
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Security header analysis and misconfiguration checks
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="nse"
                            checked={customOptions.nse}
                            onCheckedChange={() => handleCustomOptionChange('nse')}
                          />
                          <div>
                            <Label htmlFor="nse" className="flex items-center cursor-pointer">
                              <FileCode className="h-4 w-4 mr-2" />
                              NSE Scripts
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Run specialized Nmap scripts for deeper analysis
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              By submitting this scan, you confirm that you have permission to test this target.
            </p>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Start Scan'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
