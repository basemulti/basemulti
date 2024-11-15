'use client';

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGlobalStore } from "@/store/global";
import Loading from "@/components/loading";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { updateName, updatePassword } from "@/actions/auth";
import { toast } from "sonner";
import ButtonLoading from "../button-loading";
import { getInitials } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function MyAccount() {
  const { user, updateUser } = useGlobalStore(store => ({
    user: store.user,
    updateUser: store.updateUser,
  }));
  const [open, setOpen] = useState(false);
  const t = useTranslations('ModalAccount.MyAccount');

  const [password, setPassword] = useState({
    oldPassword: '',
    newPassword: '',
    repeatNewPassword: '',
  });

  const [loading, setLoading] = useState(false);

  const handleUpdateName = (e: any) => {
    e.preventDefault();
    const name = e.target.value;
    if (name.length > 0) {
      const oldName = user?.name;
      updateUser({
        name,
      });
      
      updateName({ name }).catch(e => {
        updateUser({
          name: oldName,
        });
        toast.error(e.message);
      })
    }
  }

  const handleUpdatePassword = (e: any) => {
    e.preventDefault();

    if (loading) return;

    if (!password.newPassword || !password.repeatNewPassword || !password.oldPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.newPassword !== password.repeatNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);

    updatePassword({ oldPassword: password.oldPassword, newPassword: password.newPassword }).then(result => {
      if (result?.error) {
        throw new Error(result?.error);
      }
      setOpen(false);
      toast.success('Password updated');
    }).catch(e => {
      toast.error(e.message);
    }).finally(() => {
      setLoading(false);
    })
  }

  if (!user) {
    return <Loading />;
  }

  return <>
    <div className="flex flex-col">
      <div className="text-base font-medium">{t('title')}</div>
      <Separator className="mt-3 mb-4" />
      <div className="flex items-center gap-4">
        <Avatar className="w-14 h-14">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">{t('preferred_name')}</div>
          <Input className="w-48 h-8 px-3" defaultValue={user.name} onBlur={handleUpdateName} />
        </div>
      </div>
    </div>
    <div className="flex flex-col">
      <div className="text-base font-medium">{t('account_security')}</div>
      <Separator className="mt-3 mb-4" />
      <div className="flex flex-col items-start gap-4">
        <div className="grid w-3/5 items-center gap-1.5">
          <Label>{t('email')}</Label>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="grid w-3/5 items-center gap-1.5">
            <Label>{t('password')}</Label>
            <div className="text-sm text-muted-foreground">{t('password_description')}</div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant={'outline'} className="px-3 h-8">{t('change_password')}</Button>
            </DialogTrigger>
            <DialogContent className="md:w-[350px] w-[350px] items-center gap-4" onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}>
              <div className="flex flex-col items-center gap-2">
                <div className="text-sm font-medium">{t('ModalSetPassword.modal_title')}</div>
                <div className="text-xs text-muted-foreground text-center">{t('ModalSetPassword.description')}</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-xs">{t('ModalSetPassword.old_password')}</Label>
                  <Input className="h-8 px-3" type="password" onChange={e => setPassword({
                    ...password,
                    oldPassword: e.target.value,
                  })} />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-xs">{t('ModalSetPassword.new_password')}</Label>
                  <Input className="h-8 px-3" type="password" onChange={e => setPassword({
                    ...password,
                    newPassword: e.target.value,
                  })} />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-xs">{t('ModalSetPassword.repeat_password')}</Label>
                  <Input className="h-8 px-3" type="password" onChange={e => setPassword({
                    ...password,
                    repeatNewPassword: e.target.value,
                  })} />
                </div>
                <Button className="h-8 w-full gap-2" disabled={loading} onClick={handleUpdatePassword}>
                  <ButtonLoading loading={loading} />
                  {t('ModalSetPassword.save')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  </>
}