import React, { useState, useRef, useEffect } from "react";
import { useHabitStore } from "../../store/habitStore";
import { Button } from "../ui/Button";
import type { Habit, HabitFrequency } from "../../types/habit";
import { TagInput } from "../ui/TagInput";
import { ConfirmationModal } from "../ui/ConfirmationModal";

interface HabitFormProps {
 onClose: () => void;
 initialData?: Habit;
}

const DAYS = [
  { label: 'L', value: 1 },
  { label: 'M', value: 2 },
  { label: 'X', value: 3 },
  { label: 'J', value: 4 },
  { label: 'V', value: 5 },
  { label: 'S', value: 6 },
  { label: 'D', value: 0 },
];

export const HabitForm: React.FC<HabitFormProps> = ({
 onClose,
 initialData,
}) => {
 const { addHabit, updateHabit, deleteHabit } = useHabitStore();
 const isEditing = !!initialData;

 const [name, setName] = useState(initialData?.name || "");
 const [emoji, setEmoji] = useState(initialData?.emoji || "✨");
 const [showEmojiPicker, setShowEmojiPicker] = useState(false);
 const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
 const [frequency, setFrequency] = useState<HabitFrequency>(initialData?.frequency || "daily");
 const [customDays, setCustomDays] = useState<number[]>(initialData?.customDays ?? [1, 2, 3, 4, 5]);
 const [targetDays, setTargetDays] = useState(initialData?.goal?.targetDays || 30);
 const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

 const emojiInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
  if (showEmojiPicker && emojiInputRef.current) {
   emojiInputRef.current.focus();
   emojiInputRef.current.select();
  }
 }, [showEmojiPicker]);

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!name.trim()) return;

  const habitData = {
   name,
   emoji,
   tags,
   frequency,
   customDays: frequency === 'custom' ? customDays : undefined,
   goal: frequency === 'goal'
    ? {
       targetDays,
       startDate: initialData?.goal?.startDate || new Date().toISOString(),
      }
    : undefined,
  };

  if (isEditing && initialData) {
   updateHabit(initialData.id, habitData);
  } else {
   addHabit(habitData as any);
  }

  onClose();
 };

 const toggleDay = (day: number) => {
  setCustomDays(prev => 
   prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
  );
 };

 const handleDelete = () => {
  if (initialData) {
   deleteHabit(initialData.id);
   onClose();
  }
 };

 return (
  <>
   <form onSubmit={handleSubmit} className="space-y-6">
    <div className="flex gap-3 items-start">
     <div className="flex-1 space-y-2">
      <label className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
       Nombre del hábito
      </label>
      <input
       autoFocus
       type="text"
       value={name}
       onChange={(e) => setName(e.target.value)}
       placeholder="Ej: Meditar, Correr, Leer..."
       className="w-full bg-bg-tertiary border border-border rounded-2xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
       required
      />
     </div>
     
     <div className="relative pt-6">
      <button
       type="button"
       onClick={() => setShowEmojiPicker(!showEmojiPicker)}
       className="w-14 h-14 rounded-2xl bg-bg-tertiary border border-border flex items-center justify-center text-2xl cursor-pointer hover:border-accent transition-colors flex-shrink-0"
      >
       {emoji}
      </button>
      {showEmojiPicker && (
       <div className="absolute top-full right-0 mt-2 z-50 bg-bg-secondary border border-border rounded-xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-200">
        <input
         ref={emojiInputRef}
         type="text"
         value={emoji}
         onChange={(e) => {
           setEmoji(e.target.value);
           if (e.target.value) setShowEmojiPicker(false);
         }}
         onBlur={() => setShowEmojiPicker(false)}
         className="w-12 h-12 bg-bg-tertiary border border-border rounded-lg text-center text-2xl focus:outline-none focus:border-accent"
        />
       </div>
      )}
     </div>
    </div>

    <TagInput tags={tags} onChange={setTags} />

    <div className="space-y-4">
     <label className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
      Frecuencia
     </label>
     <div className="flex flex-wrap gap-2">
      {(['goal', 'daily', 'weekdays', 'custom'] as const).map((f) => (
       <button
        key={f}
        type="button"
        onClick={() => setFrequency(f)}
        className={`
         px-4 py-2 rounded-full text-sm font-medium transition-all
         ${frequency === f 
           ? "bg-accent text-white shadow-lg shadow-accent/20" 
           : "bg-bg-tertiary text-text-muted hover:text-text-primary hover:bg-bg-tertiary/80"}
        `}
       >
        {f === 'goal' && 'Meta de días'}
        {f === 'daily' && 'Todos los días'}
        {f === 'weekdays' && 'Lun–Vie'}
        {f === 'custom' && 'Días personalizados'}
       </button>
      ))}
     </div>

     {frequency === 'goal' && (
      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 pt-2">
       <label className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
        Meta (días)
       </label>
       <input
        type="number"
        min={1}
        max={365}
        value={targetDays}
        onChange={(e) => setTargetDays(Number(e.target.value))}
        placeholder="Ej: 20"
        className="w-full bg-bg-tertiary border border-border rounded-2xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
       />
      </div>
     )}

     {frequency === 'custom' && (
      <div className="flex justify-between gap-1 animate-in fade-in slide-in-from-top-2 pt-2">
       {DAYS.map((day) => (
        <button
         key={day.value}
         type="button"
         onClick={() => toggleDay(day.value)}
         className={`
          w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all
          ${customDays.includes(day.value)
            ? "bg-accent text-white shadow-md shadow-accent/10"
            : "bg-bg-tertiary text-text-muted hover:text-text-primary"}
         `}
        >
         {day.label}
        </button>
       ))}
      </div>
     )}
    </div>

    <div className="space-y-3 pt-4 border-t border-border/50">
     <div className="flex gap-3">
      <Button
       type="button"
       variant="secondary"
       onClick={onClose}
       className="flex-1"
      >
       Cancelar
      </Button>
      <Button type="submit" className="flex-[2]">
       {isEditing ? "Guardar Cambios" : "Crear Hábito"}
      </Button>
     </div>
     {isEditing && (
      <Button
       type="button"
       variant="danger"
       onClick={() => setShowDeleteConfirm(true)}
       className="w-full bg-transparent border border-danger/20 hover:bg-danger/10"
      >
       Eliminar Hábito
      </Button>
     )}
    </div>
   </form>

   <ConfirmationModal
    isOpen={showDeleteConfirm}
    onClose={() => setShowDeleteConfirm(false)}
    onConfirm={handleDelete}
    title="¿Eliminar hábito?"
    description="Se perderá todo el progreso y el historial de este hábito. Esta acción no se puede deshacer."
   />
  </>
 );
};
