using KpopCardTracker.Models;
using Microsoft.EntityFrameworkCore;

namespace KpopCardTracker.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Card> Cards => Set<Card>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<TagType> TagTypes => Set<TagType>();
    public DbSet<CardTag> CardTags => Set<CardTag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CardTag>()
            .HasKey(ct => new { ct.CardId, ct.TagId });

        modelBuilder.Entity<CardTag>()
            .HasOne(ct => ct.Card)
            .WithMany(c => c.CardTags)
            .HasForeignKey(ct => ct.CardId);

        modelBuilder.Entity<CardTag>()
            .HasOne(ct => ct.Tag)
            .WithMany(t => t.CardTags)
            .HasForeignKey(ct => ct.TagId);

        modelBuilder.Entity<Tag>()
            .HasIndex(t => new { t.Name, t.TagTypeId })
            .IsUnique();

        // Seed built-in tag types
        modelBuilder.Entity<TagType>().HasData(
            new TagType { Id = 1, Name = "Group", IsBuiltIn = true },
            new TagType { Id = 2, Name = "Member", IsBuiltIn = true },
            new TagType { Id = 3, Name = "Album", IsBuiltIn = true },
            new TagType { Id = 4, Name = "Album Version", IsBuiltIn = true },
            new TagType { Id = 5, Name = "Year", IsBuiltIn = true },
            new TagType { Id = 6, Name = "Card Number", IsBuiltIn = true }
        );
    }
}
