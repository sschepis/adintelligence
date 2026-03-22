import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Users } from "lucide-react";

interface Influencer {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  followers: string;
  hashtag?: string;
  mentions?: number;
  engagement?: number;
}

interface InfluencerIntelligenceProps {
  trendName: string;
  trendDate?: string;
  description?: string;
  influencers: Influencer[];
  platform?: string;
  onPlatformChange?: (platform: string) => void;
}

export function InfluencerIntelligence({
  trendName,
  trendDate,
  description,
  influencers,
  platform = "TikTok",
  onPlatformChange,
}: InfluencerIntelligenceProps) {
  const [selectedPlatform, setSelectedPlatform] = useState(platform);

  const handlePlatformChange = (value: string) => {
    setSelectedPlatform(value);
    onPlatformChange?.(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
          <SelectTrigger className="w-[140px] bg-foreground text-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TikTok">TikTok</SelectItem>
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="YouTube">YouTube</SelectItem>
            <SelectItem value="Pinterest">Pinterest</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          TRENDING ON MEDIA CHANNEL
        </span>
      </div>

      {/* Trend Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5" />
          <div>
            <h2 className="font-display font-bold text-xl">{trendName}</h2>
            {trendDate && (
              <p className="text-xs text-muted-foreground">AS OF {trendDate}</p>
            )}
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground max-w-3xl">{description}</p>
        )}
      </div>

      {/* Influencer Grid */}
      <div>
        <h3 className="font-bold text-sm uppercase tracking-wide mb-4">
          {trendName} TREND INFLUENCERS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {influencers.slice(0, 8).map((influencer) => (
            <InfluencerCard key={influencer.id} influencer={influencer} />
          ))}
        </div>
      </div>

      {/* Hashtag Mentions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base uppercase tracking-wide">
            {trendName} HASHTAG + MENTIONS DATA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Influencer</TableHead>
                <TableHead>Handle / Hashtag</TableHead>
                <TableHead className="text-right">Mentions (Last Month)</TableHead>
                <TableHead className="text-right">Avg. Engagement (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {influencers.slice(0, 6).map((influencer) => (
                <TableRow key={influencer.id}>
                  <TableCell className="font-medium">{influencer.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">@{influencer.handle}</span>
                      {influencer.hashtag && (
                        <span className="text-pink-500 text-sm">#{influencer.hashtag}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {influencer.mentions?.toLocaleString() || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {influencer.engagement ? `${influencer.engagement}%` : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function InfluencerCard({ influencer }: { influencer: Influencer }) {
  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary">
        {influencer.avatar ? (
          <img 
            src={influencer.avatar} 
            alt={influencer.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary/30" />
          </div>
        )}
      </div>
      <div>
        <p className="font-semibold text-sm">{influencer.name}</p>
        <p className="text-xs text-muted-foreground">@{influencer.handle}</p>
        <p className="text-xs text-pink-500 font-medium">{influencer.followers} followers</p>
      </div>
    </div>
  );
}

