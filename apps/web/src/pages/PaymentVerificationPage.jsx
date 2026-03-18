
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import Header from '@/components/Header.jsx';
import { 
  CheckCircle2, 
  Copy, 
  Wallet, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  XCircle, 
  Loader2,
  ExternalLink
} from 'lucide-react';

const PaymentVerificationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getToken } = useAuth();
  
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const WALLET_ADDRESS = '0xc0689212690d7fC1B3aD89B1147063F190403Ab6';
  const AMOUNT = '10 USDT';
  const NETWORK = 'ERC20 (Ethereum)';

  const isHashValid = /^0x[a-fA-F0-9]{64}$/.test(txHash);
  const showValidation = txHash.length > 0;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Wallet address copied to clipboard'
    });
  };

  const handleVerify = async () => {
    if (!txHash) {
      setError('Please enter your transaction hash');
      return;
    }

    if (!isHashValid) {
      setError('Invalid TX hash format. Must be 0x followed by 64 hex characters.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = getToken();
      const response = await apiServerClient.fetch('/masters/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ txHash })
      });

      const data = await response.json();

      if (data.success) {
        setVerified(true);
        setExpiryDate(data.subscriptionExpiryDate);
        toast({
          title: 'Payment Verified!',
          description: 'Your subscription is now active'
        });
      } else {
        setError(data.error || 'Verification failed. Please check your transaction.');
      }
    } catch (err) {
      setError(err.message || 'A network error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <>
        <Helmet>
          <title>Payment Verified - MasterMap</title>
        </Helmet>

        <Header />

        <div className="min-h-[calc(100vh-64px)] bg-slate-950 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900 text-center">
            <CardContent className="pt-12 pb-8">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                <CheckCircle2 className="w-24 h-24 text-emerald-500 relative z-10" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-3">Payment Verified!</h2>
              <p className="text-slate-400 mb-8">Your master profile is now fully active and visible to clients.</p>
              
              <div className="bg-slate-800/50 rounded-xl p-5 mb-8 text-left space-y-3 border border-slate-700/50">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Activation Date</span>
                  <span className="text-white font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="h-px bg-slate-700/50 w-full"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Valid Until</span>
                  <span className="text-emerald-400 font-bold">
                    {expiryDate ? new Date(expiryDate).toLocaleDateString() : '30 days from now'}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate('/master/dashboard')} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payment Verification - MasterMap</title>
        <meta name="description" content="Verify your subscription payment" />
      </Helmet>

      <Header />

      <div className="min-h-[calc(100vh-64px)] py-12 px-4 bg-slate-950 relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full"></div>

        <div className="max-w-2xl mx-auto relative z-10 space-y-6">
          
          {/* Help Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300">
            <button 
              onClick={() => setShowHelp(!showHelp)} 
              className="w-full p-5 flex items-center justify-between text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                </div>
                <span className="font-semibold text-lg">How to find TX hash in Telegram Wallet?</span>
              </div>
              {showHelp ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            
            {showHelp && (
              <div className="p-6 border-t border-slate-800 bg-slate-900/50 text-slate-300">
                <ol className="space-y-4 list-decimal list-inside marker:text-slate-500 marker:font-medium ml-4">
                  <li className="pl-2">Open the <strong>Telegram Wallet</strong> app</li>
                  <li className="pl-2">Find and tap on the <strong>USDT transaction</strong> you just sent</li>
                  <li className="pl-2">Tap on <strong>View in Explorer</strong> <ExternalLink className="inline w-4 h-4 ml-1 text-slate-400" /></li>
                  <li className="pl-2">Locate and copy the <strong>Transaction Hash</strong> (it always starts with <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400">0x</code>)</li>
                  <li className="pl-2">Paste the copied hash into the field below</li>
                </ol>
              </div>
            )}
          </div>

          <Card className="shadow-2xl border-slate-800 bg-slate-900">
            <CardHeader className="pb-4 border-b border-slate-800">
              <CardTitle className="text-2xl text-white flex items-center space-x-3">
                <div className="bg-amber-500/20 p-2 rounded-lg">
                  <Wallet className="w-6 h-6 text-amber-500" />
                </div>
                <span>Subscription Payment</span>
              </CardTitle>
              <CardDescription className="text-slate-400 text-base mt-2">
                Complete your payment to activate your master profile for 30 days.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 pt-6">
              {/* Payment Details */}
              <div className="bg-slate-950 rounded-xl p-6 space-y-5 border border-slate-800">
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <span className="text-slate-400 font-medium">Amount Required</span>
                  <span className="text-2xl font-bold text-amber-400">{AMOUNT}</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <span className="text-slate-400 font-medium">Network</span>
                  <span className="text-white font-medium bg-slate-800 px-3 py-1 rounded-full">{NETWORK}</span>
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-400 font-medium">Destination Wallet Address</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      value={WALLET_ADDRESS}
                      readOnly
                      className="bg-slate-900 border-slate-700 text-slate-300 font-mono text-sm h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(WALLET_ADDRESS)}
                      className="h-12 px-4 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Input Section */}
              <div className="space-y-3">
                <Label htmlFor="txHash" className="text-white text-base font-medium">Transaction Hash</Label>
                <div className="relative">
                  <Input
                    id="txHash"
                    value={txHash}
                    onChange={(e) => { 
                      setTxHash(e.target.value.trim()); 
                      if (error) setError(''); 
                    }}
                    placeholder="0x..."
                    className={`bg-slate-950 border-slate-700 text-white font-mono h-14 pr-12 text-base transition-colors ${
                      showValidation 
                        ? isHashValid 
                          ? 'border-emerald-500/50 focus-visible:ring-emerald-500/50' 
                          : 'border-red-500/50 focus-visible:ring-red-500/50'
                        : 'focus-visible:ring-amber-500/50'
                    }`}
                  />
                  {showValidation && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {isHashValid ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-start">
                  {!isHashValid && showValidation ? (
                    <p className="text-sm text-red-400 font-medium">Format: 0x followed by 64 hex characters</p>
                  ) : (
                    <p className="text-sm text-slate-500">Paste the hash from your wallet explorer</p>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-5 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start space-x-3 mb-4">
                    <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-red-400 font-semibold text-lg mb-1">Verification Failed</h4>
                      <p className="text-red-200/80 text-sm leading-relaxed">{error}</p>
                    </div>
                  </div>
                  <div className="flex space-x-3 pl-9">
                    <Button 
                      onClick={handleVerify} 
                      disabled={loading || !isHashValid}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Try Again
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = 'mailto:support@mastermap.com'}
                      className="border-red-900/50 text-red-300 hover:bg-red-900/30 hover:text-red-200"
                    >
                      Contact Support
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {!error && (
                <Button
                  onClick={handleVerify}
                  disabled={loading || !txHash}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white h-14 text-lg font-semibold transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Verifying on Blockchain...
                    </>
                  ) : (
                    'Verify Payment'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PaymentVerificationPage;
