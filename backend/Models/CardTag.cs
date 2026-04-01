namespace KpopCardTracker.Models;

public class CardTag
{
    public Guid CardId { get; set; }
    public int TagId { get; set; }

    public Card Card { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
