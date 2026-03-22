import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { BackButton, ApiStatusIndicator } from "@/components/shared";
import { useWritingForge } from "@/hooks/useWritingForge";
import {
  WritingForgeHeader,
  ContentTypeGrid,
  ContentCreationForm,
  GeneratedContentPanel,
  VersionHistoryPanel,
  VariantGeneratorPanel,
  RecentContentList,
  ContentViewPanel,
} from "@/components/writing";

export default function WritingForge() {
  const {
    contents,
    loading,
    activeView,
    selectedType,
    generating,
    selectedContent,
    copiedField,
    generatingVariant,
    showVersionHistory,
    activeVariant,
    compareMode,
    compareLeft,
    compareRight,
    formData,
    generatedContent,
    contentVersions,
    contentVariants,
    setActiveView,
    setSelectedType,
    setSelectedContent,
    setShowVersionHistory,
    setActiveVariant,
    setCompareLeft,
    setCompareRight,
    setFormData,
    handleGenerate,
    handleGenerateVariant,
    restoreVersion,
    deleteVariant,
    getActiveContent,
    getContentById,
    getContentLabel,
    toggleCompareMode,
    handleSave,
    handleCopy,
    handleDelete,
    resetCreateState,
  } = useWritingForge();

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setActiveView("create");
  };

  const handleContentSelect = (content: any) => {
    setSelectedContent(content);
    setActiveView("view");
  };

  const handleBackToList = () => {
    setActiveView("list");
    setSelectedType(null);
    setSelectedContent(null);
  };

  const apiStatuses = [
    { name: "AI Content Gen", available: true, icon: "✍️" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      <Sidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <WritingForgeHeader 
              showCreateButton={activeView === "list"}
              onCreateClick={() => setActiveView("create")}
            />
            <ApiStatusIndicator apis={apiStatuses} />
          </div>

          <AnimatePresence mode="wait">
            {/* List View */}
            {activeView === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ContentTypeGrid 
                  contents={contents}
                  onSelectType={handleTypeSelect}
                />
                <RecentContentList
                  contents={contents}
                  loading={loading}
                  onSelectContent={handleContentSelect}
                  onCreateNew={() => setActiveView("create")}
                />
              </motion.div>
            )}

            {/* Create View */}
            {activeView === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <BackButton 
                  onClick={() => {
                    handleBackToList();
                    resetCreateState();
                  }}
                  label="Back to Content"
                  className="mb-4"
                />

                <div className="grid grid-cols-2 gap-6">
                  <ContentCreationForm
                    selectedType={selectedType}
                    formData={formData}
                    generating={generating}
                    onTypeChange={setSelectedType}
                    onFormChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
                    onGenerate={handleGenerate}
                  />

                  <div className="space-y-4">
                    <GeneratedContentPanel
                      generatedContent={generatedContent}
                      generating={generating}
                      generatingVariant={generatingVariant}
                      contentVariants={contentVariants}
                      activeVariant={activeVariant}
                      compareMode={compareMode}
                      compareLeft={compareLeft}
                      compareRight={compareRight}
                      copiedField={copiedField}
                      onRegenerate={handleGenerate}
                      onSave={handleSave}
                      onToggleCompare={toggleCompareMode}
                      onVariantChange={setActiveVariant}
                      onDeleteVariant={deleteVariant}
                      onCompareLeftChange={setCompareLeft}
                      onCompareRightChange={setCompareRight}
                      onCloseCompare={() => toggleCompareMode()}
                      onCopy={handleCopy}
                      getActiveContent={getActiveContent}
                      getContentById={getContentById}
                      getContentLabel={getContentLabel}
                    />

                    {generatedContent && (
                      <VariantGeneratorPanel
                        onGenerateVariant={handleGenerateVariant}
                        isGenerating={generatingVariant}
                      />
                    )}

                    <VersionHistoryPanel
                      versions={contentVersions}
                      isOpen={showVersionHistory}
                      onOpenChange={setShowVersionHistory}
                      onRestore={restoreVersion}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* View Content */}
            {activeView === "view" && selectedContent && (
              <motion.div
                key="view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <BackButton 
                  onClick={handleBackToList}
                  label="Back to Content"
                  className="mb-4"
                />

                <ContentViewPanel
                  content={selectedContent}
                  copiedField={copiedField}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
