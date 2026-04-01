namespace KpopCardTracker.Models;

public class TagType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsBuiltIn { get; set; }

    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
