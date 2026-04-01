namespace KpopCardTracker.Models;

public class Card
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ImageFileName { get; set; } = string.Empty;
    public string? OfficialCardNumber { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CardTag> CardTags { get; set; } = new List<CardTag>();
}
