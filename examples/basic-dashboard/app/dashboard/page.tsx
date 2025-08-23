'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSaturation } from '@/contexts/SaturationContext';
import { ProjectSelector } from '@/components/dashboard/project-selector';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { BudgetChart } from '@/components/dashboard/budget-chart';
import { SpendChart } from '@/components/dashboard/spend-chart';
import { PoChart } from '@/components/dashboard/po-chart';
import { VendorsChart } from '@/components/dashboard/vendors-chart';
import { CashflowTable } from '@/components/dashboard/cashflow-table';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import type { Project, Budget, Actual, PurchaseOrder } from '@saturation-api/js';

export default function DashboardPage() {
  const router = useRouter();
  const saturation = useSaturation();
  
  // Check for API key on mount
  useEffect(() => {
    const apiKey = localStorage.getItem('saturation_api_key');
    if (!apiKey) {
      router.push('/');
    }
  }, [router]);

  // Core state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [budget, setBudget] = useState<Budget | null>(null);
  const [actuals, setActuals] = useState<Actual[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  // Fetch all data when project changes
  useEffect(() => {
    if (!selectedProject) {
      // Clear data when no project selected
      setBudget(null);
      setActuals([]);
      setPurchaseOrders([]);
      return;
    }

    const fetchProjectData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel for better performance
        const [budgetRes, actualsRes, posRes] = await Promise.allSettled([
          saturation.getBudget(selectedProject.id, { 
            expands: ['lines.phaseData', 'lines.contact'] 
          }),
          saturation.listActuals(selectedProject.id, {
            expands: ['account']
          }),
          saturation.listPurchaseOrders(selectedProject.id)
        ]);

        // Handle budget
        if (budgetRes.status === 'fulfilled') {
          setBudget(budgetRes.value);
        } else {
          console.error('Failed to fetch budget:', budgetRes.reason);
          setBudget(null);
        }

        // Handle actuals
        if (actualsRes.status === 'fulfilled') {
          setActuals(actualsRes.value.actuals || []);
        } else {
          console.error('Failed to fetch actuals:', actualsRes.reason);
          setActuals([]);
        }

        // Handle POs
        if (posRes.status === 'fulfilled') {
          setPurchaseOrders(posRes.value.purchaseOrders || []);
        } else {
          console.error('Failed to fetch POs:', posRes.reason);
          setPurchaseOrders([]);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project data');
        console.error('Error fetching project data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [selectedProject, saturation]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="/favicon.svg" 
                alt="Saturation Logo" 
                width={48} 
                height={48}
                className="flex-shrink-0"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {selectedProject ? selectedProject.name : 'Saturation Dashboard'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Demo dashboard built with Saturation API • <a href="https://docs.saturation.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">View API docs</a>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProjectSelector onProjectChange={setSelectedProject} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!selectedProject ? (
          // No project selected state
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Select a project to get started
            </h2>
            <p className="text-gray-600">
              Choose a project from the dropdown above to view its financial data
            </p>
          </div>
        ) : loading ? (
          // Loading state
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading project data...</p>
          </div>
        ) : error ? (
          // Error state
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        ) : (
          // Dashboard content
          <div className="space-y-6">
            <KpiCards 
              budget={budget} 
              actuals={actuals} 
              purchaseOrders={purchaseOrders} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetChart budget={budget} />
              <SpendChart 
                actuals={actuals} 
                budgetTotal={budget?.account?.totals?.estimate || 0}
              />
              <PoChart purchaseOrders={purchaseOrders} />
              <VendorsChart actuals={actuals} purchaseOrders={purchaseOrders} />
            </div>

            {budget && <CashflowTable actuals={actuals} budget={budget} />}
          </div>
        )}
      </main>
    </div>
  );
}