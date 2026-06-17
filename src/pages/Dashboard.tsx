import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardHero from "@/components/dashboard/DashboardHero";
import AccountStatusCard from "@/components/dashboard/AccountStatusCard";
import DownloadInstallSection from "@/components/dashboard/DownloadInstallSection";
import TestingSection from "@/components/dashboard/TestingSection";
import HelpSection from "@/components/dashboard/HelpSection";
import ConnectExtension from "@/components/ConnectExtension";
import Reveal from "@/components/landing/Reveal";
import SendSmartUsageCard from "@/components/SendSmartUsageCard";
import FlaggedReviewSection from "@/components/dashboard/FlaggedReviewSection";
import AgentRepliesSection from "@/components/dashboard/AgentRepliesSection";
import MiniChat from "@/components/MiniChat";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background" data-dashboard-root>
      <DashboardHeader />
      <div className="animate-fade-in">
        <DashboardHero />
      </div>

      <div className="container mx-auto px-6 pb-24 space-y-8">
        {/* Top row: Account + Pair extension */}
        <div className="grid md:grid-cols-2 gap-6">
          <Reveal className="hover-scale"><AccountStatusCard /></Reveal>
          <Reveal delay={80} className="hover-scale">
            <div id="extension">
              <ConnectExtension />
            </div>
          </Reveal>
        </div>

        {/* Flagged for review */}
        <Reveal delay={90}>
          <div id="review">
            <FlaggedReviewSection />
          </div>
        </Reveal>

        {/* Agent Replies — AI-sent replies */}
        <Reveal delay={95}>
          <div id="replies">
            <AgentRepliesSection />
          </div>
        </Reveal>

        {/* Send Smart usage (live from Send Smart backend) */}
        <Reveal delay={100}>
          <div id="usage">
            <SendSmartUsageCard />
          </div>
        </Reveal>

        {/* Download & Install */}
        <Reveal delay={160}>
          <DownloadInstallSection />
        </Reveal>

        {/* Two-column: Testing + Help */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Reveal delay={240} className="hover-scale"><TestingSection /></Reveal>
          <Reveal delay={300} className="hover-scale"><HelpSection /></Reveal>
        </div>
      </div>

      <MiniChat />
    </div>
  );
};

export default Dashboard;
