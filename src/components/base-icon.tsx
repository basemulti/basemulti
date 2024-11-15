import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const colors = [
  'bg-red-300',
  'bg-yellow-300',
  'bg-green-300',
  'bg-blue-300',
  'bg-indigo-300',
  'bg-purple-300',
  'bg-cyan-300',
  'bg-pink-300',
  'bg-amber-300',
  'bg-lime-300',
  'bg-emerald-300',
  'bg-teal-300',
  'bg-sky-300',
  'bg-violet-300',
];

function stringToNumber(str: string) {
  let num = 0;
  for(let i = 0; i < str.length; i++) {
    num += str.charCodeAt(i);
  }
  return num;
}

export default function BaseIcon({ className, label, textClassName }: {
  className?: string;
  label: string;
  textClassName?: string;
}) {
  return <Avatar className={cn("rounded-md w-8 h-8", className)}>
    <AvatarImage src="https://xinquji.remoteb.com/7268ede3-6038-4d27-b10d-c9d?imageView2/1/w/180/h/180" />
    <AvatarFallback className={cn("rounded-md font-bold", colors[stringToNumber(label) % 13], textClassName)}>{label?.[0]}</AvatarFallback>
  </Avatar>
}