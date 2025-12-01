interface IssueDescriptionProps {
  description: string;
}

export const IssueDescription = ({ description }: IssueDescriptionProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Deskripsi</h3>
      <p className="text-muted-foreground">
        {description || "Tidak ada deskripsi."}
      </p>
    </div>
  );
};