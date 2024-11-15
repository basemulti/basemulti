"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import ButtonLoading from "../button-loading";
import { useTranslations } from "next-intl";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading: boolean;
  title?: string;
  description?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title,
  description,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations('ModalAlert');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title={title ?? t("title")}
      description={description ?? t("description")}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button className="h-8 px-3" disabled={loading} variant="outline" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button className="h-8 px-3" disabled={loading} variant="destructive" onClick={onConfirm}>
          <ButtonLoading loading={loading} />
          {t('continue')}
        </Button>
      </div>
    </Modal>
  );
};
