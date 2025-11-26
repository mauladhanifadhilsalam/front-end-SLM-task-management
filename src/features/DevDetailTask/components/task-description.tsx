interface TaskDescriptionProps {
  description: string;
}

export const TaskDescription = ({ description }: TaskDescriptionProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Deskripsi</h3>
      <p className="text-muted-foreground">
        {description || "Tidak ada deskripsi."}
      </p>
    </div>
  );
};