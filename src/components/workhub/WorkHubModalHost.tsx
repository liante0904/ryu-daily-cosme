import type { HubWorkItem } from '../../api/workHubRepository';
import { BlogReviewModal } from './BlogReviewModal';
import { WorkHubItemModal } from './WorkHubItemModal';

interface WorkHubModalHostProps {
  item: HubWorkItem | null;
  isExisting: boolean;
  onClose: () => void;
  onSave: (item: HubWorkItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function WorkHubModalHost({ item, isExisting, onClose, onSave, onDelete }: WorkHubModalHostProps) {
  if (!item) return null;

  const modalProps = {
    item,
    isExisting,
    onClose,
    onSave,
    onDelete: () => onDelete(item.id),
  };

  return item.area === '개인' && item.category === '블로그' ? (
    <BlogReviewModal
      {...modalProps}
      onSave={(nextItem) => onSave({ ...nextItem, area: '개인', category: '블로그' })}
    />
  ) : (
    <WorkHubItemModal {...modalProps} />
  );
}
