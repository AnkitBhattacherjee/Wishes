import { AnimatePresence, motion } from "motion/react";
import type { ScrapbookPage } from "../giftStore";
import OriginalScrapbookApp from "./scrapbook-original/OriginalScrapbookApp";

export default function JournalOverlay({
  isOpen,
  onClose,
  pages,
  onPagesChange,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  pages: ScrapbookPage[];
  onPagesChange: (pages: ScrapbookPage[]) => void;
  onSave: () => Promise<boolean>;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <OriginalScrapbookApp
            visible={isOpen}
            onExit={onClose}
            pages={pages}
            onPagesChange={onPagesChange}
            onSave={onSave}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
