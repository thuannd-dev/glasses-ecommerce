import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Glasses, Layers, Link } from "lucide-react";
import CoatingOptionsTab from "../components/CoatingOptionsTab";
import LensAttributesTab from "../components/LensAttributesTab";
import FrameLensCompatibilityTab from "../components/FrameLensCompatibilityTab";

type TabId = "coating" | "attributes" | "compatibility";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TABS: Tab[] = [
  {
    id: "coating",
    label: "Coating Options",
    icon: Layers,
    description: "Manage lens coating options (UV, Blue Light, Anti-Scratch...)",
  },
  {
    id: "attributes",
    label: "Lens Attributes",
    icon: Glasses,
    description: "Configure optical parameters for each variant (SPH, CYL, Index...)",
  },
  {
    id: "compatibility",
    label: "Frame-Lens Links",
    icon: Link,
    description: "Link compatible lenses with each frame product",
  },
];

export default function LensManagementScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("coating");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Glasses className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lens Management</h1>
              <p className="text-gray-600 mt-1">
                Manage lens products, coating options and compatibility
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
            <div className="flex gap-1 p-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium
                      transition-all duration-200
                      ${
                        isActive
                          ? "text-blue-700 bg-white shadow-md"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <p className="text-gray-600">
                    {TABS.find((t) => t.id === activeTab)?.description}
                  </p>
                </div>

                {activeTab === "coating" && <CoatingOptionsTab />}
                {activeTab === "attributes" && <LensAttributesTab />}
                {activeTab === "compatibility" && <FrameLensCompatibilityTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
