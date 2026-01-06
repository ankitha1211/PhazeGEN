"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface MlAnalysisReportProps {
    mlOutput: string;
}

type MlData = {
    pathogenicRisk?: { score: number; category: string };
    crisprSystem?: { present: boolean; details: string };
    resistanceGenes?: string[];
    gcContent?: string;
    genomeLength?: string;
    orfCount?: number;
};

const ReportItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between py-2 border-b">
        <dt className="font-medium text-muted-foreground">{label}</dt>
        <dd className="text-right">{value}</dd>
    </div>
);

export function MlAnalysisReport({ mlOutput }: MlAnalysisReportProps) {
    let data: MlData = {};
    try {
        data = JSON.parse(mlOutput);
    } catch (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Analysis Data Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Could not parse the ML output data.</p>
                    <pre className="mt-4 bg-muted p-4 rounded-md text-xs"><code>{mlOutput}</code></pre>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="not-prose space-y-4">
            <dl className="space-y-2 rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
                {data.pathogenicRisk && (
                    <ReportItem 
                        label="Pathogenic Risk" 
                        value={`${data.pathogenicRisk.category} (Score: ${data.pathogenicRisk.score})`} 
                    />
                )}
                {data.crisprSystem && (
                    <ReportItem 
                        label="CRISPR System" 
                        value={data.crisprSystem.present ? `Present: ${data.crisprSystem.details}` : "Not Detected"} 
                    />
                )}
                {data.resistanceGenes && (
                     <ReportItem 
                        label="Resistance Genes" 
                        value={data.resistanceGenes.join(', ')} 
                    />
                )}
                 {data.gcContent && (
                    <ReportItem 
                        label="GC Content" 
                        value={data.gcContent} 
                    />
                )}
                 {data.genomeLength && (
                    <ReportItem 
                        label="Genome Length" 
                        value={data.genomeLength} 
                    />
                )}
                 {data.orfCount && (
                    <ReportItem 
                        label="ORF Count" 
                        value={data.orfCount.toLocaleString()} 
                    />
                )}
            </dl>
        </div>
    );
}
