namespace KpopCardTracker.Models;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int TagTypeId { get; set; }

    public TagType TagType { get; set; } = null!;
    public ICollection<CardTag> CardTags { get; set; } = new List<CardTag>();
}
